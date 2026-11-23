import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function RegisterPage() {
  const { loading, firebaseUser, adminUser, memberProfile } = useAuth();

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

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminUser) {
    return <Navigate to="/admin" replace />;
  }

  if (memberProfile) {
    return <Navigate to="/profile" replace />;
  }

  return <Navigate to="/complete-profile" replace />;
}
