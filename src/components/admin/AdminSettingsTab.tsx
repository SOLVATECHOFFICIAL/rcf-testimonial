import { useState, type FormEvent } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import {
  addAdminAccount,
  removeAdminAccount,
  saveSettings,
} from '../../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../../lib/firebase';
import type { AdminRole, AdminUser, FellowshipActivity, FellowshipSettings } from '../../types/rcf';

interface AdminSettingsTabProps {
  currentAdmin: AdminUser;
  settings: FellowshipSettings;
  admins: AdminUser[];
  onSettingsChanged: () => Promise<void>;
  onAdminsChanged: () => Promise<void>;
}

export function AdminSettingsTab({
  currentAdmin,
  settings,
  admins,
  onSettingsChanged,
  onAdminsChanged,
}: AdminSettingsTabProps) {
  const [fellowshipName, setFellowshipName] = useState(settings.fellowshipName);
  const [unitsText, setUnitsText] = useState(settings.units.join('\n'));
  const [portfoliosText, setPortfoliosText] = useState(settings.executivePortfolios.join('\n'));
  const [aboutText, setAboutText] = useState(settings.aboutText);
  const [visionText, setVisionText] = useState(settings.visionText);
  const [missionText, setMissionText] = useState(settings.missionText);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactAddress, setContactAddress] = useState(settings.contactAddress);
  const [activities, setActivities] = useState<FellowshipActivity[]>(settings.activities);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // SuperAdmin: add secondary admin
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('admin');
  const [adminStatus, setAdminStatus] = useState('');

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setErrorMsg('');
    setStatusMsg('');

    const units = unitsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const executivePortfolios = portfoliosText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (units.length === 0) {
      setErrorMsg('Please keep at least one fellowship unit.');
      return;
    }
    if (executivePortfolios.length === 0) {
      setErrorMsg('Please keep at least one executive portfolio.');
      return;
    }

    setSaving(true);
    try {
      await saveSettings({
        fellowshipName: fellowshipName.trim() || settings.fellowshipName,
        lastWordUrl: '',
        lastWordDescription: '',
        units,
        executivePortfolios,
        aboutText: aboutText.trim(),
        visionText: visionText.trim(),
        missionText: missionText.trim(),
        activities: activities.filter((a) => a.title.trim().length > 0),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        contactAddress: contactAddress.trim(),
        updatedAt: new Date(),
      });
      await onSettingsChanged();
      setStatusMsg('Fellowship settings saved successfully.');
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAdmin(e: FormEvent) {
    e.preventDefault();
    setAdminStatus('');
    if (!newAdminUid.trim() || !newAdminEmail.trim()) return;
    try {
      await addAdminAccount({
        uid: newAdminUid.trim(),
        email: newAdminEmail.trim(),
        role: newAdminRole,
      });
      setNewAdminUid('');
      setNewAdminEmail('');
      await onAdminsChanged();
      setAdminStatus('Authorized admin added.');
    } catch (err) {
      setAdminStatus(parseFirestoreErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6"
      >
        <div>
          <h2 className="font-display text-lg font-bold text-[#0B2545]">
            Fellowship &amp; Platform Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure registration dropdown options, About RCF content, fellowship activities, and contact details.
          </p>
        </div>

        {/* Configurable Units & Executive Portfolios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-units" className="block text-xs font-medium text-slate-700 mb-1">
              Configurable Fellowship Units (one per line)
            </label>
            <textarea
              id="set-units"
              rows={6}
              value={unitsText}
              onChange={(e) => setUnitsText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono-tabular"
            />
          </div>

          <div>
            <label htmlFor="set-portfolios" className="block text-xs font-medium text-slate-700 mb-1">
              Configurable Executive Portfolios (one per line)
            </label>
            <textarea
              id="set-portfolios"
              rows={6}
              value={portfoliosText}
              onChange={(e) => setPortfoliosText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono-tabular"
            />
          </div>
        </div>

        {/* About RCF & Contact */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <h3 className="font-display text-sm font-bold text-[#0B2545]">
            About RCF &amp; Contact Details
          </h3>

          <div>
            <label htmlFor="set-name" className="block text-xs font-medium text-slate-700 mb-1">
              Fellowship Name
            </label>
            <input
              id="set-name"
              type="text"
              value={fellowshipName}
              onChange={(e) => setFellowshipName(e.target.value)}
              maxLength={160}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="set-about" className="block text-xs font-medium text-slate-700 mb-1">
              About the Fellowship
            </label>
            <textarea
              id="set-about"
              rows={3}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              maxLength={2500}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-vision" className="block text-xs font-medium text-slate-700 mb-1">
                Vision
              </label>
              <textarea
                id="set-vision"
                rows={3}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                maxLength={1200}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-mission" className="block text-xs font-medium text-slate-700 mb-1">
                Mission
              </label>
              <textarea
                id="set-mission"
                rows={3}
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                maxLength={1200}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="set-email" className="block text-xs font-medium text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                id="set-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={160}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-phone" className="block text-xs font-medium text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                id="set-phone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={40}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="set-addr" className="block text-xs font-medium text-slate-700 mb-1">
                Fellowship Venue / Address
              </label>
              <input
                id="set-addr"
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                maxLength={240}
                className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Fellowship Activities */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#0B2545]">
              Fellowship Activities
            </h3>
            <button
              type="button"
              onClick={() =>
                setActivities([...activities, { title: '', schedule: '', description: '' }])
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B2545] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Activity
            </button>
          </div>
          {activities.map((act, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
              <input
                type="text"
                placeholder="Activity title (e.g., Sunday Service)"
                value={act.title}
                onChange={(e) => {
                  const next = [...activities];
                  next[idx] = { ...act, title: e.target.value };
                  setActivities(next);
                }}
                className="sm:col-span-4 min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <input
                type="text"
                placeholder="Schedule (e.g., Sundays · 8:00 AM)"
                value={act.schedule}
                onChange={(e) => {
                  const next = [...activities];
                  next[idx] = { ...act, schedule: e.target.value };
                  setActivities(next);
                }}
                className="sm:col-span-3 min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <input
                type="text"
                placeholder="Short description"
                value={act.description}
                onChange={(e) => {
                  const next = [...activities];
                  next[idx] = { ...act, description: e.target.value };
                  setActivities(next);
                }}
                className="sm:col-span-4 min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
              <button
                type="button"
                aria-label="Remove activity"
                onClick={() => setActivities(activities.filter((_, i) => i !== idx))}
                className="sm:col-span-1 min-h-[40px] rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {errorMsg}
          </div>
        )}
        {statusMsg && (
          <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {statusMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </form>

      {/* Authorized Admin Directory (SuperAdmin only) */}
      {currentAdmin.role === 'superAdmin' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Authorized Administrators
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only super-admins can grant or revoke admin access using a user&apos;s verified Account UID and Google email.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl px-4">
            {admins.map((a) => (
              <div key={a.uid} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0B2545] truncate">{a.email}</p>
                  <p className="text-xs font-mono-tabular text-slate-500 truncate">
                    {a.role} · UID: {a.uid}
                  </p>
                </div>
                {a.uid !== currentAdmin.uid && (
                  <button
                    type="button"
                    onClick={() => void removeAdminAccount(a.uid).then(onAdminsChanged)}
                    aria-label={`Remove admin ${a.email}`}
                    className="min-h-[36px] min-w-[36px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <input
              type="text"
              placeholder="Account UID"
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              className="sm:col-span-4 min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono-tabular"
            />
            <input
              type="email"
              placeholder="Verified Google Email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="sm:col-span-4 min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
              className="sm:col-span-2 min-h-[40px] px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="admin">admin</option>
              <option value="testimonyAdmin">testimonyAdmin</option>
              <option value="superAdmin">superAdmin</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-2 min-h-[40px] px-3 py-2 rounded-xl bg-[#0B2545] text-white text-sm font-semibold"
            >
              Add Admin
            </button>
          </form>
          {adminStatus && <p className="text-xs text-slate-700">{adminStatus}</p>}
        </div>
      )}
    </div>
  );
}
