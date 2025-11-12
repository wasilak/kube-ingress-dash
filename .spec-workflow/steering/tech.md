# Technical Steering Document: kube-ingress-dash

## Architecture Principles
- **Single Responsibility**: Each component/module handles one specific concern
- **Real-time First**: Prioritize real-time updates over batch processing
- **Kubernetes Native**: Leverage Kubernetes APIs and patterns
- **Security First**: Secure by default with proper authentication and authorization
- **Performance Optimized**: Efficient resource usage and fast response times

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Context API (with potential for recoil/zustand if needed)
- **Real-time**: Server-Sent Events (SSE) or WebSockets for live updates
- **Styling**: Tailwind CSS with shadcn/ui components

### Backend
- **Runtime**: Node.js
- **Framework**: Built into Next.js API routes (no separate backend server)
- **Language**: TypeScript
- **Kubernetes Client**: Official Kubernetes JavaScript client library
- **Authentication**: Standard Kubernetes auth methods (in-cluster RBAC, kubeconfig contexts)

### Infrastructure
- **Container Runtime**: Docker
- **Orchestration**: Kubernetes (with Helm for deployment)
- **Packaging**: Helm chart for easy deployment
- **Build Tool**: Standard npm scripts

## Design Patterns

### Data Flow Pattern
```
Kubernetes API → Backend Service → API Route → Frontend → UI Components
```
- Backend watches Kubernetes API for ingress changes
- Changes are pushed to frontend via SSE or WebSocket
- Frontend maintains local state and updates UI components

### Service Pattern
- **Kubernetes Service**: Handles all Kubernetes API interactions
- **Ingress Stream Service**: Manages real-time ingress updates
- **Data Transformation Service**: Converts raw Kubernetes objects to UI-friendly format
- **Theme Service**: Manages color themes and preferences

### Component Pattern
- **Dumb Components**: Presentational components that only render data
- **Smart Components**: Container components that handle state and logic
- **Atomic Design**: Utilize shadcn/ui atomic components

## Security Standards

### Kubernetes Authentication
- **In-cluster**: Use service account tokens with RBAC
- **Out-of-cluster**: Use standard kubeconfig contexts
- **Permissions**: Minimal RBAC permissions required (only ingress read access)

### Client Security
- **No sensitive data**: Do not expose Kubernetes secrets or tokens to frontend
- **Input validation**: Validate all inputs on the backend
- **Output sanitization**: Sanitize any data sent to frontend

### Network Security
- **TLS**: Support connecting to Kubernetes API over TLS
- **Certificate validation**: Proper certificate validation for cluster connections

## Performance Standards

### Response Times
- **Initial Load**: Dashboard loads within 3 seconds
- **Real-time Updates**: Ingress changes reflected within 2 seconds
- **Search Response**: Filter results update in <200ms after typing stops

### Resource Usage
- **Memory**: Dashboard should not exceed 100MB memory usage
- **CPU**: Minimal CPU usage when idle, optimized during updates
- **Network**: Efficient WebSocket/SSE usage without excessive connections

## Code Quality Standards

### TypeScript Type Safety
- **Strict mode**: Use strict TypeScript compiler settings
- **Interface definitions**: Define comprehensive interfaces for all data structures
- **Type checking**: Run type checks in CI pipeline

### Error Handling
- **Graceful degradation**: Dashboard functions even with partial errors
- **User feedback**: Clear error messages when issues occur
- **Logging**: Appropriate server-side logging for debugging

### Testing
- **Unit tests**: For data transformation and utility functions
- **Component tests**: For UI components using React Testing Library
- **Integration tests**: For API endpoints and Kubernetes integration

## Deployment Architecture

### Containerization
- **Multi-stage Dockerfile**: Optimize image size
- **Security scan**: Image scanned for vulnerabilities
- **Minimal base**: Use alpine or similar minimal base image

### Kubernetes Deployment
- **Helm Chart**: Comprehensive chart with configurable options
- **RBAC**: Proper service account, role, and role binding definitions
- **Resource limits**: Memory and CPU limits specified
- **Health checks**: Liveness and readiness probes

## Integration Points

### Kubernetes API Integration
- **Watch mechanism**: Use Kubernetes watch API for real-time updates
- **Authorization**: Support both in-cluster and out-of-cluster authentication
- **Error handling**: Graceful handling of connection issues and permission errors
- **Rate limiting**: Respect API rate limits and implement backoff strategies

### Frontend-Backend Communication
- **API routes**: Next.js API routes for server-side functionality
- **Real-time updates**: SSE or WebSocket for live ingress updates
- **Error propagation**: Backend errors appropriately communicated to frontend

## Monitoring & Observability

### Logging
- **Server-side**: Structured logging on the backend
- **Client-side**: Error reporting without exposing sensitive information

### Health Checks
- **Liveness probe**: Endpoint to check if application is alive
- **Readiness probe**: Endpoint to check if all dependencies are available

## Maintainability

### Modularity
- **Separation of concerns**: Clear separation between UI, business logic, and data access
- **Component reuse**: Design components for reusability
- **Dependency management**: Clear dependency graph with minimal coupling

### Documentation
- **Code comments**: Comprehensive comments for complex logic
- **API documentation**: Document all API endpoints
- **Architecture decisions**: Record key architectural decisions

## Versioning Strategy

### Semantic Versioning
- **MAJOR**: Breaking changes to API or Kubernetes requirements
- **MINOR**: New features without breaking changes
- **PATCH**: Bug fixes and minor improvements

### Kubernetes Compatibility
- **Version support**: Support latest 3 minor versions of Kubernetes
- **API compatibility**: Use stable Kubernetes APIs where possible
- **Testing**: Test against multiple Kubernetes versions in CI

## Serena Tool Integration Requirements

### Development Workflow
- All development tasks must follow the Serena Task Completion Verification Protocol
- Before implementing any task, call the `mcp_serena_initial_instructions` tool
- Use symbolic code navigation tools when working with existing code
- Follow verification protocol before marking any task as complete:
  1. `mcp_serena_think_about_collected_information`
  2. `mcp_serena_think_about_task_adherence`
  3. `mcp_serena_think_about_whether_you_are_done`

### shadcn/ui MCP Integration
- When working with UI components, leverage the shadcn Model Context Protocol (MCP) server for component documentation and best practices
- Use shadcn MCP to access detailed component references, usage examples, and implementation patterns
- The shadcn MCP server acts as a bridge between AI assistants and shadcn component registries
- Consult shadcn MCP for theme customization patterns, especially when implementing custom color schemes like the yellow theme

### Quality Assurance
- Run appropriate diagnostic tools before completing tasks
- Verify requirements and design alignment during implementation
- Check project conventions and style guidelines
- Ensure integration with existing code patterns
- **CRITICAL: Always ensure `npm run build` passes before completing any development work**