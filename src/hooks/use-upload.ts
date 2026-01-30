"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UploadResult {
  url: string;
  path: string;
  size: number;
  name: string;
}

interface UseUploadOptions {
  bucket: "assets" | "attachments" | "brand-assets";
  onProgress?: (progress: number) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export function useUpload({ bucket, onProgress, onSuccess, onError }: UseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (file: File, folder?: string): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const supabase = createClient();

        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = folder
          ? `${folder}/${timestamp}-${sanitizedName}`
          : `uploads/${timestamp}-${sanitizedName}`;

        // Simulate progress for UX (Supabase doesn't provide upload progress)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = Math.min(prev + 10, 90);
            onProgress?.(newProgress);
            return newProgress;
          });
        }, 200);

        // Upload file
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        clearInterval(progressInterval);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        setProgress(100);
        onProgress?.(100);

        const result: UploadResult = {
          url: publicUrl,
          path: data.path,
          size: file.size,
          name: file.name,
        };

        onSuccess?.(result);
        setUploading(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        onError?.(error);
        setUploading(false);
        return null;
      }
    },
    [bucket, onProgress, onSuccess, onError]
  );

  const uploadMultiple = useCallback(
    async (files: File[], folder?: string): Promise<UploadResult[]> => {
      const results: UploadResult[] = [];

      for (const file of files) {
        const result = await upload(file, folder);
        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [upload]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    uploadMultiple,
    uploading,
    progress,
    error,
    reset,
  };
}

// Utility function to get file type category
export function getFileCategory(mimeType: string): "image" | "video" | "audio" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Utility function to validate file
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[]; // MIME types
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 50 * 1024 * 1024, allowedTypes } = options; // Default 50MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${formatFileSize(maxSize)})`,
    };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some(
      (type) => file.type === type || file.type.startsWith(type.replace("/*", "/"))
    );
    if (!isAllowed) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      };
    }
  }

  return { valid: true };
}
