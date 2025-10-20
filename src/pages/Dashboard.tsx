import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowsAPI } from '../lib/api';
import { Workflow } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, LogOut, Workflow as WorkflowIcon, FileText, Cpu } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowsAPI.getAll();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateWorkflow = () => {
    navigate('/workflow/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Workflow Platform</h1>
              <p className="text-sm text-gray-600">Добро пожаловать, {user?.email}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/ai-services')}>
                <Cpu className="mr-2 h-4 w-4" />
                AI Сервисы
              </Button>
              <Button variant="outline" onClick={() => navigate('/artifacts')}>
                <FileText className="mr-2 h-4 w-4" />
                Артефакты
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Мои Workflow</h2>
          <Button onClick={handleCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            Создать Workflow
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <WorkflowIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет созданных workflow
              </h3>
              <p className="text-gray-600 mb-4">
                Начните создавать свой первый AI workflow
              </p>
              <Button onClick={handleCreateWorkflow}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первый Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/workflow/${workflow.id}`)}
              >
                <CardHeader>
                  <CardTitle>{workflow.name}</CardTitle>
                  <CardDescription>
                    {workflow.description || 'Без описания'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <WorkflowIcon className="h-4 w-4" />
                      {workflow.nodes?.length || 0} узлов
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      workflow.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

