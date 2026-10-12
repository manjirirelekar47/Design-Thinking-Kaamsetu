export default function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/70 border-2 border-dashed border-slate-200 rounded-3xl my-2 select-none">
      <span className="text-4xl mb-3 flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-100 shadow-sm border border-yellow-200">
        {icon}
      </span>
      <h3 className="text-base font-black text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
