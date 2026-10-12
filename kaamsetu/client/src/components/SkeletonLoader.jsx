export default function SkeletonLoader({ lines = 3, type = 'card' }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 h-28 flex flex-col justify-between">
            <div className="h-3 bg-slate-200 rounded w-20" />
            <div className="h-7 bg-slate-300 rounded w-28 my-1" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-slate-300 rounded-lg w-40" />
          <div className="h-3 bg-slate-200 rounded w-28" />
        </div>
        <div className="h-6 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-200 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
      <div className="h-12 bg-slate-200 rounded-2xl w-full" />
    </div>
  );
}
