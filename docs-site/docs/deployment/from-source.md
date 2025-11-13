---
sidebar_position: 1
title: "Deployment: From Source"
---

# Deploying kube-ingress-dash from Source

This guide explains how to deploy kube-ingress-dash from source code.

## Prerequisites

- Node.js v18+ installed
- npm or yarn package manager
- Kubernetes cluster with appropriate RBAC permissions
- Git for cloning the repository

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/wasilak/kube-ingress-dash.git
cd kube-ingress-dash
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Run the Application

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Configuration

### Kubernetes RBAC

The application requires the following Kubernetes permissions:

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

### Environment Variables

The application doesn't require any environment variables for basic operation, but you can configure:

- `NODE_ENV`: Set to 'production' for production deployments
- `PORT`: Port to run the application on (default: 3000)

## Development

For development, run:

```bash
npm run dev
```

This starts the development server with hot reloading.