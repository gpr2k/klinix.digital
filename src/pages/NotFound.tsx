import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-6xl font-semibold text-slate-300">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="text-sm text-slate-600">
        A rota solicitada não existe.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
