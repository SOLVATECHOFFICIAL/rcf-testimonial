import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import { fetchPublicSettings, registerMember } from '../lib/firestore-service';
import { parseFirestoreErrorMessage } from '../lib/firebase';
import { saveMemberSession } from '../lib/member-session';
import {
  DEFAULT_EXECUTIVE_PORTFOLIOS,
  DEFAULT_UNITS,
  generateSafeId,
  validateRegistrationInput,
} from '../lib/rcf-utils';
import type { Member, MemberCategory } from '../types/rcf';
import { RcfLogo } from '../components/RcfLogo';

const CATEGORIES: MemberCategory[] = ['Member', 'Worker', 'Executive'];

export function RegisterPage() {
  const currentYear = new Date().getFullYear();

  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [portfolios, setPortfolios] = useState<string[]>(DEFAULT_EXECUTIVE_PORTFOLIOS);

  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<MemberCategory>('Member');
  const [yearJoined, setYearJoined] = useState<number>(currentYear);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [level, setLevel] = useState('');

  // Conditional fields
  const [unit, setUnit] = useState('');
  const [workerRole, setWorkerRole] = useState('');
  const [executivePortfolio, setExecutivePortfolio] = useState('');
  const [executiveSession, setExecutiveSession] = useState('');

  const [submissionNonce, setSubmissionNonce] = useState(() => generateSafeId('reg'));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitError('');
    const payload = {
      fullName,
      category,
      yearJoined: Number(yearJoined),
      email,
      phone,
      department,
      faculty,
      level,
      unit: category === 'Member' ? undefined : unit,
      workerRole: category === 'Worker' ? workerRole : undefined,
      executivePortfolio: category === 'Executive' ? executivePortfolio : undefined,
      executiveSession: category === 'Executive' ? executiveSession : undefined,
    };

    const validation = validateRegistrationInput(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
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
      setRegisteredMember(member);
      setSubmissionNonce(generateSafeId('reg'));
    } catch (err) {
      setSubmitError(parseFirestoreErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredMember) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div
          data-testid="registration-success"
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm"
        >
          <div className="flex justify-center">
            <RcfLogo size="md" />
          </div>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
              Step 1 Complete · Ready for Step 2
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545] mt-1">
              Welcome to the RCF Family!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Thank you, <span className="font-semibold text-slate-900">{registeredMember.fullName}</span>. Your fellowship registration is saved — proceed below to share your testimony.
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] border border-slate-200 p-4 text-left space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Generated Member ID</span>
              <span className="font-mono-tabular font-bold text-[#0B2545]" data-testid="generated-member-id">
                {registeredMember.memberId}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-900">{registeredMember.category}</span>
            </div>
            {registeredMember.unit && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Unit</span>
                <span className="font-medium text-slate-900">{registeredMember.unit}</span>
              </div>
            )}
            {registeredMember.executivePortfolio && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Portfolio</span>
                <span className="font-medium text-slate-900">
                  {registeredMember.executivePortfolio} ({registeredMember.executiveSession})
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/welcome"
              className="w-full inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1D4ED8] text-white font-semibold text-sm sm:text-base hover:from-[#143764] hover:to-[#2563EB] transition-all shadow-sm"
            >
              Continue to Share Your Testimony
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200">
          <RcfLogo size="md" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0369A1]">
              Step 1 of 2 · Before Sharing Your Testimony
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545] mt-0.5">
              Register to Share Your Testimony
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete this quick registration once so leadership knows who is testifying. No password required.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {/* Required Core Fields */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label htmlFor="reg-year" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Year Joined RCF <span className="text-red-600">*</span>
                </label>
                <input
                  id="reg-year"
                  type="number"
                  min={1980}
                  max={currentYear + 1}
                  value={yearJoined}
                  onChange={(e) => {
                    setYearJoined(Number(e.target.value));
                    if (errors.yearJoined) setErrors((p) => ({ ...p, yearJoined: '' }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-[#0B2545]"
                  required
                />
                {errors.yearJoined && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.yearJoined}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conditional Fields: WORKER */}
          {category === 'Worker' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-4">
              <h2 className="font-display font-semibold text-sm text-[#0B2545]">
                Worker Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-worker-unit" className="block text-sm font-medium text-slate-800 mb-1.5">
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
                    <option value="">Select unit...</option>
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="text-xs text-red-600 mt-1" role="alert">
                      {errors.unit}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-worker-role" className="block text-sm font-medium text-slate-800 mb-1.5">
                    Role / Responsibility <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="reg-worker-role"
                    type="text"
                    value={workerRole}
                    onChange={(e) => setWorkerRole(e.target.value)}
                    maxLength={120}
                    placeholder="e.g., Unit Coordinator, Sound Engineer"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Fields: EXECUTIVE */}
          {category === 'Executive' && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-4">
              <h2 className="font-display font-semibold text-sm text-[#0B2545]">
                Executive Details
              </h2>
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
                    Executive Session / Tenure <span className="text-red-600">*</span>
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
                  {errors.executiveSession && (
                    <p className="text-xs text-red-600 mt-1" role="alert">
                      {errors.executiveSession}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="reg-exec-unit" className="block text-sm font-medium text-slate-800 mb-1.5">
                    Primary Unit <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <select
                    id="reg-exec-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  >
                    <option value="">Select unit (optional)...</option>
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Optional Contact & Academic Details */}
          <div className="pt-2 border-t border-slate-200 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Contact &amp; Academic Details <span className="font-normal text-slate-500">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Email / Gmail Address
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
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={32}
                  placeholder="e.g., 08012345678"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                />
              </div>

              <div>
                <label htmlFor="reg-department" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Department
                </label>
                <input
                  id="reg-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  maxLength={120}
                  placeholder="e.g., Computer Science"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                />
              </div>

              <div>
                <label htmlFor="reg-faculty" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Faculty / College
                </label>
                <input
                  id="reg-faculty"
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  maxLength={120}
                  placeholder="e.g., Science & Technology"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                />
              </div>

              <div>
                <label htmlFor="reg-level" className="block text-sm font-medium text-slate-800 mb-1.5">
                  Level
                </label>
                <select
                  id="reg-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                >
                  <option value="">Select level (optional)...</option>
                  <option value="100L">100 Level</option>
                  <option value="200L">200 Level</option>
                  <option value="300L">300 Level</option>
                  <option value="400L">400 Level</option>
                  <option value="500L">500 Level</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Alumni / Staff">Alumni / Staff</option>
                </select>
              </div>
            </div>
          </div>

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
              . Your record is kept private.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
