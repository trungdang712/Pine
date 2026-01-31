/**
 * scripts/upload-logos.ts
 *
 * Uploads Greenfield logo files to Supabase Storage and creates BrandAsset records.
 *
 * Usage:
 *   npx tsx scripts/upload-logos.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

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

const prisma = new PrismaClient();

// Source folder for logos
const LOGO_SOURCE_DIR =
  "/Users/trungdang/Library/CloudStorage/OneDrive-GreenfieldDental/MARKETING/GREENFIELD_LOGO MỚI";

// Logo variants to upload
const LOGO_VARIANTS = [
  {
    folder: "ORIGINAL",
    name: "Logo Greenfield - Original",
    description: "Logo chính thức của Greenfield Dental với màu sắc gốc",
    usageNotes:
      "Sử dụng cho hầu hết các trường hợp: website, social media, tài liệu marketing, biển hiệu. Luôn ưu tiên sử dụng bản này khi có thể.",
    tags: "logo,original,chính,màu",
  },
  {
    folder: "BLACK",
    name: "Logo Greenfield - Black",
    description: "Logo đen một màu, phù hợp cho nền sáng",
    usageNotes:
      "Dùng trên nền trắng hoặc nền sáng. Phù hợp cho in ấn đen trắng, fax, tài liệu văn phòng, khắc laser.",
    tags: "logo,black,đen,monochrome",
  },
  {
    folder: "WHITE",
    name: "Logo Greenfield - White",
    description: "Logo trắng một màu, phù hợp cho nền tối",
    usageNotes:
      "Dùng trên nền tối, nền màu, hoặc đặt lên hình ảnh. Thường dùng cho video, banner, áo đồng phục màu tối.",
    tags: "logo,white,trắng,monochrome",
  },
  {
    folder: "GRAYSCALE",
    name: "Logo Greenfield - Grayscale",
    description: "Logo xám, phiên bản trung tính",
    usageNotes:
      "Dùng cho tài liệu đen trắng cao cấp, fax chất lượng cao, hoặc khi cần phiên bản trang nhã, không quá nổi bật.",
    tags: "logo,grayscale,xám,monochrome",
  },
];

// File extensions to upload
const FILE_EXTENSIONS = [".png", ".svg", ".eps"];

// MIME types
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".eps": "application/postscript",
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

async function uploadFile(
  filePath: string,
  storagePath: string
): Promise<string | null> {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  const { data, error } = await supabase.storage
    .from("assets")
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error(`  Error uploading ${storagePath}: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("assets")
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

function getFileSize(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Greenfield Logo Upload Script ===");
  console.log("");
  console.log("Source folder:", LOGO_SOURCE_DIR);
  console.log("Supabase URL:", SUPABASE_URL);
  console.log("");

  // Get admin user for uploadedById
  const adminUser = await prisma.user.findFirst({
    where: { role: "super_admin" },
  });

  if (!adminUser) {
    console.error("No super_admin user found. Please create one first.");
    process.exit(1);
  }

  console.log(`Using admin user: ${adminUser.name} (${adminUser.id})`);
  console.log("");

  // Process each logo variant
  for (const variant of LOGO_VARIANTS) {
    console.log(`\n--- Processing ${variant.name} ---`);

    const folderPath = path.join(LOGO_SOURCE_DIR, variant.folder);

    if (!fs.existsSync(folderPath)) {
      console.error(`  Folder not found: ${folderPath}`);
      continue;
    }

    // Find all files in folder
    const files = fs.readdirSync(folderPath);
    const logoFiles = files.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return FILE_EXTENSIONS.includes(ext) && !f.startsWith(".");
    });

    console.log(`  Found ${logoFiles.length} files: ${logoFiles.join(", ")}`);

    // Upload each file and collect URLs
    const uploadedFiles: { ext: string; url: string; size: number }[] = [];
    let thumbnailUrl: string | null = null;
    let primaryFileUrl: string | null = null;
    let totalSize = 0;

    for (const file of logoFiles) {
      const filePath = path.join(folderPath, file);
      const ext = path.extname(file).toLowerCase();
      const storagePath = `logos/${variant.folder.toLowerCase()}/${file}`;

      console.log(`  Uploading ${file}...`);
      const url = await uploadFile(filePath, storagePath);

      if (url) {
        const size = getFileSize(filePath);
        uploadedFiles.push({ ext: ext.replace(".", "").toUpperCase(), url, size });
        totalSize += size;
        console.log(`    -> OK: ${url}`);

        // Use PNG as thumbnail
        if (ext === ".png") {
          thumbnailUrl = url;
          primaryFileUrl = url;
        }

        // If no PNG, use SVG as primary
        if (!primaryFileUrl && ext === ".svg") {
          primaryFileUrl = url;
        }
      }
    }

    if (uploadedFiles.length === 0) {
      console.log("  No files uploaded, skipping database record.");
      continue;
    }

    // Create or update BrandAsset record
    const formats = uploadedFiles.map((f) => f.ext);
    const existingAsset = await prisma.brandAsset.findFirst({
      where: { name: variant.name },
    });

    if (existingAsset) {
      console.log(`  Updating existing BrandAsset: ${existingAsset.id}`);
      await prisma.brandAsset.update({
        where: { id: existingAsset.id },
        data: {
          description: variant.description,
          fileUrl: primaryFileUrl || uploadedFiles[0]?.url || "",
          thumbnailUrl,
          fileType: "LOGO",
          fileSize: totalSize,
          formats: JSON.stringify(formats),
          usageNotes: variant.usageNotes,
          tags: variant.tags,
          updatedAt: new Date(),
        },
      });
    } else {
      console.log("  Creating new BrandAsset...");
      const newAsset = await prisma.brandAsset.create({
        data: {
          name: variant.name,
          description: variant.description,
          category: "logo",
          fileUrl: primaryFileUrl || uploadedFiles[0]?.url || "",
          thumbnailUrl,
          fileType: "LOGO",
          fileSize: totalSize,
          formats: JSON.stringify(formats),
          usageNotes: variant.usageNotes,
          tags: variant.tags,
          uploadedById: adminUser.id,
        },
      });
      console.log(`    -> Created: ${newAsset.id}`);
    }

    console.log(`  Formats: ${formats.join(", ")}`);
    console.log(`  Total size: ${(totalSize / 1024).toFixed(1)} KB`);
  }

  console.log("\n\n=== Upload Complete ===");

  // List all brand assets
  const allAssets = await prisma.brandAsset.findMany({
    where: { category: "logo" },
    orderBy: { name: "asc" },
  });

  console.log(`\nTotal logo assets in database: ${allAssets.length}`);
  for (const asset of allAssets) {
    console.log(`  - ${asset.name}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  prisma.$disconnect();
  process.exit(1);
});
