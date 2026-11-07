import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/notifyHelper";
import { sendMetaConversionApiEvent } from "@/lib/metaConversionsApi";
import { detectBeninCity } from "@/lib/cityUtils";

const ALLOWED_STATUSES = new Set([
  "pending",
  "confirmed",
  "reserved",
  "postponed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

// 1. GET ALL ORDERS DIRECTEMENT DEPUIS SUPABASE (LIMITÉ À 1000 POUR ÉVITER DOS)
export async function GET() {
  try {
    const supabase = getSupabase();
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

    const supabase = getSupabase();

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

    const rawAddress = String(body.address || body.shipping_address || body.delivery_address || "").trim();
    const address = rawAddress.slice(0, 250).replace(/[<>]/g, "");

    // Détection intelligente de la vraie ville (corrige si le client a laissé Cotonou mais a tapé Parakou/Calavi/etc. dans l'adresse)
    const rawCity = String(body.city || body.shipping_city || "").trim();
    const cityDetection = detectBeninCity(rawCity, address, customerName);
    const city = cityDetection.detectedCity;
    const department = cityDetection.department;

    // Validation du slug produit
    const rawSlug = String(body.product_slug || "produit").trim();
    const productSlug = /^[a-zA-Z0-9_\-]+$/.test(rawSlug) ? rawSlug.slice(0, 60) : "produit";

    const rawTitle = String(body.product_title || "Produit Isivente").trim();
    const productTitle = rawTitle.slice(0, 150).replace(/[<>]/g, "");

    const rawBundle = String(body.bundle_name || "Offre standard").trim();
    const bundleName = rawBundle.slice(0, 150).replace(/[<>]/g, "");

    // Validation des montants et quantités (accepte total_amount, total_price ou price)
    const rawAmount = Number(body.total_amount ?? body.total_price ?? body.price);
    const totalAmount = !isNaN(rawAmount) && rawAmount >= 0 && rawAmount <= 10000000 ? Math.round(rawAmount) : 0;

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
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
    };

    let { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select();

    // Protection anti-rejet : si le slug produit viole la contrainte de clé étrangère
    if (error && (error.message?.includes("orders_product_slug_fkey") || error.code === "23503")) {
      console.warn("Slug produit non trouvé dans la table products, repli de sécurité sur 'umei':", productSlug);
      await supabase.from("products").upsert(
        [
          {
            slug: productSlug,
            title: productTitle || productSlug,
            headline: productTitle || productSlug,
            description: productTitle || productSlug,
            price: totalAmount || 14900,
            original_price: Math.round((totalAmount || 14900) * 1.5),
            is_active: true,
          },
        ],
        { onConflict: "slug" }
      );
      const retry = await supabase.from("orders").insert([payload]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase POST error:", error?.message);
      return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement de la commande" }, { status: 500 });
    }

    const savedOrder = data?.[0] || payload;

    // Auto-conversion du lead dans la table `leads` côté serveur
    // Utilise les 8 derniers chiffres pour matcher quel que soit le préfixe saisi (01, 229, 00229)
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (phoneDigits.length >= 8) {
      const last8 = phoneDigits.slice(-8);
      try {
        await supabase
          .from("leads")
          .update({
            status: "converted",
            updated_at: new Date().toISOString(),
          })
          .ilike("customer_phone", `%${last8}`)
          .eq("product_slug", productSlug);
      } catch (err: any) {
        console.warn("Auto-convert lead warning:", err?.message);
      }
    }

    // Déclencher EN PARALLÈLE l'événement d'achat serveur Meta CAPI (priorité immédiate) et l'alerte email/mobile
    const userAgent = req.headers.get("user-agent") || undefined;
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (req as any).ip ||
      undefined;
    const cookies = req.cookies;
    let fbp = cookies.get("_fbp")?.value || body.fbp;
    let fbc = cookies.get("_fbc")?.value || body.fbc;

    if (!fbc && body.fbclid) {
      fbc = `fb.1.${Date.now()}.${String(body.fbclid).trim()}`;
    }
    if (!fbc && req.headers.get("referer")) {
      try {
        const refUrl = new URL(req.headers.get("referer")!);
        const fbclid = refUrl.searchParams.get("fbclid") || refUrl.searchParams.get("fb_action_ids");
        if (fbclid && fbclid.trim().length > 5) {
          fbc = `fb.1.${Date.now()}.${fbclid.trim()}`;
        }
      } catch {}
    }
    if (!fbp || !/^fb\.\d+\.\d+\.\d+$/.test(fbp)) {
      fbp = `fb.1.${Date.now()}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }

    const nameParts = customerName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await Promise.allSettled([
      sendMetaConversionApiEvent({
        event_name: "Purchase",
        event_id: orderNumberStr,
        event_source_url: req.headers.get("referer") || undefined,
        user_data: {
          phone: cleanPhone,
          first_name: firstName,
          last_name: lastName,
          city: city,
          st: department,
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
      }).catch((e) => console.error("Meta CAPI Purchase error:", e?.message)),
      sendOrderNotification(savedOrder).catch((e) =>
        console.error("Server notify error:", e?.message)
      ),
    ]);

    const res = NextResponse.json({
      success: true,
      order: savedOrder,
      message: "Commande enregistrée avec succès",
    });

    if (fbp) {
      res.cookies.set("_fbp", fbp, { maxAge: 90 * 24 * 60 * 60, path: "/", sameSite: "lax" });
    }
    if (fbc) {
      res.cookies.set("_fbc", fbc, { maxAge: 90 * 24 * 60 * 60, path: "/", sameSite: "lax" });
    }

    return res;
  } catch (error: any) {
    console.error("Orders POST error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Erreur de traitement de la commande" },
      { status: 400 }
    );
  }
}

// 3. UPDATE ORDER STATUS
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Corps de requête invalide" }, { status: 400 });
    }

    const supabase = getSupabase();

    const rawId = String(body.id || "").trim();
    const rawStatus = String(body.status || "").trim();

    if (!rawId || !/^[a-zA-Z0-9_\-]+$/.test(rawId) || !ALLOWED_STATUSES.has(rawStatus)) {
      return NextResponse.json({ success: false, error: "ID ou statut invalide" }, { status: 400 });
    }

    const isUuid = rawId.includes("-") && rawId.length > 30;

    const updatePayload: Record<string, any> = { status: rawStatus };
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.reservation_date !== undefined) updatePayload.reservation_date = body.reservation_date;

    let query = supabase.from("orders").update(updatePayload);
    if (isUuid) {
      query = query.eq("id", rawId);
    } else {
      query = query.eq("order_number", rawId);
    }

    const { data: updatedData, error } = await query.select();
    if (error) {
      console.error("Supabase PATCH error:", error?.message);
      return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
    }

    // Si la commande est passée à "delivered" (Livrée & Encaissée), déclencher l'événement Offline CAPI "Purchase_Delivered"
    if (rawStatus === "delivered" && updatedData && updatedData[0]) {
      const order = updatedData[0];
      const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
      const nameParts = (order.customer_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const orderNum = order.order_number || rawId;

      sendMetaConversionApiEvent({
        event_name: "Purchase_Delivered",
        event_id: "deliv_" + orderNum,
        event_source_url: `https://isivente.vercel.app/p/${order.product_slug || "product"}`,
        user_data: {
          phone: cleanPhone,
          first_name: firstName,
          last_name: lastName,
          city: order.city || "Cotonou",
          country: "bj",
          external_id: orderNum,
        },
        custom_data: {
          currency: "XOF",
          value: Number(order.total_amount) || 0,
          content_name: order.product_title || order.product_slug,
          content_ids: [order.product_slug || "product"],
          order_id: orderNum,
          num_items: order.quantity || 1,
        },
      }).catch((e) => console.error("Meta CAPI Purchase_Delivered error:", e?.message));
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
    const supabase = getSupabase();

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
