export function ProgressRing({
  percent,
  size = 160,
  strokeWidth = 14,
  color = "var(--pitch)",
  label,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (c * clamped) / 100;

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="color-mix(in oklab, var(--muted) 70%, transparent)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-bold tabular leading-none">
            {Math.round(clamped)}%
          </div>
          {label && (
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          )}
        </div>
      </div>
    </div>
  );
}
