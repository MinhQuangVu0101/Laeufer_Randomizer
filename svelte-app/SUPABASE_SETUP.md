# Supabase Setup (Phase 7 — Cross-Device Sync)

This is the one-time manual setup that activates Cross-Device Sync. Without it,
the app runs in offline-only mode (the AuthBar simply doesn't render).

Time: ~15 minutes.

---

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in (free GitHub login).
2. **New project**:
   - Name: `laeufer-randomizer` (or whatever you like)
   - Database Password: generate one and save it in a password manager
   - Region: pick the one closest to you (e.g. Frankfurt)
   - Plan: **Free**
3. Wait ~1 minute for the project to provision.

## 2. Run the SQL schema

1. Open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Copy-paste the contents of `svelte-app/sql/schema.sql` from this repo.
4. Click **Run**. You should see "Success. No rows returned."
5. (Verify) Go to **Table Editor** — you should now see `profiles`, `settings`, `rosters`.

## 3. Configure Auth — OTP-based email login

1. Open **Authentication → Providers → Email**.
2. Enable **Enable email provider** (should already be on).
3. Make sure **Confirm email** is **OFF** (we use OTP, not link-confirm).
4. **Authentication → URL Configuration**:
   - **Site URL**: `https://minhquangvu0101.github.io/Laeufer_Randomizer/`
   - **Redirect URLs**: add `https://minhquangvu0101.github.io/Laeufer_Randomizer/`
   - For local dev: also add `http://localhost:5173/Laeufer_Randomizer/`
5. **Authentication → Email Templates → Magic Link**:
   - The default template includes `{{ .Token }}` somewhere — that's the 6-digit code.
   - If you want to customize: replace `{{ .ConfirmationURL }}` mentions with text saying
     "Dein Code: {{ .Token }}" — but the default works.

## 4. Get the API credentials

1. **Project Settings → API**.
2. Copy two values:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon / public key** — long string starting with `eyJ`

## 5. Local development

In `svelte-app/` directory:

```sh
cp .env.local.example .env.local
```

Edit `.env.local` and paste your values:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev`. The AuthBar should now appear above the roster section.

## 6. Production: GitHub Secrets

For the Action to inject the same env vars at build time:

1. **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**.
2. Add two secrets:
   - Name: `SUPABASE_URL`, Value: your Project URL
   - Name: `SUPABASE_ANON_KEY`, Value: your anon key
3. Re-run the deploy workflow (Actions tab → "Deploy Svelte app to GitHub Pages" → "Run workflow").

## 7. Test the flow

Local dev or production:

1. Click **☁ Sync aktivieren** in the AuthBar.
2. Enter your email. Click **Code senden**.
3. Check your email — Supabase sends a 6-digit code (look in spam if it doesn't arrive within a minute).
4. Paste the code into the modal. Click **Bestätigen**.
5. If you have local rosters but the cloud is empty: the SyncWizard appears asking how to handle it. Pick **Hier → Cloud** to push your local rosters up.
6. Open the app on another device (or another browser), log in with the same email + new code, and you should see the SyncWizard with **Cloud: N Rosters**. Pick **Cloud → Hier** to pull them down.

## Known gotchas

- **iOS Safari Standalone PWA**: magic-link callbacks fail there. That's why we use **OTP** (6-digit code) — works in PWA standalone mode. You paste the code into the app instead of clicking a link.
- **Rate limit**: Supabase free tier allows 4 OTP requests per hour per email. If you hit it, wait or switch emails.
- **`updated_at` is per-record**: rosters and settings each have their own timestamp. The merge option picks the newer of each per-roster.
- **Initial-Sync-Wizard appears only when there's a conflict**: if cloud and local are both empty, or both identical, no wizard. The wizard only fires when local has rosters cloud doesn't (or vice versa).

## Rollback

If Phase 7 breaks something, you can disable it entirely by:
1. Removing the env vars from GitHub Secrets (delete or rename).
2. Re-running the deploy workflow.
3. The build output runs without Supabase, AuthBar doesn't render, sync code is dead.
