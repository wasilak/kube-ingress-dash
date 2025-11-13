# Helm Chart Analysis: k8s-ingress-dashboard vs kube-ingress-dash

## Overview

This document provides a detailed analysis of the two existing Helm charts in the kube-ingress-dash project, identifying unique features, differences, and best practices from each to inform the consolidation process.

## Chart Structure Comparison

### k8s-ingress-dashboard
- Chart name: `k8s-ingress-dashboard`
- Templates:
  - `_helpers.tpl`
  - `clusterrole.yaml`
  - `clusterrolebinding.yaml`
  - `deployment.yaml`
  - `ingress.yaml`
  - `service.yaml`
  - `serviceaccount.yaml`

### kube-ingress-dash
- Chart name: `kube-ingress-dash`
- Templates:
  - `_helpers.tpl`
  - `deployment.yaml`
  - `ingress.yaml`
  - `NOTES.txt`
  - `rbac.yaml`
  - `service.yaml`

## Detailed Feature Comparison

### Chart.yaml Differences
- `k8s-ingress-dashboard`: Basic Chart.yaml with minimal metadata
- `kube-ingress-dash`: More comprehensive Chart.yaml with keywords, home page, sources, and maintainers

### values.yaml Differences
- `k8s-ingress-dashboard`:
  - Includes autoscaling configuration
  - More detailed RBAC configuration with specific parameters
  - ServiceAccount creation is enabled by default
  - More comprehensive default resource configurations

- `kube-ingress-dash`:
  - Includes deployment strategy configuration (RollingUpdate)
  - More detailed environment variable configuration
  - Simpler RBAC creation flag
  - ServiceAccount creation is disabled by default

### RBAC Configuration
- `k8s-ingress-dashboard`:
  - Separate files for ClusterRole, ClusterRoleBinding, and ServiceAccount
  - More granular RBAC configuration in values.yaml
  - Uses specific naming convention with `-sa` suffix

- `kube-ingress-dash`:
  - Combined RBAC resources in single `rbac.yaml` file
  - Simpler RBAC configuration in values.yaml
  - All RBAC resources in one file for easier management

### Deployment Configuration
- `k8s-ingress-dashboard`:
  - Standard deployment without specific strategy
  - No environment variable configuration
  - Uses standard liveness and readiness probes

- `kube-ingress-dash`:
  - Includes specific deployment strategy (RollingUpdate with maxSurge: 1, maxUnavailable: 0)
  - Supports environment variable configuration
  - Uses standard liveness and readiness probes

### Additional Features
- `k8s-ingress-dashboard`:
  - Includes autoscaling configuration (HPA)
  - More detailed service account configuration

- `kube-ingress-dash`:
  - Includes comprehensive NOTES.txt with installation instructions
  - Better structured Chart.yaml with metadata

## Best Practices Identified

### From k8s-ingress-dashboard
1. Comprehensive RBAC configuration with granular control
2. Autoscaling capabilities with HPA settings
3. Detailed service account configuration options
4. More complete image pull secrets handling

### From kube-ingress-dash
1. Better Chart.yaml metadata (keywords, home page, sources, maintainers)
2. Comprehensive NOTES.txt with clear installation instructions
3. Proper deployment strategy for zero-downtime updates
4. Environment variable support
5. Combined RBAC resources for easier management

## Recommendations for Consolidated Chart

### Essential Features to Include
1. Combined RBAC configuration (from both charts) with granular controls
2. Deployment strategy configuration (RollingUpdate)
3. Environment variable support
4. Autoscaling capabilities (HPA)
5. Comprehensive NOTES.txt with installation instructions
6. Complete Chart.yaml metadata
7. Proper service account management
8. Image pull secrets configuration

### Structure Recommendations
1. Combine RBAC resources into a single rbac.yaml file like kube-ingress-dash but with the granular controls from k8s-ingress-dashboard
2. Include both autoscaling and environment variable configurations
3. Add the deployment strategy from kube-ingress-dash
4. Include comprehensive NOTES.txt like kube-ingress-dash
5. Use the richer Chart.yaml metadata from kube-ingress-dash
6. Maintain the service account configuration options from k8s-ingress-dashboard

## Unique Resources to Preserve
- `NOTES.txt` from kube-ingress-dash (important for user guidance)
- All RBAC resources from both charts (combined appropriately)
- Autoscaling configuration from k8s-ingress-dashboard
- Environment variable support from kube-ingress-dash
- Deployment strategy from kube-ingress-dash