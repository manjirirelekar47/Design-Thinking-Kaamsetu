import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Button({
  children,
  icon,
  sublabel,
  variant = 'yellow', // 'yellow', 'navy', 'danger', 'success', 'ghost'
  size = 'lg', // 'lg' (min-h-[56px]), 'md', 'sm'
  disabled = false,
  onClick,
  speechText = '',
  className = '',
  type = 'button',
}) {
  const { speak } = useLanguage();

  let sizeStyle = 'min-h-[58px] px-5 py-3.5 text-base';
  if (size === 'md') sizeStyle = 'min-h-[46px] px-4 py-2.5 text-sm';
  if (size === 'sm') sizeStyle = 'min-h-[38px] px-3.5 py-1.5 text-xs';

  let variantStyle =
    'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-2 border-yellow-500 shadow-[0_6px_20px_-2px_rgba(255,194,46,0.45)] hover:shadow-[0_8px_24px_-2px_rgba(255,194,46,0.55)]';
  if (variant === 'navy') {
    variantStyle =
      'bg-slate-900 hover:bg-slate-850 text-white border-2 border-slate-950 shadow-[0_6px_20px_-2px_rgba(15,23,42,0.3)] hover:shadow-[0_8px_24px_-2px_rgba(15,23,42,0.4)]';
  } else if (variant === 'danger') {
    variantStyle =
      'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-700 shadow-[0_6px_20px_-2px_rgba(225,29,72,0.35)]';
  } else if (variant === 'success') {
    variantStyle =
      'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-700 shadow-[0_6px_20px_-2px_rgba(5,150,105,0.35)]';
  } else if (variant === 'ghost') {
    variantStyle =
      'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200/90 shadow-sm hover:border-slate-300';
  }

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <motion.button
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`w-full rounded-2xl font-black transition-colors flex items-center justify-between gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer ${sizeStyle} ${variantStyle}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-2xl flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-black/10">
              {icon}
            </span>
          )}
          <div className="text-left">
            <div className="leading-tight font-extrabold">{children}</div>
            {sublabel && (
              <div className="text-xs font-semibold opacity-85 mt-0.5">{sublabel}</div>
            )}
          </div>
        </div>

        {speechText && (
          <motion.span
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              speak(speechText);
            }}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current flex-shrink-0 transition cursor-pointer"
            title="Listen out loud"
            role="button"
            tabIndex={0}
            aria-label="Listen audio prompt"
          >
            <Volume2 size={18} />
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
