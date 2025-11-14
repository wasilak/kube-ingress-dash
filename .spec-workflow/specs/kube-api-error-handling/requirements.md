# Requirements: Kube API Error Handling

## User Stories (EARS)
- When the app cannot access the Kubernetes API (e.g., lack of permissions), users shall see a helpful error screen.
- The error screen shall explain the issue and provide a link to RBAC documentation.
- The app shall detect common permission errors and display relevant messages.
- The error screen shall be visually distinct and easy to understand.

## Acceptance Criteria
- Permission/API errors are detected and handled.
- User-friendly error screen is shown.
- Link to RBAC docs is present.
