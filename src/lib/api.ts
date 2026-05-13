import type { User, UserRole } from '@/components/SecurityProvider';

const fallbackApiUrl = 'https://api.statementwiseai.com/v1';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  fallbackApiUrl
).replace(/\/+$/, '');

type BackendRole = 'user' | 'admin' | 'accountant' | 'viewer' | UserRole;

interface BackendUser {
  id: string;
  email: string;
  full_name?: string | null;
  name?: string | null;
  company_name?: string | null;
  role?: BackendRole | null;
  avatar_url?: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
  detail?: string | Array<{ msg?: string }>;
  message?: string;
}

interface AuthPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: BackendUser;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
}

const roleMap: Record<string, UserRole> = {
  user: 'individual',
  individual: 'individual',
  accountant: 'firm',
  firm: 'firm',
  client: 'client',
  admin: 'admin',
  viewer: 'viewer',
};

export function mapBackendUser(backendUser: BackendUser): User {
  const rawRole = String(backendUser.role || 'user').toLowerCase();

  return {
    id: backendUser.id,
    email: backendUser.email,
    name:
      backendUser.full_name ||
      backendUser.name ||
      backendUser.company_name ||
      backendUser.email.split('@')[0] ||
      'User',
    role: roleMap[rawRole] || 'individual',
    avatar: backendUser.avatar_url || undefined,
  };
}

function getErrorMessage(body: ApiEnvelope<unknown>, fallback: string): string {
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail.map((item) => item.msg).filter(Boolean).join(', ') || fallback;
  }
  return body.message || fallback;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiEnvelope<T>)
    : ({ message: await response.text() } as ApiEnvelope<T>);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, `Request failed with status ${response.status}`));
  }

  return (body.data ?? body) as T;
}

function normalizeAuthSession(payload: AuthPayload): AuthSession {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
    user: mapBackendUser(payload.user),
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    const payload = await requestJson<AuthPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return normalizeAuthSession(payload);
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    const payload = await requestJson<AuthPayload>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        full_name: input.fullName,
        company_name: input.companyName || undefined,
      }),
    });

    return normalizeAuthSession(payload);
  },

  async logout(token: string | null): Promise<void> {
    if (!token) return;

    await requestJson('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => undefined);
  },
};

export function buildSupabaseOAuthUrl(
  provider: 'google' | 'apple',
  nextPath: string
): string | null {
  if (import.meta.env.VITE_ENABLE_SOCIAL_AUTH !== 'true') return null;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const redirectTo = new URL('/auth/callback', window.location.origin);
  redirectTo.searchParams.set('next', nextPath);

  const url = new URL('/auth/v1/authorize', supabaseUrl);
  url.searchParams.set('provider', provider);
  url.searchParams.set('redirect_to', redirectTo.toString());
  return url.toString();
}
