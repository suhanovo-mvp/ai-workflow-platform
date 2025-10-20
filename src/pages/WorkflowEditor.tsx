import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowsAPI, aiServicesAPI } from '../lib/api';
import { AIService, Workflow } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Save, Play, ArrowLeft, Plus } from 'lucide-react';

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [name, setName] = useState('Новый Workflow');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState<AIService[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
    if (id && id !== 'new') {
      loadWorkflow();
    }
  }, [id]);

  const loadServices = async () => {
    try {
      const data = await aiServicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const loadWorkflow = async () => {
    if (!id || id === 'new') return;
    
    try {
      const data = await workflowsAPI.getById(id);
      setWorkflow(data);
      setName(data.name);
      setDescription(data.description || '');
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const workflowData = {
        name,
        description,
        nodes,
        edges,
        status: 'draft' as const,
      };

      if (id && id !== 'new') {
        await workflowsAPI.update(id, workflowData);
      } else {
        const newWorkflow = await workflowsAPI.create(workflowData);
        navigate(`/workflow/${newWorkflow.id}`, { replace: true });
      }
      alert('Workflow сохранен!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!id || id === 'new') {
      alert('Сначала сохраните workflow');
      return;
    }

    try {
      await workflowsAPI.execute(id);
      alert('Workflow запущен!');
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      alert('Ошибка при запуске');
    }
  };

  const addServiceNode = (service: AIService) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: service.name,
        serviceId: service.id,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 max-w-md">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название workflow"
              className="font-semibold"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button onClick={handleExecute}>
            <Play className="mr-2 h-4 w-4" />
            Запустить
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-4">AI Сервисы</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => addServiceNode(service)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-gray-600">{service.description}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {service.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {service.operationType}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

