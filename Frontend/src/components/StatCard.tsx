export default function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Icon />
        </div>
      </div>
    </div>
  );
}
