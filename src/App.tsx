import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { WelcomePage } from './pages/WelcomePage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Redeemed Christian Fellowship (RCF) – Share Your Testimony',
    description:
      "Register with Redeemed Christian Fellowship (RCF) and share your testimony of God's faithfulness with fellowship leadership.",
  },
  '/register': {
    title: 'Register to Share Your Testimony – Redeemed Christian Fellowship (RCF)',
    description:
      'Complete quick fellowship registration to share your testimony with Redeemed Christian Fellowship (RCF).',
  },
  '/welcome': {
    title: 'Share Your Testimony – Redeemed Christian Fellowship (RCF)',
    description:
      "Design and share your testimony card with Redeemed Christian Fellowship (RCF) leadership.",
  },
  '/about': {
    title: 'About Us – Redeemed Christian Fellowship (RCF)',
    description:
      'Learn about the vision, mission, weekly fellowship services, and contact details of Redeemed Christian Fellowship (RCF).',
  },
  '/privacy': {
    title: 'Privacy Notice – Redeemed Christian Fellowship (RCF)',
    description:
      'How Redeemed Christian Fellowship (RCF) protects member records and testimony confidentiality.',
  },
  '/admin': {
    title: 'Leadership Portal – Redeemed Christian Fellowship (RCF)',
    description:
      'Authorized leadership portal for Redeemed Christian Fellowship (RCF).',
  },
};

function SeoSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[pathname] ?? ROUTE_META['/'];
    document.title = meta.title;

    const currentUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : '';

    const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
      if (!value) return;
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);

    if (currentUrl) {
      setMeta('meta[property="og:url"]', 'content', currentUrl);
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', currentUrl);
    }
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SeoSync />
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
