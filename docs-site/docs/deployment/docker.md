---
sidebar_position: 2
title: "Deployment: Docker"
---

# Deploying kube-ingress-dash with Docker

This guide explains how to deploy kube-ingress-dash using Docker containers.

## Prerequisites

- Docker Engine 20.10+ installed
- Access to the kube-ingress-dash Docker image
- Kubernetes cluster with appropriate RBAC permissions (for cluster access)

## Using Pre-built Images

The application is available as multi-architecture Docker images on GitHub Container Registry (GHCR):

### Pull the Image

```bash
docker pull ghcr.io/wasilak/kube-ingress-dash:latest
```

### Run with Docker

```bash
docker run -p 3000:3000 ghcr.io/wasilak/kube-ingress-dash:latest
```

## Building from Source

### 1. Clone the Repository

```bash
git clone https://github.com/wasilak/kube-ingress-dash.git
cd kube-ingress-dash
```

### 2. Build the Docker Image

```bash
docker build -t kube-ingress-dash .
```

### 3. Run the Container

```bash
docker run -p 3000:3000 kube-ingress-dash
```

## Configuration

### Multi-architecture Support

Our Docker images support multiple architectures:
- `linux/amd64`
- `linux/arm64`

The appropriate image will be automatically selected based on your platform.

### Running with Custom Configuration

```bash
# Example with environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  ghcr.io/wasilak/kube-ingress-dash:latest
```

## Kubernetes Deployment with Docker

While Docker is typically used for local development, you can use Docker images in Kubernetes:

### 1. Create a Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-ingress-dash
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
      serviceAccountName: kube-ingress-dash-viewer  # Ensure proper RBAC
      containers:
      - name: kube-ingress-dash
        image: ghcr.io/wasilak/kube-ingress-dash:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
```

### 2. Create a Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kube-ingress-dash
spec:
  selector:
    app: kube-ingress-dash
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```