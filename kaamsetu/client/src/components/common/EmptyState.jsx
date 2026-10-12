export default function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl my-2">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-base font-bold text-navy-900 mb-1">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
