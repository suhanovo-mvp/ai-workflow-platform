import axios from 'axios';
import type { AuthResponse, User, AIService, Artifact, Workflow, WorkflowExecution } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string, role?: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password, role });
    return data;
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// AI Services API
export const aiServicesAPI = {
  getAll: async (): Promise<AIService[]> => {
    const { data } = await api.get('/ai-services');
    return data;
  },
  
  getById: async (id: string): Promise<AIService> => {
    const { data } = await api.get(`/ai-services/${id}`);
    return data;
  },
  
  create: async (service: Partial<AIService>): Promise<AIService> => {
    const { data } = await api.post('/ai-services', service);
    return data;
  },
  
  update: async (id: string, service: Partial<AIService>): Promise<AIService> => {
    const { data } = await api.put(`/ai-services/${id}`, service);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/ai-services/${id}`);
  },
};

// Artifacts API
export const artifactsAPI = {
  getAll: async (): Promise<Artifact[]> => {
    const { data } = await api.get('/artifacts');
    return data;
  },
  
  getById: async (id: string): Promise<Artifact> => {
    const { data } = await api.get(`/artifacts/${id}`);
    return data;
  },
  
  create: async (artifact: Partial<Artifact>): Promise<Artifact> => {
    const { data } = await api.post('/artifacts', artifact);
    return data;
  },
  
  update: async (id: string, artifact: Partial<Artifact>): Promise<Artifact> => {
    const { data } = await api.put(`/artifacts/${id}`, artifact);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/artifacts/${id}`);
  },
};

// Workflows API
export const workflowsAPI = {
  getAll: async (): Promise<Workflow[]> => {
    const { data } = await api.get('/workflows');
    return data;
  },
  
  getById: async (id: string): Promise<Workflow> => {
    const { data } = await api.get(`/workflows/${id}`);
    return data;
  },
  
  create: async (workflow: Partial<Workflow>): Promise<Workflow> => {
    const { data } = await api.post('/workflows', workflow);
    return data;
  },
  
  update: async (id: string, workflow: Partial<Workflow>): Promise<Workflow> => {
    const { data } = await api.put(`/workflows/${id}`, workflow);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },
  
  execute: async (id: string): Promise<WorkflowExecution> => {
    const { data } = await api.post(`/workflows/${id}/execute`);
    return data;
  },
  
  getExecutions: async (id: string): Promise<WorkflowExecution[]> => {
    const { data } = await api.get(`/workflows/${id}/executions`);
    return data;
  },
};

// Executions API
export const executionsAPI = {
  getById: async (id: string): Promise<WorkflowExecution> => {
    const { data } = await api.get(`/executions/${id}`);
    return data;
  },
  
  getLogs: async (id: string): Promise<{ logs: any[] }> => {
    const { data } = await api.get(`/executions/${id}/logs`);
    return data;
  },
};

export default api;

