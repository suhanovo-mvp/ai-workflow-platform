import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import AIServices from './pages/AIServices';
import Artifacts from './pages/Artifacts';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/workflow/:id"
          element={
            <PrivateRoute>
              <WorkflowEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-services"
          element={
            <PrivateRoute>
              <AIServices />
            </PrivateRoute>
          }
        />
        <Route
          path="/artifacts"
          element={
            <PrivateRoute>
              <Artifacts />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

