import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, CheckCircle2, HeartHandshake, ImagePlus, Send, Trash2 } from 'lucide-react';
import {
  generateSafeId,
  getPresetForColor,
  TESTIMONY_COLOR_PRESETS,
  TESTIMONY_CONTEXTS,
  validateTestimonyInput,
} from '../lib/rcf-utils';
import { compressImageToDataUrl } from '../lib/image-compress';
import { submitTestimony } from '../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../lib/firebase';
import type { MemberSession } from '../types/rcf';
import { RcfLogo } from './RcfLogo';

interface TestimonyComposerProps {
  memberSession: MemberSession;
}

export function TestimonyComposer({ memberSession }: TestimonyComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const [selectedColor, setSelectedColor] = useState(TESTIMONY_COLOR_PRESETS[0].backgroundColor);
  const [testimonyContext, setTestimonyContext] = useState<string>('Thanksgiving');
  const [testimonyText, setTestimonyText] = useState('');
  const [consentToSundaySharing, setConsentToSundaySharing] = useState(false);

  const [submissionNonce, setSubmissionNonce] = useState(() => generateSafeId('nonce'));
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const activePreset = getPresetForColor(selectedColor);
  const charCount = testimonyText.length;

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setProcessingPhoto(true);
    try {
      const compressed = await compressImageToDataUrl(file);
      setPhotoDataUrl(compressed);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Unable to process the selected picture.',
      );
    } finally {
      setProcessingPhoto(false);
    }
  }

  function handleRemovePhoto() {
    setPhotoDataUrl('');
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const payload = {
      authorMemberId: memberSession.memberId,
      authorName: memberSession.fullName,
      membershipCategory: memberSession.category,
      unit: memberSession.unit || memberSession.executivePortfolio,
      testimonyContext: testimonyContext.trim(),
      testimonyTitle: testimonyContext.trim(),
      testimonyText: testimonyText.trim(),
      photoDataUrl: photoDataUrl || undefined,
      backgroundColor: activePreset.backgroundColor,
      textColor: activePreset.textColor,
      consentToSundaySharing,
    };

    const validation = validateTestimonyInput(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      if (validation.errors.testimonyText && typeof document !== 'undefined') {
        const el = document.getElementById('testimony-text');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const docId = await submitTestimony(payload, submissionNonce);
      setSubmittedId(docId);
      setTestimonyText('');
      setPhotoDataUrl('');
      setConsentToSundaySharing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSubmissionNonce(generateSafeId('nonce'));
    } catch (err) {
      setSubmitError(parseFirestoreErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <section
        data-testid="testimony-submitted-confirmation"
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-xs max-w-xl mx-auto"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            Testimony Submitted!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Thank you for declaring what the Lord has done. Your testimony has been delivered to fellowship leadership.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSubmittedId(null)}
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] transition-colors"
        >
          Share Another Testimony
        </button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="composer-heading"
      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs"
    >
      <div className="pb-5 border-b border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">
          Step 2 of 2 · Share Your Testimony
        </p>
        <h1 id="composer-heading" className="text-xl sm:text-2xl font-bold text-[#0B2545] mt-0.5">
          Create Your Testimony Card
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Add your picture if you wish, choose your card color, select the testimony context, write your text, and submit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8" noValidate>
        {/* Left: Picture, Color, Context, Text & Submit */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Upload Picture */}
          <div>
            <span className="block text-sm font-medium text-slate-800 mb-2">
              1. Add Your Picture <span className="text-slate-400 font-normal">(optional)</span>
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                id="testimony-photo"
                type="file"
                accept="image/*"
                onChange={(e) => void handlePhotoChange(e)}
                className="sr-only"
              />
              <label
                htmlFor="testimony-photo"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-800 cursor-pointer transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-[#0369A1]" />
                {processingPhoto ? 'Optimizing picture...' : photoDataUrl ? 'Change Picture' : 'Upload Picture'}
              </label>

              {photoDataUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={photoDataUrl}
                    alt="Uploaded testimony preview"
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    aria-label="Remove uploaded picture"
                    className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {photoError && (
              <p className="text-xs text-red-600 mt-1.5" role="alert">
                {photoError}
              </p>
            )}
          </div>

          {/* 2. Background Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-slate-800">
                2. Choose Background Color <span className="text-red-600">*</span>
              </span>
              <span className="text-xs font-semibold text-[#0B2545]">
                {activePreset.label}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Testimony card background color"
              className="grid grid-cols-6 sm:grid-cols-9 gap-2"
            >
              {TESTIMONY_COLOR_PRESETS.map((preset) => {
                const isSelected = preset.backgroundColor === activePreset.backgroundColor;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${preset.label} background`}
                    title={preset.label}
                    onClick={() => setSelectedColor(preset.backgroundColor)}
                    style={{
                      background: preset.gradient ?? preset.backgroundColor,
                      color: preset.textColor,
                    }}
                    className={`w-full h-11 rounded-xl flex items-center justify-center border transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2545] ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#0B2545] scale-105 border-slate-400'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Testimony Context / Type */}
          <div>
            <span className="block text-sm font-medium text-slate-800 mb-2">
              3. Testimony Type / Context <span className="text-red-600">*</span>
            </span>
            <div
              role="radiogroup"
              aria-label="Testimony context"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {TESTIMONY_CONTEXTS.map((ctx) => {
                const selected = testimonyContext === ctx;
                return (
                  <button
                    key={ctx}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setTestimonyContext(ctx);
                      if (fieldErrors.testimonyContext) {
                        setFieldErrors((p) => ({ ...p, testimonyContext: '' }));
                      }
                    }}
                    className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-[#0B2545] text-white border-[#0B2545]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ctx}
                  </button>
                );
              })}
            </div>
            {fieldErrors.testimonyContext && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.testimonyContext}
              </p>
            )}
          </div>

          {/* 4. Testimony Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="testimony-text" className="block text-sm font-medium text-slate-800">
                4. Write Your Testimony <span className="text-red-600">*</span>
              </label>
              <span className="text-xs font-mono-tabular text-slate-500">
                {charCount} / 3,000
              </span>
            </div>
            <textarea
              id="testimony-text"
              rows={5}
              value={testimonyText}
              onChange={(e) => {
                setTestimonyText(e.target.value);
                if (fieldErrors.testimonyText) {
                  setFieldErrors((prev) => ({ ...prev, testimonyText: '' }));
                }
              }}
              maxLength={3000}
              placeholder="Praise the Lord! Share what God has done for you..."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545] resize-y"
              required
            />
            {fieldErrors.testimonyText && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {fieldErrors.testimonyText}
              </p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={consentToSundaySharing}
                onChange={(e) => setConsentToSundaySharing(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-slate-400 text-[#0B2545] focus:ring-[#0B2545] shrink-0"
              />
              <span className="text-sm text-slate-800 leading-snug">
                I agree that the fellowship may consider this testimony for sharing during Sunday fellowship.
              </span>
            </label>
          </div>

          {Object.values(fieldErrors).some(Boolean) && (
            <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
              {Object.values(fieldErrors).find(Boolean)}
            </div>
          )}

          {submitError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || processingPhoto}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white text-sm font-semibold hover:from-[#143764] hover:to-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting Testimony...' : 'Submit Testimony'}
          </button>
        </div>

        {/* Right: Live Colored Card Preview (No private member details displayed) */}
        <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-800">Live Card Preview</span>
            <span className="text-xs text-slate-500">Updates automatically</span>
          </div>

          <div
            data-testid="testimony-live-preview"
            style={{
              background: activePreset.gradient ?? activePreset.backgroundColor,
              color: activePreset.textColor,
              borderColor: activePreset.borderColor,
            }}
            className="flex-1 min-h-[300px] sm:min-h-[340px] rounded-2xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Member testimony photo"
                    className="w-11 h-11 rounded-full object-cover border border-white/40 shrink-0"
                  />
                ) : (
                  <RcfLogo size="sm" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {testimonyContext || 'Testimony'}
                  </p>
                  <p
                    style={{ color: activePreset.mutedTextColor }}
                    className="text-xs truncate"
                  >
                    RCF Testimony Card
                  </p>
                </div>
              </div>
              <HeartHandshake className="w-5 h-5 shrink-0 opacity-80" aria-hidden="true" />
            </div>

            <div className="my-6 text-center px-1">
              <p
                className={`leading-relaxed break-words whitespace-pre-wrap ${
                  testimonyText.trim().length > 260
                    ? 'text-sm sm:text-base text-left'
                    : 'text-lg sm:text-xl font-medium text-center'
                }`}
              >
                {testimonyText.trim() ||
                  'Your testimony will appear right here as you type. Choose your picture, color, and context.'}
              </p>
            </div>

            <div
              style={{ color: activePreset.mutedTextColor }}
              className="pt-3 border-t border-current/15 flex items-center justify-between text-xs"
            >
              <span>Redeemed Christian Fellowship</span>
              <span>
                {consentToSundaySharing ? 'Sunday sharing: Agreed' : 'Leadership only'}
              </span>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
