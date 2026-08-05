# Leaked .env: rotate keys and stop tracking the file

## First, the reassuring part

The values in your `.env` are all **publishable**, not secret:

- `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` — the anon key. It is designed to be shipped to every browser that loads your site; anyone can already read it from the page source. It grants nothing on its own — row-level security decides what it can read or write.
- `VITE_SUPABASE_URL` / `SUPABASE_URL` and the project ID — also public by design.

Your real secrets (service role key, `FIRECRAWL_API_KEY`, `REFRESH_COMPETITIONS_SECRET`, `LOVABLE_API_KEY`) are **not** in this file. They live in the encrypted backend secret store and were never in the repo. So this commit did not expose anything that a visitor to the site could not already see.

That said, rotating is cheap and there is a real hygiene issue worth fixing.

## 1. Rotate the Supabase API keys

Run the key rotation for the backend. This issues fresh publishable and service-role keys, invalidates the old ones, and rewrites `.env` and the runtime environment with the new values.

Note on impact: rotating invalidates the old anon key immediately. The published site keeps working because it gets rebuilt with the new key, but any browser tab left open on the old build, and anything external you hardcoded the old key into, will start failing until it reloads. You will want to publish again right after rotating.

## 2. The real exposure to check

The leaked key matters only in proportion to how permissive your database rules are. Right now `profiles` and `listings` both allow anonymous reads by design, so anyone with the anon key (i.e. anyone) can read onboarded profiles and active listings. That was your deliberate choice for public browsing, and the server functions project only safe columns. Worth re-confirming that no other table allows anonymous access — I'll run the database linter and review the policies as part of this work.

## 3. Stop tracking `.env`

`.gitignore` currently has no entry for it. Add:

```text
# Local env
.env
.env.*
!.env.example
```

Then create a committed `.env.example` listing the variable names with empty values, so anyone cloning the repo knows what to fill in.

**One caveat to decide on:** Lovable regenerates `.env` for you and, on Git-synced projects, expects it in the repo so the connection survives a clone. Untracking it is the right call for a public repo, but if you later clone the repo and build outside Lovable, you must supply those variables yourself.

## 4. Purge it from git history

Removing the file from tracking going forward does **not** erase it from past commits — it stays readable in the repo history on GitHub. This is the one step I cannot do for you: Lovable does not run history-rewriting git commands on your repo. On your machine:

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
# then rewrite history, e.g. with git-filter-repo:
git filter-repo --path .env --invert-paths
git push --force
```

Since the values are publishable, rewriting history is optional housekeeping rather than an emergency.

## 5. Consider making the repo private

If nothing depends on it being public, this removes the whole class of problem.

## What I will do on approval

1. Rotate the Supabase API keys.
2. Add the `.env` entries to `.gitignore` and add a `.env.example`.
3. Run the database linter and review anonymous-access policies, reporting anything beyond the intended public browsing.
4. Tell you when to publish so the live site picks up the new key.

Steps 4 and 5 above (history purge, repo visibility) are yours to run on GitHub.

## Question

Do you want the keys rotated now, given the anon key is public by design and rotating briefly breaks open tabs until you republish?
