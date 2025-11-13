# Development Guide

This guide provides instructions for setting up a development environment, contributing to the project, and understanding the codebase.

## Prerequisites

Before you begin developing kube-ingress-dash, ensure you have:

- Node.js v18+ installed
- npm (v8+) or yarn installed
- Docker (for building container images)
- Kubernetes cluster (Minikube, Kind, or access to any cluster for testing)
- Git
- A Kubernetes Ingress controller deployed in your test cluster (NGINX, Traefik, etc.)

## Setting Up Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/kube-ingress-dash.git
cd kube-ingress-dash
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Additional Dev Dependencies

```bash
# For testing
npm install -D @testing-library/jest-dom @testing-library/react jest-environment-jsdom

# For building
npm install -D tailwindcss postcss autoprefixer
```

## Project Structure

Understanding the project organization:

```
kube-ingress-dash/
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   └── ingresses/
│   │   │       └── route.ts    # Main ingress data API
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard page
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/ui components
│   │   │   ├── card.tsx        # Card component
│   │   │   ├── button.tsx      # Button component
│   │   │   └── ...
│   │   ├── ingress-card.tsx    # Ingress card display component
│   │   ├── search-bar.tsx      # Search bar component
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   │   └── use-mounted.ts      # Hook to handle hydration
│   ├── lib/                    # Library functions and utilities
│   │   ├── k8s/                # Kubernetes client implementation
│   │   │   ├── client.ts       # Kubernetes API client
│   │   │   └── ingress-stream.ts # Real-time ingress updates
│   │   └── utils/              # Utility functions
│   │       ├── ingress-transformer.ts  # Convert K8s to UI format
│   │       └── ...             # Other utilities
│   ├── types/                  # TypeScript type definitions
│   │   └── ingress.ts          # Ingress type definitions
│   └── ...
├── charts/                     # Helm charts
│   └── kube-ingress-dash/
├── docs/                       # Documentation
├── tests/                      # Test files (alternative location)
├── .github/
│   └── workflows/              # CI/CD workflows
├── __tests__/                  # Jest test files
├── Dockerfile                  # Docker build definition
├── docker-compose.yml          # Docker Compose for local dev
├── jest.config.js              # Jest configuration
├──jest.setup.js                 # Jest setup file
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Development Workflow

### 1. Running the Application Locally

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:3000
```

For local development with in-cluster access, you'll need to configure cluster access:

```bash
# If using kubeconfig file
export KUBECONFIG=~/.kube/config

# If running in-cluster, the app will automatically detect the cluster
```

### 2. Environment Specific Development

#### Development Environment

```bash
# Default - runs with hot reloading
npm run dev

# Or with specific port
PORT=3001 npm run dev
```

#### Mock Data Development

For local development without a Kubernetes cluster, you might want to create mock data. The application currently fetches from the cluster API, but you can mock the service for testing:

Create a `__mocks__` directory structure similar to your source code to override API calls during development.

### 3. Building the Application

```bash
# Build for production
npm run build

# Preview the production build
npm run start
```

### 4. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test ingress-card

# Generate coverage report
npm run test:coverage

# Run tests with verbose output
npm test -- --verbose
```

### 5. Linting and Formatting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Format code with Prettier
npm run format
```

## Code Quality Standards

### TypeScript Best Practices

1. **Type Safety**: All props, return values, and variables should have explicit types
2. **Interfaces**: Use `interface` for object shapes and `type` for union types
3. **Generic Types**: Use generics when creating reusable components

```typescript
interface IngressCardProps {
  ingress: IngressData;
  onClick?: () => void;
}
```

### React Best Practices

1. **Component Structure**: Follow the pattern of component declaration at end of file
2. **Custom Hooks**: Extract common logic into custom hooks
3. **Children Prop**: Use `React.ReactNode` for children prop

### Styling Conventions

1. **Tailwind Classes**: Use consistent class ordering
2. **Shadcn Components**: Leverage existing shadcn component styles
3. **CSS Variables**: Use CSS variables for theming

### Error Handling

1. **Try-Catch**: Wrap asynchronous operations
2. **Error Boundaries**: Use error boundaries for component trees
3. **Logging**: Log errors appropriately with context

## Key Components Overview

### Main Dashboard Page (`src/app/page.tsx`)

Handles the main dashboard functionality:
- State management for ingresses
- Filtering and search
- Theme selection
- Loading states
- Error boundaries

### Ingress Card Component (`src/components/ingress-card.tsx`)

Displays individual ingress information:
- Name and namespace
- Hosts and paths
- TLS status
- Annotations and labels

### Kubernetes Client (`src/lib/k8s/client.ts`)

Handles communication with the Kubernetes API:
- Authentication and authorization
- Ingress listing and watching
- RBAC validation
- Error handling

### Search and Filtering

Located in `src/lib/utils/ingress-transformer.ts`:
- Text-based searching
- Advanced filtering
- Deduplication

## Testing Strategy

### Unit Tests

Located in `__tests__/` or alongside components:

```bash
# Components tests
src/components/__tests__/component-name.test.tsx

# Utilities tests
src/lib/utils/__tests__/utility-name.test.ts

# API route tests
src/app/api/__tests__/route-name.test.ts
```

### Integration Tests

Test the integration between components:

```bash
tests/integration/
```

### Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
test('should render ingress card with correct data', () => {
  // Arrange
  const mockIngress = { /* ... */ };
  
  // Act
  render(<IngressCard ingress={mockIngress} />);
  
  // Assert
  expect(screen.getByText('ingress-name')).toBeInTheDocument();
});
```

## Creating New Features

### 1. Component Development

When creating a new component:

```bash
# Example: Creating a new Stats component
# File: src/components/stats-panel.tsx
import React from 'react';

interface StatsPanelProps {
  // Define your props
}

const StatsPanel: React.FC<StatsPanelProps> = ({ /* props */ }) => {
  return (
    <div className="stats-container">
      {/* Component content */}
    </div>
  );
};

export default StatsPanel;
```

### 2. API Routes

When adding new API routes:

```bash
# File: src/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle request
  return NextResponse.json({ data: '...' });
}
```

### 3. Type Definitions

Add new types to `src/types/`:

```bash
# File: src/types/stats.ts
export interface StatsData {
  // Define your type
}
```

## Kubernetes API Integration

### Working with the Kubernetes Client

The application uses the official Kubernetes JavaScript client. Key considerations:

1. **RBAC Permissions**: Ensure proper RBAC roles are configured
2. **Error Handling**: Handle authentication and authorization errors gracefully
3. **Rate Limiting**: Respect Kubernetes API rate limits
4. **Watch vs List**: Use watches for real-time updates, lists for snapshots

### Adding New Kubernetes Resources

When extending the application to work with other Kubernetes resources:

1. Update the `KubernetesClient` to include new resource methods
2. Create new transformer functions in `ingress-transformer.ts` or new files
3. Add new types in the `types` directory
4. Update RBAC permissions as needed

## Building and Packaging

### Docker Images

Build the Docker image:

```bash
# Build the image
docker build -t kube-ingress-dash:latest .

# Tag and push to registry
docker tag kube-ingress-dash:latest your-registry/kube-ingress-dash:version
docker push your-registry/kube-ingress-dash:version
```

### Helm Charts

Update the Helm chart in `charts/kube-ingress-dash/`:

1. Modify `values.yaml` for configurable values
2. Update `templates/` for Kubernetes manifests
3. Update `Chart.yaml` for version changes
4. Test with `helm install --dry-run`

## Debugging Tips

### Client-side Debugging

```bash
# Enable debug logging
localStorage.setItem('debug', 'kube:*');

# Or in the browser console
window.localStorage.debug = 'kube:*';
```

### Server-side Debugging

```bash
# For Next.js server components
DEBUG=* npm run dev

# For specific areas
DEBUG=app:k8s:* npm run dev
```

### Kubernetes Debugging

```bash
# Check application logs
kubectl logs -f deployment/kube-ingress-dash

# Check Kubernetes API access
kubectl auth can-i get ingresses --as=system:serviceaccount:default:kube-ingress-dash

# Describe pods for more details
kubectl describe pods -l app=kube-ingress-dash
```

## Contributing

### Branch Organization

- Create feature branches for new functionality: `feature/description`  
- Create bugfix branches for fixes: `bugfix/issue-description`
- Keep PRs focused on a single change

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add or update tests for new functionality
4. Follow the existing code style
5. Submit PR with clear description of changes

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run build`)
- [ ] Changes are documented in README if applicable
- [ ] New functionality has tests
- [ ] Includes appropriate error handling
- [ ] Follows existing code patterns
- [ ] Performance implications considered

## Performance Considerations

### Client-side Performance

1. **Virtual Scrolling**: For large ingress lists
2. **Memoization**: Use `React.memo` and `useMemo` appropriately
3. **Efficient Rendering**: Minimize re-renders with proper state management

### Server-side Performance

1. **Connection Pooling**: Efficient Kubernetes API connections
2. **Caching**: Cache expensive operations when appropriate
3. **Pagination**: Support for paginated results for large datasets

## Common Patterns

### State Management

The application uses a combination of:
- React hooks (`useState`, `useEffect`, etc.) for component state
- Context API for theme and application-wide state
- Server components where appropriate for initial data loading

### Async Operations

Handle async operations with proper error handling:

```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const data = await api.getData();
    setData(data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

## Troubleshooting Common Issues

### Development Issues

1. **TypeScript Compilation Errors**: Run `npm run build` to catch all type issues
2. **Module Import Errors**: Check absolute imports in `tsconfig.json`
3. **Styling Issues**: Verify Tailwind classes and CSS variables

### Kubernetes Access Issues

1. **RBAC Issues**: Check ClusterRoleBinding and ServiceAccount
2. **API Server Connectivity**: Verify cluster access and network policies
3. **Authentication**: Ensure proper kubeconfig or service account tokens

### Testing Issues

1. **Mock Failures**: Ensure proper mocking of Kubernetes client
2. **Jest Setup**: Verify jest.setup.js configurations
3. **Snapshot Updates**: Run `npm test -- -u` to update snapshots when needed

This guide should help you get started with developing for kube-ingress-dash. If you encounter issues not covered here, please consult the issue tracker or reach out to the community.