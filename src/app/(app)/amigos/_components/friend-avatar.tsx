"use client";

import { useState } from "react";

/**
 * Avatar para tarjeta de amigo en /amigos.
 * Fallback chain: MyPanini → avatar_url → iniciales.
 * Las imágenes cargan lazy desde el navegador, sin bloquear SSR.
 */
export function FriendAvatar({
  username,
  avatarUrl,
  initials,
}: {
  username: string;
  avatarUrl: string | null;
  initials: string;
}) {
  // step 0 = MyPanini, 1 = avatar_url, 2 = iniciales
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const showInitials = step === 2 || (step === 1 && !avatarUrl);
  const src =
    step === 0 ? `/api/u/${username}/card` : step === 1 ? avatarUrl! : null;

  return (
    <div className="size-12 rounded-full overflow-hidden bg-muted grid place-items-center text-sm font-semibold ring-1 ring-border">
      {showInitials || !src ? (
        <span>{initials || "?"}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setStep((s) => Math.min(s + 1, 2) as 0 | 1 | 2)}
        />
      )}
    </div>
  );
}
