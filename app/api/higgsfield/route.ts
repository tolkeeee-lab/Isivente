import { NextRequest, NextResponse } from "next/server";
import { 
  getHiggsfieldPresets, 
  submitHiggsfieldImage, 
  pollHiggsfieldJob, 
  HiggsfieldGenerateParams 
} from "@/lib/higgsfield";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout for AI generation

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "presets";
    const customKey = req.headers.get("x-hf-key") || searchParams.get("key") || undefined;

    if (action === "presets") {
      const presets = await getHiggsfieldPresets(customKey);
      return NextResponse.json({ success: true, ...presets });
    }

    if (action === "status") {
      const requestId = searchParams.get("requestId");
      if (!requestId) {
        return NextResponse.json({ success: false, error: "requestId requis" }, { status: 400 });
      }
      const status = await pollHiggsfieldJob(requestId, customKey, 1);
      return NextResponse.json({ success: true, ...status });
    }

    return NextResponse.json({ success: false, error: "Action non supportée" }, { status: 400 });
  } catch (err: any) {
    console.error("Higgsfield GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur lors de l'appel Higgsfield" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customKey = req.headers.get("x-hf-key") || body.customKey || undefined;
    const { params, poll = true } = body;

    if (!params || !params.prompt) {
      return NextResponse.json(
        { success: false, error: "Le paramètre 'prompt' est obligatoire." },
        { status: 400 }
      );
    }

    // 1. Soumission du travail
    const initialStatus = await submitHiggsfieldImage(params as HiggsfieldGenerateParams, customKey);

    // 2. Si l'image est déjà terminée immédiatement
    if (initialStatus.status === "completed") {
      return NextResponse.json({ success: true, ...initialStatus });
    }

    // 3. Polling automatique côté serveur si demandé
    if (poll && (initialStatus.status_url || initialStatus.request_id)) {
      const targetUrl = initialStatus.status_url || initialStatus.request_id;
      const finalResult = await pollHiggsfieldJob(targetUrl, customKey, 24, 2500);
      return NextResponse.json({ success: true, ...finalResult });
    }

    // 4. Sinon renvoyer l'état en attente pour polling client
    return NextResponse.json({ success: true, ...initialStatus });
  } catch (err: any) {
    console.error("Higgsfield POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur lors de la génération de l'image" },
      { status: 500 }
    );
  }
}
