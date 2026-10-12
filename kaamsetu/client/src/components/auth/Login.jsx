import { useState } from 'react';
import Card from '../common/Card';
import PainPointTag from '../common/PainPointTag';
import VoiceAssistantModal from '../common/VoiceAssistantModal';
import { api, setToken } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Mic, Globe, KeyRound, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Worker', name: 'Ramesh (Mason)', phone: '9000000001', icon: '👷' },
  { role: 'Contractor', name: 'Patil Builders', phone: '9000000002', icon: '🏗️' },
  { role: 'Mukkadam', name: 'Sunil (Crew Lead)', phone: '9000000003', icon: '👥' },
  { role: 'Contractor', name: 'Shree Infra (Unverified)', phone: '9000000004', icon: '⚠️' },
];

export default function Login({ onLoginSuccess }) {
  const { lang, setLang } = useLanguage();
  const { addToast } = useToast();
  const [phone, setPhone] = useState('9000000001');
  const [otp, setOtp] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: { phone, otp },
      });
      setToken(res.token);
      addToast(`Logged in as ${res.user.name} (${res.user.role})`, 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (demoPhone) => {
    setPhone(demoPhone);
    setOtp('1234');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-amber-50/40 to-slate-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Language selector bar */}
        <div className="flex justify-end items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-navy-950 shadow-2xs">
            <Globe size={14} className="text-safety-600" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-4 border-safety shadow-2xl p-6 sm:p-7 space-y-5">
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5">
            <img
              src="/logo.png"
              alt="KaamSetu Logo"
              className="h-24 w-auto object-contain mx-auto mb-4 drop-shadow-md"
            />
            <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
              Labour Platform for construction and daily-wage workers — Verified work, escrow-secured wages.
            </p>
          </div>

          {/* Voice-First Registration Button (PDF Feature 2) */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-safety-400 to-safety hover:from-safety-500 hover:to-safety-400 text-navy-950 font-black text-sm shadow-yellow border-2 border-safety-600 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-navy-900 text-white">
                <Mic size={18} />
              </span>
              <div className="text-left">
                <div className="leading-tight">Voice-First Onboarding</div>
                <div className="text-[11px] font-semibold opacity-80">
                  Speak in Marathi or Hindi — No typing needed
                </div>
              </div>
            </div>
            <ArrowRight size={18} />
          </button>

          <PainPointTag text="App is in English, low digital literacy; cannot read or type on small smartphone keyboards" persona="worker" />

          {/* 1-Tap Demo Role Selectors */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              1-Tap Demo Roles (OTP: 1234)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.phone}
                  type="button"
                  onClick={() => selectDemo(d.phone)}
                  className={`p-2.5 rounded-xl border-2 text-left transition ${
                    phone === d.phone
                      ? 'border-navy-900 bg-navy-800 text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <span>{d.icon}</span>
                    <span className="truncate">{d.role}</span>
                  </div>
                  <div className="text-[10px] font-medium opacity-80 truncate mt-0.5">
                    {d.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone & OTP Form */}
          <form onSubmit={handleLogin} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Mobile Number (10 Digits)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9000000001"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-safety rounded-xl pl-10 pr-3 py-2.5 text-sm font-bold text-navy-950 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                SMS OTP (Demo: 1234)
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-safety rounded-xl pl-10 pr-3 py-2.5 text-sm font-bold text-navy-950 font-mono tracking-widest"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-navy-800 hover:bg-navy-700 active:scale-[0.98] text-white font-black rounded-xl text-sm shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Platform →'}
            </button>
          </form>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] font-medium text-slate-500">
          Design Thinking Phase 2 Prototype · Node.js API (:5000) + React (:5173)
        </p>
      </div>

      {/* Spoken Voice Onboarding Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
}
