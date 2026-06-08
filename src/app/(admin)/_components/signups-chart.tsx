export function SignupsChart({ days }: { days: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="border rounded-xl bg-card p-5 space-y-3">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Signups últimos 30 días
      </h2>
      <div className="grid grid-cols-30 gap-0.5 items-end h-32" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const h = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count}`}
              className="bg-[var(--panini-blue)] rounded-sm transition-all hover:opacity-80"
              style={{ height: `${Math.max(2, h)}%` }}
            />
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground tabular flex justify-between">
        <span>{days[0]?.date ?? ""}</span>
        <span>{days[days.length - 1]?.date ?? ""}</span>
      </p>
    </div>
  );
}
