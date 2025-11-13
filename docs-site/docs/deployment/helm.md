---
sidebar_position: 3
title: "Deployment: Helm"
---

# Deploying kube-ingress-dash with Helm

This guide explains how to deploy kube-ingress-dash using Helm charts.

## Prerequisites

- Helm 3.0+ installed
- Kubernetes cluster with appropriate RBAC permissions
- Access to the kube-ingress-dash Helm chart

## Quick Start

### Add the Helm Repository

Since our chart is published to GitHub Container Registry (GHCR) as an OCI chart:

```bash
# Install directly from OCI registry
helm install kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash/kube-ingress-dash --version 0.1.0
```

## Installation

### 1. Install with Default Values

```bash
helm install kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash/kube-ingress-dash --version 0.1.0
```

### 2. Install with Custom Values

```bash
helm install kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash/kube-ingress-dash --version 0.1.0 -f my-values.yaml
```

## Configuration

### Common Configuration Options

The Helm chart provides extensive configuration options:

#### Image Configuration
```yaml
image:
  repository: ghcr.io/wasilak/kube-ingress-dash/kube-ingress-dash
  pullPolicy: IfNotPresent
  tag: ""  # Defaults to appVersion in Chart.yaml
```

#### Service Configuration
```yaml
service:
  type: ClusterIP
  port: 80
  targetPort: 3000
```

#### Ingress Configuration
```yaml
ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: Prefix
  tls: []
```

#### Autoscaling Configuration
```yaml
autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  # targetMemoryUtilizationPercentage: 80
```

#### RBAC Configuration
```yaml
rbac:
  create: true
  enabled: true
  clusterRoleName: "kube-ingress-dash-viewer"
  clusterRoleBinding: true
  serviceAccountName: "kube-ingress-dash-viewer"
```

## Upgrading the Chart

```bash
# Upgrade to a new version
helm upgrade kube-ingress-dash oci://ghcr.io/wasilak/kube-ingress-dash/kube-ingress-dash --version <new-version>
```

## Uninstalling the Chart

```bash
# Uninstall the release
helm uninstall kube-ingress-dash
```

## RBAC Requirements

The Helm chart creates the necessary RBAC resources for kube-ingress-dash to function properly. If you're installing in a cluster where you need to create these resources manually, ensure the following permissions are granted:

```yaml
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
```