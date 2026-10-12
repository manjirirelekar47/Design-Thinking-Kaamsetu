import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Star,
  Award,
  Calendar,
  IndianRupee,
  Share2,
  Lock,
  CheckCircle2,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export default function WorkerPassportTab({ user, passport, onUpdateProfile }) {
  const { lang } = useLanguage();
  const { addToast } = useToast();
  const [skill, setSkill] = useState(user.skill || 'Mason');

  const passportUrl = `${window.location.origin}/api/passport/${user.id}`;

  const handleShareWhatsApp = () => {
    const text = `👷 KaamSetu Verified Wage Passport for ${passport?.name || user.name}:
✅ Verified Days Worked: ${passport?.days || user.days} days
⭐ Contractor Trust Rating: ${passport?.rating || user.rating} / 5.0
🛡️ Skill Badges: ${(passport?.badges || []).slice(0, 3).join(', ')}
🔗 Verify online: ${passportUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(passportUrl);
    addToast('Passport verification link copied to clipboard', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Hero Badge Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-3xl p-5 shadow-xl border-2 border-safety relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-safety/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="KaamSetu Logo"
              className="h-10 w-auto object-contain bg-white/10 rounded-xl p-1"
            />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-safety block">
                Official Portable Credential
              </span>
              <h2 className="text-xl font-black text-white leading-none">
                Digital Wage Passport
              </h2>
            </div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <ShieldCheck size={13} /> Live Verified
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Portable, tamper-proof record of verified shifts, wages collected, contractor reviews, and skill badges. Scannable by any contractor at any site.
        </p>

        {/* Core Passport Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-navy-700/80">
          <div className="bg-navy-800/80 p-2.5 rounded-xl border border-navy-700">
            <span className="text-xl sm:text-2xl font-black text-safety block">
              {passport?.days || user.days}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Days Worked</span>
          </div>

          <div className="bg-navy-800/80 p-2.5 rounded-xl border border-navy-700">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block">
              ₹{(passport?.totalWagesReceived || (passport?.days || user.days) * 700).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Wages Secured</span>
          </div>

          <div className="bg-navy-800/80 p-2.5 rounded-xl border border-navy-700">
            <div className="flex items-center justify-center gap-0.5 text-xl sm:text-2xl font-black text-amber-400">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span>{passport?.rating || user.rating}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Rating ({passport?.onTimePct || 96}% On-Time)</span>
          </div>
        </div>

        <PainPointTag
          text="Workers have no proof of years of experience and no trust when meeting new contractors"
          persona="worker"
        />
      </div>

      {/* Scannable QR Code Card */}
      <Card className="text-center space-y-3">
        <h3 className="text-sm font-extrabold text-navy-950 uppercase tracking-wide">
          Contractor Instant QR Verification
        </h3>
        
        <div className="p-4 bg-white inline-block rounded-2xl border-4 border-navy-800 shadow-md">
          <QRCodeSVG
            value={passportUrl}
            size={160}
            level="H"
            includeMargin={true}
          />
        </div>

        <div>
          <p className="text-base font-black text-navy-950">{passport?.name || user.name}</p>
          <p className="text-xs font-semibold text-slate-500">
            Primary Skill: <span className="font-bold text-navy-800">{passport?.skill || user.skill}</span> · ID: <span className="font-mono">{user.id}</span>
          </p>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 justify-center pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Share2 size={14} />
            <span>Share on WhatsApp</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-xs font-bold transition border border-slate-300"
          >
            <ExternalLink size={14} />
            <span>Copy Link</span>
          </button>
        </div>
      </Card>

      {/* Verified Skill Badges (PDF Feature 14) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
            <Award size={16} className="text-safety-600" />
            <span>Earned Skill Badges</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            {passport?.badges?.length || 4} Badges
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {passport?.badges?.map((badge, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-navy-950 border border-amber-200 text-xs font-bold shadow-2xs"
            >
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>{badge}</span>
            </span>
          ))}
        </div>
        <PainPointTag text="Growing the crew and earning better contractor jobs through verified credentials" persona="worker" />
      </Card>

      {/* Profile & Skill selector */}
      <Card className="space-y-3">
        <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
          <Briefcase size={16} className="text-navy-700" />
          <span>Update Primary Skill Profile</span>
        </h3>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 block">Current Trade / Skill</label>
          <select
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              onUpdateProfile({ skill: e.target.value });
            }}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-navy-950 focus:border-safety focus:outline-none"
          >
            {['Mason', 'Helper', 'Painter', 'Plumber', 'Electrician'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Verified Reviews from Contractors */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span>Contractor Testimonials & Ratings</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {passport?.reviews?.length || 0} Reviews
          </span>
        </div>

        {(!passport?.reviews || passport.reviews.length === 0) ? (
          <p className="text-xs text-slate-500 italic p-2 text-center">
            Completed contractor shifts will appear here after wage release.
          </p>
        ) : (
          <div className="space-y-2.5">
            {passport.reviews.map((rev, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex text-amber-500">
                    {'★'.repeat(rev.stars || 5)}{'☆'.repeat(5 - (rev.stars || 5))}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date || 'Recent shift'}</span>
                </div>
                <p className="text-xs font-semibold text-navy-900 italic">"{rev.comment}"</p>
                {rev.contractor && (
                  <p className="text-[10px] text-slate-500 font-bold">— {rev.contractor}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Consent and Privacy Screen (PDF Feature 18) */}
      <Card className="border-2 border-slate-300 space-y-2.5 bg-slate-50/70">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-navy-100 text-navy-900 mt-0.5">
            <Lock size={18} />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-navy-950">Consent & Data Privacy</h4>
              <input
                type="checkbox"
                checked={!!passport?.consent}
                onChange={(e) => onUpdateProfile({ consent: e.target.checked })}
                className="w-5 h-5 accent-navy-800 rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'mr'
                ? 'माझी माहिती सुरक्षित आहे. ठेकेदार फक्त माझे कामाचे दिवस आणि रेटिंग पाहू शकतात. माझा फोन नंबर किंवा घराचा पत्ता कधीही उघड केला जात नाही.'
                : lang === 'hi'
                ? 'मेरी जानकारी सुरक्षित है। ठेकेदार सिर्फ मेरे काम के दिन और रेटिंग देख सकते हैं। फोन नंबर व निजी जानकारी सुरक्षित है।'
                : 'I consent to sharing verified days and ratings with contractors only when I show my QR. My personal phone and address remain private.'}
            </p>
          </div>
        </div>
        <PainPointTag text="Workers fear misuse of personal phone numbers and address data" persona="worker" />
      </Card>
    </div>
  );
}
