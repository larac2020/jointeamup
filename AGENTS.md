# Architecture rules

- Keep verification return-address logic in the browser-safe auth-redirect module so signup links and tests share the same destination rule.
- Keep signed-in-only pages under the client-only _authenticated layout, preserving their public URLs; browser sessions are unavailable during SSR.
- Sanitize login return paths in auth-redirect and wait for profile hydration before redirecting after login, preventing external redirects and false onboarding bounces.- Events (competitions) are user-created only and every listing links to one via competition_id; the server copies the event's name and city onto the listing so feeds and older code keep working.
- Define sport-specific listing choices in the browser-safe listing-sports module for forms, labels, filters, and server validation; store Singles/Individual as Individual and Doubles/Pairs as Doubles to preserve the existing enum and live data compatibility.

- Keep listing-owned competition dates and expiry in event-dates, mirrored by database constraints/triggers and expires_on; derive event ranges from original_date plus all linked listing dates so individual dates never inherit a shared schedule.
