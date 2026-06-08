export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: "blue" | "gold" | "red" | "green";
}) {
  const accentColor =
    accent === "blue"
      ? "var(--panini-blue)"
      : accent === "gold"
        ? "var(--gold)"
        : accent === "red"
          ? "var(--panini-red)"
          : accent === "green"
            ? "rgb(16 185 129)"
            : "var(--foreground)";
  return (
    <div className="border rounded-xl bg-card p-5 space-y-2">
      <p className="eyebrow">{label}</p>
      <p
        className="font-display text-3xl font-bold tabular leading-none"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
