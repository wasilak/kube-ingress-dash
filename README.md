# kube-ingress-dash

A Kubernetes Ingress Dashboard for monitoring and navigating services running in Kubernetes clusters. This tool provides real-time visibility into ingress resources, making it easy to discover, access, and monitor services.

## Features

- **Real-time Ingress Monitoring**: Watch ingress resources update in real-time
- **Search and Filter**: Quickly find ingresses by name, namespace, host, or path
- **Advanced Filtering**: Multi-select component for filtering by labels and annotations
- **Kubernetes Context Information**: View cluster, namespace, and other context information
- **TLS Visualization**: Clear indicators for TLS-enabled ingresses
- **Responsive Dashboard**: Clean, modern UI built with shadcn/ui and Tailwind CSS
- **Dark/Light Theme**: Toggle between light, dark, and system themes with custom indigo theme
- **Service Navigation**: Direct links to your services from the dashboard
- **Error Handling**: Comprehensive error boundaries and centralized error reporting
- **Testing**: Comprehensive test suite with Jest and React Testing Library

## Prerequisites

- Kubernetes cluster with appropriate RBAC permissions
- Node.js v18+ (for local development)
- Docker (for containerized deployment)
- Helm (for Kubernetes deployment)

## Installation & Setup

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kube-ingress-dash
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Containerized Deployment

#### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t kube-ingress-dash .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 kube-ingress-dash
   ```

#### Using Helm

1. Install the Helm chart:
   ```bash
   helm install kube-ingress-dash ./charts/k8s-ingress-dashboard
   ```

2. Or deploy from a remote repository:
   ```bash
   helm install kube-ingress-dash <repo-url>/k8s-ingress-dashboard
   ```

## Configuration

### Kubernetes RBAC

The application requires the following Kubernetes permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kube-ingress-dash-viewer
rules:
- apiGroups: [""]
  resources: ["services", "pods", "endpoints", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses"]
  verbs: ["get", "list", "watch"]
```

### Environment Variables

The application doesn't require any environment variables for basic operation, but you can configure:

- `NODE_ENV`: Set to 'production' for production deployments
- `PORT`: Port to run the application on (default: 3000)

## API Endpoints

### GET /api/ingresses

Fetch all ingresses or filter by namespace:

- Query Parameters:
  - `namespace` (optional): Filter ingresses by namespace
  - `search` (optional): Search term to filter ingresses by name, host, or path

Example response:
```json
{
  "ingresses": [...],
  "timestamp": "2023-10-01T12:00:00Z",
  "namespace": "all",
  "count": 5
}
```

## Development

### Project Structure

```
kube-ingress-dash/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components (ui, business logic)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library files (K8s client, utils)
│   └── types/            # TypeScript type definitions
├── charts/               # Helm charts
├── tests/                # Test files
└── ...
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Multiselect Component

The dashboard includes a custom multiselect component for advanced filtering:

- **Dynamic Sizing**: Automatically expands vertically as more options are selected
- **Overflow Handling**: Shows "+X more" indicator when too many options are selected
- **Tag Removal**: Individual tags can be removed by clicking the close button
- **Searchable Dropdown**: Options can be searched within the dropdown menu
- **Keyboard Navigation**: Supports keyboard navigation and selection

### Build for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS with shadcn/ui components
- Real-time updates with WebSocket/Server-Sent Events

### Backend
- Next.js API routes
- Kubernetes JavaScript client
- RBAC-aware authentication

### Deployment
- Docker multi-stage builds
- Helm chart for Kubernetes deployment
- Standard Kubernetes resources (Deployment, Service, RBAC)

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**: Ensure the service account has proper RBAC permissions to view ingresses.

2. **Ingresses Not Showing**: Verify that the Kubernetes API server is accessible and the application has network connectivity to it.

3. **RBAC Configuration**: If running outside the cluster, ensure `KUBECONFIG` is properly set.

### Debugging

Enable development mode to get detailed error information:

```bash
NODE_ENV=development npm run dev
```

## License

[MIT](LICENSE)

## Support

For support, please open an issue in the GitHub repository.