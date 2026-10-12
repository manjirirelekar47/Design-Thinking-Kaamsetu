import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceReader({
  text,
  label = 'Listen',
  className = '',
  size = 'sm', // 'sm', 'md'
}) {
  const { speak, lang } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleEnd = () => setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('end', handleEnd);
      window.speechSynthesis.addEventListener('error', handleEnd);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('end', handleEnd);
        window.speechSynthesis.removeEventListener('error', handleEnd);
      }
    };
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speak(text);
      // Auto reset after rough reading duration
      const duration = Math.max(3000, (text?.length || 20) * 80);
      setTimeout(() => setIsSpeaking(false), duration);
    }
  };

  const getLocalizedLabel = () => {
    if (lang === 'mr') return isSpeaking ? 'थांबवा' : 'ऐका';
    if (lang === 'hi') return isSpeaking ? 'रोकें' : 'सुनें';
    return isSpeaking ? 'Stop' : 'Listen';
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs border select-none ${
        isSpeaking
          ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm animate-pulse'
          : 'bg-gray-100 hover:bg-yellow-100 text-slate-800 border-slate-300 hover:border-yellow-400'
      } ${className}`}
      title={isSpeaking ? 'Stop speech' : 'Listen aloud via speech synthesis'}
      aria-label="Listen text aloud"
    >
      {isSpeaking ? (
        <VolumeX size={15} className="text-slate-900" />
      ) : (
        <Volume2 size={15} className="text-slate-800" />
      )}
      <span className="font-extrabold">{getLocalizedLabel()}</span>
      {isSpeaking && (
        <span className="flex gap-0.5 items-end h-3">
          <span className="w-0.5 h-3 bg-slate-900 animate-bounce" />
          <span className="w-0.5 h-2 bg-slate-900 animate-bounce delay-75" />
          <span className="w-0.5 h-3.5 bg-slate-900 animate-bounce delay-150" />
        </span>
      )}
    </button>
  );
}
