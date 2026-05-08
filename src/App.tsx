import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Agenda } from '@/pages/Agenda';
import { Clientes } from '@/pages/Clientes';
import { Dashboard } from '@/pages/Dashboard';
import { NotFound } from '@/pages/NotFound';
import { Profissionais } from '@/pages/Profissionais';
import { Servicos } from '@/pages/Servicos';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="profissionais" element={<Profissionais />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
