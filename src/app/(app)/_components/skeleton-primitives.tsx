export function sh(delay = 0): React.CSSProperties {
  return {
    backgroundImage:
      "linear-gradient(110deg, var(--muted) 0%, var(--muted) 35%, var(--card) 50%, var(--muted) 65%, var(--muted) 100%)",
    backgroundSize: "300% 100%",
    animation: "panini-shimmer 1.9s ease-in-out infinite",
    animationDelay: `${delay}ms`,
  };
}

export function Bone({
  className = "",
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return <div className={`rounded-md ${className}`} style={{ ...sh(delay), ...style }} />;
}
