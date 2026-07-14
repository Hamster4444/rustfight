"use client";

import { useState } from "react";
import Image from "next/image";

interface SteamImageProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

/** Steam CDN image with a neutral dark placeholder if the URL fails to load. */
export default function SteamImage({
  src,
  alt,
  size,
  className = "",
}: SteamImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-bg p-1 text-center text-[10px] leading-tight text-zinc-500 ${className}`}
        style={{ width: size, height: size }}
      >
        {alt}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
