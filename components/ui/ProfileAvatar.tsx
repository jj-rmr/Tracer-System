"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  name: string;
  pictureUrl?: string | null;
  size?: number;
  className?: string;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)?.[0] : ""}`.toUpperCase();
}

export function ProfileAvatar({
  name,
  pictureUrl,
  size = 40,
  className,
}: ProfileAvatarProps) {
  const [failedPictureUrl, setFailedPictureUrl] = useState<string | null>(null);
  const imageFailed = Boolean(pictureUrl && failedPictureUrl === pictureUrl);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-semibold text-secondary-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {pictureUrl && !imageFailed ? (
        <Image
          src={pictureUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailedPictureUrl(pictureUrl)}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: Math.max(11, size * 0.34) }}
        >
          {initialsFor(name)}
        </span>
      )}
      <span className="sr-only">
        Profile picture for {name || "unnamed user"}
      </span>
    </span>
  );
}
