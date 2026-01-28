/**
 * scripts/setup-storage.ts
 *
 * Creates Supabase Storage buckets programmatically using the service role key.
 *
 * Buckets:
 *   - "assets"       (public)  - library assets such as images, videos, documents
 *   - "attachments"  (private) - task attachments and internal files
 *
 * Usage:
 *   npx tsx scripts/setup-storage.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Bucket definitions - keep in sync with 001_storage_buckets.sql
const BUCKETS = [
  {
    id: "assets" as const,
    public: true,
    fileSizeLimit: 52_428_800, // 50 MB
    allowedMimeTypes: undefined as string[] | undefined, // allow all
  },
  {
    id: "attachments" as const,
    public: false,
    fileSizeLimit: 10_485_760, // 10 MB
    allowedMimeTypes: undefined as string[] | undefined,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Supabase Storage Bucket Setup ===");
  console.log("");
  console.log("Supabase URL: " + SUPABASE_URL);
  console.log("");

  for (const bucket of BUCKETS) {
    const label = bucket.public ? "public" : "private";
    console.log('Creating bucket "' + bucket.id + '" (' + label + ')...');

    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes ?? undefined,
    });

    if (error) {
      // Supabase returns "Bucket already exists" when duplicated
      if (error.message?.toLowerCase().includes("already exists")) {
        console.log('  -> Bucket "' + bucket.id + '" already exists. Skipping.');
        console.log("");
      } else {
        console.error('  -> ERROR creating "' + bucket.id + '": ' + error.message);
        console.log("");
      }
    } else {
      console.log("  -> Created successfully: " + JSON.stringify(data));
      console.log("");
    }
  }

  // -----------------------------------------------------------------------
  // Verify - list all buckets
  // -----------------------------------------------------------------------
  console.log("--- Verifying: listing all buckets ---");
  console.log("");

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("Failed to list buckets: " + listError.message);
    process.exit(1);
  }

  if (!buckets || buckets.length === 0) {
    console.log("No buckets found (unexpected).");
  } else {
    for (const b of buckets) {
      const visibility = b.public ? "public" : "private";
      const limit = b.file_size_limit ?? "none";
      console.log('  Bucket: "' + b.id + '" | ' + visibility + ' | size limit: ' + limit);
    }
  }

  console.log("");
  console.log("Done.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
