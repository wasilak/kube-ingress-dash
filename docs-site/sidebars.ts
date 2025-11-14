const sidebars = {
  sidebar: [
  'index',
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/interaction-with-kubernetes',
        'architecture/rbac-setup',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/index',
        'deployment/docker',
        'deployment/from-source',
        'deployment/helm',
      ],
    },
  ],
};

export default sidebars;
