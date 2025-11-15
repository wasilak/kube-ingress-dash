# Design: Kube API Error Handling

## Overview
Detect permission/API errors and show a user-friendly error screen with a link to RBAC docs. Handle common error codes and provide actionable messages.

## Key Components
- Error detection in backend/API client
- ErrorBoundary or ErrorScreen component in frontend
- Link to RBAC documentation

## Flow
1. App detects API/permission error
2. UI displays error screen with message and docs link
3. User can access troubleshooting info

## Considerations
- Distinct visual style for error screen
- Localized/helpful messages
- Easy navigation to docs
