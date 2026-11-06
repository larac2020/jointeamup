import { describe, expect, test } from "bun:test";
import { isSignupConfirmation, signupConfirmationDestination } from "./auth-redirect";

describe("email verification destination", () => {
  test("verification returns to /feed on the user's site", () => {
    expect(signupConfirmationDestination("https://jointeamup.lovable.app")).toBe("https://jointeamup.lovable.app/feed");
  });
  test("existing signup links are recognized without treating recovery as signup", () => {
    expect(isSignupConfirmation("#type=signup&access_token=example")).toBe(true);
    expect(isSignupConfirmation("#type=recovery&access_token=example")).toBe(false);
    expect(isSignupConfirmation("")).toBe(false);
  });
});