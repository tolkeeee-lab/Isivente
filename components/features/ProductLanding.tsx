"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Droplets, Wind, Pointer } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Types ---
interface ProductBundle {
  id: string;
  name: string;
  quantity: number;
  price: number;
  original_price: number;
  badge: string | null;
  description: string;
}

interface ProductFeature {
  id: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  location: string;
  rating: number;
  comment: string;
  handle: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function ProductLanding({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedBundle, setSelectedBundle] = useState<ProductBundle | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+229");
  const [city, setCity] = useState("Cotonou");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (data) {
        setProduct(data);
        if (data.bundles && data.bundles.length > 0) {
          // Select 'duo' by default if it exists, else first one
          const defaultBundle = data.bundles.find((b: any) => b.id === 'duo') || data.bundles[0];
          setSelectedBundle(defaultBundle);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBundle || !product) return;
    setIsSubmitting(true);

    const orderNumber = `UM-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase.from("orders").insert([
      {
        order_number: orderNumber,
        product_slug: product.slug,
        product_title: product.title,
        customer_name: customerName,
        customer_phone: customerPhone,
        city: city,
        address: address,
        bundle_name: selectedBundle.name,
        quantity: selectedBundle.quantity,
        total_amount: selectedBundle.price,
      }
    ]);

    setIsSubmitting(false);
    if (!error) {
      router.push(`/p/${slug}/success`);
    } else {
      alert("Une erreur s'est produite lors de l'enregistrement de votre commande.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-2xl font-bold">Chargement...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-display text-2xl font-bold">Produit introuvable</div>;

  return (
    <div className="bg-bg text-ink min-h-screen font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-magenta rounded-full block"></span>
            {product.slug === 'umei' ? 'uméi' : 'Isivente'}
          </div>
          <nav className="hidden md:flex gap-8 font-bold text-[15px]">
            <a href="#comment" className="hover:text-magenta transition-colors">Comment ça marche</a>
            <a href="#avis" className="hover:text-magenta transition-colors">Avis</a>
            <a href="#faq" className="hover:text-magenta transition-colors">Questions</a>
          </nav>
          <a href="#commander">
            <Button variant="takeboost" size="sm">Commander</Button>
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-16 pb-8 md:pt-20 md:pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <h1 className="font-display text-[42px] sm:text-[64px] font-bold leading-[0.98] tracking-[-0.02em] mb-6">
              Démêler tes <span className="text-purple">boucles</span> ne devrait pas <span className="text-magenta">faire mal.</span>
            </h1>
            <p className="text-lg text-ink-soft font-medium max-w-[46ch] mb-8">
              {product.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a href="#commander">
                <Button variant="primary" size="lg" className="text-[17px]">
                  Je commande — {product.price.toLocaleString('fr-FR')} FCFA
                </Button>
              </a>
              <a href="#comment">
                <Button variant="outline" size="lg" className="text-[17px]">
                  Voir comment ça marche
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Paiement à la livraison</Badge>
              <Badge variant="default">Livraison 48–72h</Badge>
              <Badge variant="default">Garantie 30 jours</Badge>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-[420px]">
              <img 
                src={product.images[0]?.url || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"} 
                alt="Product Hero" 
                className="w-full rounded-[28px] border-2 border-ink shadow-sm"
              />
              <div className="absolute -top-4 -left-6 w-[118px] h-[118px] bg-mint border-2 border-ink rounded-full flex items-center justify-center text-center font-display font-bold text-[14px] leading-tight p-2 shadow-sticker transform -rotate-12">
                3-en-1 vapeur + huile + clic
              </div>
              <div className="absolute -bottom-2 -right-4 w-[96px] h-[96px] bg-magenta text-white border-2 border-ink rounded-full flex items-center justify-center text-center font-display font-bold text-[13px] leading-tight p-1.5 shadow-sticker transform rotate-6">
                Sans chaleur agressive
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-ink text-white py-4 overflow-hidden mt-14 transform -rotate-1 border-y-2 border-ink">
        <div className="flex whitespace-nowrap animate-scroll w-max">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-display font-bold text-[18px] px-5 flex items-center gap-5">
              VAPEUR <span className="text-mint not-italic">?</span> BRUME + HUILE <span className="text-mint not-italic">?</span> CLIC LIBÉRATEUR <span className="text-mint not-italic">?</span> SANS CHALEUR AGRESSIVE <span className="text-mint not-italic">?</span> POUR TOUTES LES TEXTURES <span className="text-mint not-italic">?</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES 3-in-1 */}
      <section id="comment" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <h2 className="font-display text-[32px] sm:text-[42px] font-bold mb-4">Ce qu'il y a dedans, en vrai.</h2>
            <p className="text-ink-soft text-[17px] font-medium">Pas de magie — juste trois mécanismes qui font le travail à ta place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {product.features?.map((feat: ProductFeature, idx: number) => (
              <Card key={idx} className="border-2 border-ink hover:-translate-y-2 transition-transform duration-300">
                <CardContent className="p-8">
                  <div className={`w-[64px] h-[64px] rounded-2xl flex items-center justify-center mb-6 border-2 border-ink ${idx === 0 ? 'bg-purple' : idx === 1 ? 'bg-magenta' : 'bg-mint-deep'}`}>
                    {idx === 0 && <Wind className="w-8 h-8 text-white" />}
                    {idx === 1 && <Droplets className="w-8 h-8 text-white" />}
                    {idx === 2 && <Pointer className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="font-display text-[22px] font-bold mb-3">{feat.title}</h3>
                  <p className="text-ink-soft text-[15px] font-medium leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="bg-panel py-24 border-y-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display text-[34px] sm:text-[58px] font-bold leading-tight max-w-[18ch] mx-auto">
            Tes cheveux méritent <span className="text-purple">mieux</span> qu'un peigne qui <span className="text-magenta">tire.</span>
          </h2>
        </div>
      </section>

      {/* PHOTO FEATURE */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <img src={product.images[2]?.url || "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388"} alt="Détail clic" className="rounded-[24px] border-2 border-ink w-full max-w-[400px] mx-auto" />
          <div>
            <span className="inline-block bg-ink text-white text-[13px] font-bold px-4 py-2 rounded-full mb-5">Le détail qui change tout</span>
            <h2 className="font-display text-[32px] sm:text-[42px] font-bold leading-tight mb-5 max-w-[14ch]">Un clic, et c'est réglé.</h2>
            <p className="text-ink-soft text-[17px] font-medium max-w-[42ch] mb-8">
              Sur une brosse classique, retirer les cheveux coincés prend souvent plus de temps que le coiffage lui-même. Le mécanisme à dégagement automatique règle ça en une seconde.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-bold text-[16px]"><Check className="text-magenta w-6 h-6 shrink-0" /> Aucun cheveu coincé dans les poils</li>
              <li className="flex items-center gap-3 font-bold text-[16px]"><Check className="text-magenta w-6 h-6 shrink-0" /> Nettoyage en quelques secondes</li>
              <li className="flex items-center gap-3 font-bold text-[16px]"><Check className="text-magenta w-6 h-6 shrink-0" /> Poils doux, sans casse ni tiraillement</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CHECKOUT / OFFER SECTION */}
      <section id="commander" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-panel border-2 border-ink rounded-[32px] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left: Bundle Selection */}
            <div className="flex-1 p-8 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-ink">
              <h2 className="font-display text-[28px] font-bold mb-2">Choisis ton offre</h2>
              <p className="text-ink-soft font-medium mb-8">Sélectionne la quantité. Paiement à la livraison sécurisé.</p>
              
              <div className="space-y-4">
                {product.bundles?.map((bundle: ProductBundle) => (
                  <div 
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedBundle?.id === bundle.id 
                      ? 'border-magenta bg-magenta/5 ring-4 ring-magenta/10' 
                      : 'border-panel-line bg-white hover:border-ink'
                    }`}
                  >
                    {bundle.badge && (
                      <div className="absolute -top-3 left-4 bg-ink text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                        {bundle.badge}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedBundle?.id === bundle.id ? 'border-magenta' : 'border-slate-300'
                        }`}>
                          {selectedBundle?.id === bundle.id && <div className="w-3 h-3 bg-magenta rounded-full"></div>}
                        </div>
                        <div>
                          <h4 className="font-bold text-[17px]">{bundle.name}</h4>
                          <p className="text-sm text-ink-soft font-medium mt-0.5">{bundle.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-[20px] text-magenta">{bundle.price.toLocaleString('fr-FR')} F</div>
                        {bundle.original_price > bundle.price && (
                          <div className="text-xs text-slate-400 line-through font-bold">{bundle.original_price.toLocaleString('fr-FR')} F</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Checkout Form */}
            <div className="flex-1 p-8 md:p-12 bg-white">
              <h2 className="font-display text-[24px] font-bold mb-6">Informations de livraison</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2">Nom complet</label>
                  <input 
                    required 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Prénom & Nom"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-magenta focus:ring-0 transition-colors font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Numéro WhatsApp / Appel</label>
                  <input 
                    required 
                    type="tel" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-magenta focus:ring-0 transition-colors font-medium font-mono"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-2">Ville (Bénin)</label>
                    <select 
                      value={city} 
                      onChange={e => setCity(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-magenta focus:ring-0 transition-colors font-medium"
                    >
                      <option value="Cotonou">Cotonou</option>
                      <option value="Abomey-Calavi">Abomey-Calavi</option>
                      <option value="Porto-Novo">Porto-Novo</option>
                      <option value="Parakou">Parakou</option>
                      <option value="Ouidah">Ouidah</option>
                      <option value="Autre">Autre ville</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Quartier / Repère</label>
                    <input 
                      required 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Ex: Akpakpa, pharmacie X..."
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-magenta focus:ring-0 transition-colors font-medium"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t-2 border-slate-100 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Total à payer (COD) :</span>
                    <span className="font-display font-bold text-[28px] text-ink">{selectedBundle?.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    variant="primary" 
                    size="xl" 
                    className="w-full text-[18px] h-[64px]"
                  >
                    {isSubmitting ? 'Traitement en cours...' : 'Valider ma commande (COD)'}
                  </Button>
                  <p className="text-center text-xs text-slate-500 font-medium mt-4">
                    ?? Vous ne payez rien maintenant. Le paiement se fera en espèces à la livraison.
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="avis" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <h2 className="font-display text-[32px] sm:text-[42px] font-bold mb-4">On te laisse pas juste sur parole.</h2>
            <p className="text-ink-soft text-[17px] font-medium">Ce que disent celles qui ont déjà changé de rituel.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.testimonials?.map((t: Testimonial, idx: number) => (
              <Card key={idx} className={`border-2 border-ink p-8 flex flex-col justify-between ${idx === 0 ? 'bg-purple text-white border-purple' : idx === 2 ? 'bg-magenta text-white border-magenta' : 'bg-white'}`}>
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${idx === 1 ? 'text-amber-400' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <p className={`text-[17px] font-bold leading-relaxed mb-6 ${idx === 1 ? 'text-ink' : 'text-white'}`}>"{t.comment}"</p>
                </div>
                <div>
                  <p className={`font-display font-bold text-[15px] ${idx === 1 ? 'text-ink' : 'text-white'}`}>{t.handle}</p>
                  <p className={`text-[13px] font-medium opacity-80 ${idx === 1 ? 'text-ink-soft' : 'text-white'}`}>{t.name} — {t.location}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-panel py-24 border-y-2 border-ink">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-[32px] sm:text-[42px] font-bold mb-12 text-center">Les questions qu'on nous pose</h2>
          <div className="space-y-4">
            {product.faq?.map((item: FAQItem, idx: number) => (
              <details key={idx} className="group border-2 border-ink bg-white rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-display font-bold text-[18px]">
                  {item.question}
                  <span className="relative ml-4 shrink-0 w-8 h-8 rounded-full bg-panel flex items-center justify-center text-magenta group-open:rotate-45 transition-transform duration-300">
                    <Plus className="w-5 h-5" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-ink-soft font-medium text-[16px] leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 text-center px-6">
        <h2 className="font-display text-[34px] sm:text-[50px] font-bold leading-tight max-w-[16ch] mx-auto mb-10">
          Prête à changer ton rituel capillaire ?
        </h2>
        <a href="#commander">
          <Button variant="primary" size="xl" className="text-[18px]">
            Commander ma brosse — {product.price.toLocaleString('fr-FR')} FCFA
          </Button>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-ink py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[14px] font-bold text-ink-soft">
          <div>© {new Date().getFullYear()} {product.slug === 'umei' ? 'uméi' : 'Isivente'}. Tous droits réservés.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-magenta transition-colors">Contact</a>
            <a href="#" className="hover:text-magenta transition-colors">Livraison (Bénin)</a>
            <a href="#" className="hover:text-magenta transition-colors">Conditions</a>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t-2 border-ink z-50 transform translate-y-0 transition-transform">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex flex-col">
            <span className="font-display font-bold text-[14px]">uméi 3-en-1</span>
            <span className="text-magenta font-bold text-[16px]">{product.price.toLocaleString('fr-FR')} F</span>
          </div>
          <a href="#commander">
            <Button variant="takeboost" size="md">Commander</Button>
          </a>
        </div>
      </div>

    </div>
  );
}

