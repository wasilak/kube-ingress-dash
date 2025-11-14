# Requirements: Real-Time Ingress Updates

## User Stories (EARS)
- When ingresses change in the cluster, users shall see updates in the dashboard in real time.
- The app shall use Kubernetes watch/stream API to receive ingress events.
- The UI shall reflect additions, deletions, and updates instantly.
- Users shall not need to refresh the page to see changes.

## Acceptance Criteria
- Ingress changes are shown in real time.
- UI updates without manual refresh.
- Uses Kubernetes watch/stream API.
