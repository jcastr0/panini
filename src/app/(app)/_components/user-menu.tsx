"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, HelpCircle, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/(auth)/actions";
import { SupportButton } from "./support-button";

export function UserMenu({
  email,
  username,
  displayName,
  avatarUrl,
  collectorCardBase64,
}: {
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  collectorCardBase64: string | null;
}) {
  const router = useRouter();
  const [supportOpen, setSupportOpen] = useState(false);
  const initials = (displayName || username || email)
    .split(/\s+|[@._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const imgSrc = collectorCardBase64
    ? `data:image/jpeg;base64,${collectorCardBase64}`
    : avatarUrl;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9">
          {imgSrc ? <AvatarImage src={imgSrc} alt="" /> : null}
          <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-medium">
              {displayName || (username ? `@${username}` : email)}
            </div>
            <div className="text-xs text-muted-foreground truncate">{email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 size-4" /> Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/manual")}>
          <HelpCircle className="mr-2 size-4" /> Ayuda
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSupportOpen(true)}>
          <Heart
            className="mr-2 size-4 text-[var(--panini-red)]"
            fill="currentColor"
          />{" "}
          Apoya el proyecto
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logoutAction();
          }}
        >
          <LogOut className="mr-2 size-4" /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <SupportButton open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
