export function signupConfirmationDestination(origin: string) {
  return `${origin}/feed`;
}

export function isSignupConfirmation(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "signup";
}