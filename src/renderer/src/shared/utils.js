import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getOS() {
  const platform = navigator.userAgent.toLowerCase();
  if (platform.includes("mac")) return "mac";
  if (platform.includes("win")) return "windows";
  if (platform.includes("linux")) return "linux";
  return "unknown";
}
