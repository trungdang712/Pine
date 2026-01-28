# Supabase Storage Setup

This document explains how to configure Supabase Storage buckets and Row Level Security (RLS) policies for the Greenfield Dental Command Center project.

## Overview

The application uses two storage buckets:

| Bucket | Visibility | Size Limit | Purpose |
|---|---|---|---|
| `assets` | **Public** | 50 MB | Library assets: images, videos, documents |
| `attachments` | **Private** | 10 MB | Task attachments and internal files |

### RLS Policy Summary

**assets (public)**

| Operation | Who | Condition |
|---|---|---|
| SELECT | Anyone | No restriction (public bucket) |
| INSERT | Authenticated users | -- |
| UPDATE | Authenticated users | Owner only (`owner_id` matches) |
| DELETE | Authenticated users | Owner only (`owner_id` matches) |

**attachments (private)**

| Operation | Who | Condition |
|---|---|---|
| SELECT | Authenticated users | -- |
| INSERT | Authenticated users | -- |
| UPDATE | Authenticated users | Owner only (`owner_id` matches) |
| DELETE | Authenticated users | Owner only (`owner_id` matches) |

---

## Option A: Run via the Supabase Dashboard SQL Editor

This is the simplest approach and requires no local tooling.

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Open the migration file at `supabase/migrations/001_storage_buckets.sql` in your code editor and copy its entire contents.
5. Paste the SQL into the query editor.
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
7. You should see `Success. No rows returned` for each statement. If a policy already exists you will see a notice -- this is safe to ignore if you are re-running the migration.

### Verifying the setup in the Dashboard

- Go to **Storage** in the left sidebar. You should see both `assets` and `attachments` buckets listed.
- Click a bucket, then click the **Policies** tab to confirm that the RLS policies are in place.
- Confirm `assets` shows a globe icon (public) and `attachments` shows a lock icon (private).

---

## Option B: Run via the Supabase CLI

If you prefer a repeatable, version-controlled workflow, use the Supabase CLI.

### Prerequisites

Install the Supabase CLI if you have not already:

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# npm (any platform)
npx supabase --version   # will auto-install if needed

# Or download a binary from https://github.com/supabase/cli/releases
```

### Initial project link (first time only)

```bash
# From the project root directory
npx supabase login          # authenticate with your Supabase account
npx supabase init           # creates a local supabase/ config (if not present)
npx supabase link --project-ref <your-project-ref>
```

You can find your project reference ID in the Supabase Dashboard under **Project Settings > General**.

### Running the migration

```bash
# Push all pending migrations to your linked remote project
npx supabase db push
```

This command reads every file in `supabase/migrations/` in alphabetical order and applies any that have not yet been run against the remote database.

### Resetting a local development database

If you are running Supabase locally with `npx supabase start`, you can reset and replay all migrations:

```bash
npx supabase db reset
```

---

## Environment Variables

Make sure the following environment variables are set in your `.env.local` (or equivalent):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

The upload hook at `src/hooks/use-upload.ts` reads these values through the Supabase browser client (`src/lib/supabase/client.ts`).

---

## Troubleshooting

### "Bucket already exists" error
The migration uses `ON CONFLICT (id) DO UPDATE`, so re-running it is safe. Existing buckets will have their settings updated to match the migration.

### "Policy already exists" error
If you run the migration more than once, PostgreSQL will raise an error because `CREATE POLICY` does not support `IF NOT EXISTS`. To re-apply policies, first drop the existing ones:

```sql
-- Drop all storage policies (run only if you need to re-create them)
DROP POLICY IF EXISTS "assets_public_select"           ON storage.objects;
DROP POLICY IF EXISTS "assets_authenticated_insert"    ON storage.objects;
DROP POLICY IF EXISTS "assets_owner_update"            ON storage.objects;
DROP POLICY IF EXISTS "assets_owner_delete"            ON storage.objects;
DROP POLICY IF EXISTS "attachments_authenticated_select" ON storage.objects;
DROP POLICY IF EXISTS "attachments_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "attachments_owner_update"         ON storage.objects;
DROP POLICY IF EXISTS "attachments_owner_delete"         ON storage.objects;
```

Then run the full migration again.

### Upload fails with "new row violates row-level security policy"
This means the authenticated user does not satisfy the policy conditions. Confirm that:
- The user is signed in (not anonymous).
- The bucket name in the upload call matches one of the configured buckets.
- For update/delete operations, the user is the original uploader (`owner_id` matches `auth.uid()`).

### File exceeds size limit
The `assets` bucket allows files up to **50 MB** and `attachments` allows up to **10 MB**. The client-side validation in `src/hooks/use-upload.ts` defaults to 50 MB but you can pass a custom `maxSize` to `validateFile()` for stricter limits. Supabase will also enforce the server-side limit configured on the bucket.
