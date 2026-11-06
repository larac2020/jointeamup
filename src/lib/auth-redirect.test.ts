import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { isSignupConfirmation, signupConfirmationDestination, safeLoginReturnPath } from "./auth-redirect";

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

describe("login return destination", () => {
  test("all protected pages retain their requested destination", () => {
    for (const path of ["/listings/mine", "/listings/new", "/listings/123/edit", "/messages?c=123#thread", "/notifications", "/settings", "/profile/edit", "/onboarding"]) {
      assert.equal(safeLoginReturnPath(path), path);
    }
  });
  test("external destinations and login loops are rejected", () => {
    for (const path of [undefined, "https://example.com", "//example.com", "/\\example.com", "/login?redirect=/settings", "/login/", "/\n/example.com"]) {
      assert.equal(safeLoginReturnPath(path), undefined);
    }
  });
});