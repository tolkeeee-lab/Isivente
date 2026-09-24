import { NextRequest, NextResponse } from "next/server";
import { getLocalAgentResponse } from "@/lib/commerceAgent";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { saveOrUpdateLead } from "@/lib/leadsStorage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, slug, customerName, customerPhone, city } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    const safeSlug = (slug || "produit").toLowerCase();
    const product = DEFAULT_CATALOG_MAP[safeSlug];

    // Détection d'un numéro pour capture silencieuse de prospect (Ghost Lead)
    const phoneMatch = message.replace(/\s+/g, "").match(/(\+?229)?[0-9]{8,10}/);
    if (phoneMatch) {
      const detectedPhone = phoneMatch[0];
      try {
        await saveOrUpdateLead({
          customer_name: customerName || "Prospect Chat",
          customer_phone: detectedPhone,
          city: city || "Cotonou",
          product_slug: safeSlug,
          product_title: product?.title || safeSlug,
          bundle_name: product?.bundles?.[0]?.name || "Pack Standard",
          total_amount: product?.price || 0,
        });
      } catch (err) {
        console.error("Agent lead save error:", err);
      }
    }

    // Réponse de l'agent
    const agentReply = getLocalAgentResponse(message, safeSlug);

    return NextResponse.json({
      success: true,
      reply: agentReply,
    });
  } catch (error: any) {
    console.error("API agent/chat error:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur interne de l'agent" },
      { status: 500 }
    );
  }
}
