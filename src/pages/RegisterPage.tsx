import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { fetchPublicSettings, registerMember } from '../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../lib/firebase';
import { getMemberSession, saveMemberSession } from '../lib/member-session';
import {
  DEFAULT_EXECUTIVE_PORTFOLIOS,
  DEFAULT_UNITS,
  generateSafeId,
  getYearTapGrid,
  JOINED_MONTHS,
  validateRegistrationInput,
} from '../lib/rcf-utils';
import type { MemberCategory } from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';

const CATEGORIES: MemberCategory[] = ['Member', 'Worker', 'Executive'];

export function RegisterPage() {
  const navigate = useNavigate();
  const existingSession = getMemberSession();
  const currentYear = new Date().getFullYear();

  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [portfolios, setPortfolios] = useState<string[]>(DEFAULT_EXECUTIVE_PORTFOLIOS);

  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<MemberCategory>('Member');

  // Step-by-step Year (20-year tap grid) -> optional Month -> optional Date & Time
  const [yearWindowEnd, setYearWindowEnd] = useState<number>(currentYear);
  const [yearJoined, setYearJoined] = useState<number>(currentYear);
  const [monthJoined, setMonthJoined] = useState<string>('');
  const [dateJoined, setDateJoined] = useState<string>('');
  const [timeJoined, setTimeJoined] = useState<string>('');

  // All compulsory contact & academic details
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [level, setLevel] = useState('');

  // Simple category-specific field (no redundant extra post fields)
  const [unit, setUnit] = useState('');
  const [executivePortfolio, setExecutivePortfolio] = useState('');
  const [executiveSession, setExecutiveSession] = useState(`${currentYear - 1}/${currentYear}`);

  const [submissionNonce, setSubmissionNonce] = useState(() => generateSafeId('reg'));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let mounted = true;
    void fetchPublicSettings().then((settings) => {
      if (!mounted) return;
      setUnits(settings.units);
      setPortfolios(settings.executivePortfolios);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Once registered, member cannot go back to change or re-register details
  if (existingSession) {
    return <Navigate to="/welcome" replace />;
  }

  const yearGrid = getYearTapGrid(yearWindowEnd, 20);
  const quickSessions = [
    `${currentYear - 2}/${currentYear - 1}`,
    `${currentYear - 1}/${currentYear}`,
    `${currentYear}/${currentYear + 1}`,
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const payload = {
      fullName,
      category,
      yearJoined: Number(yearJoined),
      monthJoined: monthJoined || undefined,
      dateJoined: dateJoined || undefined,
      timeJoined: timeJoined || undefined,
      email,
      phone,
      department,
      faculty,
      level,
      unit: category === 'Worker' ? unit : undefined,
      executivePortfolio: category === 'Executive' ? executivePortfolio : undefined,
      executiveSession: category === 'Executive' ? executiveSession : undefined,
    };

    const validation = validateRegistrationInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      const firstKey = Object.keys(validation.errors)[0];
      const fieldIdMap: Record<string, string> = {
        fullName: 'reg-fullname',
        unit: 'reg-worker-unit',
        executivePortfolio: 'reg-exec-portfolio',
        executiveSession: 'reg-exec-session',
        email: 'reg-email',
        phone: 'reg-phone',
        department: 'reg-department',
        faculty: 'reg-faculty',
        level: 'reg-level',
      };
      const targetId = firstKey ? fieldIdMap[firstKey] : undefined;
      if (targetId && typeof document !== 'undefined') {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const member = await registerMember(payload, submissionNonce);
      saveMemberSession({
        memberId: member.memberId,
        fullName: member.fullName,
        category: member.category,
        unit: member.unit,
        executivePortfolio: member.executivePortfolio,
      });
      setSubmissionNonce(generateSafeId('reg'));
      // Go straight to Testimony Studio without showing registration details again
      navigate('/welcome', { replace: true });
    } catch (err) {
      setSubmitError(parseFirestoreErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200">
          <RcfLogo size="md" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">
              Step 1 of 2 · Fellowship Registration
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545] mt-0.5">
              Register to Share Your Testimony
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Fill in all required details below once. Once submitted, your details are locked and you go straight to sharing your testimony.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {/* Full Name & Category */}
          <div className="space-y-4">
            <div>
              <label htmlFor="reg-fullname" className="block text-sm font-medium text-slate-800 mb-1.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                }}
                maxLength={120}
                placeholder="Enter your surname and first name"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545]"
                required
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-800 mb-1.5">
                Membership Category <span className="text-red-600">*</span>
              </span>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Membership Category">
                {CATEGORIES.map((cat) => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setCategory(cat);
                        setErrors((p) => ({
                          ...p,
                          unit: '',
                          executivePortfolio: '',
                          executiveSession: '',
                        }));
                      }}
                      className={`min-h-[44px] px-2 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        active
                          ? 'bg-[#0B2545] text-white border-[#0B2545]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conditional Simple Role Selection (no extra post questions) */}
          {category === 'Worker' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
              <label htmlFor="reg-worker-unit" className="block text-sm font-medium text-slate-800">
                Fellowship Unit <span className="text-red-600">*</span>
              </label>
              <select
                id="reg-worker-unit"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (errors.unit) setErrors((p) => ({ ...p, unit: '' }));
                }}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                required
              >
                <option value="">Select your unit...</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.unit}
                </p>
              )}
            </div>
          )}

          {category === 'Executive' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-exec-portfolio" className="block text-sm font-medium text-slate-800 mb-1.5">
                    Executive Portfolio <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="reg-exec-portfolio"
                    value={executivePortfolio}
                    onChange={(e) => {
                      setExecutivePortfolio(e.target.value);
                      if (errors.executivePortfolio) {
                        setErrors((p) => ({ ...p, executivePortfolio: '' }));
                      }
                    }}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    required
                  >
                    <option value="">Select portfolio...</option>
                    {portfolios.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.executivePortfolio && (
                    <p className="text-xs text-red-600 mt-1" role="alert">
                      {errors.executivePortfolio}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-exec-session" className="block text-sm font-medium text-slate-800 mb-1.5">
                    Executive Session <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="reg-exec-session"
                    type="text"
                    value={executiveSession}
                    onChange={(e) => {
                      setExecutiveSession(e.target.value);
                      if (errors.executiveSession) {
                        setErrors((p) => ({ ...p, executiveSession: '' }));
                      }
                    }}
                    maxLength={40}
                    placeholder="e.g., 2025/2026"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                    required
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {quickSessions.map((sess) => (
                      <button
                        key={sess}
                        type="button"
                        onClick={() => {
                          setExecutiveSession(sess);
                          if (errors.executiveSession) {
                            setErrors((p) => ({ ...p, executiveSession: '' }));
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-mono-tabular border transition-colors ${
                          executiveSession === sess
                            ? 'bg-[#0B2545] text-white border-[#0B2545]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sess}
                      </button>
                    ))}
                  </div>
                  {errors.executiveSession && (
                    <p className="text-xs text-red-600 mt-1" role="alert">
                      {errors.executiveSession}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tap-to-Select Year (20-Year Preview) -> Optional Month -> Optional Date & Time */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="block text-sm font-semibold text-[#0B2545]">
                  Year Joined RCF <span className="text-red-600">*</span>
                </span>
                <p className="text-xs text-slate-500">
                  Tap your year below (no typing needed). Selected: <span className="font-mono-tabular font-semibold text-[#0B2545]">{yearJoined}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setYearWindowEnd((prev) => Math.max(1999, prev - 10))}
                  disabled={yearWindowEnd <= 1999}
                  aria-label="Show earlier years"
                  className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Earlier
                </button>
                <button
                  type="button"
                  onClick={() => setYearWindowEnd((prev) => Math.min(currentYear + 1, prev + 10))}
                  disabled={yearWindowEnd >= currentYear + 1}
                  aria-label="Show newer years"
                  className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Later
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              role="radiogroup"
              aria-label="Year Joined RCF"
              className="grid grid-cols-4 sm:grid-cols-5 gap-2"
            >
              {yearGrid.map((yr) => {
                const selected = yearJoined === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setYearJoined(yr);
                      if (errors.yearJoined) setErrors((p) => ({ ...p, yearJoined: '' }));
                    }}
                    className={`min-h-[44px] rounded-xl font-mono-tabular text-sm font-semibold border transition-colors ${
                      selected
                        ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                        : yr >= 2018
                          ? 'bg-white text-[#0B2545] border-blue-200 hover:bg-blue-50'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
            {errors.yearJoined && (
              <p className="text-xs text-red-600" role="alert">
                {errors.yearJoined}
              </p>
            )}

            {/* Optional Month Selection */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Month Joined <span className="font-normal text-slate-500">(optional)</span>
                </span>
                {monthJoined && (
                  <button
                    type="button"
                    onClick={() => setMonthJoined('')}
                    className="text-xs text-[#0369A1] hover:underline"
                  >
                    Clear month
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {JOINED_MONTHS.map((m) => {
                  const selected = monthJoined === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonthJoined(selected ? '' : m)}
                      className={`min-h-[38px] px-2 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-[#0369A1] text-white border-[#0369A1]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Day & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label htmlFor="reg-date-day" className="block text-xs font-medium text-slate-700 mb-1">
                  Day of Month <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  id="reg-date-day"
                  value={dateJoined}
                  onChange={(e) => setDateJoined(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
                >
                  <option value="">Any day (optional)</option>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reg-time" className="block text-xs font-medium text-slate-700 mb-1">
                  Time <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  id="reg-time"
                  type="time"
                  value={timeJoined}
                  onChange={(e) => setTimeJoined(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-mono-tabular text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* All Compulsory Contact & Academic Details */}
          <div className="pt-2 border-t border-slate-200 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0B2545]">
                Contact &amp; Academic Details <span className="text-red-600">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All fields below are required before proceeding to share your testimony.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Email / Gmail Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  maxLength={160}
                  placeholder="name@gmail.com"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  maxLength={32}
                  placeholder="e.g., 08012345678"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-department" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Department <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-department"
                  type="text"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (errors.department) setErrors((p) => ({ ...p, department: '' }));
                  }}
                  maxLength={120}
                  placeholder="e.g., Computer Science"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                />
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.department}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-faculty" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Faculty / College <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-faculty"
                  type="text"
                  value={faculty}
                  onChange={(e) => {
                    setFaculty(e.target.value);
                    if (errors.faculty) setErrors((p) => ({ ...p, faculty: '' }));
                  }}
                  maxLength={120}
                  placeholder="e.g., Science & Technology"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                />
                {errors.faculty && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.faculty}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="reg-level" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Level <span className="text-red-600">*</span>
                </label>
                <select
                  id="reg-level"
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    if (errors.level) setErrors((p) => ({ ...p, level: '' }));
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  required
                >
                  <option value="">Select level...</option>
                  <option value="100L">100 Level</option>
                  <option value="200L">200 Level</option>
                  <option value="300L">300 Level</option>
                  <option value="400L">400 Level</option>
                  <option value="500L">500 Level</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Alumni / Staff">Alumni / Staff</option>
                </select>
                {errors.level && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.level}
                  </p>
                )}
              </div>
            </div>
          </div>

          {Object.values(errors).some(Boolean) && (
            <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
              {Object.values(errors).find(Boolean)}
            </div>
          )}

          {submitError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              By registering, you agree to our{' '}
              <Link to="/privacy" className="underline text-[#0B2545]">
                Privacy Notice
              </Link>
              . Your details are kept private and cannot be altered after submission.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Saving & Opening Studio...' : 'Continue to Testimony'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
