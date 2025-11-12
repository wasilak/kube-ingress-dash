# Structure Steering Document: kube-ingress-dash

## Project Structure Convention

```
kube-ingress-dash/
├── src/                           # Source code
│   ├── app/                      # Next.js App Router (or pages/ for Pages Router)
│   │   ├── layout.tsx            # Root layout with theme provider
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── globals.css           # Global styles
│   │   └── api/                  # API routes
│   │       └── ingresses/        # Ingress-related API routes
│   │           └── route.ts      # Main ingress API route
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # shadcn/ui components (auto-generated)
│   │   ├── ingress-card.tsx      # Ingress visualization component
│   │   ├── search-bar.tsx        # Search functionality
│   │   ├── theme-provider.tsx    # Theme context provider
│   │   └── ...                   # Other UI components
│   ├── lib/                      # Business logic and utilities
│   │   ├── k8s/                  # Kubernetes-specific logic
│   │   │   ├── client.ts         # Kubernetes API client
│   │   │   ├── ingress-stream.ts # Ingress streaming service
│   │   │   └── rbac.ts           # RBAC and auth utilities
│   │   ├── utils/                # General utilities
│   │   │   ├── ingress-transformer.ts # Data transformation
│   │   │   ├── error-handler.ts  # Error handling utilities
│   │   │   └── ...               # Other utilities
│   │   └── types/                # Type definitions (if not in src/types)
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-search.ts         # Search functionality hook
│   │   ├── use-theme.ts          # Theme management hook
│   │   └── use-k8s-data.ts       # Kubernetes data fetching hook
│   └── types/                    # TypeScript type definitions
│       └── ingress.ts            # Ingress data type definitions
├── public/                       # Static assets
├── docs/                         # Documentation
│   ├── development.md            # Development setup guide
│   ├── deployment.md             # Deployment instructions
│   └── architecture.md           # Architecture overview
├── charts/                       # Helm charts
│   └── k8s-ingress-dashboard/    # Main Helm chart
│       ├── Chart.yaml            # Chart metadata
│       ├── values.yaml           # Default values
│       ├── templates/            # Kubernetes manifest templates
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── rbac.yaml
│       │   └── ...               # Other Kubernetes resources
│       └── README.md             # Chart documentation
├── tests/                        # Test files (if needed)
├── .dockerignore                 # Docker ignore file
├── Dockerfile                    # Multi-stage Dockerfile
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Node.js dependencies and scripts
├── components.json               # shadcn/ui configuration
└── README.md                     # Project overview
```

## Naming Conventions

### File and Directory Naming
- **Directories**: Use kebab-case (e.g., `k8s-client`, `ui-components`)
- **Files**: Use kebab-case for most files (e.g., `ingress-card.tsx`, `use-search.ts`)
- **TypeScript/React Components**: Use PascalCase for component files (e.g., `IngressCard.tsx`)
- **Test files**: Use `.test.ts` or `.test.tsx` suffix
- **Configuration files**: Use standard naming (e.g., `next.config.js`, `tsconfig.json`)

### Code Naming
- **Components**: Use PascalCase (e.g., `IngressCard`, `SearchBar`)
- **Functions**: Use camelCase (e.g., `getIngresses`, `transformIngressData`)
- **Variables**: Use camelCase (e.g., `ingressData`, `isConnected`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `DEFAULT_THEME`, `INGRESS_API_PATH`)
- **Type/Interface Names**: Use PascalCase (e.g., `IngressData`, `ThemeConfig`)

## Component Organization

### UI Components Structure
```
components/
├── ui/                       # shadcn/ui base components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── layout/                   # Layout-specific components
│   └── theme-provider.tsx
├── data-display/             # Components for displaying data
│   ├── ingress-card.tsx
│   └── ingress-grid.tsx
├── forms/                    # Form and input components
│   └── search-bar.tsx
└── utils/                    # Utility components
    └── error-boundary.tsx
```

### Hooks Structure
```
hooks/
├── data/                     # Data fetching hooks
│   └── use-k8s-data.ts
├── state/                    # State management hooks
│   ├── use-search.ts
│   └── use-theme.ts
└── utils/                    # Utility hooks
    └── use-websocket.ts
```

### Utilities Structure
```
lib/
├── k8s/                      # Kubernetes-specific utilities
│   ├── client.ts
│   ├── ingress-stream.ts
│   └── rbac.ts
├── utils/                    # General utilities
│   ├── ingress-transformer.ts
│   ├── error-handler.ts
│   └── url-builder.ts
└── types/                    # Type definitions
    ├── ingress.ts
    └── k8s.ts
```

## Code Organization Principles

### Single File Responsibility
- Each file should have a single, well-defined purpose
- Component files contain the component and related sub-components
- Service files handle specific functionality
- Hook files export related hooks
- Utility files contain related helper functions

### Module Dependencies
- **Top-level imports**: Import from standard libraries first
- **Internal imports**: Organized by directory structure
- **No circular dependencies**: Maintain clear dependency hierarchy
- **Shared utilities**: Create reusable utility modules for common functions

### API Structure
```
app/
├── api/
│   ├── ingresses/
│   │   └── route.ts          # Handles ingress data API
│   └── [...path]/             # Catch-all for any additional API routes
```

## Build and Deployment Structure

### Docker Multi-stage Build
```
Dockerfile
├── Base stage: Set up Node.js environment
├── Dependencies stage: Install production dependencies
├── Build stage: Build Next.js application
└── Production stage: Copy build assets and run application
```

### Helm Chart Structure
```
charts/k8s-ingress-dashboard/
├── Chart.yaml                 # Chart metadata
├── values.yaml                # Default configuration values
├── values.schema.json         # Schema validation for values
├── README.md                 # Chart documentation
└── templates/                # Kubernetes resource templates
    ├── _helpers.tpl          # Template helper functions
    ├── deployment.yaml       # Application deployment
    ├── service.yaml          # Service definition
    ├── serviceaccount.yaml   # Service account
    ├── role.yaml             # RBAC role
    ├── rolebinding.yaml      # RBAC role binding
    ├── clusterrole.yaml      # RBAC cluster role (if needed)
    ├── clusterrolebinding.yaml # RBAC cluster role binding (if needed)
    ├── ingress.yaml          # Ingress for dashboard access (optional)
    ├── hpa.yaml             # Horizontal Pod Autoscaler (optional)
    └── NOTES.txt            # Installation notes
```

## Testing Structure (if implemented)
```
tests/
├── unit/                     # Unit tests
│   ├── components/           # Component tests
│   │   └── ingress-card.test.tsx
│   ├── lib/                  # Library/utilities tests
│   │   ├── k8s/
│   │   └── utils/
│   └── hooks/                # Hook tests
│       └── use-search.test.ts
├── integration/              # Integration tests
│   └── api/
│       └── ingresses.test.ts
└── e2e/                      # End-to-end tests
    └── dashboard.test.ts
```

## Documentation Structure
```
docs/
├── development/
│   ├── setup.md             # Local development setup
│   ├── architecture.md      # System architecture overview
│   └── contributing.md      # Contribution guidelines
├── deployment/
│   ├── kubernetes.md        # Kubernetes deployment guide
│   ├── configuration.md     # Configuration options
│   └── troubleshooting.md   # Troubleshooting guide
├── api/                     # API documentation
│   └── reference.md         # API endpoints reference
└── usage/                   # User guide
    ├── quickstart.md        # Getting started
    └── features.md          # Feature usage
```

## Configuration Files Structure
- **`package.json`**: Dependencies, scripts, and project metadata
- **`tsconfig.json`**: TypeScript compiler configuration
- **`next.config.js`**: Next.js configuration
- **`components.json`**: shadcn/ui configuration
- **`.dockerignore`**: Files to exclude from Docker build
- **`.gitignore`**: Files to exclude from Git
- **`Dockerfile`**: Multi-stage Docker build configuration

## Import/Export Patterns

### Internal Module Imports
```typescript
// Prefer relative imports within the same domain
import { IngressCard } from '@/components/data-display/ingress-card';
import { useK8sData } from '@/hooks/data/use-k8s-data';
import { getIngresses } from '@/lib/k8s/client';
import { IngressData } from '@/types/ingress';
```

### Public API Exports
- Create index.ts files to expose public APIs
- Use barrel exports to simplify imports
- Maintain clear boundaries between public and private APIs

### Third-party Library Integration
- Group third-party imports at the top
- Create wrapper modules for complex third-party integrations
- Maintain consistent usage patterns across the application

## Serena Tool Integration Requirements

### Project Navigation Protocol
- When starting work on any task within this project, use Serena's symbolic code navigation tools to understand the structure
- Call `mcp_serena_initial_instructions` at the beginning of each development session
- Leverage `find_symbol`, `find_referencing_symbols`, and other symbolic tools to understand existing code patterns
- Use `get_symbols_overview` to understand new files before modifying them

### shadcn/ui MCP Integration
- When working with UI components and themes, utilize the shadcn Model Context Protocol (MCP) server
- The MCP provides detailed component documentation, usage examples, and theme customization patterns
- Consult MCP for best practices when implementing custom color themes like the yellow theme variants
- Use MCP to access comprehensive shadcn component registry information

### Implementation Verification
- Before completing any implementation work, run the Serena verification protocol:
  1. `mcp_serena_think_about_collected_information` - Verify understanding of requirements
  2. `mcp_serena_think_about_task_adherence` - Verify implementation matches task requirements
  3. `mcp_serena_think_about_whether_you_are_done` - Verify completeness of work
- Always check existing code patterns and project conventions during implementation
- Use diagnostic tools to verify code quality before completion
- **CRITICAL: Always verify that `npm run build` passes before considering any work complete**