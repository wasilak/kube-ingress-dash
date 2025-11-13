# Deployment Guide

This guide covers different methods to deploy kube-ingress-dash to various environments.

## Prerequisites

Before deploying kube-ingress-dash, ensure you have:

- A Kubernetes cluster (v1.19 or later)
- `kubectl` configured to connect to your cluster
- Appropriate RBAC permissions (ClusterRole and ClusterRoleBinding)
- For Helm deployment: Helm v3+

## RBAC Configuration

The application requires specific RBAC permissions to function. Create the required RBAC resources:

```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kube-ingress-dash-sa
  namespace: default  # Change as needed
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
  name: kube-ingress-dash-viewer-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kube-ingress-dash-viewer
subjects:
- kind: ServiceAccount
  name: kube-ingress-dash-sa
  namespace: default  # Change as needed
```

Apply the RBAC configuration:
```bash
kubectl apply -f rbac.yaml
```

## Deployment Methods

### 1. Using Helm (Recommended)

Helm provides the easiest and most configurable way to deploy kube-ingress-dash.

#### Install from local chart:
```bash
helm install kube-ingress-dash ./charts/k8s-ingress-dashboard \
  --set serviceAccount.name=kube-ingress-dash-sa \
  --set rbac.enabled=false  # RBAC was created separately above
```

#### Install with custom values:
```bash
# Create a values file
cat << EOF > custom-values.yaml
replicaCount: 2
image:
  repository: your-registry/kube-ingress-dash
  tag: latest

service:
  type: LoadBalancer
  port: 80

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: kube-ingress-dash.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
EOF

helm install kube-ingress-dash ./charts/k8s-ingress-dashboard \
  -f custom-values.yaml \
  --set serviceAccount.name=kube-ingress-dash-sa \
  --set rbac.enabled=false
```

#### Upgrade deployment:
```bash
helm upgrade kube-ingress-dash ./charts/k8s-ingress-dashboard -f custom-values.yaml
```

#### Uninstall:
```bash
helm uninstall kube-ingress-dash
```

### 2. Using Kubernetes Manifests

If you prefer plain Kubernetes manifests, you can create them from the Helm chart:

```bash
# Generate manifests from Helm chart
helm template kube-ingress-dash ./charts/k8s-ingress-dashboard \
  --set serviceAccount.name=kube-ingress-dash-sa \
  --set rbac.enabled=false > kube-ingress-dash-manifests.yaml

# Apply the generated manifests
kubectl apply -f kube-ingress-dash-manifests.yaml
```

### 3. Using Docker

You can run kube-ingress-dash as a Docker container in various environments:

#### Standalone Docker:
```bash
docker run -d \
  --name kube-ingress-dash \
  -p 3000:3000 \
  --env KUBECONFIG=/path/to/kubeconfig \
  -v ~/.kube/config:/path/to/kubeconfig:ro \
  kube-ingress-dash:latest
```

#### Docker Compose:
```yaml
# docker-compose.yml
version: '3.8'
services:
  kube-ingress-dash:
    image: kube-ingress-dash:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ~/.kube/config:/app/.kube/config:ro
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Configuration Options

### Helm Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of pod replicas | `1` |
| `image.repository` | Container image repository | `kube-ingress-dash` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `image.tag` | Container image tag | `""` (defaults to appVersion) |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `ingress.enabled` | Enable ingress resource | `false` |
| `resources` | CPU/Memory resource requests and limits | `{}` |
| `rbac.enabled` | Create RBAC resources | `true` |
| `rbac.clusterRoleName` | Name of the ClusterRole | `kube-ingress-dash-viewer` |

### Environment Variables

The application supports these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port to run the application on | `3000` |
| `NODE_ENV` | Node.js environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | (unset) |

## Kubernetes Deployment Considerations

### Security

- Run the pod with a non-root user
- Use RBAC to limit permissions to the minimum required
- Enable Pod Security Standards where applicable
- Consider using a NetworkPolicy to restrict traffic

### Resources

For production deployments, consider requesting appropriate resources:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Health Checks

The application doesn't currently have built-in health checks, but you can add liveness and readiness probes that check the root path:

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Scaling

### Horizontal Pod Autoscaler

To automatically scale based on CPU usage:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: kube-ingress-dash-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kube-ingress-dash
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Monitoring and Logging

### Accessing Logs

To view application logs:
```bash
kubectl logs -l app.kubernetes.io/name=kube-ingress-dash -f
```

### Service Discovery

The service is typically available at:
- Internal cluster: `http://kube-ingress-dash:80`
- External (if LoadBalancer): Check `kubectl get svc kube-ingress-dash`

## Troubleshooting

### Common Issues

1. **No ingresses showing**: Check RBAC permissions and ensure the service account has access to list ingresses.

2. **Permission denied errors**: Verify ClusterRoleBinding is correctly configured.

3. **Connection timeouts**: Ensure the pod has network access to the Kubernetes API server.

### Debugging

Enable verbose logging by setting the environment to development in your values:
```bash
helm install kube-ingress-dash ./charts/k8s-ingress-dashboard \
  --set-string extraEnv[0].name=NODE_ENV \
  --set-string extraEnv[0].value=development
```