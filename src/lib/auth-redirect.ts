export function signupConfirmationDestination(origin: string) {
  return `${origin}/feed`;
}

export function isSignupConfirmation(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "signup";
}

/** Accept only local return paths; never send a user to an external site or login loop. */
export function safeLoginReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  try {
    const url = new URL(value, "https://teamup.invalid");
    if (url.origin !== "https://teamup.invalid" || url.pathname === "/login" || url.pathname.startsWith("/login/")) return undefined;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}