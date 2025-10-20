import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiServicesAPI } from '../lib/api';
import { AIService } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

export default function AIServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await aiServicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Сервисы</h1>
              <p className="text-sm text-gray-600">Каталог доступных AI операций</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет доступных сервисов
              </h3>
              <p className="text-gray-600">
                AI сервисы будут добавлены администратором
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {service.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {service.operationType}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Входные форматы:</p>
                      <div className="flex gap-1 flex-wrap">
                        {service.inputFormats.map((format, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Выходные форматы:</p>
                      <div className="flex gap-1 flex-wrap">
                        {service.outputFormats.map((format, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
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

