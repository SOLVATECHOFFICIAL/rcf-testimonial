import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMemberSession } from '../lib/member-session';
import { TestimonyComposer } from '../components/TestimonyComposer';

export function WelcomePage() {
  const [memberSession] = useState(() => getMemberSession());

  if (!memberSession) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <TestimonyComposer memberSession={memberSession} />
    </div>
  );
}
