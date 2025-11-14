# Tasks: Kube API Error Handling

- [ ] Detect permission/API errors in backend
  _Prompt: Implement the task for spec kube-api-error-handling, first run spec-workflow-guide to get the workflow guide then implement the task:
  Role: Backend developer
  Task: Detect permission/API errors in backend
  Restrictions: Must cover common error codes
  _Leverage: Existing API client
  _Requirements: Permission/API errors are detected
  Success: Errors are detected and passed to frontend

- [ ] Implement ErrorScreen component in frontend
  _Prompt: Implement the task for spec kube-api-error-handling, first run spec-workflow-guide to get the workflow guide then implement the task:
  Role: React developer
  Task: Implement ErrorScreen component with helpful message and docs link
  Restrictions: Must be visually distinct and easy to understand
  _Leverage: Existing ErrorBoundary
  _Requirements: User-friendly error screen is shown
  Success: Error screen displays correct message and link

- [ ] Link error screen to RBAC documentation
  _Prompt: Implement the task for spec kube-api-error-handling, first run spec-workflow-guide to get the workflow guide then implement the task:
  Role: Frontend developer
  Task: Link error screen to RBAC documentation
  Restrictions: Link must be easy to find
  _Leverage: Existing docs
  _Requirements: Link to RBAC docs is present
  Success: Users can access RBAC docs from error screen
