import { useMemo, useState } from 'react';
import {
  Check,
  CheckSquare,
  Copy,
  Edit3,
  Printer,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteTestimonyRecord,
  updateTestimonyPresentationCopy,
} from '../../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../../lib/firebase';
import { formatNigeriaDateTime, getPresetForColor } from '../../lib/rcf-utils';
import type { Testimony } from '../../types/rcf';

interface AdminTestimoniesTabProps {
  testimonies: Testimony[];
  selectedSundayIds: string[];
  onToggleSundaySelect: (testimonyId: string) => void;
  onTestimoniesChanged: () => Promise<void>;
  onGoToSundayList: () => void;
}

export function AdminTestimoniesTab({
  testimonies,
  selectedSundayIds,
  onToggleSundaySelect,
  onTestimoniesChanged,
  onGoToSundayList,
}: AdminTestimoniesTabProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [consentFilter, setConsentFilter] = useState<'all' | 'consented' | 'private'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingCopyTarget, setEditingCopyTarget] = useState<Testimony | null>(null);
  const [copyDraft, setCopyDraft] = useState('');
  const [savingCopy, setSavingCopy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [printingSingle, setPrintingSingle] = useState<Testimony | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = testimonies.filter((t) => {
      if (categoryFilter !== 'all' && (t.membershipCategory ?? '') !== categoryFilter) {
        return false;
      }
      if (consentFilter === 'consented' && !t.consentToSundaySharing) return false;
      if (consentFilter === 'private' && t.consentToSundaySharing) return false;
      if (dateFilter && t.createdAt) {
        const lagosDate = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Africa/Lagos',
        }).format(t.createdAt);
        if (lagosDate !== dateFilter) return false;
      }
      if (!q) return true;
      return (
        t.authorName.toLowerCase().includes(q) ||
        t.testimonyText.toLowerCase().includes(q) ||
        (t.testimonyTitle ?? '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const ta = a.createdAt?.getTime() ?? 0;
      const tb = b.createdAt?.getTime() ?? 0;
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  }, [testimonies, search, categoryFilter, consentFilter, dateFilter, sortOrder]);

  async function handleCopy(t: Testimony) {
    const text = `${t.authorName}${t.testimonyTitle ? ` — ${t.testimonyTitle}` : ''}\n${
      t.presentationCopy?.trim() || t.testimonyText
    }\nSubmitted: ${formatNigeriaDateTime(t.createdAt)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(t.id);
      setTimeout(() => setCopiedId((prev) => (prev === t.id ? null : prev)), 2000);
    } catch {
      // Fallback ignored
    }
  }

  function handlePrintSingle(t: Testimony) {
    setPrintingSingle(t);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  async function handleSavePresentationCopy() {
    if (!editingCopyTarget || savingCopy) return;
    setSavingCopy(true);
    setErrorMsg('');
    try {
      await updateTestimonyPresentationCopy(editingCopyTarget.id, copyDraft);
      await onTestimoniesChanged();
      setEditingCopyTarget(null);
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    } finally {
      setSavingCopy(false);
    }
  }

  async function handleDelete(t: Testimony) {
    setErrorMsg('');
    try {
      await deleteTestimonyRecord(t.id);
      await onTestimoniesChanged();
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      {/* Single Testimony Print Sheet */}
      {printingSingle && (
        <div className="hidden print-only p-8 bg-white text-black">
          <div className="flex items-center justify-between border-b border-black/20 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold">RCF — REDEEMED CHRISTIAN FELLOWSHIP</h1>
              <p className="text-sm">Testimony Record</p>
            </div>
            <button
              type="button"
              onClick={() => setPrintingSingle(null)}
              className="no-print text-xs underline"
            >
              Close Print View
            </button>
          </div>
          <p className="font-bold text-lg">
            {printingSingle.authorName}
            {printingSingle.testimonyTitle ? ` — ${printingSingle.testimonyTitle}` : ''}
          </p>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            Submitted: {formatNigeriaDateTime(printingSingle.createdAt)} ·{' '}
            {printingSingle.consentToSundaySharing ? 'Consented for Sunday Sharing' : 'Leadership Only'}
          </p>
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {printingSingle.presentationCopy?.trim() || printingSingle.testimonyText}
          </p>
        </div>
      )}

      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Submitted Testimonies ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">
              All submitted testimonies appear immediately with verified server timestamps. Only consented testimonies can be added to a Sunday list.
            </p>
          </div>

          {selectedSundayIds.length > 0 && (
            <button
              type="button"
              onClick={onGoToSundayList}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] transition-colors shrink-0"
            >
              Prepare Sunday List ({selectedSundayIds.length})
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search testimonies by member name or content"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member name or testimony..."
              className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>

          <select
            aria-label="Filter by membership category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
          >
            <option value="all">All Categories</option>
            <option value="Member">Member</option>
            <option value="Worker">Worker</option>
            <option value="Executive">Executive</option>
          </select>

          <select
            aria-label="Filter by Sunday sharing consent"
            value={consentFilter}
            onChange={(e) =>
              setConsentFilter(e.target.value as 'all' | 'consented' | 'private')
            }
            className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
          >
            <option value="all">All Consent Statuses</option>
            <option value="consented">Consented for Sunday</option>
            <option value="private">Leadership Only (No Consent)</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              aria-label="Filter by submission date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 min-h-[42px] px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
            />
            <select
              aria-label="Sort order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="min-h-[42px] px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {errorMsg}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No testimonies match your current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((item) => {
              const preset = getPresetForColor(item.backgroundColor);
              const isSelectedForSunday = selectedSundayIds.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col"
                >
                  {/* Colored Post Card Body */}
                  <div
                    style={{
                      background: preset.gradient ?? item.backgroundColor,
                      color: item.textColor,
                    }}
                    className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <p className="font-display font-bold text-base">{item.authorName}</p>
                        <p style={{ color: preset.mutedTextColor }} className="mt-0.5">
                          {[item.membershipCategory, item.unit, item.authorMemberId]
                            .filter(Boolean)
                            .join(' · ') || 'Fellowship Member'}
                        </p>
                      </div>
                      <span
                        style={{ color: preset.mutedTextColor }}
                        className="font-mono-tabular text-right shrink-0"
                      >
                        {formatNigeriaDateTime(item.createdAt)}
                      </span>
                    </div>

                    <div>
                      {item.testimonyTitle && (
                        <h3 className="font-display font-bold text-lg mb-2">
                          {item.testimonyTitle}
                        </h3>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {item.testimonyText}
                      </p>
                    </div>

                    {item.presentationCopy && item.presentationCopy.trim() !== '' && (
                      <div className="p-3 rounded-xl bg-black/20 text-xs space-y-1">
                        <p className="font-semibold">Edited Sunday Presentation Copy:</p>
                        <p className="whitespace-pre-wrap opacity-95">{item.presentationCopy}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Toolbar */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        item.consentToSundaySharing ? 'text-emerald-800' : 'text-slate-600'
                      }`}
                    >
                      {item.consentToSundaySharing
                        ? 'Consented for Sunday Fellowship'
                        : 'Private (No Sunday Consent)'}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleCopy(item)}
                        className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintSingle(item)}
                        className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCopyTarget(item);
                          setCopyDraft(item.presentationCopy || item.testimonyText);
                        }}
                        className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Copy
                      </button>

                      {item.consentToSundaySharing && (
                        <button
                          type="button"
                          onClick={() => onToggleSundaySelect(item.id)}
                          className={`inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-lg font-semibold transition-colors ${
                            isSelectedForSunday
                              ? 'bg-[#0B2545] text-white'
                              : 'border border-[#0B2545] text-[#0B2545] bg-white hover:bg-[#0B2545]/5'
                          }`}
                        >
                          {isSelectedForSunday ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" />
                              In Sunday List
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5" />
                              Add to Sunday
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        aria-label={`Delete testimony by ${item.authorName}`}
                        className="inline-flex items-center justify-center min-h-[34px] min-w-[34px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Presentation Copy Modal */}
      {editingCopyTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-copy-title"
          className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 id="edit-copy-title" className="font-display text-lg font-bold text-[#0B2545]">
                  Edit Sunday Presentation Copy
                </h3>
                <p className="text-xs text-slate-500">
                  Original testimony text by {editingCopyTarget.authorName} remains untouched.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCopyTarget(null)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Original Submission:</p>
              <p className="whitespace-pre-wrap">{editingCopyTarget.testimonyText}</p>
            </div>

            <div>
              <label htmlFor="presentation-copy-input" className="block text-xs font-medium text-slate-700 mb-1">
                Presentation Copy (for Sunday projection/reading)
              </label>
              <textarea
                id="presentation-copy-input"
                rows={5}
                value={copyDraft}
                onChange={(e) => setCopyDraft(e.target.value)}
                maxLength={3000}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCopyTarget(null)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingCopy}
                onClick={() => void handleSavePresentationCopy()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0B2545] text-white text-sm font-semibold disabled:opacity-60"
              >
                {savingCopy ? 'Saving...' : 'Save Presentation Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
