import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Formats d'images autorisés
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo max

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { filename, base64Data } = body;

    if (!filename || typeof filename !== "string" || !base64Data || typeof base64Data !== "string") {
      return NextResponse.json({ error: "filename et base64Data requis" }, { status: 400 });
    }

    // 1. Assainissement strict du nom de fichier (protection contre le path traversal)
    const baseName = path.basename(filename).trim();
    const ext = path.extname(baseName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Extension non autorisée. Formats acceptés : .jpg, .jpeg, .png, .webp" },
        { status: 400 }
      );
    }

    // Autoriser uniquement les caractères alphanumériques, tirets et underscores
    const safeNameRegex = /^[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp)$/i;
    if (!safeNameRegex.test(baseName)) {
      return NextResponse.json(
        { error: "Nom de fichier invalide (caractères alphanumériques et tirets uniquement)" },
        { status: 400 }
      );
    }

    // 2. Nettoyer et valider le base64
    const base64Image = base64Data.replace(/^data:image\/(jpeg|png|webp);base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Données d'image corrompues ou vides" }, { status: 400 });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse (maximum 10 Mo)" }, { status: 413 });
    }

    // 3. Répertoire de destination sécurisé et confiné à public/images
    const imagesDir = path.resolve(process.cwd(), "public", "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.resolve(imagesDir, baseName);

    // Vérification de sécurité absolue : le chemin doit obligatoirement résider dans imagesDir
    if (!filePath.startsWith(imagesDir)) {
      return NextResponse.json({ error: "Tentative d'accès non autorisé" }, { status: 403 });
    }

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      path: `/images/${baseName}`,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error("Erreur save-carrousel:", error?.message);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'image" }, { status: 500 });
  }
}
