# Deployment Guide

This guide provides instructions for deploying kube-ingress-dash in various environments.

## Prerequisites

Before deploying kube-ingress-dash, ensure you have:

- A Kubernetes cluster (v1.19+) with appropriate RBAC permissions
- kubectl configured to connect to your cluster
- Helm 3+ installed (for Helm deployment)
- Or access to apply Kubernetes manifests directly

## Kubernetes RBAC Setup

Before deploying the application, you need to create the required RBAC resources:

```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kube-ingress-dash
  namespace: default  # Change to your preferred namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kube-ingress-dash-viewer
rules:
- apiGroups: [""]
  resources: ["services", "pods", "endpoints", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kube-ingress-dash-viewer
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kube-ingress-dash-viewer
subjects:
- kind: ServiceAccount
  name: kube-ingress-dash
  namespace: default  # Change to your preferred namespace
```

Apply these resources:

```bash
kubectl apply -f rbac.yaml
```

## Deployment Options

### Option 1: Helm Chart (Recommended)

1. Add the Helm repository (if published):

```bash
helm repo add kube-ingress-dash https://your-repo.github.io/charts
helm repo update
```

2. Install the chart:

```bash
# Basic installation
helm install kube-ingress-dash kube-ingress-dash/kube-ingress-dash

# With custom values
helm install kube-ingress-dash kube-ingress-dash/kube-ingress-dash \
  --namespace ingress-dash \
  --create-namespace \
  --set replicaCount=2 \
  --set service.type=LoadBalancer
```

3. Or install from local chart:

```bash
helm install kube-ingress-dash ./charts/kube-ingress-dash \
  --namespace ingress-dash \
  --create-namespace
```

### Option 2: Kubernetes Manifests

1. Download or create the deployment manifest:

```bash
# Using kubectl
kubectl apply -f deployment.yaml
```

Example `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-ingress-dash
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kube-ingress-dash
  template:
    metadata:
      labels:
        app: kube-ingress-dash
    spec:
      serviceAccountName: kube-ingress-dash
      containers:
      - name: kube-ingress-dash
        image: kube-ingress-dash:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
---
apiVersion: v1
kind: Service
metadata:
  name: kube-ingress-dash
  namespace: default
spec:
  selector:
    app: kube-ingress-dash
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### Option 3: Docker

1. Pull the image from registry:

```bash
docker pull your-registry/kube-ingress-dash:latest
```

2. Run the container:

```bash
docker run -d \
  --name kube-ingress-dash \
  -p 3000:3000 \
  your-registry/kube-ingress-dash:latest
```

## Configuration Options

### Helm Chart Values

The Helm chart supports the following configuration options:

```yaml
# Default values for kube-ingress-dash
image:
  repository: kube-ingress-dash
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: false
  className: ""
  annotations: {}
    # kubernetes.io/ingress.class: nginx
    # kubernetes.io/tls-acme: "true"
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
  #  - secretName: chart-example-tls
  #    hosts:
  #      - chart-example.local

resources: {}
  # We usually recommend not to specify default resources and to leave this as a conscious
  # choice for the user. This also increases chances charts run on environments with little
  # resources, such as Minikube. If you do want to specify resources, uncomment the following
  # lines, adjust them as necessary, and remove the curly braces after 'resources:'.
  # limits:
  #   cpu: 100m
  #   memory: 128Mi
  # requests:
  #   cpu: 100m
  #   memory: 128Mi

rbac:
  create: false  # Set to true if the dashboard needs to access Kubernetes API
```

## Exposing the Service

### Using Ingress

If you want to expose the dashboard via an Ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kube-ingress-dash
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: dashboard.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kube-ingress-dash
            port:
              number: 80
```

### Using LoadBalancer Service

Change the service type to `LoadBalancer`:

```bash
kubectl patch service kube-ingress-dash -p '{"spec":{"type":"LoadBalancer"}}'
```

## Security Considerations

1. **RBAC**: Ensure the ServiceAccount has minimal required permissions (least privilege principle)

2. **Network Policies**: Consider applying NetworkPolicies to restrict traffic to the dashboard

3. **Authentication**: For production deployments, consider adding authentication (OIDC, basic auth, etc.)

4. **HTTPS**: Always use HTTPS when exposing the dashboard publicly

## Monitoring and Logging

Monitor the application with:

```bash
# Check pod status
kubectl get pods -l app=kube-ingress-dash

# View logs
kubectl logs -l app=kube-ingress-dash -f

# Check resource usage
kubectl top pods -l app=kube-ingress-dash
```

## Scaling

Scale the deployment as needed:

```bash
kubectl scale deployment kube-ingress-dash --replicas=3
```

## Upgrading

### Helm Upgrade

```bash
# Update the chart version
helm upgrade kube-ingress-dash kube-ingress-dash/kube-ingress-dash --version <new-version>

# Or upgrade from local chart
helm upgrade kube-ingress-dash ./charts/kube-ingress-dash
```

### Manual Upgrade

```bash
# Update the deployment with new image
kubectl set image deployment/kube-ingress-dash kube-ingress-dash=<new-image-tag>
```

## Troubleshooting

### Common Issues

1. **Pods CrashLoopBackOff**: Check RBAC permissions and ensure service account is properly set
2. **Access Denied**: Verify ClusterRole and ClusterRoleBinding are correctly set up
3. **Service Unreachable**: Check service selectors and network policies
4. **High Memory/CPU Usage**: Check for memory leaks and tune resource limits

### Debugging Commands

```bash
# Check events
kubectl get events --sort-by='.lastTimestamp'

# Describe deployment
kubectl describe deployment kube-ingress-dash

# Exec into pod
kubectl exec -it deployment/kube-ingress-dash -- /bin/sh
```