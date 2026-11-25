import { differenceInCalendarDays } from "date-fns";

export function postedAge(createdAt: string, now = new Date()) {
  const date = new Date(createdAt);
  const days = Math.max(0, differenceInCalendarDays(now, date));
  if (!Number.isFinite(days)) return { unit: "unknown" as const, value: 0, date };
  if (days > 60) return { unit: "date" as const, value: days, date };
  if (days >= 7) return { unit: "weeks" as const, value: Math.floor(days / 7), date };
  return { unit: "days" as const, value: days, date };
}

export function postedTime(createdAt: string, now = new Date()): string {
  const age = postedAge(createdAt, now);
  if (age.unit === "unknown") return "Posted";
  if (age.unit === "date") return `Posted on ${age.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  if (age.unit === "weeks") return `Posted ${age.value} week${age.value === 1 ? "" : "s"} ago`;
  if (age.value === 0) return "Posted today";
  if (age.value === 1) return "Posted yesterday";
  return `Posted ${age.value} days ago`;
}