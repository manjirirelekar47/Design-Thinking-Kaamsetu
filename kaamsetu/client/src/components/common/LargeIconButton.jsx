import { Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LargeIconButton({
  icon,
  label,
  sublabel,
  onClick,
  variant = 'yellow', // 'yellow', 'navy', 'danger', 'ghost', 'success'
  disabled = false,
  speechText = '',
  className = '',
  type = 'button',
}) {
  const { speak } = useLanguage();

  let baseStyle = 'relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none select-none';
  
  let variantStyle = '';
  if (variant === 'yellow') {
    variantStyle = 'bg-safety hover:bg-safety-400 text-navy-900 border-2 border-safety-600 shadow-yellow';
  } else if (variant === 'navy') {
    variantStyle = 'bg-navy-800 hover:bg-navy-700 text-white border-2 border-navy-900 shadow-soft';
  } else if (variant === 'danger') {
    variantStyle = 'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-700 shadow-soft';
  } else if (variant === 'success') {
    variantStyle = 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-700 shadow-soft';
  } else if (variant === 'ghost') {
    variantStyle = 'bg-white hover:bg-slate-50 text-navy-900 border-2 border-slate-300 shadow-card';
  }

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${baseStyle} ${variantStyle} w-full`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-2xl sm:text-3xl flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-black/10">
              {icon}
            </span>
          )}
          <div className="text-left">
            <div className="text-base sm:text-lg leading-tight font-extrabold">{label}</div>
            {sublabel && (
              <div className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
                {sublabel}
              </div>
            )}
          </div>
        </div>

        {speechText && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              speak(speechText);
            }}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current flex-shrink-0 transition"
            title="Listen out loud"
            role="button"
            tabIndex={0}
            aria-label="Listen audio prompt"
          >
            <Volume2 size={18} />
          </span>
        )}
      </button>
    </div>
  );
}
