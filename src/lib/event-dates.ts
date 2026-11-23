export type EventDates = { event_date: string; end_date?: string | null; race_day?: string | null };

export const eventEnd = (event: EventDates) => event.end_date || event.event_date;
export const listingExpiry = (listing: EventDates) => listing.race_day || eventEnd(listing);
export const isExpired = (listing: EventDates, today = new Date().toISOString().slice(0, 10)) => listingExpiry(listing) < today;
export const validRaceDay = (event: EventDates, raceDay: string | null | undefined) =>
  !raceDay || (raceDay >= event.event_date && raceDay <= eventEnd(event));
export const dateRangesNearby = (a: EventDates, b: EventDates) => {
  const days = (date: string) => Date.parse(date + "T00:00:00Z") / 86400000;
  return days(a.event_date) <= days(eventEnd(b)) + 7 && days(eventEnd(a)) >= days(b.event_date) - 7;
};
export const shortDate = (date: string) => new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
});
export const eventDateLabel = (event: EventDates) => eventEnd(event) === event.event_date
  ? event.event_date : `${event.event_date} – ${eventEnd(event)}`;