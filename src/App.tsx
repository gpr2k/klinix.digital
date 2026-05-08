import { Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { AppLayout } from '@/layouts/AppLayout';
import { Agenda } from '@/pages/Agenda';
import { Auditoria } from '@/pages/Auditoria';
import { Clientes } from '@/pages/Clientes';
import { ClienteProfile } from '@/pages/ClienteProfile';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Profissionais } from '@/pages/Profissionais';
import { Servicos } from '@/pages/Servicos';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteProfile />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="profissionais" element={<Profissionais />} />
        <Route
          path="auditoria"
          element={
            <AuthGuard allowedRoles={['ADMIN']}>
              <Auditoria />
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
