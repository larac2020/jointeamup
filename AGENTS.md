# Architecture rules

- Keep verification return-address logic in the browser-safe auth-redirect module so signup links and tests share the same destination rule.
- Keep signed-in-only pages under the client-only _authenticated layout, preserving their public URLs; browser sessions are unavailable during SSR.
- Sanitize login return paths in auth-redirect and wait for profile hydration before redirecting after login, preventing external redirects and false onboarding bounces.