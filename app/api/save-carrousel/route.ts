import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { filename, base64Data } = await req.json();

    if (!filename || !base64Data) {
      return NextResponse.json({ error: "filename et base64Data requis" }, { status: 400 });
    }

    // Nettoyer le préfixe data:image/jpeg;base64,
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const imagesDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: `/images/${filename}`, size: buffer.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
