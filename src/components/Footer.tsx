import { Link } from 'react-router-dom';
import { RcfLogo } from './RcfLogo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="no-print bg-[#0B2545] text-slate-200 border-t border-[#15355E] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <RcfLogo size="sm" />
            <div>
              <p className="font-display font-semibold text-white text-sm sm:text-base">
                Redeemed Christian Fellowship (RCF)
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Campus Fellowship · Worship, Word &amp; Testimony
              </p>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link to="/welcome" className="text-[#F5B700] font-semibold hover:text-white transition-colors py-1">
              Share Testimony
            </Link>
            <Link to="/about" className="text-slate-200 hover:text-white transition-colors py-1">
              About RCF
            </Link>
            <Link to="/privacy" className="text-slate-200 hover:text-white transition-colors py-1">
              Privacy Notice
            </Link>
            <Link
              to="/admin"
              className="text-slate-300 hover:text-[#F5B700] transition-colors py-1"
            >
              Admin
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <p>&copy; {year} Redeemed Christian Fellowship (RCF). All rights reserved.</p>
          <p>Member records and private testimonies are protected and restricted to authorized leadership.</p>
        </div>
      </div>
    </footer>
  );
}
