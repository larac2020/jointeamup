export type EventDates = { event_date: string; end_date?: string | null; competition_date?: string | null; race_day?: string | null };

export const eventEnd = (event: EventDates) => event.end_date || event.event_date;
export const listingExpiry = (listing: EventDates) => listing.competition_date || listing.event_date;
export const isExpired = (listing: EventDates, today = new Date().toISOString().slice(0, 10)) => listingExpiry(listing) < today;
export const dateRangesNearby = (a: EventDates, b: EventDates) => {
  const days = (date: string) => Date.parse(date + "T00:00:00Z") / 86400000;
  return days(a.event_date) <= days(eventEnd(b)) + 7 && days(eventEnd(a)) >= days(b.event_date) - 7;
};
export const shortDate = (date: string) => new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
});
export const competitionDateLabel = (listing: EventDates) => `Competition date: ${shortDate(listingExpiry(listing))}`;
export const eventDateLabel = (event: EventDates) => {
  const start = new Date(event.event_date + "T00:00:00Z");
  const end = new Date(eventEnd(event) + "T00:00:00Z");
  const full = (date: Date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  if (event.event_date === eventEnd(event)) return full(start);
  if (start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth()) return `${start.getUTCDate()}–${full(end)}`;
  return `${full(start)} – ${full(end)}`;
};
