# Design Document: Helm Chart Consolidation and Modern CI/CD

## Introduction

This document outlines the technical design for consolidating two existing Helm charts into a single, comprehensive chart for kube-ingress-dash, along with implementing modern GitHub Actions-based CI/CD pipelines for both Docker images and Helm charts using OCI registries.

## Architecture Overview

The solution will consist of:
1. A consolidated Helm chart named "kube-ingress-dash" that incorporates features from both existing charts
2. GitHub Actions workflows for building and signing Docker images for multiple architectures
3. GitHub Actions workflow for publishing Helm charts to OCI registry
4. Implementation of security best practices including image signing and minimal RBAC

## Design Components

### Component 1: Consolidated Helm Chart Structure

#### Description
A single Helm chart named "kube-ingress-dash" that includes all necessary Kubernetes resources with best-practice configuration options.

#### Implementation Details
- Rename the more comprehensive chart directory to "kube-ingress-dash" if not already named so
- Merge RBAC configurations from both charts, ensuring comprehensive but minimal permissions
- Include all Kubernetes resources (Deployment, Service, ServiceAccount, ClusterRole, ClusterRoleBinding, Ingress)
- Maintain comprehensive NOTES.txt with clear installation instructions
- Implement Kubernetes API version compatibility checks for Ingress resources
- Add comprehensive values.yaml with appropriate defaults

#### Files to be created/modified
- charts/kube-ingress-dash/Chart.yaml
- charts/kube-ingress-dash/values.yaml
- charts/kube-ingress-dash/templates/*.yaml (all resource templates)
- charts/kube-ingress-dash/templates/NOTES.txt
- charts/kube-ingress-dash/templates/_helpers.tpl

### Component 2: Multi-architecture Docker Build Workflow

#### Description
GitHub Actions workflow to build Docker images for multiple architectures (linux/amd64, linux/arm64) with security signing.

#### Implementation Details
- Based on the best-practices workflow from wasilak/tools
- Use Buildx for multi-platform builds
- Implement proper tagging strategy (semver, branch, etc.)
- Include cosign for image signing
- Use secure authentication with GITHUB_TOKEN
- Implement proper caching for efficient builds

#### Files to be created
- .github/workflows/docker.yml

### Component 3: OCI Helm Chart Deployment Workflow

#### Description
GitHub Actions workflow to package and publish Helm charts to OCI registry (GHCR).

#### Implementation Details
- Automated chart versioning tied to Git tags
- OCI registry authentication using GITHUB_TOKEN
- Security scanning of charts before publishing
- Proper tagging and versioning strategy
- Integration with Helm best practices for OCI

#### Files to be created
- .github/workflows/helm.yml

## Technical Implementation

### Helm Chart Best Practices to Implement

1. **Template Structure**
   - Use standard Helm template functions and helpers
   - Implement proper Kubernetes API version compatibility checks
   - Use conditional resource creation with proper guards

2. **Configuration Management**
   - Implement comprehensive values.yaml with detailed comments
   - Provide appropriate defaults for all configurable parameters
   - Use consistent naming conventions for values

3. **Security Considerations**
   - Minimal RBAC permissions following least-privilege principle
   - Secure ServiceAccount configuration
   - Proper container security contexts

4. **Kubernetes Resource Optimization**
   - Implement appropriate resource requests and limits
   - Use proper health checks (liveness/readiness probes)
   - Implement efficient deployment strategies

### GitHub Actions Best Practices

1. **Security**
   - Use minimal required permissions in workflow files
   - Implement proper authentication using GITHUB_TOKEN
   - Sign artifacts using cosign

2. **Efficiency**
   - Implement proper caching strategies
   - Build for multiple architectures in parallel
   - Use appropriate runner scaling

3. **Reliability**
   - Implement proper error handling
   - Use semantic versioning for artifacts
   - Include testing steps where appropriate

## Data Flow

### Docker Image Flow
1. Code commit triggers workflow
2. Docker image built for multiple architectures
3. Image pushed to GHCR
4. Image signed using cosign

### Helm Chart Flow
1. Git tag push triggers workflow
2. Helm chart packaged and validated
3. Chart pushed to GHCR OCI registry
4. Chart version updated in registry

## Security Considerations

- Docker images will be signed using cosign with GitHub OIDC
- Minimal RBAC permissions in Helm chart for security
- Use of secure authentication methods in GitHub Actions
- Proper container security contexts to limit attack surface

## Testing Strategy

- Unit tests for Helm templates using ct (Chart Testing) or similar tools
- Integration tests to verify chart functionality in test cluster
- Security scanning of Docker images before pushing
- Validation of Helm chart before publishing

## Deployment Strategy

- The consolidated Helm chart will support rolling updates by default
- Proper liveness and readiness probes to ensure service availability
- Support for both canary and blue-green deployment patterns via configuration