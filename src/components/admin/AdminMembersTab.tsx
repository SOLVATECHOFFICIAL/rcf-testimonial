import { useMemo, useState, type FormEvent } from 'react';
import { Download, Edit3, Search, Trash2, X } from 'lucide-react';
import { deleteMemberRecord, updateMemberRecord } from '../../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../../lib/firebase';
import { exportMembersToCsv, formatNigeriaDateTime } from '../../lib/rcf-utils';
import type { Member, MemberCategory, RegistrationInput } from '../../types/rcf';

interface AdminMembersTabProps {
  mode: 'all' | 'workers' | 'executives';
  members: Member[];
  units: string[];
  portfolios: string[];
  onMembersChanged: () => Promise<void>;
}

export function AdminMembersTab({
  mode,
  members,
  units,
  portfolios,
  onMembersChanged,
}: AdminMembersTabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState<RegistrationInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const baseMembers = useMemo(() => {
    if (mode === 'workers') return members.filter((m) => m.category === 'Worker');
    if (mode === 'executives') return members.filter((m) => m.category === 'Executive');
    return members;
  }, [members, mode]);

  const distinctYears = useMemo(() => {
    const set = new Set<number>(baseMembers.map((m) => m.yearJoined));
    return Array.from(set).sort((a, b) => b - a);
  }, [baseMembers]);

  const distinctUnits = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => set.add(u));
    baseMembers.forEach((m) => {
      if (m.unit) set.add(m.unit);
    });
    return Array.from(set).sort();
  }, [baseMembers, units]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseMembers.filter((m) => {
      if (mode === 'all' && categoryFilter !== 'all' && m.category !== categoryFilter) {
        return false;
      }
      if (yearFilter !== 'all' && String(m.yearJoined) !== yearFilter) {
        return false;
      }
      if (unitFilter !== 'all' && (m.unit ?? '') !== unitFilter) {
        return false;
      }
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        (m.unit ?? '').toLowerCase().includes(q) ||
        (m.executivePortfolio ?? '').toLowerCase().includes(q) ||
        (m.department ?? '').toLowerCase().includes(q)
      );
    });
  }, [baseMembers, search, mode, categoryFilter, yearFilter, unitFilter]);

  function handleExportCsv() {
    const csv = exportMembersToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rcf-${mode}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function startEdit(member: Member) {
    setErrorMsg('');
    setEditingMember(member);
    setEditForm({
      fullName: member.fullName,
      category: member.category,
      yearJoined: member.yearJoined,
      monthJoined: member.monthJoined ?? '',
      dateJoined: member.dateJoined ?? '',
      timeJoined: member.timeJoined ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      department: member.department ?? '',
      faculty: member.faculty ?? '',
      level: member.level ?? '',
      unit: member.unit ?? '',
      workerRole: member.workerRole ?? '',
      executivePortfolio: member.executivePortfolio ?? '',
      executiveSession: member.executiveSession ?? '',
    });
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingMember || !editForm || saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await updateMemberRecord(editingMember.id, editForm, editingMember);
      await onMembersChanged();
      setEditingMember(null);
      setEditForm(null);
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member: Member) {
    setErrorMsg('');
    try {
      await deleteMemberRecord(member.id);
      await onMembersChanged();
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    }
  }

  const heading =
    mode === 'workers'
      ? 'Fellowship Workers'
      : mode === 'executives'
        ? 'Fellowship Executives'
        : 'Member Directory';

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              {heading} ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">
              Private fellowship records — visible only to authorized leadership.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search members by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, unit..."
              className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>

          {mode === 'all' && (
            <select
              aria-label="Filter by membership category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            >
              <option value="all">All Categories</option>
              <option value="Member">Member</option>
              <option value="Worker">Worker</option>
              <option value="Executive">Executive</option>
            </select>
          )}

          <select
            aria-label="Filter by year joined"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          >
            <option value="all">All Years Joined</option>
            {distinctYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                Joined {yr}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by unit"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          >
            <option value="all">All Units</option>
            {distinctUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Table / Mobile Cards */}
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No matching records found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  {mode === 'executives' ? (
                    <>
                      <th className="py-3 px-4 font-semibold">Portfolio</th>
                      <th className="py-3 px-4 font-semibold">Session</th>
                    </>
                  ) : mode === 'workers' ? (
                    <>
                      <th className="py-3 px-4 font-semibold">Unit</th>
                      <th className="py-3 px-4 font-semibold">Role / Responsibility</th>
                    </>
                  ) : (
                    <th className="py-3 px-4 font-semibold">Unit / Portfolio</th>
                  )}
                  <th className="py-3 px-4 font-semibold">Contact &amp; Dept</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 align-top">
                      <p className="font-semibold text-[#0B2545]">{m.fullName}</p>
                      <p className="text-xs font-mono-tabular text-slate-500">{m.memberId}</p>
                    </td>
                    <td className="py-3 px-4 align-top text-slate-700">{m.category}</td>
                    {mode === 'executives' ? (
                      <>
                        <td className="py-3 px-4 align-top font-medium text-slate-800">
                          {m.executivePortfolio || '—'}
                        </td>
                        <td className="py-3 px-4 align-top font-mono-tabular text-slate-600">
                          {m.executiveSession || '—'}
                        </td>
                      </>
                    ) : mode === 'workers' ? (
                      <>
                        <td className="py-3 px-4 align-top font-medium text-slate-800">
                          {m.unit || '—'}
                        </td>
                        <td className="py-3 px-4 align-top text-slate-600">
                          {m.workerRole || '—'}
                        </td>
                      </>
                    ) : (
                      <td className="py-3 px-4 align-top text-slate-700">
                        {m.category === 'Executive'
                          ? `${m.executivePortfolio || 'Executive'}${m.executiveSession ? ` (${m.executiveSession})` : ''}`
                          : m.category === 'Worker'
                            ? `${m.unit || 'Worker'}${m.workerRole ? ` · ${m.workerRole}` : ''}`
                            : m.unit || 'General Member'}
                      </td>
                    )}
                    <td className="py-3 px-4 align-top text-xs text-slate-600 space-y-0.5">
                      {m.phone && <p>{m.phone}</p>}
                      {m.email && <p className="break-all">{m.email}</p>}
                      {(m.department || m.level) && (
                        <p className="text-slate-500">
                          {[m.department, m.faculty, m.level].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {!m.phone && !m.email && !m.department && <span>—</span>}
                    </td>
                    <td className="py-3 px-4 align-top text-xs text-slate-600 tabular-nums">
                      <p className="font-medium text-slate-800">
                        {[m.dateJoined, m.monthJoined, m.yearJoined].filter(Boolean).join(' ')}
                        {m.timeJoined ? ` (${m.timeJoined})` : ''}
                      </p>
                      <p className="text-slate-400 mt-0.5">{formatNigeriaDateTime(m.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        aria-label={`Edit ${m.fullName}`}
                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0B2545]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(m)}
                        aria-label={`Delete ${m.fullName}`}
                        className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMember && editForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-member-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 id="edit-member-title" className="font-display text-lg font-bold text-[#0B2545]">
                  Edit Member Record
                </h3>
                <p className="text-xs font-mono-tabular text-slate-500">{editingMember.memberId}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                aria-label="Close edit dialog"
                className="min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value as MemberCategory })
                    }
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Member">Member</option>
                    <option value="Worker">Worker</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Year Joined</label>
                  <input
                    type="number"
                    value={editForm.yearJoined}
                    onChange={(e) =>
                      setEditForm({ ...editForm, yearJoined: Number(e.target.value) })
                    }
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {editForm.category === 'Worker' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                    <select
                      value={editForm.unit}
                      onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="">Select unit...</option>
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={editForm.workerRole}
                      onChange={(e) => setEditForm({ ...editForm, workerRole: e.target.value })}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>
              )}

              {editForm.category === 'Executive' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Portfolio</label>
                    <select
                      value={editForm.executivePortfolio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, executivePortfolio: e.target.value })
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="">Select portfolio...</option>
                      {portfolios.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Session</label>
                    <input
                      type="text"
                      value={editForm.executiveSession}
                      onChange={(e) =>
                        setEditForm({ ...editForm, executiveSession: e.target.value })
                      }
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0B2545] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
