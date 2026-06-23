export const CATEGORIES: Record<string, string[]> = {
  'Tech / Engineering': [
    'API', 'CI/CD', 'DevOps', 'MVP', 'scalability', 'microservices', 'Kubernetes',
    'containerization', 'serverless', 'technical debt', 'refactoring', 'code review',
    'sprint', 'backlog', 'velocity', 'SLA', 'latency', 'throughput', 'observability',
    'monitoring', 'incident', 'on-call', 'deployment', 'rollback', 'feature flag',
    'A/B testing', 'architecture', 'migration', 'caching', 'load balancing',
    'authentication', 'authorization', 'encryption', 'cloud-native',
  ],
  'Corporate / Strategy': [
    'ROI', 'synergy', 'alignment', 'stakeholder', 'bandwidth', 'leverage', 'circle back',
    'take offline', 'action item', 'move the needle', 'low-hanging fruit', 'deep dive',
    'drill down', 'touch base', 'ideate', 'paradigm shift', 'value proposition',
    'deliverable', 'KPI', 'OKR', 'North Star', 'strategy', 'roadmap', 'milestone',
    'headcount', 'resourcing', 'prioritization', 'escalation', 'visibility',
    'accountability', 'ownership', 'buy-in', 'cross-functional',
  ],
  'Startup': [
    'pivot', 'runway', 'traction', 'growth hacking', 'unicorn', 'burn rate',
    'product-market fit', 'disruption', 'iterate', 'scale', 'ecosystem',
    'go-to-market', 'series A', 'venture capital', 'angel investor', 'exit strategy',
    'freemium', 'churn', 'retention', 'acquisition', 'monetization', 'unit economics',
    'cohort analysis', 'conversion rate', 'funnel', 'user journey', 'persona',
    'launch', 'ship it', 'fail fast', 'lean', 'agile', 'two-sided market',
  ],
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES)
