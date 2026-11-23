import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0B2545]">
              Privacy Notice
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Redeemed Christian Fellowship (RCF)
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-[#0B2545]">
            1. Information We Collect
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            When you register or submit a testimony on this website, RCF collects only the information needed for:
          </p>
          <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-1.5">
            <li>Fellowship membership records and unit or executive placement.</li>
            <li>Fellowship communication and pastoral care where contact details are provided.</li>
            <li>Fellowship organization and Sunday service planning.</li>
            <li>Receiving and reviewing member testimonies.</li>
            <li>Preparing Sunday fellowship testimony lists where you explicitly grant consent.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-[#0B2545]">
            2. Member &amp; Testimony Confidentiality
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            Your membership details and submitted testimonies are <strong>not</strong> made public automatically. The member directory, phone numbers, email addresses, and submitted testimonies are strictly protected by database security rules and are accessible only to authorized RCF administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-[#0B2545]">
            3. Sunday Testimony Sharing Consent
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            During testimony submission, you are asked whether the fellowship may consider your testimony for sharing during Sunday fellowship. If you do not check this consent option, your testimony remains strictly for private leadership reading and will not be added to Sunday presentation lists.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-[#0B2545]">
            4. Updates or Removal Requests
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            If you wish to update your membership information or request removal of a record or testimony, please contact fellowship leadership through the contact details on our About page.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
          <Link
            to="/welcome"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#143764] transition-colors"
          >
            Share Testimony
          </Link>
        </div>
      </article>
    </div>
  );
}
