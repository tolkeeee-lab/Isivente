import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendMetaConversionApiEvent } from "@/lib/metaConversionsApi";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const cmd = url.searchParams.get("cmd")?.trim();

    if (!cmd || !/^[a-zA-Z0-9_\-]+$/.test(cmd) || cmd.length > 50) {
      return NextResponse.json({ success: false, error: "Numéro de commande manquant ou invalide" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, city, shipping_city, address, shipping_address, product_title, product_slug, bundle_name, quantity, total_amount, status, created_at, notes")
      .eq("order_number", cmd)
      .maybeSingle();

    if (error) {
      console.error("Delivery GET error:", error.message);
      return NextResponse.json({ success: false, error: "Erreur lors de la recherche de la commande" }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name || "Client",
        customer_phone: order.customer_phone || "",
        city: order.shipping_city || order.city || "Cotonou",
        address: order.shipping_address || order.address || "Adresse à confirmer",
        product_title: order.product_title || "Produit Isivente",
        product_slug: order.product_slug || "umei",
        bundle_name: order.bundle_name || "Standard",
        quantity: order.quantity || 1,
        total_amount: order.total_amount || 0,
        status: order.status || "shipped",
        notes: order.notes || "",
        created_at: order.created_at,
      },
    });
  } catch (err: any) {
    console.error("Delivery GET exception:", err?.message);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    const cmd = String(body.cmd || "").trim();
    const action = String(body.action || "").trim();
    const paymentMethod = body.paymentMethod === "momo" ? "Mobile Money" : "Espèces";
    const issueReason = String(body.issueReason || "").trim().slice(0, 200);

    if (!cmd || !/^[a-zA-Z0-9_\-]+$/.test(cmd) || cmd.length > 50) {
      return NextResponse.json({ success: false, error: "Numéro de commande invalide" }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Récupération de la commande
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", cmd)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: "Commande introuvable" }, { status: 404 });
    }

    const now = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (action === "delivered") {
      const updatedNotes = order.notes 
        ? `${order.notes} | ✅ Livré le ${now} (${paymentMethod})`
        : `✅ Livré le ${now} (${paymentMethod})`;

      const { data: updated, error: updateErr } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          notes: updatedNotes,
        })
        .eq("order_number", cmd)
        .select()
        .single();

      if (updateErr) {
        console.error("Delivery update delivered error:", updateErr.message);
        return NextResponse.json({ success: false, error: "Impossible de valider la livraison" }, { status: 500 });
      }

      // Envoi de la conversion Offline à Meta CAPI (Purchase_Delivered)
      try {
        const cleanPhone = (order.customer_phone || "").replace(/\D/g, "");
        const nameParts = (order.customer_name || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        sendMetaConversionApiEvent({
          event_name: "Purchase_Delivered",
          event_id: "deliv_" + cmd,
          event_source_url: `https://isivente.vercel.app/livreur?cmd=${cmd}`,
          user_data: {
            phone: cleanPhone,
            first_name: firstName,
            last_name: lastName,
            city: order.city || "Cotonou",
            country: "bj",
            external_id: cmd,
          },
          custom_data: {
            currency: "XOF",
            value: Number(order.total_amount) || 0,
            content_name: order.product_title || order.product_slug,
            content_ids: [order.product_slug || "product"],
            order_id: cmd,
            num_items: order.quantity || 1,
          },
        }).catch((e) => console.error("Meta CAPI delivery hook error:", e?.message));
      } catch (capiErr: any) {
        console.warn("CAPI delivery event error:", capiErr?.message);
      }

      return NextResponse.json({
        success: true,
        status: "delivered",
        message: "Livraison confirmée avec succès !",
      });
    }

    if (action === "issue") {
      const reasonLabel = issueReason || "Problème signalé par le livreur";
      const updatedNotes = order.notes 
        ? `${order.notes} | ⚠️ Livreur (${now}) : ${reasonLabel}`
        : `⚠️ Livreur (${now}) : ${reasonLabel}`;

      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          status: "postponed",
          notes: updatedNotes,
        })
        .eq("order_number", cmd);

      if (updateErr) {
        console.error("Delivery update issue error:", updateErr.message);
        return NextResponse.json({ success: false, error: "Impossible d'enregistrer le signalement" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        status: "postponed",
        message: "Signalement enregistré pour l'équipe commerciale.",
      });
    }

    return NextResponse.json({ success: false, error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    console.error("Delivery POST exception:", err?.message);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
