---
sidebar_position: 3
title: "Architecture: Interaction with Kubernetes"
---

# Architecture: Interaction with Kubernetes

This document describes how kube-ingress-dash interacts with Kubernetes and the overall system architecture.

## System Architecture

The following diagram illustrates the overall architecture of kube-ingress-dash:

```mermaid
graph TB
    subgraph "Client"
        A[Browser/End User]
    end
    
    subgraph "kube-ingress-dash Application"
        B[Next.js Frontend]
        C[Next.js API Routes]
        D[Kubernetes Client]
    end
    
    subgraph "Kubernetes Cluster"
        E[Kubernetes API Server]
        F[Ingress Resources]
        G[Service Resources]
        H[Pod Resources]
    end
    
    A -- "HTTP Requests" --> B
    B -- "Internal API Calls" --> C
    C -- "Kubernetes API Calls" --> D
    D -- "Watch/List API" --> E
    E -- "Ingress Data" --> F
    E -- "Service Data" --> G
    E -- "Pod Data" --> H
```

## Detailed Interaction Flow

The interaction between kube-ingress-dash and Kubernetes follows this flow:

```mermaid
sequenceDiagram
    participant User as End User
    participant Frontend as Frontend UI
    participant Backend as Backend API
    participant K8sAPI as Kubernetes API
    participant Ingress as Ingress Resources
    
    User->>Frontend: Opens dashboard
    Frontend->>Backend: Fetch ingress data
    Backend->>K8sAPI: List ingresses request
    K8sAPI-->>Backend: Return ingress list
    Backend-->>Frontend: Send formatted data
    Frontend-->>User: Display ingresses
    Backend->>K8sAPI: Watch for changes
    K8sAPI-->>Backend: Notify of changes
    Backend-->>Frontend: Send updates
    Frontend-->>User: Update dashboard in real-time
```

## Kubernetes Permissions

kube-ingress-dash requires specific RBAC permissions to access Kubernetes resources:

```mermaid
graph LR
    A[kube-ingress-dash] -- "get, list, watch" --> B(Ingresses)
    A -- "get, list, watch" --> C(Services)
    A -- "get, list, watch" --> D(Pods)
    A -- "get, list, watch" --> E(Namespaces)
    A -- "Uses" --> F(Service Account)
    F -- "Bound by" --> G(ClusterRoleBinding)
    G -- "Grants permissions from" --> H(ClusterRole)
```

## Data Flow

The data flow within kube-ingress-dash follows this pattern:

```mermaid
graph LR
    A[Kubernetes Ingress<br/>Controller Creates/Updates] --> B[Kubernetes API Server]
    B --> C[Watch/Event Stream]
    C --> D[kube-ingress-dash<br/>Kubernetes Client]
    D --> E[Data Transformation<br/>& Processing]
    E --> F[API Response<br/>Formatting]
    F --> G[Frontend<br/>Visualization]
    G --> H[User Dashboard]
    
    style A fill:#e1f5fe
    style H fill:#e8f5e8
```

## Security Architecture

The security model ensures proper isolation and access control:

```mermaid
graph TB
    subgraph "Security Boundaries"
        A[kube-ingress-dash<br/>Pod Security Context]
        B[Service Account<br/>with Minimal Permissions]
        C[ClusterRole<br/>with Limited RBAC Rules]
        D[Network Policies<br/>(if configured)]
    end
    
    A --> B
    B --> C
    A --> D
```