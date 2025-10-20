export interface User {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'analyst' | 'user';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AIService {
  id: string;
  name: string;
  description: string;
  category: 'NLP' | 'CV' | 'generation' | 'analytics' | 'audio' | 'other';
  operationType: string;
  inputFormats: string[];
  outputFormats: string[];
  parameters?: Record<string, any>;
  apiEndpoint?: string;
  apiKeyRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  userId: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'code' | 'document';
  format: string;
  content: string;
  metadata?: Record<string, any>;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  status: 'draft' | 'active' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  logs?: any[];
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    serviceId?: string;
    artifactId?: string;
    parameters?: Record<string, any>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

