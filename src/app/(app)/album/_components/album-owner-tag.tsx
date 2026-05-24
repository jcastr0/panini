import { cn } from "@/lib/utils";

export function AlbumOwnerTag({
  username,
  displayName,
  collectorCardBase64,
  avatarUrl,
  size = "md",
  className,
}: {
  username: string;
  displayName: string | null;
  collectorCardBase64: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const imgSrc = collectorCardBase64
    ? `data:image/jpeg;base64,${collectorCardBase64}`
    : avatarUrl;
  const initials = (displayName || username || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const dim = size === "sm" ? "size-7" : "size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur pl-1 pr-3 py-1",
        className,
      )}
    >
      <div
        className={cn(
          dim,
          "rounded-full overflow-hidden bg-muted grid place-items-center text-xs font-semibold ring-1 ring-border",
        )}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Álbum de
        </span>
        <span className="text-sm font-semibold">
          @{username}
        </span>
      </div>
    </div>
  );
}
