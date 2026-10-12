import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import VoiceAssistantModal from '../components/common/VoiceAssistantModal';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { Mic, Phone, KeyRound, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

const DEMOS = [
  { role: 'Worker', name: 'Ramesh (Mason)', phone: '9000000001', icon: '👷' },
  { role: 'Contractor', name: 'Patil Builders', phone: '9000000002', icon: '🏗️' },
  { role: 'Mukkadam', name: 'Sunil (Lead)', phone: '9000000003', icon: '👥' },
  { role: 'Unverified', name: 'Shree Infra', phone: '9000000004', icon: '⚠️' },
];

export default function LoginPage({ onLogin, onVoiceOnboard }) {
  const { lang, setLang, t } = useLanguage();
  const { addToast } = useToast();

  const [phone, setPhone] = useState('9000000001');
  const [otp, setOtp] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await onLogin(phone, otp);
      addToast('Logged in successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoPhone) => {
    setPhone(demoPhone);
    setOtp('1234');
    setLoading(true);
    try {
      await onLogin(demoPhone, '1234');
      addToast('Logged in successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Language switcher top bar */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-2xl px-3 py-1.5 text-xs font-black text-slate-900 shadow-sm">
            <Globe size={15} className="text-yellow-500" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
            </select>
          </div>
        </div>

        {/* Login Box */}
        <Card className="border-4 border-yellow-400 shadow-2xl p-6 sm:p-7 space-y-5">
          {/* Logo */}
          <div className="text-center space-y-1">
            <img
              src="/logo.png"
              alt="KaamSetu Logo"
              className="h-24 w-auto object-contain mx-auto mb-4 drop-shadow-md"
            />
            <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto">
              Labour Platform for construction and daily-wage workers — Verified work, escrow-secured wages.
            </p>
          </div>

          {/* Voice-First Registration Trigger (PDF Feature 2) */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => setShowVoiceModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm shadow-[0_4px_16px_rgba(255,194,46,0.4)] border-2 border-yellow-500 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                <Mic size={18} />
              </span>
              <div className="text-left">
                <div className="leading-tight font-black">{t('voiceOnboarding')}</div>
                <div className="text-[11px] font-bold opacity-85">
                  {t('voiceOnboardingDesc')}
                </div>
              </div>
            </div>
            <ArrowRight size={18} />
          </motion.button>

          {/* 1-Tap Demo Switcher */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              {t('oneTapDemo')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMOS.map((d) => (
                <motion.button
                  key={d.phone}
                  type="button"
                  disabled={loading}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickDemoLogin(d.phone)}
                  className={`p-3 rounded-2xl border-2 text-left transition select-none cursor-pointer ${
                    phone === d.phone
                      ? 'border-yellow-400 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:bg-yellow-50/50 text-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <span>{d.icon}</span>
                    <span className="truncate">
                      {d.role === 'Worker' ? t('worker') : d.role === 'Contractor' ? t('contractor') : d.role === 'Mukkadam' ? t('mukkadam') : d.role}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold opacity-80 truncate mt-0.5">
                    {d.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Phone & OTP Inputs */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                {t('mobileNumber')}
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9000000001"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-yellow-400 rounded-xl pl-10 pr-3 py-2.5 text-sm font-black text-slate-950 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                {t('smsOtp')}
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-yellow-400 rounded-xl pl-10 pr-3 py-2.5 text-sm font-black text-slate-950 font-mono tracking-widest"
                  required
                />
              </div>
            </div>

            <Button size="lg" variant="navy" type="submit" disabled={loading}>
              {loading ? t('loggingIn') : t('enterPlatform')}
            </Button>
          </form>
        </Card>

        {/* Voice Modal */}
        <VoiceAssistantModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onLoginSuccess={(u) => {
            setShowVoiceModal(false);
            onVoiceOnboard(u);
          }}
        />
      </div>
    </div>
  );
}
