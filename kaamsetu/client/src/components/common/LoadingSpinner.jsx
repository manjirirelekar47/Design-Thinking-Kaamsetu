export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-safety rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{text}</span>
    </div>
  );
}
