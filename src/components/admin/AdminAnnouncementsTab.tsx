import { useState, type FormEvent } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { deleteAnnouncementRecord, saveAnnouncement } from '../../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../../lib/firebase';
import { formatNigeriaDateTime } from '../../lib/rcf-utils';
import type { Announcement } from '../../types/rcf';

interface AdminAnnouncementsTabProps {
  announcements: Announcement[];
  onAnnouncementsChanged: () => Promise<void>;
}

export function AdminAnnouncementsTab({
  announcements,
  onAnnouncementsChanged,
}: AdminAnnouncementsTabProps) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function resetForm() {
    setEditingId(undefined);
    setTitle('');
    setContent('');
    setEventDate('');
    setActive(true);
    setErrorMsg('');
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setEventDate(a.eventDate ?? '');
    setActive(a.active);
    setErrorMsg('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (title.trim().length < 2 || content.trim().length < 2) {
      setErrorMsg('Please enter both an announcement title and message.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      await saveAnnouncement({
        id: editingId,
        title: title.trim(),
        content: content.trim(),
        eventDate: eventDate.trim() || undefined,
        active,
      });
      await onAnnouncementsChanged();
      resetForm();
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setErrorMsg('');
    try {
      await deleteAnnouncementRecord(id);
      if (editingId === id) resetForm();
      await onAnnouncementsChanged();
    } catch (err) {
      setErrorMsg(parseFirestoreErrorMessage(err));
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-600 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label htmlFor="ann-title" className="block text-xs font-medium text-slate-700 mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              placeholder="e.g., Sunday Thanksgiving Service"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="ann-date" className="block text-xs font-medium text-slate-700 mb-1">
              Announcement / Event Date <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="ann-date"
              type="text"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              maxLength={64}
              placeholder="e.g., Sunday, 29 November 2026 · 8:00 AM"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label htmlFor="ann-content" className="block text-xs font-medium text-slate-700 mb-1">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              id="ann-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              placeholder="Write announcement details..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              required
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-400 text-[#0B2545]"
            />
            Display publicly on Homepage and Welcome Page
          </label>

          {errorMsg && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Saving...' : editingId ? 'Update Announcement' : 'Publish Announcement'}
          </button>
        </form>
      </div>

      {/* Existing List */}
      <div className="lg:col-span-7">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0B2545]">
            All Announcements ({announcements.length})
          </h2>

          {announcements.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No announcements created yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <div key={a.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className={a.active ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                        {a.active ? 'Public (Active)' : 'Hidden (Draft)'}
                      </span>
                      {a.eventDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{a.eventDate}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{formatNigeriaDateTime(a.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-base text-[#0B2545] mt-1">{a.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      aria-label={`Edit ${a.title}`}
                      className="min-h-[36px] min-w-[36px] rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(a.id)}
                      aria-label={`Delete ${a.title}`}
                      className="min-h-[36px] min-w-[36px] rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
