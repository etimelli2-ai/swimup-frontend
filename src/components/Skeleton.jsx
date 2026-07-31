// ============================================================
// 📁 frontend/src/components/Skeleton.jsx — NOUVEAU
// ============================================================

export function AvisCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-32" />
          <div className="h-3 bg-slate-200 rounded w-48" />
        </div>
        <div className="h-5 bg-slate-200 rounded w-16" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-32 mb-3" />
      <div className="h-20 bg-slate-200 rounded mb-3" />
      <div className="flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-8 bg-slate-200 rounded w-24" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
      <div className="h-32 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-48 bg-slate-200 rounded-xl" />
    </div>
  );
}

export function AvisListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AvisCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-pulse">
      <div className="h-10 bg-slate-100 rounded-t-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-200 rounded flex-1" style={{ width: `${20 + Math.random() * 60}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
