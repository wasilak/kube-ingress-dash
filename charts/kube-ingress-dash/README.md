# kube-ingress-dash

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Kubernetes Ingress Dashboard

**Homepage:** <https://github.com/kube-ingress-dash/kube-ingress-dash>

## Maintainers

| Name        | Email                     | Url |
| ----------- | ------------------------- | --- |
| Piotr Boruc | <piotr.m.boruc@gmail.com> |     |

## Source Code

- <https://github.com/kube-ingress-dash/kube-ingress-dash>

## Values

| Key                                        | Type   | Default                               | Description |
| ------------------------------------------ | ------ | ------------------------------------- | ----------- |
| affinity                                   | list   | `[]`                                  |             |
| autoscaling.enabled                        | bool   | `false`                               |             |
| autoscaling.maxReplicas                    | int    | `100`                                 |             |
| autoscaling.minReplicas                    | int    | `1`                                   |             |
| autoscaling.targetCPUUtilizationPercentage | int    | `80`                                  |             |
| env                                        | list   | `[]`                                  |             |
| fullnameOverride                           | string | `""`                                  |             |
| image.pullPolicy                           | string | `"IfNotPresent"`                      |             |
| image.repository                           | string | `"ghcr.io/wasilak/kube-ingress-dash"` |             |
| image.tag                                  | string | `""`                                  |             |
| imagePullSecrets                           | list   | `[]`                                  |             |
| ingress.annotations                        | object | `{}`                                  |             |
| ingress.className                          | string | `""`                                  |             |
| ingress.enabled                            | bool   | `false`                               |             |
| ingress.hosts[0].host                      | string | `"chart-example.local"`               |             |
| ingress.hosts[0].paths[0].path             | string | `"/"`                                 |             |
| ingress.hosts[0].paths[0].pathType         | string | `"Prefix"`                            |             |
| ingress.tls                                | list   | `[]`                                  |             |
| livenessProbe.failureThreshold             | int    | `3`                                   |             |
| livenessProbe.initialDelaySeconds          | int    | `30`                                  |             |
| livenessProbe.periodSeconds                | int    | `10`                                  |             |
| livenessProbe.successThreshold             | int    | `1`                                   |             |
| livenessProbe.timeoutSeconds               | int    | `5`                                   |             |
| nameOverride                               | string | `""`                                  |             |
| nodeSelector                               | object | `{}`                                  |             |
| podAnnotations                             | object | `{}`                                  |             |
| podSecurityContext                         | object | `{}`                                  |             |
| rbac.clusterRoleBinding                    | bool   | `true`                                |             |
| rbac.clusterRoleName                       | string | `"kube-ingress-dash-viewer"`          |             |
| rbac.create                                | bool   | `true`                                |             |
| rbac.enabled                               | bool   | `true`                                |             |
| rbac.serviceAccountName                    | string | `"kube-ingress-dash-viewer"`          |             |
| readinessProbe.failureThreshold            | int    | `3`                                   |             |
| readinessProbe.initialDelaySeconds         | int    | `10`                                  |             |
| readinessProbe.periodSeconds               | int    | `5`                                   |             |
| readinessProbe.successThreshold            | int    | `1`                                   |             |
| readinessProbe.timeoutSeconds              | int    | `5`                                   |             |
| replicaCount                               | int    | `1`                                   |             |
| resources                                  | object | `{}`                                  |             |
| securityContext                            | object | `{}`                                  |             |
| service.port                               | int    | `3000`                                |             |
| service.targetPort                         | int    | `3000`                                |             |
| service.type                               | string | `"ClusterIP"`                         |             |
| serviceAccount.annotations                 | object | `{}`                                  |             |
| serviceAccount.create                      | bool   | `true`                                |             |
| serviceAccount.name                        | string | `""`                                  |             |
| strategy.rollingUpdate.maxSurge            | int    | `1`                                   |             |
| strategy.rollingUpdate.maxUnavailable      | int    | `0`                                   |             |
| strategy.type                              | string | `"RollingUpdate"`                     |             |
| tolerations                                | list   | `[]`                                  |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)
