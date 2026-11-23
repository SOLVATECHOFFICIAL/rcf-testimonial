import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HeartHandshake, LayoutDashboard, LogIn, Menu, User, X } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { RcfLogo } from './RcfLogo';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, firebaseUser, adminUser, memberProfile } = useAuth();

  const accountAction = (() => {
    if (loading) return null;
    if (!firebaseUser) {
      return { to: '/login', label: 'Sign In', icon: LogIn };
    }
    if (adminUser) {
      return { to: '/admin', label: 'Dashboard', icon: LayoutDashboard };
    }
    if (memberProfile) {
      return { to: '/profile', label: 'My Profile', icon: User };
    }
    return { to: '/complete-profile', label: 'Complete Profile', icon: User };
  })();

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Lockup */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545] rounded-lg"
          onClick={() => setMobileOpen(false)}
        >
          <RcfLogo size="sm" />
          <span className="font-display font-bold text-[#0B2545] text-sm sm:text-base tracking-tight whitespace-nowrap">
            Redeemed Christian Fellowship
          </span>
        </Link>

        {/* Zone 2: Desktop Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#0B2545] text-[#0B2545] font-semibold'
                    : 'border-transparent hover:text-[#0B2545] hover:border-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Auth / Profile + Primary Action + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {accountAction && (
            <Link
              to={accountAction.to}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-[#0B2545] text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <accountAction.icon className="w-4 h-4 text-[#0369A1]" />
              {accountAction.label}
            </Link>
          )}

          <Link
            to="/welcome"
            className="hidden sm:inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white text-sm font-semibold hover:from-[#143764] hover:to-[#2563EB] transition-all whitespace-nowrap shrink-0 shadow-xs"
          >
            <HeartHandshake className="w-4 h-4 text-[#F5B700]" />
            Share Testimony
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center min-h-[44px] px-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0B2545]/5 text-[#0B2545] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {accountAction && (
              <Link
                to={accountAction.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-300 bg-white text-[#0B2545] text-sm font-semibold"
              >
                <accountAction.icon className="w-4 h-4 text-[#0369A1]" />
                {accountAction.label}
              </Link>
            )}
            <Link
              to="/welcome"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white text-sm font-semibold"
            >
              <HeartHandshake className="w-4 h-4 text-[#F5B700]" />
              Share Testimony
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
