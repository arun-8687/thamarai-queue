import type { SessionName } from "./types";

export function todayIST(d = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export function sessionIST(d = new Date()): SessionName {
  const hour = Number(
    d.toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false,
    }),
  );
  if (hour < 11) return "morning";
  if (hour < 16) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

export function formatISTTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}
