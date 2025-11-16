# kube-ingress-dash

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Kubernetes Ingress Dashboard

**Homepage:** <https://github.com/wasilak/kube-ingress-dash>

## Overview

Kube Ingress Dash is a modern, lightweight dashboard for visualizing and monitoring Kubernetes Ingress resources. It provides a clean, intuitive interface to view all your ingress configurations across namespaces in real-time.

### Features

- 🚀 Real-time monitoring of Kubernetes Ingress resources
- 🔍 Multi-namespace support with filtering capabilities
- 📊 Clean, modern UI for easy navigation
- 🔒 RBAC-enabled with minimal required permissions
- ⚡ Lightweight and fast
- 🎨 Responsive design for desktop and mobile

## Installation

### Prerequisites

- Kubernetes 1.19+
- Helm 3.0+

### Quick Start

Add the Helm repository (if using HTTP-based repository):

```bash
helm repo add kube-ingress-dash https://your-repo-url
helm repo update
```

Or install directly from OCI registry:

```bash
helm install kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash-chart
```

### Install with custom values

```bash
helm install kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash-chart \
  --set ingress.enabled=true \
  --set ingress.className=nginx \
  --set ingress.hosts[0].host=ingress-dash.example.com
```

### Install from local chart

```bash
helm install kube-ingress-dash ./charts/kube-ingress-dash
```

## Configuration

The following table lists the configurable parameters and their default values. You can override these values using `--set` flags or by providing a custom `values.yaml` file.

### Example: Enable Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ingress-dash.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ingress-dash-tls
      hosts:
        - ingress-dash.example.com
```

### Example: Configure Resources

```yaml
resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

### Example: Enable Autoscaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Piotr Boruc | <piotr.m.boruc@gmail.com> |  |

## Source Code

* <https://github.com/wasilak/kube-ingress-dash>

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | list | `[]` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| env | list | `[]` |  |
| fullnameOverride | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/wasilak/kube-ingress-dash"` |  |
| image.tag | string | `""` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `""` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"chart-example.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"Prefix"` |  |
| ingress.tls | list | `[]` |  |
| livenessProbe.failureThreshold | int | `3` |  |
| livenessProbe.initialDelaySeconds | int | `30` |  |
| livenessProbe.periodSeconds | int | `10` |  |
| livenessProbe.successThreshold | int | `1` |  |
| livenessProbe.timeoutSeconds | int | `5` |  |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| rbac.clusterRoleBinding | bool | `true` |  |
| rbac.clusterRoleName | string | `"kube-ingress-dash-viewer"` |  |
| rbac.create | bool | `true` |  |
| rbac.enabled | bool | `true` |  |
| rbac.serviceAccountName | string | `"kube-ingress-dash-viewer"` |  |
| readinessProbe.failureThreshold | int | `3` |  |
| readinessProbe.initialDelaySeconds | int | `10` |  |
| readinessProbe.periodSeconds | int | `5` |  |
| readinessProbe.successThreshold | int | `1` |  |
| readinessProbe.timeoutSeconds | int | `5` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| securityContext | object | `{}` |  |
| service.port | int | `3000` |  |
| service.targetPort | int | `3000` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| strategy.rollingUpdate.maxSurge | int | `1` |  |
| strategy.rollingUpdate.maxUnavailable | int | `0` |  |
| strategy.type | string | `"RollingUpdate"` |  |
| tolerations | list | `[]` |  |

## Accessing the Dashboard

After installation, you can access the dashboard in several ways:

### Port Forward (for testing)

```bash
kubectl port-forward svc/kube-ingress-dash 3000:3000
```

Then open http://localhost:3000 in your browser.

### Via Ingress

If you enabled ingress during installation, access the dashboard at the configured hostname.

### Via LoadBalancer

If you set `service.type=LoadBalancer`:

```bash
kubectl get svc kube-ingress-dash
```

Use the external IP to access the dashboard.

## Upgrading

```bash
helm upgrade kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash-chart
```

## Uninstalling

```bash
helm uninstall kube-ingress-dash
```

## RBAC Permissions

By default, the chart creates a ServiceAccount with ClusterRole permissions to view Ingress resources across all namespaces. You can customize RBAC settings:

```yaml
rbac:
  enabled: true
  create: true
  clusterRoleBinding: true  # Set to false for namespace-scoped access
```

## Troubleshooting

### Dashboard not showing ingresses

1. Check RBAC permissions:
   ```bash
   kubectl auth can-i list ingresses --as=system:serviceaccount:default:kube-ingress-dash-viewer
   ```

2. Check pod logs:
   ```bash
   kubectl logs -l app.kubernetes.io/name=kube-ingress-dash
   ```

### Connection issues

Verify the service is running:
```bash
kubectl get pods -l app.kubernetes.io/name=kube-ingress-dash
kubectl get svc kube-ingress-dash
```

## Support

- 📖 [Documentation](https://wasilak.github.io/kube-ingress-dash/)
- 🐛 [Issue Tracker](https://github.com/wasilak/kube-ingress-dash/issues)

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
