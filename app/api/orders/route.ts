import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { sendOrderNotification } from "@/lib/notifyHelper";
import { sendMetaConversionApiEvent } from "@/lib/metaConversionsApi";

const defaultUrl = "https://uelognqedzqtvupwzejh.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

const ALLOWED_STATUSES = new Set([
  "pending",
  "confirmed",
  "reserved",
  "postponed",
  "delivered",
  "cancelled",
  "returned",
]);

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

  return createServerClient(url, key, {
    cookies: {
      get() { return undefined; },
      set() {},
      remove() {},
    },
  });
}

// 1. GET ALL ORDERS DIRECTEMENT DEPUIS SUPABASE (LIMITÉ À 1000 POUR ÉVITER DOS)
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Supabase GET error:", error?.message);
      return NextResponse.json({ success: false, error: "Impossible de récupérer les commandes", orders: [] }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
      count: data ? data.length : 0,
    });
  } catch (err: any) {
    console.error("Orders GET route error:", err?.message);
    return NextResponse.json({ success: false, error: "Erreur serveur lors de la récupération des commandes", orders: [] }, { status: 500 });
  }
}

// 2. CREATE NEW ORDER (VALIDATION STRICTE & INSERTION SUPABASE GARANTIE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Validation stricte du téléphone client
    const rawPhone = String(body.customer_phone || body.phone || "").trim();
    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8 || cleanPhone.length > 15) {
      return NextResponse.json(
        { success: false, error: "Numéro de téléphone invalide (au moins 8 chiffres requis)" },
        { status: 400 }
      );
    }

    // Assainissement des champs textuels
    const rawName = String(body.customer_name || body.name || "Client").trim();
    const customerName = (rawName.slice(0, 100) || "Client").replace(/[<>]/g, "");

    const rawCity = String(body.city || body.shipping_city || "Cotonou").trim();
    const city = (rawCity.slice(0, 100) || "Cotonou").replace(/[<>]/g, "");

    const rawAddress = String(body.address || body.shipping_address || "").trim();
    const address = rawAddress.slice(0, 250).replace(/[<>]/g, "");

    // Validation du slug produit
    const rawSlug = String(body.product_slug || "produit").trim();
    const productSlug = /^[a-zA-Z0-9_\-]+$/.test(rawSlug) ? rawSlug.slice(0, 60) : "produit";

    const rawTitle = String(body.product_title || "Produit Isivente").trim();
    const productTitle = rawTitle.slice(0, 150).replace(/[<>]/g, "");

    const rawBundle = String(body.bundle_name || "Offre standard").trim();
    const bundleName = rawBundle.slice(0, 150).replace(/[<>]/g, "");

    // Validation des montants et quantités
    const rawAmount = Number(body.total_amount);
    const totalAmount = !isNaN(rawAmount) && rawAmount >= 0 && rawAmount <= 10000000 ? Math.round(rawAmount) : 14900;

    const rawQuantity = Number(body.quantity);
    const quantity = !isNaN(rawQuantity) && rawQuantity >= 1 && rawQuantity <= 100 ? Math.floor(rawQuantity) : 1;

    // Statut autorisé
    const status = ALLOWED_STATUSES.has(body.status) ? body.status : "pending";

    // Numéro de commande sécurisé
    const rawOrderNum = String(body.order_number || "").trim();
    const orderNumberStr = (/^[a-zA-Z0-9_\-]+$/.test(rawOrderNum) && rawOrderNum.length <= 50)
      ? rawOrderNum
      : ("CMD-" + Math.floor(100000 + Math.random() * 900000));

    const createdAt = body.created_at && !isNaN(Date.parse(body.created_at))
      ? new Date(body.created_at).toISOString()
      : new Date().toISOString();

    const payload: Record<string, any> = {
      order_number: orderNumberStr,
      customer_name: customerName,
      customer_phone: cleanPhone,
      city: city,
      address: address,
      product_slug: productSlug,
      product_title: productTitle,
      bundle_name: bundleName,
      total_amount: totalAmount,
      quantity: quantity,
      status: status,
      created_at: createdAt,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase POST error:", error?.message);
      return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement de la commande" }, { status: 500 });
    }

    const savedOrder = data?.[0] || payload;

    // Déclencher l'alerte email & mobile immédiatement de manière attendue (AWAITED)
    try {
      await sendOrderNotification(savedOrder);
    } catch (e: any) {
      console.error("Server notify error:", e?.message);
    }

    // Déclencher l'événement d'achat serveur Meta Conversions API (CAPI)
    try {
      const userAgent = req.headers.get("user-agent") || undefined;
      const clientIp = 
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
        req.headers.get("x-real-ip") || 
        undefined;
      const cookies = req.cookies;
      const fbp = cookies.get("_fbp")?.value;
      const fbc = cookies.get("_fbc")?.value;

      const nameParts = customerName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      sendMetaConversionApiEvent({
        event_name: "Purchase",
        event_id: orderNumberStr,
        event_source_url: req.headers.get("referer") || undefined,
        user_data: {
          phone: cleanPhone,
          first_name: firstName,
          last_name: lastName,
          city: city,
          country: "bj",
          external_id: orderNumberStr,
          client_ip_address: clientIp,
          client_user_agent: userAgent,
          fbp,
          fbc,
        },
        custom_data: {
          currency: "XOF",
          value: totalAmount,
          content_name: productTitle || productSlug,
          content_ids: [productSlug],
          order_id: orderNumberStr,
          num_items: quantity,
        },
      }).catch(e => console.error("Meta CAPI Purchase error:", e?.message));
    } catch (e: any) {
      console.error("Meta CAPI trigger error:", e?.message);
    }

    return NextResponse.json({
      success: true,
      order: savedOrder,
      message: "Commande enregistrée avec succès",
    });
  } catch (error: any) {
    console.error("Orders POST error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Erreur de traitement de la commande" },
      { status: 400 }
    );
  }
}

// 3. UPDATE ORDER STATUS OU UPGRADE UPSELL
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Cas A : Upgrade d'une commande avec une offre Upsell / Downsell
    if (body.action === "upgrade_upsell" || (body.orderRef && body.additionalAmount)) {
      const rawRef = String(body.orderRef || body.id || "").trim();
      const additionalAmount = Number(body.additionalAmount) || 0;
      const rawTitle = String(body.addedItemTitle || "Offre Complémentaire").trim();
      const addedItemTitle = rawTitle.slice(0, 100).replace(/[<>]/g, "");

      if (!rawRef || !/^[a-zA-Z0-9_\-]+$/.test(rawRef) || additionalAmount <= 0 || additionalAmount > 2000000) {
        return NextResponse.json({ success: false, error: "Paramètres d'upsell invalides" }, { status: 400 });
      }

      const isUuid = rawRef.includes("-") && rawRef.length > 30;
      let query = supabase.from("orders").select("*");
      if (isUuid) {
        query = query.eq("id", rawRef);
      } else {
        query = query.eq("order_number", rawRef);
      }

      const { data: existingList, error: findErr } = await query;
      const existing = existingList?.[0];

      if (findErr || !existing) {
        console.warn("Upsell order not found in Supabase:", rawRef);
        return NextResponse.json({ success: false, error: "Commande non trouvée pour l'upsell" }, { status: 404 });
      }

      const newTotal = (Number(existing.total_amount) || 0) + additionalAmount;
      const currentBundle = existing.bundle_name || "Offre standard";
      const newBundle = currentBundle.includes("[OFFRE VIP]")
        ? `${currentBundle} + ${addedItemTitle}`
        : `${currentBundle} + [OFFRE VIP] ${addedItemTitle}`;

      const { data: updatedData, error: updateErr } = await supabase
        .from("orders")
        .update({
          total_amount: newTotal,
          bundle_name: newBundle.slice(0, 250),
        })
        .eq("id", existing.id)
        .select();

      if (updateErr) {
        console.error("Upsell update Supabase error:", updateErr?.message);
        return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour de l'upsell" }, { status: 500 });
      }

      const updatedOrder = updatedData?.[0] || { ...existing, total_amount: newTotal, bundle_name: newBundle };

      // Alerte notification upsell
      try {
        await sendOrderNotification({
          ...updatedOrder,
          is_upsell: true,
        });
      } catch (notifyErr: any) {
        console.error("Upsell notification error:", notifyErr?.message);
      }

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        message: "Commande enrichie avec l'upsell et notification envoyée",
      });
    }

    // Cas B : Mise à jour de statut standard
    const rawId = String(body.id || "").trim();
    const rawStatus = String(body.status || "").trim();

    if (!rawId || !/^[a-zA-Z0-9_\-]+$/.test(rawId) || !ALLOWED_STATUSES.has(rawStatus)) {
      return NextResponse.json({ success: false, error: "ID ou statut invalide" }, { status: 400 });
    }

    const isUuid = rawId.includes("-") && rawId.length > 30;
    let query = supabase.from("orders").update({ status: rawStatus });
    if (isUuid) {
      query = query.eq("id", rawId);
    } else {
      query = query.eq("order_number", rawId);
    }

    const { error } = await query;
    if (error) {
      console.error("Supabase PATCH error:", error?.message);
      return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: rawId, status: rawStatus });
  } catch (error: any) {
    console.error("Orders PATCH error:", error?.message);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}

// 4. DELETE ORDER (PROTÉGÉ CONTRE LA SUPPRESSION TOTALE NON AUTORISÉE)
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id")?.trim();
    const clearAll = url.searchParams.get("clearAll");
    const supabase = getSupabaseClient();

    // Protection critique : interdire la suppression totale sans jeton d'administration
    if (clearAll === "true") {
      const adminSecretHeader = req.headers.get("x-admin-secret");
      const configuredSecret = process.env.ADMIN_API_SECRET;

      if (!configuredSecret || adminSecretHeader !== configuredSecret) {
        return NextResponse.json(
          { success: false, error: "Action non autorisée. La suppression totale nécessite un secret d'administration valide." },
          { status: 403 }
        );
      }

      await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      return NextResponse.json({ success: true, message: "Toutes les commandes ont été supprimées" });
    }

    if (id && /^[a-zA-Z0-9_\-]+$/.test(id)) {
      const isUuid = id.includes("-") && id.length > 30;
      if (isUuid) {
        await supabase.from("orders").delete().eq("id", id);
      } else {
        await supabase.from("orders").delete().eq("order_number", id);
      }
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ success: false, error: "ID valide ou autorisation requise" }, { status: 400 });
  } catch (error: any) {
    console.error("Orders DELETE error:", error?.message);
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
