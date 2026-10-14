"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { buildPublicUrl, getSpacesClient, getSpacesConfig } from "@/lib/spaces";

export type CreateItemState = {
  error?: string;
  success?: boolean;
  // Public DO Spaces URL of the file just uploaded, shown once right after
  // upload. Not persisted anywhere — the DB never stores this.
  uploadedFileUrl?: string;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function createItem(
  _prevState: CreateItemState,
  formData: FormData
): Promise<CreateItemState> {
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const thumbnailUrl =
    (formData.get("thumbnailUrl") as string | null)?.trim() || null;
  const file = formData.get("file") as File | null;

  if (!title) {
    return { error: "Title is required." };
  }

  const hasFile = !!file && file.size > 0;

  if (hasFile) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { error: "Uploaded file must be 5MB or smaller." };
    }
  }

  let uploadedFileUrl: string | undefined;

  try {
    // Upload the file straight to DO Spaces if one was provided. We don't
    // store its URL/key anywhere in the DB — it just lives in the bucket,
    // served directly from there. We do hand the URL back to the UI once,
    // right after upload, so it isn't lost entirely.
    if (hasFile) {
      const { bucket } = getSpacesConfig();
      const client = getSpacesClient();

      const fileExtension = file.name.includes(".")
        ? file.name.split(".").pop()
        : "bin";
      const key = `uploads/${randomUUID()}.${fileExtension}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ACL: "public-read",
          })
        );
      } catch (uploadErr) {
        // Some Spaces buckets have "Restrict File Listing" / a bucket policy
        // that blocks public-read ACLs outright. Surface that clearly instead
        // of a generic AWS SDK error, since it's a common gotcha and not a
        // bug in this code.
        console.error("Spaces upload failed:", uploadErr);
        throw new Error(
          "Upload to DigitalOcean Spaces failed. If this is an AccessDenied/ACL error, check that your Space allows public-read ACLs (Space Settings → File Listing / permissions)."
        );
      }

      uploadedFileUrl = buildPublicUrl(key);
    }

    await prisma.item.create({
      data: {
        title,
        thumbnailUrl,
      },
    });

    revalidatePath("/");
    return { success: true, uploadedFileUrl };
  } catch (err) {
    console.error("Failed to create item:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
    };
  }
}
