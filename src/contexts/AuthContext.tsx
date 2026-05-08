import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole | null;
}

interface AuthState {
  /** True while the initial session + role lookup are in flight. */
  isInitializing: boolean;
  session: Session | null;
  user: AuthUser | null;
  /** Last error from signIn / role lookup. Surface in the Login page. */
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseClient
    .from('users')
    .select('id, name, email, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data as ProfileRow | null;
}

function mergeUser(
  session: Session | null,
  profile: ProfileRow | null,
): AuthUser | null {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: profile?.name ?? session.user.email ?? null,
    role: profile?.role ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profileCacheRef = useRef<Map<string, ProfileRow>>(new Map());

  const loadProfile = useCallback(async (current: Session | null) => {
    if (!current?.user) {
      setUser(null);
      return;
    }
    const cached = profileCacheRef.current.get(current.user.id);
    if (cached) {
      setUser(mergeUser(current, cached));
      return;
    }
    try {
      const profile = await fetchProfile(current.user.id);
      if (profile) {
        profileCacheRef.current.set(current.user.id, profile);
      }
      setUser(mergeUser(current, profile));
    } catch (err) {
      setUser(mergeUser(current, null));
      setError(err instanceof Error ? err.message : 'Falha ao carregar perfil.');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        return loadProfile(data.session);
      })
      .finally(() => {
        if (mounted) setIsInitializing(false);
      });
    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (!nextSession) {
          profileCacheRef.current.clear();
          setUser(null);
        } else {
          loadProfile(nextSession);
        }
      },
    );
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabaseClient.auth.signInWithPassword(
      { email, password },
    );
    if (signInError) {
      setError(signInError.message);
      throw new Error(signInError.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    profileCacheRef.current.clear();
    const { error: signOutError } = await supabaseClient.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ isInitializing, session, user, error, signIn, signOut }),
    [isInitializing, session, user, error, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
