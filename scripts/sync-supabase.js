const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://uelognqedzqtvupwzejh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("--- 1. DELETING TEST ORDERS ---");
  const { data: delData, error: delErr } = await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (delErr) {
    console.error("Delete error:", delErr.message);
  } else {
    console.log("Test orders deleted successfully!");
  }

  console.log("\n--- 2. INSERTING ALL 4 PRODUCTS INTO SUPABASE ---");
  const products = [
    {
      slug: "umei",
      title: "Brosse Démêlante Vapeur Uméi 3-en-1",
      headline: "La première brosse démêlante à vapeur qui libère tes cheveux d'un simple clic.",
      description: "Sur une brosse classique, retirer les cheveux coincés prend souvent plus de temps que le coiffage lui-même. Le mécanisme à dégagement automatique d'uméi règle ça en une seconde.",
      price: 14900,
      original_price: 20000,
      currency: "FCFA",
      images: [{ url: "/images/umei-hero-real.jpg" }],
      bundles: [
        { name: "Pack Découverte (1 Brosse)", price: 14900 },
        { name: "Pack Sérénité Duo (2 Brosses)", price: 24900 },
        { name: "Pack Famille (3 Brosses)", price: 34900 }
      ],
      is_active: true
    },
    {
      slug: "eraclean",
      title: "Purificateur d'Air & Anti-Odeurs Frigo EraClean™",
      headline: "Élimine 99.9% des odeurs et bactéries dans votre réfrigérateur, penderie et voiture sans produit chimique.",
      description: "Technologie d'oxydation active et d'ions négatifs. Double mode désodorisation profonde et fraîcheur longue durée 30 jours sur batterie rechargeable USB.",
      price: 19900,
      original_price: 25000,
      currency: "FCFA",
      images: [{ url: "/images/eraclean-studio.jpg" }],
      bundles: [
        { name: "Pack Solo (1 Appareil)", price: 19900 },
        { name: "Pack Duo Frigo + WC (2 Appareils)", price: 32900 },
        { name: "Pack Grand Ménage (3 Appareils)", price: 44900 }
      ],
      is_active: true
    },
    {
      slug: "turbofan",
      title: "Ventilateur Ceinture & Powerbank TurboFan™ Max",
      headline: "Fraîcheur glaciale sous vos vêtements et batterie de secours 10 000 mAh.",
      description: "Moteur brushless ultra-puissant à 5 vitesses, double clip de fixation ceinture et cordon tour de cou mains-libres avec sortie USB charge rapide.",
      price: 16900,
      original_price: 22000,
      currency: "FCFA",
      images: [{ url: "/images/turbofan-studio.jpg" }],
      bundles: [
        { name: "Pack Solo Fraîcheur (1 TurboFan)", price: 16900 },
        { name: "Pack Duo (2 TurboFans)", price: 27900 },
        { name: "Pack Famille / Chantier (3 TurboFans)", price: 37900 }
      ],
      is_active: true
    },
    {
      slug: "peeler",
      title: "Éplucheur Automatique ChefPeel™ Pro",
      headline: "L'épluchage automatique pour ail, pommes de terre, pommes et oignons en quelques secondes.",
      description: "Lames en acier inoxydable et bol rotatif électrique 1300 mAh rechargeable par USB. Idéal pour gagner un temps précieux en cuisine.",
      price: 14900,
      original_price: 20000,
      currency: "FCFA",
      images: [{ url: "/images/peeler-hero.jpg" }],
      bundles: [
        { name: "Pack Découverte Cuisine (1 Appareil)", price: 14900 },
        { name: "Pack Duo Sérénité (2 Appareils)", price: 24900 },
        { name: "Pack Traiteur / Famille (3 Appareils)", price: 34900 }
      ],
      is_active: true
    }
  ];

  for (const prod of products) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prod.slug);

    if (existing && existing.length > 0) {
      const { error: updErr } = await supabase
        .from("products")
        .update(prod)
        .eq("slug", prod.slug);
      console.log("Updated product in Supabase:", prod.slug, updErr ? updErr.message : "OK");
    } else {
      const { error: insErr } = await supabase
        .from("products")
        .insert([prod]);
      console.log("Inserted product in Supabase:", prod.slug, insErr ? insErr.message : "OK");
    }
  }

  console.log("\n--- 3. FINAL VERIFICATION ---");
  const { data: orders } = await supabase.from("orders").select("id, order_number, customer_name");
  const { data: allProds } = await supabase.from("products").select("slug, title, price, is_active");
  console.log("Current Orders in Supabase:", orders);
  console.log("Current Products in Supabase:", allProds);
}

main().catch(console.error);
