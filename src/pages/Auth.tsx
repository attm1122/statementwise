import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Building2, Loader2, Lock, Mail, User } from 'lucide-react';
import { useSecurity } from '@/components/SecurityProvider';
import { buildSupabaseOAuthUrl } from '@/lib/api';

type AuthMode = 'signin' | 'signup';

interface AuthPageProps {
  mode: AuthMode;
}

function getSafeNext(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}

export default function Auth({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, loading } = useSecurity();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const next = getSafeNext(params.get('next'), mode === 'signup' ? '/convert' : '/dashboard');

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';
  const googleUrl = typeof window !== 'undefined' ? buildSupabaseOAuthUrl('google', next) : null;
  const appleUrl = typeof window !== 'undefined' ? buildSupabaseOAuthUrl('apple', next) : null;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, next]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignup) {
        await register({
          fullName: fullName.trim(),
          companyName: companyName.trim() || undefined,
          email,
          password,
        });
      } else {
        await login(email, password);
      }

      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const socialButtonClass =
    'flex h-11 items-center justify-center rounded-lg border border-[#162544] bg-[#050B14] text-sm font-semibold text-[#E8EEF7] transition hover:border-[#1E3260] hover:bg-[#162544]/40 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <main className="min-h-[calc(100dvh-72px)] pt-[72px] bg-[#050B14] text-[#E8EEF7]">
      <div className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-2xl border border-[#162544] bg-[#0B1628] shadow-2xl shadow-black/30 md:grid-cols-[1fr_1.1fr]">
          <section className="hidden border-r border-[#162544] bg-[#08111F] p-10 md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#78A4FF]">Statementwise.ai</p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight">
                Convert bank statements without the manual grind.
              </h1>
              <p className="mt-5 text-base leading-7 text-[#8BA3C7]">
                Create your account, upload a statement, and review extracted transactions in one protected workspace.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#8BA3C7]">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#00D68F]" />
                50 free pages included
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#4B82FF]" />
                Secure session-based access
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#FFB020]" />
                Export to CSV, XLSX, OFX, QBO, and JSON
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm text-[#8BA3C7]">
                {isSignup ? 'Start free. No credit card required.' : 'Sign in to continue to your workspace.'}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {googleUrl ? (
                  <a className={socialButtonClass} href={googleUrl}>Continue with Google</a>
                ) : (
                  <button className={socialButtonClass} type="button" disabled>Google unavailable</button>
                )}
                {appleUrl ? (
                  <a className={socialButtonClass} href={appleUrl}>Continue with Apple</a>
                ) : (
                  <button className={socialButtonClass} type="button" disabled>Apple unavailable</button>
                )}
              </div>

              <div className="my-6 flex items-center gap-3 text-xs text-[#4A6180]">
                <span className="h-px flex-1 bg-[#162544]" />
                Email
                <span className="h-px flex-1 bg-[#162544]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#C8D6EC]">Full name</span>
                      <span className="flex h-12 items-center gap-3 rounded-lg border border-[#162544] bg-[#050B14] px-3 focus-within:border-[#4B82FF]">
                        <User size={18} className="text-[#4A6180]" />
                        <input
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          required
                          autoComplete="name"
                          className="min-w-0 flex-1 bg-transparent text-sm text-[#E8EEF7] outline-none placeholder:text-[#4A6180]"
                          placeholder="Aubrey Mazinyi"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#C8D6EC]">Company</span>
                      <span className="flex h-12 items-center gap-3 rounded-lg border border-[#162544] bg-[#050B14] px-3 focus-within:border-[#4B82FF]">
                        <Building2 size={18} className="text-[#4A6180]" />
                        <input
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                          autoComplete="organization"
                          className="min-w-0 flex-1 bg-transparent text-sm text-[#E8EEF7] outline-none placeholder:text-[#4A6180]"
                          placeholder="Your firm or business"
                        />
                      </span>
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#C8D6EC]">Email</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[#162544] bg-[#050B14] px-3 focus-within:border-[#4B82FF]">
                    <Mail size={18} className="text-[#4A6180]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#E8EEF7] outline-none placeholder:text-[#4A6180]"
                      placeholder="you@example.com"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#C8D6EC]">Password</span>
                  <span className="flex h-12 items-center gap-3 rounded-lg border border-[#162544] bg-[#050B14] px-3 focus-within:border-[#4B82FF]">
                    <Lock size={18} className="text-[#4A6180]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={isSignup ? 12 : 1}
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#E8EEF7] outline-none placeholder:text-[#4A6180]"
                      placeholder={isSignup ? 'At least 12 characters' : 'Your password'}
                    />
                  </span>
                </label>

                {error && (
                  <div className="rounded-lg border border-[#FF4D6A]/30 bg-[#FF4D6A]/10 px-4 py-3 text-sm text-[#FFB8C4]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4B82FF] px-5 text-sm font-semibold text-white transition hover:bg-[#1E6BFF] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isSignup ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#8BA3C7]">
                {isSignup ? 'Already have an account?' : 'New to Statementwise?'}{' '}
                <Link
                  to={`${isSignup ? '/signin' : '/signup'}?next=${encodeURIComponent(next)}`}
                  className="font-medium text-[#78A4FF] hover:underline"
                >
                  {isSignup ? 'Sign in' : 'Create an account'}
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
