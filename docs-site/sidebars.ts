const sidebars = {
  sidebar: [
    'index',
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/interaction-with-kubernetes',
        'architecture/rbac-setup',
        'architecture/production-features',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: ['deployment/index', 'deployment/docker', 'deployment/from-source', 'deployment/helm'],
    },
    {
      type: 'category',
      label: 'Features',
      items: ['features/error-handling', 'features/multi-namespace-streaming'],
    },
    {
      type: 'category',
      label: 'API',
      items: ['api/health-check'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/error-codes'],
    },
  ],
};

export default sidebars;
