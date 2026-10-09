import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

const BUCKET = "task-attachments";

/**
 * Upload file ke Supabase Storage
 * @param userId - user ID
 * @param fileUri - URI lokal file
 * @param fileName - nama file
 * @returns public URL atau null
 */
export const uploadAttachment = async (
  userId: string,
  fileUri: string,
  fileName: string,
): Promise<string | null> => {
  try {
    // Baca file sebagai base64
    const file = new FileSystem.File(fileUri);
    const base64 = await file.base64();

    // Convert base64 ke Uint8Array
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Path: userId/timestamp_filename
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${userId}/${timestamp}_${cleanName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: getMimeType(fileName),
      upsert: false,
    });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    console.log("✅ File uploaded:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.log("❌ Gagal upload:", error);
    return null;
  }
};

/**
 * Hapus file dari Supabase Storage
 */
export const deleteAttachment = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract path dari URL
    const urlParts = fileUrl.split(`${BUCKET}/`);
    if (urlParts.length < 2) return false;
    const path = urlParts[1];

    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;

    console.log("🗑️ File deleted:", path);
    return true;
  } catch (error) {
    console.log("❌ Gagal hapus file:", error);
    return false;
  }
};

/**
 * Get MIME type dari nama file
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
  };
  return mimeMap[ext] || "application/octet-stream";
}
