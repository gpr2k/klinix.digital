import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const { isInitializing, session, signIn, error: authError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormError(null);
  }, [email, password]);

  if (!isInitializing && session) {
    const from = (location.state as LocationState | null)?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setFormError('Preencha email e senha.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Falha no login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError ?? authError;

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            K
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">Klinix.digital</p>
            <p className="text-xs text-slate-500">Área restrita</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {displayError ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {displayError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          Crie usuários no painel do Supabase (Auth → Users) e defina o papel
          via <code className="font-mono">update public.users set role = 'ADMIN' …</code>.
        </p>
      </div>
    </div>
  );
}
