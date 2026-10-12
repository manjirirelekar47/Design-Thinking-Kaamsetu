import { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import VoiceReader from './VoiceReader';
import {
  ShieldCheck,
  Star,
  Award,
  Share2,
  Copy,
  CheckCircle2,
  HardHat,
  ExternalLink,
  Cpu,
  BadgeCheck,
} from 'lucide-react';

export default function WagePassport({ user, passport, onUpdateSkill, onToggleConsent }) {
  const { t, lang } = useLanguage();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const passportUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/passport/${user?.id || 'w1'}`
    : `https://kaamsetu.org/passport/${user?.id || 'w1'}`;

  const daysWorked = passport?.days || user?.days || 187;
  const wagesSecured = passport?.totalWagesReceived || (daysWorked * 700);
  const rating = passport?.rating || user?.rating || 4.9;
  const onTimePct = passport?.onTimePct || 96;

  const handleShareWhatsApp = () => {
    const text = `👷 KaamSetu Verified Wage Passport for ${passport?.name || user?.name}:
✅ Verified Days Worked: ${daysWorked} days
💰 Wages Secured via Escrow: ₹${wagesSecured.toLocaleString('en-IN')}
⭐ Contractor Trust Rating: ${rating} / 5.0 (${onTimePct}% On-Time)
🛡️ Live Credential Verification: ${passportUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(passportUrl);
      setCopied(true);
      addToast('Passport verification link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPassportSpeech = () => {
    if (lang === 'mr') {
      return `कामगार ${passport?.name || user?.name} यांचे अधिकृत डिजिटल मजुरी पासपोर्ट. एकूण ${daysWorked} दिवस प्रमाणित काम पूर्ण. सुरक्षित मजुरी ₹${wagesSecured}. कंत्राटदार विश्वास रेटिंग ${rating} स्टार.`;
    }
    if (lang === 'hi') {
      return `श्रमिक ${passport?.name || user?.name} का आधिकारिक डिजिटल वेज पासपोर्ट। कुल ${daysWorked} दिन प्रमाणित कार्य संपन्न। सुरक्षित मजदूरी ₹${wagesSecured}। ठेकेदार ट्रस्ट रेटिंग ${rating} स्टार।`;
    }
    return `Worker ${passport?.name || user?.name}. Official portable wage credential. ${daysWorked} verified days worked. Secured escrow wages ₹${wagesSecured}. Contractor trust rating ${rating} stars.`;
  };

  return (
    <div className="space-y-4">
      {/* High-End Physical ID Card (Hero Feature) */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        whileHover={{ y: -3 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white p-6 sm:p-7 border-2 border-yellow-400/80 shadow-[0_20px_50px_rgba(15,23,42,0.35)] overflow-hidden"
      >
        {/* Holographic Corner Flare & Shimmer Lines */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 border border-yellow-400/20 rounded-full pointer-events-none" />

        {/* Top Header: Logo, Smartcard Chip & Credential Stamp */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="KaamSetu Logo"
              className="h-11 w-auto object-contain bg-white/10 rounded-2xl p-1.5 backdrop-blur-md shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">
                  {t('officialCredential') || 'OFFICIAL WAGE CREDENTIAL'}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {t('officialPassport') || 'Digital Wage Passport'}
              </h2>
            </div>
          </div>

          {/* Biometric Smartcard Micro-Badge */}
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 text-[11px] font-black shadow-xs">
              <Cpu size={13} className="text-yellow-400" />
              <span>CHIP ID</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
              KS-{(user?.id || 'w1').toUpperCase()}-2026
            </span>
          </div>
        </div>

        {/* Worker Identity & Scannable QR Code Split */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center relative z-10 mb-5">
          {/* Identity Info (7 cols) */}
          <div className="sm:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-yellow-400 text-slate-950 font-black text-lg shadow-sm">
                👷
              </span>
              <div>
                <h3 className="text-xl font-black text-white leading-tight">
                  {passport?.name || user?.name || 'Ramesh Kumar'}
                </h3>
                <p className="text-xs font-bold text-yellow-300">
                  {passport?.skill || user?.skill || 'Master Mason'} · {user?.area || 'Pune Chowk'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Tamper-proof verifiable record of completed construction shifts, escrow payouts, and verified contractor ratings.
            </p>

            {/* Verification status pill */}
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black">
                <ShieldCheck size={14} />
                <span>Govt Minimum Wage Protected</span>
              </span>
            </div>
          </div>

          {/* Clean High-Contrast White Area for QR Code (5 cols) */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] border-2 border-yellow-400/60 transition-transform hover:scale-105">
              <QRCodeSVG
                value={passportUrl}
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2">
              Scan Site QR to Verify
            </span>
          </div>
        </div>

        {/* Core Passport Metrics Grid (Oversized typography) */}
        <div className="grid grid-cols-3 gap-2.5 text-center pt-3 border-t border-slate-700/80 relative z-10 mb-5">
          <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/70 shadow-inner">
            <span className="text-2xl sm:text-3xl font-black text-yellow-400 block font-mono">
              {daysWorked}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('daysWorked') || 'Days Worked'}
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/70 shadow-inner">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block font-mono">
              ₹{wagesSecured.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('wagesSecured') || 'Wages Secured'}
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/70 shadow-inner">
            <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-400">
              <Star size={18} className="fill-amber-400" />
              <span>{rating}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {t('trustRating') || 'Rating'} ({onTimePct}%)
            </span>
          </div>
        </div>

        {/* Verified Trust Badges */}
        <div className="space-y-2 relative z-10 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">
              Verified Skill & Safety Badges
            </span>
            <span className="text-yellow-400 font-bold text-[11px] flex items-center gap-1">
              <BadgeCheck size={14} /> 4 Active Badges
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'Aadhaar KYC',
              'Skill Certified (Mason L2)',
              'ISI Safety Protocol',
              'Escrow Backed',
            ].map((badge, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200 shadow-2xs"
              >
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons: WhatsApp Share, Copy Link, Audio Reader */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-[0_4px_16px_rgba(5,150,105,0.35)] transition cursor-pointer"
        >
          <Share2 size={16} />
          <span>{t('shareWhatsApp') || 'Share WhatsApp'}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-[0_4px_16px_rgba(15,23,42,0.25)] border border-slate-800 transition cursor-pointer"
        >
          <Copy size={16} className={copied ? 'text-emerald-400' : ''} />
          <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
        </motion.button>

        <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
          <VoiceReader text={getPassportSpeech()} />
        </div>
      </div>
    </div>
  );
}
