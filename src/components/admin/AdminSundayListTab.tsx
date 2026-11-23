import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { deleteSundayListRecord, saveSundayList } from '../../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../../lib/firebase';
import { formatNigeriaDateTime, formatSundayListPlainText } from '../../lib/rcf-utils';
import type { SundayList, Testimony } from '../../types/rcf';

interface AdminSundayListTabProps {
  adminUid: string;
  testimonies: Testimony[];
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  savedLists: SundayList[];
  onListsChanged: () => Promise<void>;
}

export function AdminSundayListTab({
  adminUid,
  testimonies,
  selectedIds,
  onChangeSelectedIds,
  savedLists,
  onListsChanged,
}: AdminSundayListTabProps) {
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [serviceTitle, setServiceTitle] = useState('Sunday Testimony List');
  const [activeListId, setActiveListId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const consentedTestimonies = useMemo(
    () => testimonies.filter((t) => t.consentToSundaySharing),
    [testimonies],
  );

  const testimonyMap = useMemo(() => {
    const map = new Map<string, Testimony>();
    testimonies.forEach((t) => map.set(t.id, t));
    return map;
  }, [testimonies]);

  const orderedSelected = useMemo(
    () =>
      selectedIds
        .map((id) => testimonyMap.get(id))
        .filter((t): t is Testimony => Boolean(t && t.consentToSundaySharing)),
    [selectedIds, testimonyMap],
  );

  const availableConsented = useMemo(
    () => consentedTestimonies.filter((t) => !selectedIds.includes(t.id)),
    [consentedTestimonies, selectedIds],
  );

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedSelected.length) return;
    const next = orderedSelected.map((t) => t.id);
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    onChangeSelectedIds(next);
  }

  function removeItem(id: string) {
    onChangeSelectedIds(selectedIds.filter((x) => x !== id));
  }

  function addItem(id: string) {
    if (!selectedIds.includes(id)) {
      onChangeSelectedIds([...selectedIds, id]);
    }
  }

  async function handleCopyList() {
    const text = formatSundayListPlainText(serviceDate, serviceTitle, orderedSelected);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }

  async function handleSaveList() {
    if (!serviceDate.trim()) {
      setErrorMsg('Please set the Sunday / service date.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const id = await saveSundayList(
        {
          id: activeListId,
          serviceDate: serviceDate.trim(),
          title: serviceTitle.trim() || 'Sunday Testimony List',
          orderedTestimonyIds: orderedSelected.map((t) => t.id),
        },
        adminUid,
      );
      setActiveListId(id);
      await onListsChanged();
      setStatusMsg('Sunday Testimony List saved successfully.');
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function loadSavedList(list: SundayList) {
    setActiveListId(list.id);
    setServiceDate(list.serviceDate);
    setServiceTitle(list.title || 'Sunday Testimony List');
    onChangeSelectedIds(list.orderedTestimonyIds);
    setStatusMsg('');
    setErrorMsg('');
  }

  async function handleDeleteSaved(id: string) {
    try {
      await deleteSundayListRecord(id);
      if (activeListId === id) setActiveListId(undefined);
      await onListsChanged();
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Selection & Ordering */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Service Details &amp; Ordering
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sunday-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Sunday / Service Date
                </label>
                <input
                  id="sunday-date"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="sunday-title" className="block text-xs font-medium text-slate-700 mb-1">
                  Service Title (optional)
                </label>
                <input
                  id="sunday-title"
                  type="text"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  maxLength={160}
                  placeholder="Sunday Testimony List"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Selected Order ({orderedSelected.length})
                </h3>
                {activeListId && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveListId(undefined);
                      onChangeSelectedIds([]);
                    }}
                    className="text-xs text-[#0B2545] underline"
                  >
                    Start New List
                  </button>
                )}
              </div>

              {orderedSelected.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 border border-dashed border-slate-300 rounded-xl text-center">
                  Add consented testimonies below to arrange your Sunday list.
                </p>
              ) : (
                <ol className="space-y-2">
                  {orderedSelected.map((t, idx) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B2545] truncate">
                          {idx + 1}. {t.authorName}
                          {t.testimonyTitle ? ` — ${t.testimonyTitle}` : ''}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {t.presentationCopy?.trim() || t.testimonyText}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(idx, -1)}
                          disabled={idx === 0}
                          aria-label={`Move ${t.authorName} up`}
                          className="min-h-[34px] min-w-[34px] rounded-lg border border-slate-300 bg-white flex items-center justify-center disabled:opacity-40"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(idx, 1)}
                          disabled={idx === orderedSelected.length - 1}
                          aria-label={`Move ${t.authorName} down`}
                          className="min-h-[34px] min-w-[34px] rounded-lg border border-slate-300 bg-white flex items-center justify-center disabled:opacity-40"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(t.id)}
                          aria-label={`Remove ${t.authorName}`}
                          className="min-h-[34px] min-w-[34px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
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

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => void handleSaveList()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save List'}
              </button>

              <button
                type="button"
                onClick={() => void handleCopyList()}
                disabled={orderedSelected.length === 0}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy List'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                disabled={orderedSelected.length === 0}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Available Consented Testimonies */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#0B2545]">
              Available Consented Testimonies ({availableConsented.length})
            </h3>
            {availableConsented.length === 0 ? (
              <p className="text-xs text-slate-500">
                All consented testimonies have been added or none are available yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {availableConsented.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0B2545]">
                        {t.authorName}
                        {t.testimonyTitle ? ` — ${t.testimonyTitle}` : ''}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                        {t.presentationCopy?.trim() || t.testimonyText}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(t.id)}
                      className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-[#0B2545] text-white text-xs font-semibold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Sunday Lists */}
          {savedLists.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-[#0B2545]">
                Saved Sunday Lists
              </h3>
              <div className="divide-y divide-slate-100">
                {savedLists.map((list) => (
                  <div key={list.id} className="py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => loadSavedList(list)}
                      className="text-left min-w-0 flex-1 hover:underline"
                    >
                      <p className="text-sm font-semibold text-[#0B2545] truncate">
                        {list.title || 'Sunday Testimony List'} ({list.serviceDate})
                      </p>
                      <p className="text-xs text-slate-500">
                        {list.orderedTestimonyIds.length} testimonies · Saved{' '}
                        {formatNigeriaDateTime(list.createdAt)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSaved(list.id)}
                      aria-label={`Delete saved list ${list.serviceDate}`}
                      className="min-h-[34px] min-w-[34px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Printable Sheet Preview */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 print-container">
            <div className="border-b-2 border-[#0B2545] pb-4 mb-6">
              <p className="font-display text-sm font-bold tracking-wide text-[#0B2545]">
                RCF — REDEEMED CHRISTIAN FELLOWSHIP
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                {serviceTitle.trim() || 'Sunday Testimony List'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5 font-mono-tabular">
                {serviceDate || 'Service date not set'}
              </p>
            </div>

            {orderedSelected.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                Your printable Sunday testimony sheet will appear here once testimonies are selected.
              </p>
            ) : (
              <ol className="space-y-5">
                {orderedSelected.map((t, idx) => (
                  <li key={t.id} className="space-y-1">
                    <p className="font-display font-bold text-base text-slate-900">
                      {idx + 1}. {t.authorName}
                      {t.testimonyTitle ? ` — ${t.testimonyTitle}` : ''}
                    </p>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed pl-4 whitespace-pre-wrap">
                      {t.presentationCopy?.trim() || t.testimonyText}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Print-Only Output (clean church format when printing) */}
      <div className="hidden print-only p-4">
        <div className="border-b-2 border-black pb-4 mb-6">
          <p className="text-sm font-bold tracking-wide">
            RCF — REDEEMED CHRISTIAN FELLOWSHIP
          </p>
          <h1 className="text-2xl font-bold mt-1">
            {serviceTitle.trim() || 'Sunday Testimony List'}
          </h1>
          <p className="text-sm mt-0.5">{serviceDate}</p>
        </div>
        <ol className="space-y-5">
          {orderedSelected.map((t, idx) => (
            <li key={t.id} className="space-y-1">
              <p className="font-bold text-base">
                {idx + 1}. {t.authorName}
                {t.testimonyTitle ? ` — ${t.testimonyTitle}` : ''}
              </p>
              <p className="text-base leading-relaxed pl-4 whitespace-pre-wrap">
                {t.presentationCopy?.trim() || t.testimonyText}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
