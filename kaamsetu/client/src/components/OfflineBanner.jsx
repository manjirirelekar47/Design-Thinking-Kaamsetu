import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OfflineBanner({ isOffline, onSync }) {
  const { lang } = useLanguage();

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-400 text-slate-950 px-4 py-2.5 text-xs font-black flex items-center justify-between border-b-2 border-yellow-500 shadow-md sticky top-14 z-30 animate-in slide-in-from-top-1">
      <div className="flex items-center gap-2">
        <WifiOff size={16} className="text-slate-900 flex-shrink-0 animate-pulse" />
        <span>
          {lang === 'mr'
            ? 'ऑफलाइन मोड: जतन केलेला स्थानिक डेटा दाखवत आहे. इंटरनेट जोडल्यावर आपोआप सिंक होईल.'
            : lang === 'hi'
            ? 'ऑफलाइन मोड: पुराना सुरक्षित डेटा दिखाया जा रहा है। नेटवर्क आने पर सिंक होगा।'
            : 'Low-Data / Offline Mode: Displaying saved local records. Real-time changes queue locally.'}
        </span>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-yellow-300 rounded-lg font-bold flex items-center gap-1 transition"
        >
          <RefreshCw size={12} />
          <span>Sync</span>
        </button>
      )}
    </div>
  );
}
