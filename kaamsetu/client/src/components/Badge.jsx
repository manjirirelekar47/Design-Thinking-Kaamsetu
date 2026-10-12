export default function Badge({
  children,
  variant = 'neutral', // 'success', 'warning', 'danger', 'info', 'yellow', 'navy', 'neutral'
  size = 'sm', // 'sm', 'md'
  icon,
  className = '',
}) {
  let variantStyle = 'bg-slate-100 text-slate-700 border-slate-200/80';

  if (variant === 'success') {
    variantStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10 shadow-2xs';
  } else if (variant === 'warning') {
    variantStyle = 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10 shadow-2xs';
  } else if (variant === 'danger') {
    variantStyle = 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/10 shadow-2xs';
  } else if (variant === 'info') {
    variantStyle = 'bg-sky-50 text-sky-700 border-sky-200/80 ring-1 ring-sky-500/10 shadow-2xs';
  } else if (variant === 'yellow') {
    variantStyle = 'bg-yellow-400/20 text-slate-950 border-yellow-400/80 ring-1 ring-yellow-400/30 font-black shadow-2xs';
  } else if (variant === 'navy') {
    variantStyle = 'bg-slate-900 text-yellow-300 border-slate-950 font-bold shadow-sm';
  }

  const sizeStyle = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border leading-tight transition-colors ${sizeStyle} ${variantStyle} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
