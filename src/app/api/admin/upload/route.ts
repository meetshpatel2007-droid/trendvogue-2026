import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";
import { getServerUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") return apiError("Forbidden", 403);

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return apiError("No files provided", 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return apiError(`File type ${file.type} not allowed`, 400);
      }
      if (file.size > maxSize) {
        return apiError("File size must be under 5MB", 400);
      }

      const ext      = file.name.split(".").pop();
      const filename = `${nanoid(12)}.${ext}`;
      const buffer   = Buffer.from(await file.arrayBuffer());

      await writeFile(join(uploadDir, filename), buffer);
      urls.push(`/uploads/${filename}`);
    }

    return apiSuccess({ urls });
  } catch (error) {
    console.error("[UPLOAD]", error);
    return apiError("Upload failed", 500);
  }
}
