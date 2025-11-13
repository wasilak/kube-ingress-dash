# Development Guide

This guide provides information for developers who want to contribute to kube-ingress-dash or customize it for their needs.

## Prerequisites

- Node.js v18 or later
- npm v8 or later (or yarn/pnpm)
- Kubernetes cluster for testing (optional)
- Docker (for containerization)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kube-ingress-dash
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The application uses the standard Kubernetes configuration. Ensure your kubeconfig file is properly configured:

```bash
# Verify kubectl works
kubectl cluster-info

# The application will use the current context by default
kubectl config current-context
```

### 4. Run in Development Mode

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
kube-ingress-dash/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/             # API routes
│   │   │   └── ingresses/   # Ingress API endpoints
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main dashboard page
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── error-boundary.tsx  # Error boundary component
│   │   ├── ingress-card.tsx    # Ingress card display component
│   │   ├── search-bar.tsx      # Search and filter component
│   │   └── theme-provider.tsx  # Theme management
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Library files
│   │   ├── k8s/             # Kubernetes client and utilities
│   │   │   └── client.ts    # Main Kubernetes client
│   │   └── utils/           # Utility functions
│   │       ├── error-handler.ts    # Error handling utilities
│   │       └── ingress-transformer.ts  # Ingress data transformation
│   └── types/               # TypeScript definitions
│       └── ingress.ts       # Ingress data types
├── public/                  # Static assets
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── charts/                  # Helm charts
│   └── k8s-ingress-dashboard/
│       ├── Chart.yaml       # Chart metadata
│       ├── values.yaml      # Default values
│       └── templates/       # Kubernetes manifest templates
├── docs/                    # Documentation
├── Dockerfile               # Multi-stage Docker build
├── .dockerignore            # Docker ignore rules
├── jest.config.js           # Jest configuration
├── jest.setup.js            # Jest setup
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Architecture

### Frontend Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks (useState, useEffect, etc.)
- **Data Fetching**: Built-in Next.js fetch capabilities

### Backend Architecture

- **API**: Next.js API routes
- **Kubernetes Client**: Official Kubernetes JavaScript client
- **Authentication**: RBAC-based with in-cluster and out-of-cluster support
- **Data Processing**: Ingress transformation and filtering

### Key Components

#### Ingress Data Flow
1. Kubernetes API provides raw ingress data
2. `lib/k8s/client.ts` fetches ingresses
3. `lib/utils/ingress-transformer.ts` processes and transforms data
4. API route (`app/api/ingresses/route.ts`) serves the data
5. `components/ingress-card.tsx` displays the data
6. `app/page.tsx` orchestrates the dashboard

#### Error Handling
1. `lib/utils/error-handler.ts` provides centralized error handling
2. `components/error-boundary.tsx` catches rendering errors
3. API routes use the error handler for consistent error responses

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production version |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Code Style and Conventions

### TypeScript

- Use strict TypeScript with `strict: true` in tsconfig
- Define clear interfaces for data structures
- Use type guards when necessary
- Prefer types over interfaces unless you need to extend

### React Components

- Use functional components with hooks
- Follow the container/presentational component pattern
- Use descriptive prop names
- Destructure props in component signatures
- Use React.memo for performance when appropriate

### Naming Conventions

- File names: Use kebab-case for most files (e.g., `search-bar.tsx`)
- Component names: Use PascalCase (e.g., `SearchBar`)
- Variable names: Use camelCase (e.g., `ingressData`)
- Constants: Use UPPER_SNAKE_CASE (e.g., `INGRESS_STATUS_ACTIVE`)

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui design patterns
- Use CSS variables for theming defined in `globals.css`
- Maintain consistent spacing and typography

## Testing

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/                 # Unit tests for individual functions/components
│   ├── error-handler.test.ts    # Error handler tests
│   └── ingress-card.test.tsx    # Ingress card component tests
└── integration/          # Integration tests for API routes
    └── ingress-api.test.ts      # API route tests
```

### Writing Tests

- Use Jest and React Testing Library
- Test component behavior, not implementation details
- Use meaningful test descriptions
- Mock external dependencies appropriately
- Test error states and edge cases

Example test:
```tsx
import { render, screen } from '@testing-library/react';
import IngressCard from '@/components/ingress-card';

test('displays ingress name and namespace', () => {
  const mockIngress = {
    name: 'test-ingress',
    namespace: 'test-namespace',
    // ... other required properties
  };

  render(<IngressCard ingress={mockIngress} />);
  
  expect(screen.getByText('test-ingress')).toBeInTheDocument();
  expect(screen.getByText('test-namespace')).toBeInTheDocument();
});
```

## Kubernetes Integration

### Client Configuration

The Kubernetes client (`lib/k8s/client.ts`) handles authentication for both in-cluster and out-of-cluster scenarios:

- **In-cluster**: Uses service account token and CA certificate
- **Out-of-cluster**: Uses kubeconfig file (typically `~/.kube/config`)

### RBAC Permissions

The application requires these permissions:
- `get`, `list`, `watch` on `ingresses` (networking.k8s.io)
- `get`, `list`, `watch` on `services`, `pods`, `endpoints`, `namespaces`

### API Error Handling

All Kubernetes API errors are caught and handled by the error handler utility:

```ts
try {
  const ingresses = await kubeClient.getIngresses();
  // Process ingresses
} catch (error) {
  const errorInfo = ErrorHandler.handleKubernetesError(error, 'GET /api/ingresses');
  // Handle error appropriately
}
```

## Building and Packaging

### Docker Build

```bash
# Build the Docker image
docker build -t kube-ingress-dash .

# Run the container
docker run -p 3000:3000 kube-ingress-dash
```

### Next.js Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

The build process includes:
- Type checking
- ESLint validation
- Bundle optimization
- Static asset optimization

## Extending the Application

### Adding New Features

1. Identify the scope of the feature
2. Create necessary data types in `types/`
3. Implement backend functionality in `lib/`
4. Create components in `components/`
5. Add routes if necessary in `app/`
6. Write tests for new functionality
7. Update documentation as needed

### Adding New API Endpoints

1. Create a new route file in `app/api/`
2. Implement the API logic with proper error handling
3. Add to the error handler if needed
4. Write integration tests
5. Update API documentation

### Component Development

When developing new components:

1. Place reusable components in `components/`
2. Use shadcn/ui components when possible
3. Follow the same styling patterns
4. Add proper TypeScript typing
5. Write unit tests
6. Document props if complex

## Troubleshooting

### Common Development Issues

1. **Hydration Errors**: Ensure client-side state is initialized after mounting:
   ```ts
   const [isMounted, setIsMounted] = useState(false);
   
   useEffect(() => {
     setIsMounted(true);
   }, []);
   
   if (!isMounted) return null; // or a loading state
   ```

2. **TypeScript Errors**: Run `npm run build` to see all type errors at once

3. **Test Failures**: Check for missing mocks for external dependencies

4. **Kubernetes Connection Issues**: Verify kubeconfig and RBAC permissions

### Performance Optimization

- Use React.memo for components that render frequently
- Implement proper key props for lists
- Optimize image loading if added
- Consider code splitting for large components
- Use lazy loading when appropriate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the code style
4. Add tests for new functionality
5. Update documentation as needed
6. Run all tests to ensure nothing is broken
7. Submit a pull request with a clear description

### Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix
- Include tests for new functionality
- Update documentation as needed
- Follow the existing code style
- Provide a clear description of changes

## Deployment from Development

To package your development changes for deployment:

1. Build the application: `npm run build`
2. Test locally: `npm run start`
3. Build Docker image: `docker build -t your-image:tag .`
4. Push to registry: `docker push your-image:tag`
5. Update Helm chart values and deploy