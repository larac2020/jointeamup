import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { isSignupConfirmation, signupConfirmationDestination } from "./auth-redirect";

describe("email verification destination", () => {
  test("verification returns to /feed on the user's site", () => {
    assert.equal(signupConfirmationDestination("https://jointeamup.lovable.app"), "https://jointeamup.lovable.app/feed");
  });
  test("existing signup links are recognized without treating recovery as signup", () => {
    assert.equal(isSignupConfirmation("#type=signup&access_token=example"), true);
    assert.equal(isSignupConfirmation("#type=recovery&access_token=example"), false);
    assert.equal(isSignupConfirmation(""), false);
  });
});