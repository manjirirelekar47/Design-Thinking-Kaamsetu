import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api, setToken } from '../../api';
import { Globe, RefreshCw, LogOut, Wifi, WifiOff } from 'lucide-react';

export default function Header({ user, onLogout, isOffline, setIsOffline, onQuickLogin }) {
  const { lang, setLang, t } = useLanguage();
  const { addToast } = useToast();

  const handleReset = async () => {
    try {
      await api('/reset', { method: 'POST' });
      addToast('Demo restored to clean seed data', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleQuickSwitch = async (phone, roleLabel) => {
    try {
      await onQuickLogin(phone, '1234');
      addToast(`Switched to ${roleLabel} account!`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const getRoleIcon = () => {
    if (user?.role === 'worker') return '👷';
    if (user?.role === 'contractor') return '🏗️';
    if (user?.role === 'mukkadam') return '👥';
    return '👤';
  };

  return (
    <header className="bg-slate-900/85 backdrop-blur-xl text-white border-b-2 border-yellow-400/80 shadow-[0_8px_30px_rgb(15,23,42,0.2)] px-4 py-3 sticky top-0 z-40 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* Brand & User identity */}
        <div className="flex items-center gap-2.5">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src="/logo.png"
            alt="KaamSetu Logo"
            className="h-10 w-auto object-contain drop-shadow-sm cursor-pointer"
          />
          {user && (
            <div className="border-l border-slate-700/80 pl-2.5">
              <div className="text-xs text-slate-200 flex items-center gap-1 font-bold leading-tight">
                <span>{getRoleIcon()}</span>
                <span className="truncate max-w-[120px] sm:max-w-none">{user.name}</span>
              </div>
              <div className="text-[10px] text-yellow-400 capitalize font-extrabold leading-none mt-0.5">
                {t(user.role) || user.role}
              </div>
            </div>
          )}
        </div>

        {/* 1-Tap Persona Switcher for Evaluators */}
        {onQuickLogin && (
          <div className="hidden md:flex items-center gap-1 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-slate-700/70 text-xs shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Demo:</span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickSwitch('9000000001', 'Worker')}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                user?.role === 'worker' ? 'bg-yellow-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              👷 {t('worker')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickSwitch('9000000002', 'Contractor')}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                user?.role === 'contractor' ? 'bg-yellow-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              🏗️ {t('contractor')}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickSwitch('9000000003', 'Mukkadam')}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                user?.role === 'mukkadam' ? 'bg-yellow-400 text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              👥 {t('mukkadam')}
            </motion.button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Offline / Low-data simulator button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setIsOffline(!isOffline);
              addToast(
                !isOffline ? 'Simulating low-connectivity site mode' : 'Back online with real-time sync',
                !isOffline ? 'warning' : 'success'
              );
            }}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Low-Data / Offline Mode for demonstration"
          >
            {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
            <span className="hidden sm:inline">{isOffline ? 'Low Data' : 'Live'}</span>
          </motion.button>

          {/* Multilingual Selector */}
          <div className="relative flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-200 shadow-inner">
            <Globe size={13} className="text-yellow-400 mr-1.5" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-1 font-bold"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी</option>
            </select>
          </div>

          {/* Reset Demo button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition flex items-center cursor-pointer shadow-xs"
            title="Reset demo data to initial state"
            aria-label="Reset demo"
          >
            <RefreshCw size={15} />
          </motion.button>

          {/* Logout button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setToken(null);
              onLogout();
            }}
            className="p-1.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60 transition flex items-center cursor-pointer shadow-xs"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={15} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
