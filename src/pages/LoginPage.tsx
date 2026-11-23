import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { RcfLogo } from '../components/RcfLogo';

export function LoginPage() {
  const navigate = useNavigate();
  const {
    loading,
    firebaseUser,
    adminUser,
    memberProfile,
    signingIn,
    authError,
    signInWithGoogle,
  } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#0B2545] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Checking your fellowship account...</p>
        </div>
      </div>
    );
  }

  if (firebaseUser) {
    if (adminUser) {
      return <Navigate to="/admin" replace />;
    }
    if (memberProfile) {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/complete-profile" replace />;
  }

  async function handleContinueWithGoogle() {
    const outcome = await signInWithGoogle();
    if (outcome === 'admin') {
      navigate('/admin', { replace: true });
    } else if (outcome === 'member') {
      navigate('/profile', { replace: true });
    } else if (outcome === 'new') {
      navigate('/complete-profile', { replace: true });
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
        <div className="flex justify-center">
          <RcfLogo size="md" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">
            Redeemed Christian Fellowship
          </p>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            Sign In with Google
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Use your Gmail account to sign in or register. RCF does not use passwords—signing in with Google is the secure way to access and recover your fellowship profile anytime.
          </p>
        </div>

        {authError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 text-left"
          >
            {authError}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleContinueWithGoogle()}
          disabled={signingIn}
          className="w-full inline-flex items-center justify-center gap-3 min-h-[48px] px-5 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-xs"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
            />
          </svg>
          {signingIn ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5 text-left text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p>
            Returning members are taken straight to their profile. First-time members will complete a short fellowship registration on the next screen.
          </p>
        </div>
      </div>
    </div>
  );
}
