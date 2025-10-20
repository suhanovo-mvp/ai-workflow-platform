import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artifactsAPI } from '../lib/api';
import { Artifact } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileText, Image, Music, Video, Code, File } from 'lucide-react';

const getIconForType = (type: string) => {
  switch (type) {
    case 'text': return FileText;
    case 'image': return Image;
    case 'audio': return Music;
    case 'video': return Video;
    case 'code': return Code;
    default: return File;
  }
};

export default function Artifacts() {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      const data = await artifactsAPI.getAll();
      setArtifacts(data);
    } catch (error) {
      console.error('Failed to load artifacts:', error);
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
              <h1 className="text-2xl font-bold text-gray-900">Артефакты</h1>
              <p className="text-sm text-gray-600">Библиотека ваших данных</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : artifacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет артефактов
              </h3>
              <p className="text-gray-600">
                Артефакты будут создаваться при выполнении workflow
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artifacts.map((artifact) => {
              const Icon = getIconForType(artifact.type);
              return (
                <Card key={artifact.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {artifact.metadata?.name || `Артефакт ${artifact.type}`}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {artifact.format}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          artifact.type === 'text' ? 'bg-blue-100 text-blue-800' :
                          artifact.type === 'image' ? 'bg-purple-100 text-purple-800' :
                          artifact.type === 'audio' ? 'bg-green-100 text-green-800' :
                          artifact.type === 'video' ? 'bg-red-100 text-red-800' :
                          artifact.type === 'code' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {artifact.type}
                        </span>
                      </div>
                      {artifact.metadata?.tags && (
                        <div className="flex gap-1 flex-wrap">
                          {artifact.metadata.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Создан: {new Date(artifact.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

