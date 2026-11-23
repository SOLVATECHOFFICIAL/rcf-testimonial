import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  MessageSquareQuote,
  RefreshCw,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { parseFirestoreErrorMessage } from '../lib/firebase';
import {
  fetchAdmins,
  fetchAllAnnouncements,
  fetchAllMembers,
  fetchAllTestimonies,
  fetchPublicSettings,
  fetchSundayLists,
} from '../lib/firestore-service';
import { DEFAULT_SETTINGS, INITIAL_ADMIN_EMAIL } from '../lib/rcf-utils';
import type {
  AdminUser,
  Announcement,
  FellowshipSettings,
  Member,
  SundayList,
  Testimony,
} from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminMembersTab } from '../components/admin/AdminMembersTab';
import { AdminTestimoniesTab } from '../components/admin/AdminTestimoniesTab';
import { AdminSundayListTab } from '../components/admin/AdminSundayListTab';
import { AdminAnnouncementsTab } from '../components/admin/AdminAnnouncementsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

type AdminTabId =
  | 'overview'
  | 'members'
  | 'workers'
  | 'executives'
  | 'testimonies'
  | 'sunday'
  | 'announcements'
  | 'settings';

const TABS: { id: AdminTabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'workers', label: 'Workers', icon: Briefcase },
  { id: 'executives', label: 'Executives', icon: Award },
  { id: 'testimonies', label: 'Testimonies', icon: MessageSquareQuote },
  { id: 'sunday', label: 'Sunday List', icon: ClipboardList },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminPage() {
  const {
    loading: authLoading,
    firebaseUser,
    adminUser,
    authError,
    signingIn,
    signInWithGoogle,
    signOutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');

  const [members, setMembers] = useState<Member[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<FellowshipSettings>(DEFAULT_SETTINGS);
  const [sundayLists, setSundayLists] = useState<SundayList[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedSundayIds, setSelectedSundayIds] = useState<string[]>([]);

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const [m, t, a, s, sl, ad] = await Promise.all([
        fetchAllMembers(),
        fetchAllTestimonies(),
        fetchAllAnnouncements(),
        fetchPublicSettings(),
        fetchSundayLists(),
        fetchAdmins(),
      ]);
      setMembers(m);
      setTestimonies(t);
      setAnnouncements(a);
      setSettings(s);
      setSundayLists(sl);
      setAdmins(ad);
    } catch (err) {
      setDataError(parseFirestoreErrorMessage(err));
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      void loadDashboardData();
    }
  }, [adminUser, loadDashboardData]);

  async function handleGoogleSignIn() {
    await signInWithGoogle();
  }

  async function handleSignOut() {
    await signOutUser();
    setMembers([]);
    setTestimonies([]);
    setAnnouncements([]);
    setSundayLists([]);
    setAdmins([]);
  }

  function handleToggleSundaySelect(testimonyId: string) {
    setSelectedSundayIds((prev) =>
      prev.includes(testimonyId)
        ? prev.filter((id) => id !== testimonyId)
        : [...prev, testimonyId],
    );
  }

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#0B2545] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated View — NO dashboard data exposed
  if (!firebaseUser) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="flex justify-center">
            <RcfLogo size="md" />
          </div>
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#0B2545]/10 text-[#0B2545]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0B2545]">
              RCF Admin Sign-In
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Sign in with an authorized Google account to manage member records, read testimonies, and prepare Sunday testimony lists.
            </p>
          </div>

          {authError && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 text-left">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={signingIn}
            className="w-full inline-flex items-center justify-center gap-2.5 min-h-[48px] px-5 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60 transition-colors"
          >
            {signingIn ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <p className="text-xs text-slate-500">
            Access is restricted to authorized fellowship leadership via Google Sign-In.
          </p>
        </div>
      </div>
    );
  }

  // Signed in, but NOT authorized — NO dashboard data exposed
  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[#0B2545]">
              Access Denied
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              The signed-in account (<span className="font-medium text-slate-900">{firebaseUser.email}</span>) is not authorized to access the RCF Admin Dashboard.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Please sign in with the authorized fellowship administrator account ({INITIAL_ADMIN_EMAIL}) or ask a Super Admin to grant access.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out &amp; Switch Account
          </button>
        </div>
      </div>
    );
  }

  // Authorized Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RcfLogo size="sm" />
          <div>
            <h1 className="font-display text-xl font-bold text-[#0B2545]">
              RCF Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              {adminUser.email} · Role: {adminUser.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadDashboardData()}
            disabled={dataLoading}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        aria-label="Admin sections"
        className="no-print flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'sunday' && selectedSundayIds.length > 0 && (
                <span className="ml-0.5 tabular-nums">({selectedSundayIds.length})</span>
              )}
            </button>
          );
        })}
      </nav>

      {dataError && (
        <div role="alert" className="no-print p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {dataError}
        </div>
      )}

      {/* Tab Content */}
      {dataLoading && members.length === 0 && testimonies.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-36 rounded-2xl bg-slate-200/70 animate-pulse" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <AdminOverviewTab
              members={members}
              testimonies={testimonies}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === 'members' && (
            <AdminMembersTab
              mode="all"
              members={members}
              units={settings.units}
              portfolios={settings.executivePortfolios}
              onMembersChanged={async () => {
                setMembers(await fetchAllMembers());
              }}
            />
          )}

          {activeTab === 'workers' && (
            <AdminMembersTab
              mode="workers"
              members={members}
              units={settings.units}
              portfolios={settings.executivePortfolios}
              onMembersChanged={async () => {
                setMembers(await fetchAllMembers());
              }}
            />
          )}

          {activeTab === 'executives' && (
            <AdminMembersTab
              mode="executives"
              members={members}
              units={settings.units}
              portfolios={settings.executivePortfolios}
              onMembersChanged={async () => {
                setMembers(await fetchAllMembers());
              }}
            />
          )}

          {activeTab === 'testimonies' && (
            <AdminTestimoniesTab
              testimonies={testimonies}
              selectedSundayIds={selectedSundayIds}
              onToggleSundaySelect={handleToggleSundaySelect}
              onTestimoniesChanged={async () => {
                setTestimonies(await fetchAllTestimonies());
              }}
              onGoToSundayList={() => setActiveTab('sunday')}
            />
          )}

          {activeTab === 'sunday' && (
            <AdminSundayListTab
              adminUid={adminUser.uid}
              testimonies={testimonies}
              selectedIds={selectedSundayIds}
              onChangeSelectedIds={setSelectedSundayIds}
              savedLists={sundayLists}
              onListsChanged={async () => {
                setSundayLists(await fetchSundayLists());
              }}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab
              announcements={announcements}
              onAnnouncementsChanged={async () => {
                setAnnouncements(await fetchAllAnnouncements());
              }}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              currentAdmin={adminUser}
              settings={settings}
              admins={admins}
              onSettingsChanged={async () => {
                setSettings(await fetchPublicSettings());
              }}
              onAdminsChanged={async () => {
                setAdmins(await fetchAdmins());
              }}
            />
          )}
        </>
      )}

      {/* Bottom Admin Logout Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Signed in as <span className="font-semibold text-[#0B2545]">{adminUser.email}</span> ({adminUser.role})
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 rounded-xl bg-red-600 text-white text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout from Admin
        </button>
      </div>
    </div>
  );
}
