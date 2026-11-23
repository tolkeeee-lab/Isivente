# PDP Guidelines — Ecommerce Best Practice Knowledge Base

A compilation of publicly documented ecommerce UX and conversion best practice for product detail pages, drawn from published ecommerce UX research and statistics, accessibility standards (WCAG 2.2), consumer-protection guidance (FTC, EU), platform UX documentation, and established CRO practice. Everything is paraphrased and compiled — no entry reproduces text from any single source.

Entries are organized by page zone. Each has: an ID, the rule, why it matters for conversion, and common violation patterns to look for during an audit.

Severity guidance: guidelines marked ⚠ are common **Critical/High** candidates when violated — they touch documented abandonment drivers (unexpected costs, insufficient product information, lack of trust, undiscoverable critical content).

**Contents:**
Layout & page structure (L) · Gallery (G) · Buy box & add-to-cart (B) · Price & promotions (P) · Variants, size & customization (V) · Shipping & returns (S) ⚠ · Reviews & social proof (R) · Description & specs (D) · Cross-sells (X) · Mobile & performance (M) · Trust, accessibility & page-level (T)

---

## Layout & page structure (L)

**L1. Use a traditional single-column scrolling layout for PDP content.** The main content flows in one vertical column (a buy-box sidebar on desktop is fine); avoid multi-column or magazine-style arrangements for the descriptive content itself.
*Why:* users evaluate a product by scrolling; parallel columns create ambiguous reading order and content that half the audience never sees.
*Violations:* description and specs side-by-side in desynced columns; masonry-style content blocks below the fold.
*Source: published ecommerce UX research on product page layouts.*

**L2. ⚠ Never use horizontal tabs for primary page sections.** Product details, specifications, reviews, shipping/returns and similar core sections belong in vertically stacked sections — not behind tabs. Use expanded sections or collapsible sections depending on page length and device (L3/L4).
*Why:* tabbed content routinely goes undiscovered — users don't systematically open every tab, so purchase-critical content in the third tab effectively doesn't exist. Tabs also truncate and break on narrow viewports.
*Violations:* reviews reachable only via a tab; return policy in the fourth of five tabs; tab strip cut off mid-label on mobile; duplicate tabs teaching users the tabs aren't worth opening.
*Source: published ecommerce UX research on tabs vs. sections; general findability research.*

**L3. On long mobile PDPs, use collapsed (accordion) sections with clear titles and recognizable icons.** Section headers must say what's inside in plain words; icons (chevrons, +/−) must read as expandable.
*Why:* collapsing keeps a long page navigable, but only if users can predict what each section contains; vague headers make collapsed content invisible.
*Violations:* headers like "More info" or "Details²"; no expand affordance; sections that navigate away instead of expanding in place.
*Source: published mobile commerce UX research.*

**L4. On shorter PDPs, use expanded sections so all core content is reachable by scrolling alone.** Don't make users tap to reveal content a single scroll would have covered.
*Why:* every unnecessary expand interaction filters out a share of readers; on a short page there's nothing to gain from hiding content.
*Violations:* a five-section page where every section is collapsed by default; "Read more" links guarding two sentences.
*Source: published ecommerce UX research on progressive disclosure.*

**L5. On long desktop PDPs with expanded sections, add a sticky table of contents.** Place it high on the page, style it distinctively so it reads as navigation, indicate the current section, and smooth-scroll to targets.
*Why:* on pages several viewports tall, a persistent section index is the difference between "the specs exist" and "the specs are findable."
*Violations:* anchor links that jump abruptly with no orientation; a ToC that appears only after scrolling past everything it links to; sticky nav visually indistinguishable from body text.
*Source: published ecommerce UX research on long-page navigation.*

---

## Gallery (G)

**G1. Provide multiple image types — not multiple angles of one type.** Users need different kinds of visual answers: a clean cutout shot, the product in scale/context, lifestyle usage, close-up detail of material/texture, and an "included accessories" / what's-in-the-box image where relevant. Anything pictured but not included in the price must be labeled "sold separately". One or two studio shots are never enough; considered purchases need broad type coverage. Where a huge catalog makes this impractical, prioritize the most important and best-selling products first.
*Why:* insufficient product imagery is a documented driver of returns and abandonment — users can't assess what they can't see, and uncertainty defaults to "no"; a hero shot styled with extra-cost accessories, unlabeled, produces disputes and returns.
*Violations:* 1–2 studio shots on white; three near-identical angles of the same cutout; hero image styled with accessories that cost extra, with no label; flagship products with the same thin coverage as long-tail SKUs.
*Source: published ecommerce image-UX research.*

**G2. Show products from 3 or more distinct angles.** Front, back/side, and at least one perspective or detail view; more for products whose shape or construction matters.
*Why:* a single frontal view forces users to guess at depth, back detailing, ports, closures — the exact details that trigger "I'll check in store" or a return.
*Violations:* front view only; "back" view that is a mirrored front; angles that hide known weak points.
*Source: published ecommerce image-UX research.*

**G3. Always include at least one "in scale" image, and human-model images for apparel and accessories.** Show the product relative to a person, its environment, or objects of known size; for very large catalogs, computer-generated in-scale imagery is acceptable. For clothing, bags, and jewelry, images worn by a human model are non-negotiable for judging size, fit, and style.
*Why:* dimensions in millimeters don't build intuition; misjudged size is one of the most common reasons for returns and abandoned consideration.
*Violations:* furniture floating on white with no room context; a bag with no on-shoulder shot; jewelry photographed macro with no wrist/hand reference.
*Source: published ecommerce image-UX research; published returns research.*

**G4. Provide "feature callout" images for key features.** Close-ups or annotated graphics that isolate a specific feature (hinge, port, fabric weave, control panel), scaled to product complexity — appliances and equipment need more callouts than a t-shirt.
*Why:* callouts answer feature-specific questions in the medium users actually inspect (the gallery), instead of hoping they cross-reference the description.
*Violations:* complex machine with only beauty shots; features named in copy but never shown.
*Source: published ecommerce image-UX research.*

**G5. Support high-resolution zoom that meets category needs, and never block pinch-zoom on mobile.** Zoom must reveal genuinely more detail (texture, stitching, ports), not just enlarge a low-res image.
*Why:* zoom substitutes for physical inspection; a blurry zoom actively damages quality perception.
*Violations:* `user-scalable=no` in the viewport meta; zoom opens a same-resolution image; lightbox with no zoom.
*Source: published ecommerce image-UX research; WCAG 2.2 SC 1.4.4 (blocking zoom is also an accessibility failure).*

**G6. Make gallery scope visible, and use thumbnails on desktop.** On desktop, always represent gallery images with thumbnails; either show all thumbnails or clearly signal hidden ones (arrows, a "+N" truncation thumbnail, or a visibly cut-off final thumbnail). On mobile, dots or a counter must communicate how many images exist.
*Why:* users routinely miss images hidden behind unmarked carousels — content that isn't discovered doesn't exist.
*Violations:* single hero with tiny dots below the fold; arrows only on hover; no indicator at all.
*Source: published ecommerce gallery and carousel research.*

**G7. Give image overlays generous room, and full-screen overlays must respect the back button.** The lightbox is where inspection happens — let it use most of the screen; if it takes over the page, the back button/gesture must close it rather than exit the PDP.
*Why:* cramped overlays defeat their purpose; a back button that dumps users off the product page after they inspected an image is a rage-quit pattern, especially on mobile.
*Violations:* cramped lightbox that barely enlarges the image; full-screen zoom where "back" leaves the page; overlay with no visible close affordance.
*Source: published ecommerce image-UX research; platform navigation conventions.*

**G8. Provide product videos and interactive views (360° spins) — at minimum for top-selling products — placed in the main gallery with distinguishing icons.** Motion answers questions statics can't: apparel drape, mechanism operation, assembly, true size in use; 360° spins let users pick their own angle. All of it belongs among the gallery thumbnails, marked with recognizable play/rotate indicators, not buried in a description tab.
*Why:* video and interactive views resolve uncertainty for fit and mechanics, but only if they're discovered — and the gallery is the only place everyone looks; users treat 360° content as a supplement to images and expect it in the same container.
*Violations:* no video on flagship products where movement matters; video or 360° view hosted only in a tab or at the page bottom; video thumbnail indistinguishable from an image.
*Source: published ecommerce video-UX research.*

**G9. Implement video properly: fast playback, real controls, informative titles and start frames, and captions.** Playback must start quickly and stream smoothly; the player needs standard controls including a mute toggle; give each video a descriptive title and a meaningful first frame; provide closed captions where speech carries information.
*Why:* a video that buffers, starts on a black frame, or blasts audio gets abandoned before it answers anything; captions serve sound-off mobile viewing and accessibility alike.
*Violations:* 30MB self-hosted MP4; autoplay with sound; start frame of a logo card; "video_final_v2" as the title.
*Source: published video usability research; WCAG 2.2 (captions).*

**G10. Variant selection must update the gallery, and visually distinct variations need their own imagery.** Selecting a color swatch shows that color; each visually different variation gets its own photography, not one recolored hero.
*Why:* users buy the variant they see; mismatches cause returns and mistrust.
*Violations:* swatch changes price/SKU but the hero image stays on the default color; only the default colorway has detail shots.
*Source: published ecommerce variant-UX research.*

**G11. For fit-critical products, include a "dimensions image" — a graphic tying each measurement to the exact part it describes.** A line drawing or annotated photo showing which number is the seat height, which is the overall depth, with labels legible on mobile without zooming. Distinct from the in-scale image (G3): in-scale builds intuition, the dimensions image resolves exact-fit verification.
*Why:* text-only measurement lists force users to guess which dimension maps to which part; users who can't confirm fit mostly abandon rather than risk it, and those who guess wrong become returns.
*Violations:* a dimensions table using category jargon with no diagram; a dimensions graphic illegible at mobile size; measurements given for the packaging, not the assembled product, without saying so.
*Source: published furniture/home-goods UX research.*

**G12. Treat 3D models and AR ("view in your space") as supplements — properly integrated, never a substitute for photography.** Where spatial fit drives the decision, a 3D/AR option can answer what photos can't; give it a meaningful preview image, a stable correctly-sized container in the gallery, and a clearly labeled launch control on supporting devices. But usage of these features is low in testing — put the budget into imagery, customer photos, and a dimensions image first, and keep the AR entry point unobtrusive.
*Why:* a janky 3D model or broken AR button actively creates doubt at the decision moment; the documented drivers of purchase confidence are still high-quality images and exact dimensions.
*Violations:* a 3D model as the only media with no photos; prominent "View in Room" button on a PDP with two studio shots and no dimensions image; AR control that silently does nothing on unsupported devices; a 3D viewer with no size constraint causing layout jumps.
*Source: published AR/3D usability research; platform theme documentation.*

**G13. Carousels advance only on user action, with visible controls and full accessibility.** Nothing on the PDP — gallery, cross-sell row, promo strip — should auto-rotate; if anything does, it needs an obvious pause. Navigation controls live inside the carousel frame, permanently visible and large; the current position is shown; controls are keyboard-operable and slide changes are announced to assistive technology.
*Why:* auto-advancing frames yank content away mid-evaluation and make the module read as an ad, which users ignore at very high rates; hover-only arrows and unfocusable click-handler divs lock out touch, keyboard, and screen-reader users from the page's primary evidence.
*Violations:* auto-rotating gallery or cross-sell carousel; arrows revealed only on hover; carousel controls as unfocusable `<div>`s; swiping updates the image with no position indicator or AT announcement.
*Source: published carousel usability research; W3C WAI carousel tutorial.*

---

## Buy box & add-to-cart (B)

**B1. ⚠ One visually dominant primary CTA with styling used nowhere else.** Add-to-cart must be the most prominent interactive element in the buy box, and its style (color, weight) should be unique to it on the page — secondary purchase actions (express-pay buttons, wishlist) visually subordinate, not competing equals.
*Why:* competing CTAs of equal weight create hesitation and misclicks at the highest-intent moment on the page; reusing the ATC style on lesser buttons trains users to ignore it.
*Violations:* three equally loud buttons stacked; branded express-pay buttons louder than ATC; ATC styled as ghost/outline; every button on the page in the ATC color.
*Source: published visual-hierarchy and CTA research; platform UX documentation.*

**B2. ⚠ Added-to-cart feedback must be unmistakable and offer a path forward.** A cart drawer or clear overlay confirming the item, with both "continue shopping" and "go to checkout" available. A silent counter increment in the header is not feedback.
*Why:* users who aren't sure the add worked either add duplicates or leave to check — both are friction at peak intent.
*Violations:* toast that disappears in 1.5s; only the cart badge updates; full-page redirect to cart when the catalog encourages multi-item orders.
*Source: published cart-interaction research.*

**B3. Communicate availability before the click.** In-stock/low-stock/out-of-stock state visible in the buy box; out-of-stock variants explained rather than presented as a dead disabled button.
*Why:* discovering unavailability after investing in the page is a trust hit; unexplained disabled buttons read as broken.
*Violations:* disabled ATC with no explanation; stock state only revealed as an error after clicking.
*Source: published ecommerce availability-UX research.*

**B4. Let users buy temporarily out-of-stock items as backorders with an extended, clearly stated delivery time — and label permanently unavailable products "Discontinued" with alternatives promoted.** Temporary stockouts should extend the delivery estimate, not kill the sale ("Ships in 3–4 weeks"). Permanently gone products need the explicit word "Discontinued" (not a perpetual "out of stock") plus prominent links to successor or comparable products.
*Why:* a hard "out of stock" on a purchasable-later item sends ready buyers to competitors; an ambiguous forever-out-of-stock page strands SEO traffic with no path forward.
*Violations:* backorder-able item shown as flatly unavailable; discontinued product still saying "notify me" indefinitely; no alternatives offered on a dead product page.
*Source: published ecommerce availability-UX research.*

**B5. ⚠ Sticky add-to-cart on long mobile PDPs — compact and unobtrusive.** Once the buy box scrolls out of view on mobile, a compact sticky bar (product, price, ATC) should appear.
*Why:* on content-rich PDPs, users read reviews and specs far below the buy box; forcing a long scroll back up loses conversions at the decision moment.
*Violations:* no sticky bar on a PDP requiring 6+ screen-heights of scroll; sticky bar that covers content or stacks with cookie banners and chat widgets.
*Source: published mobile commerce research; platform UX documentation.*

**B6. Quantity controls only where multi-purchase is plausible, and touch-friendly.** Steppers with ≥44px tap targets; default quantity 1; allow direct numeric input.
*Why:* an unnecessary quantity field adds a decision; tiny steppers cause mis-taps on the most consequential form on the page.
*Violations:* quantity selector on one-per-customer products; 20px +/− icons; stepper that resets variant selection.
*Source: WCAG 2.2 SC 2.5.8 (target size); Apple/Google public touch-target guidance; established CRO practice.*

**B7. Provide a save/wishlist feature that works for guests, explains itself, and stays subtle.** Users must be able to save without an account (with an optional sign-in to persist across devices); briefly describe what saving does; use an unobtrusive design near — but clearly secondary to — the ATC; make the saved list easy to find again.
*Why:* "save" is the pressure valve for not-ready-yet buyers; forcing account creation at that moment converts a future sale into a bounce.
*Violations:* heart icon that opens a login wall; no indication where saved items live; save button styled as prominently as add-to-cart.
*Source: published ecommerce wishlist-UX research.*

**B8. If gifting options exist, say so on the PDP — before the cart.** Gift-suitable catalogs should surface what's available (gift message, price-hidden receipt, gift wrap) near the buy section, even as one short line linking to details; the full designation can happen in cart/checkout.
*Why:* gift buyers decide whether to purchase partly on whether gifting is handled; discovering at checkout that there's no gift receipt converts a committed buyer into an abandonment. Most sites show no gifting information on the product page at all — easy differentiation.
*Violations:* gift wrap/messaging exists but is first mentioned at checkout; no way to tell pre-purchase whether prices appear on the packing slip; a gifting FAQ page unlinked from the PDP.
*Source: published ecommerce gifting-flow research.*

**B9. Buy-box errors appear next to their source, in plain blame-free language, with the user's selections preserved.** When add-to-cart fails (missing size, quantity over stock, invalid personalization), show the message adjacent to the offending control, say specifically what to do, and never wipe chosen variants or typed text.
*Why:* the buy box is the highest-stakes form on the site; a generic toast, an error the user must hunt for, or a reset of their configuration converts peak purchase intent into an exit.
*Violations:* "Please select options" banner at the top while the size selector sits two viewports down un-highlighted; ATC click that silently does nothing; error that clears the chosen color/size or typed engraving text.
*Source: published error-message and form-validation research.*

**B10. Present subscriptions as an explicit one-time vs. subscribe choice — defaulting to one-time.** Label the group plainly ("Subscribe & save"), show the subscription price beside the one-time price with the saving stated, keep the delivery frequency visible at selection time, link the subscription policy, and spell out future price changes ("first month free, then $9/mo") before add-to-cart.
*Why:* a recurring charge is a bigger commitment than a purchase; pre-selecting subscription or hiding the frequency converts a sale into a chargeback and a churned customer, while clear savings framing is what makes the option convert at all.
*Violations:* subscription pre-selected on first load; "Subscribe" with no visible frequency; intro price shown with no mention of the ongoing price; savings claim with no one-time price to compare against.
*Source: platform UX documentation on subscription purchase options.*

**B11. Pre-orders and other deferred purchases need a state badge, a matching CTA label, an expected date, and honest deposit math.** Mark the state near the price ("Pre-order"), change the button text to match the commitment ("Pre-order now", not "Add to cart"), give an expected ship date or range, and show any deposit and the full price as separate plain facts — never styled as a discount — with the balance-charge timing stated.
*Why:* a deferred purchase is a different contract than a normal sale; users who discover the wait or the second charge after committing dispute the order, and strikethrough-styled deposits read as deceptive pricing.
*Violations:* generic "Add to cart" on a pre-order item; no ship date anywhere; deposit displayed next to a struck-through full price as if discounted; balance-due date revealed only in the confirmation email.
*Source: platform UX documentation on deferred purchase options.*

---

## Price & promotions (P)

**P1. ⚠ Price in the buy section, prominently styled, adjacent to title and CTA.** The price belongs inside the buy box with high visibility — large type, bold weight, or a distinct color. The user should never hunt for the price or scroll to reconnect price with the buy action.
*Why:* price is the first qualifying fact; a small, gray, or distant price reads as evasive and breaks the decision flow.
*Violations:* price below the fold; price in small light-gray text; price only appears after selecting all variants with no starting-from indication.
*Source: published pricing-display research.*

**P2. Sale pricing needs a clear, honest anchor.** Show original price struck through, current price emphasized, and the saving (% or amount). The final payable price must be unambiguous.
*Why:* anchoring drives perceived value, but ambiguity about which number you'll pay creates checkout-stage abandonment; fabricated anchors are a legal risk.
*Violations:* three prices with no labels; "compare at" prices with no basis; member price shown as if it were the default.
*Source: EU Omnibus Directive & FTC public guidance on reference pricing; published discount-display research.*

**P3. Show unit pricing where quantity comparison matters.** Per-100ml, per-kg, per-unit for consumables and multipacks.
*Why:* users comparing pack sizes without unit prices either do math (friction) or leave to compare elsewhere; in many jurisdictions it's legally required.
*Violations:* multipacks with no per-unit price; inconsistent units across variants.
*Source: consumer-protection regulations (EU Price Indication Directive); published pricing research.*

**P4. Installment/BNPL messaging: informative, not dominant.** One concise line ("or 4× $22.50 with X") near the price, with details behind a tap.
*Why:* BNPL can lift AOV for higher tickets, but stacked financing banners bury the actual price and add noise for users who'll never use it.
*Violations:* three competing BNPL providers each with a banner; BNPL price more prominent than real price.
*Source: published CRO practice; platform UX documentation.*

**P5. Where quantity rules or volume pricing apply, state them on the PDP before add-to-cart.** Show order constraints as plain text near the quantity control ("Minimum 12 · sold in multiples of 6"), render volume tiers as a compact per-unit price-break table, and update the effective per-unit price live as the quantity changes.
*Why:* B2B and wholesale buyers decide on landed per-unit cost; hiding the tier table or enforcing minimums only as a cart error turns the PDP into a trial-and-error form and pushes volume buyers to a distributor who publishes their breaks.
*Violations:* minimum-order rule surfacing only as an add-to-cart error; volume discounts that exist but appear nowhere on the page; a tier table that doesn't update the displayed price at qualifying quantities.
*Source: platform merchant documentation (B2B storefronts).*

---

## Variants, size & customization (V)

**V1. Always use swatches for color — never dropdowns — and make them work hard.** Real-image or accurate color swatches with the name on hover/tap (names alone like "Fjord" communicate nothing; colors alone fail color-blind users — provide both). The main image must change to the selected color. On desktop, preview the hovered swatch; on mobile, manage screen real estate carefully once swatches exceed two rows.
*Why:* variant selection is a visual decision; text-only dropdowns for color force serial trial-and-error, and an image that doesn't follow the selection sells the wrong product.
*Violations:* dropdown listing "Blue / Navy / Midnight"; swatches that don't match photographed color; six rows of swatches pushing the ATC below the fold on mobile.
*Source: published ecommerce variant-UX research; WCAG 2.2 SC 1.4.1 (use of color).*

**V2. Signal unavailable combinations before selection.** Cross out or dim unavailable size/color combos as the user selects; never let them configure a variant and then error out.
*Why:* the configure-then-fail loop is one of the most rage-inducing PDP patterns and a direct exit trigger.
*Violations:* all options always enabled with a post-click "unavailable" error; availability only visible after opening every dropdown.
*Source: published ecommerce variant-UX research.*

**V3. ⚠ Size guide adjacent to the size selector, opening as an overlay.** It must contain garment/product measurements (not only regional conversions) and ideally fit guidance ("runs small", model reference).
*Why:* size uncertainty is a top driver of both non-purchase and returns in apparel/footwear; a size chart on a separate page loses the user's selection context.
*Violations:* size guide link in the footer; chart with only S/M/L↔EU conversions and no cm/inches; no fit feedback despite having review data.
*Source: published sizing-UX research; published apparel returns research.*

**V4. Selected state must be obvious and update everything.** Strong visible selection state on the chosen swatch/size; price, imagery, availability, and SKU update immediately.
*Why:* weak selected states cause wrong-variant orders; lag between selection and price update breeds distrust.
*Violations:* selection indicated only by a subtle 1px border; price updates only after page reload.
*Source: published feedback/selection-state research; WCAG 2.2 (focus visibility).*

**V5. On mobile, keep variant selection and its visual result visible together.** The user picking a color must see what they're picking — don't separate the swatches so far from the product imagery that the selection's effect happens off-screen. The same applies to configurators: keep the preview in view while options are chosen.
*Why:* selection-without-preview forces scroll-up-scroll-down loops and produces wrong-variant orders.
*Violations:* swatches two screen-heights below the gallery; configurator options that scroll the preview entirely off-screen.
*Source: published variant-UX research (selection must update visible imagery); established mobile commerce practice.*

**V6. Put simple customization in the buy section; move complex multivariable customization to a dedicated flow.** Essential options (engraving text, simple choices) live above the ATC. Multi-step configurators (built-to-order furniture, custom PCs) deserve a separate page or explicit multistep process — with a sequential list of steps to complete, and transitions/animations that draw the eye to what each choice changed.
*Why:* burying simple options below the ATC gets them skipped; cramming a 12-decision configurator into a sidebar overwhelms and produces abandoned half-configurations.
*Violations:* engraving field hidden in a tab; complex configurator with no progress indication; option changes that silently update a price nobody notices.
*Source: published research on step-by-step wizards and progressive disclosure; established CRO practice.*

**V7. Product content must be universal across variations of the same product — or clearly labeled when it isn't.** Reviews, Q&A, images, videos, and manuals should attach to the product, not fragment across color/size variations; where content genuinely applies to only one variation, say so.
*Why:* fragmenting reviews across variants makes every variant look unpopular; users assume PDP content covers what's in their cart, so unlabeled variant-specific content misleads.
*Violations:* 200 reviews on the black variant, 0 visible on the white one; a manual for the prior model year with no note.
*Source: published ecommerce variant-UX research.*

**V8. Present size options as exposed buttons — never dropdowns — and don't pre-select a size.** All sizes visible at a glance with unavailable ones signaled in place (per V2); for very large ranges, group by type or use a swipeable row on mobile rather than reverting to a dropdown.
*Why:* dropdowns hide the size range and its availability behind a click — users overlook the selector (triggering add-to-cart errors) or invest in the product only to discover their size missing; a pre-selected default causes wrong-size orders.
*Violations:* size in a `<select>` dropdown on desktop; a default size pre-chosen so ATC works without a deliberate choice; available sizes discoverable only by opening a menu.
*Source: published ecommerce variant-selection research.*

---

## Shipping & returns (S) ⚠ — top abandonment territory

**S1. ⚠ Shipping cost visible on the PDP, before add-to-cart — the lowest cost or a range by default, with a path to full details.** When free shipping isn't sitewide, show the cheapest rate or a range near the buy section ("Shipping from $9.90"), linked to the full list of methods, prices, and conditions. Consider a tax estimate or tax-exempt notice where relevant. Best: an estimate for the user's region.
*Why:* unexpected extra costs are the single most-cited reason for cart abandonment in long-running public survey data (~40% of abandoners citing extra costs in the most recent published wave; overall documented average cart abandonment ~70%). Every purchase decision made without shipping cost is provisional.
*Violations:* zero shipping information anywhere pre-checkout; shipping policy only in the footer; "calculated at checkout" as the only message; a confusing rate table as the only presentation.
*Source: publicly documented cart-abandonment statistics; published checkout research.*

**S2. ⚠ Free-shipping information belongs in or near the buy section — visible, unconditional-looking only if it's unconditional, and never contradictory.** State it near the CTA even when a sitewide banner also announces it. Make qualifying conditions (threshold, membership, regions) visible by default. Never let elements contradict each other.
*Why:* free shipping is a top purchase driver but users don't trust it until they see it attached to this product; a banner saying "free shipping" next to a buy box saying "$4.99 shipping" reads as a bait-and-switch.
*Violations:* free-shipping promise only in a dismissible top bar; threshold discovered at checkout; sitewide "free shipping" banner while the PDP shows a per-item rate with no explanation.
*Source: published ecommerce shipping-UX research; platform merchant documentation.*

**S3. Show delivery timing as dates, not just durations — and order cutoffs as live countdowns.** "Arrives Thu, Aug 6 – Mon, Aug 10" beats "3–5 business days" (which forces the user to compute and guess handling time). Region/ZIP-based estimates where feasible. Where an order cutoff affects the promised date, show it as a countdown ("order within 43 minutes for delivery by Tue") rather than a static clock time — this is the legitimate, honest form of urgency (see T4).
*Why:* delivery speed is a purchase criterion; vague timing pushes users to marketplaces that answer it; static cutoff times force timezone arithmetic and produce missed-expectation deliveries.
*Violations:* no delivery estimate on PDP; "ships in 24h" with no transit estimate; "order by 2pm EST" with no countdown for a global audience; estimate hidden behind a shipping-policy link.
*Source: published delivery-expectation research and consumer surveys.*

**S4. ⚠ Return policy in the main content of the PDP, summarized in plain language.** A one-line summary near the buy box or a dedicated section/accordion: return window, who pays return shipping, method — linked to the full policy. Structure the full policy for reading: summary first, headers, plain language. A "free returns" claim must explicitly state whether return shipping is covered.
*Why:* returns are the online substitute for trying the product; an invisible policy is read as a hostile one, and a "free returns" badge contradicted by smallprint is worse than no badge.
*Violations:* returns only in footer legalese; policy summary that contradicts the full policy; "free returns" with paid-return smallprint; the policy buried in a tab (see L2).
*Source: published returns-and-trust research.*

**S5. Free-shipping threshold as motivation, not mystery.** If a threshold exists, state it on the PDP; in the cart, show progress toward it.
*Why:* thresholds are among the most reliably documented AOV levers, but only if users know about them while deciding.
*Violations:* threshold only discovered at checkout; threshold in a top-bar ticker that's dismissed on mobile.
*Source: published CRO practice; platform merchant documentation.*

**S6. If store pickup / local availability exists, surface it on the PDP.** Show pickup availability for the user's store (or a store selector) near the delivery information, with timing ("Ready today at …").
*Why:* pickup is the fastest "delivery method" and a decisive factor for urgent purchases; hiding it until checkout forfeits that advantage.
*Violations:* BOPIS offered but only discoverable at checkout; "check store availability" opening a dead end.
*Source: published omnichannel commerce research.*

**S7. Serve international buyers: local currency, duty transparency, and independent locale controls.** Show prices in the buyer's local currency (sensibly rounded), and state near the shipping information whether duties and import taxes are included/collected at checkout or may be collected by the carrier on delivery. Make language, display currency, and ship-to country separately switchable via a discoverable control (top corner on desktop, menu on mobile), label languages in their own language ("Deutsch", not "German"), and never force a geo-redirect that discards the product page the user landed on.
*Why:* a surprise customs bill at the door is the international version of unexpected checkout costs — refused deliveries, chargebacks, lost repeat business; foreign-currency prices force mental math comparison shoppers won't do; international users deliberately mix settings (original-language content, own currency), and a buried switcher reads as "we don't ship to you".
*Violations:* international storefront priced only in the merchant's home currency; DAP shipping with no mention that the carrier collects import fees; currency changeable only by switching the whole site language; forced redirect to a regional homepage off the PDP.
*Source: platform merchant documentation (international selling); published international-ecommerce usability research.*

---

## Reviews & social proof (R)

**R1. Rating summary near the title, anchoring to the review section.** Stars + count at the top; clicking scrolls to reviews.
*Why:* rating is a qualifying fact users check within seconds; making them scroll blind to find reviews adds friction to trust-building.
*Violations:* no summary at top; stars shown without count ("★★★★☆" from 2 reviews reads very differently from 2,000).
*Source: published social-proof and review-UX research.*

**R2. Provide distribution, sorting, and filtering — with the histogram visible and clickable.** Show the star-distribution histogram expanded by default (hide it only when there are too few reviews to be meaningful), make each bar a tappable filter for that rating, offer sorting by recent/helpful, and filter by relevant attributes. For apparel and footwear, add an aggregate fit indicator ("runs small ↔ runs large") at the top of the reviews.
*Why:* users specifically seek negative reviews to stress-test the purchase; a wall of unfilterable praise is unusable and unconvincing. Users instinctively try to click the histogram bars, and hiding the distribution behind a toggle collapses its usage; apparel buyers otherwise tally fit comments manually across hundreds of reviews.
*Violations:* average only, no distribution; no way to see 1–2★ reviews; histogram bars that aren't clickable; no fit summary on apparel despite review data; reviews paginated 3 at a time.
*Source: published review-UX research; published research on negative reviews and purchase confidence.*

**R3. Don't sanitize — respond, and disclose how reviews are verified.** Visible critical reviews with merchant responses outperform artificially perfect scores: respond at least to negative reviews on top products, and style responses distinctly (label, staff title, nesting). Never fabricate counts or seed fake reviews (legal exposure: FTC rule on fake reviews, EU consumer law). Additionally, state whether and how the store verifies that reviews come from real purchasers, apply "verified purchase" labels only per that stated process, and disclose any incentivized-review policy — EU consumer law requires the affirmative disclosure, not just the absence of fakes.
*Why:* a 4.6 with visible criticism converts better than a suspicious 5.0; documented consumer skepticism toward perfect ratings. Most sites never respond to reviews and can't demonstrate their reviews are genuine — an enforcement sweep found the majority failing exactly these disclosures.
*Violations:* only 5★ reviews displayed; "verified" labels applied to everything with no explanation of what they mean; no verification statement anywhere in the review module; incentivized reviews mixed in unlabeled; review import mismatched to the actual product.
*Source: FTC public rule on consumer reviews (2024); EU consumer-protection enforcement publications (UCPD); published trust research.*

**R4. Surface customer photos and social-media visuals where the category benefits.** Apparel fit, furniture in real rooms, cosmetics results — filterable and tappable. For lifestyle-driven categories, an integrated stream of real-usage social imagery works as a distinct, less-filtered evidence layer alongside review photos.
*Why:* customer imagery answers "what will this look like for someone like me", which studio photography structurally can't; users read social visuals as less staged than brand photography.
*Violations:* photo reviews exist but are buried; no photo gallery aggregation; a social carousel showing unrelated products or posts without the product being viewed.
*Source: published UGC and review-imagery research.*

**R5. Handle the empty state honestly.** Few/no reviews: show "Be the first to review" or omit the module — never fake counts, never show an empty 0.0★.
*Why:* "0 reviews ★☆☆☆☆" reads as a warning label; fabrication is worse.
*Violations:* 0.0 rating rendered as one empty star row; review count from a different variant/product.
*Source: FTC public guidance (fabrication); general trust and empty-state UX practice.*

**R6. Provide both site-authored FAQs and community Q&A for question-prone categories — and answer them.** The hybrid matters: curated FAQs guarantee coverage of predictable questions (including on new and low-traffic products), while community questions and answers carry credibility manufacturer copy can't. Place them with (or near) reviews; unanswered questions should notify the merchant, not rot publicly.
*Why:* Q&A captures the exact objections blocking purchases — each public answer converts every future user with the same question; a graveyard of unanswered questions signals an absent merchant, and new products with an empty Q&A module and no seeded FAQ answer nothing at all.
*Violations:* Q&A module with months-old unanswered questions; new products shipping with an empty Q&A and no FAQ; answers only from other customers guessing; no search across 200 questions.
*Source: published ecommerce Q&A-UX research.*

---

## Description & specs (D)

**D1. Structure the description for both skimmers and researchers: prose plus bullets, benefits first, placed near the buy box.** Use both text blocks (product overview, use cases, feature explanations) and bullet lists (features and specs), with generous bullet spacing and each list adjacent to its related prose. Keep the description close to the buy section — not stranded below cross-sells and widgets — and consider showing it partially expanded.
*Why:* two audiences read the description — skimmers deciding and researchers verifying — and one wall of text serves neither; a description buried several viewports down gets read by neither.
*Violations:* single 400-word manufacturer paragraph; bullet lists floating far from the prose they support; description opening below cross-sells and reviews.
*Source: published scannability and product-content research.*

**D2. ⚠ Complete the spec sheet for the category, at a consistent depth across similar products.** Cover three levels: basic functionality (what it is and does), feature highlights (what's special), and full product details (dimensions, weight, materials, care, compatibility, what's included). Keep detail depth and structure consistent across products of the same type. The description should also resolve anything ambiguous in the photos and expand on features the images show.
*Why:* insufficient product information is a documented top reason users leave a PDP to search elsewhere — often landing on a competitor or marketplace; inconsistent depth across a category makes thinner pages look untrustworthy rather than just unfinished.
*Violations:* furniture without dimensions in the buyer's local units; electronics without a compatibility list; apparel without fabric composition; one blender with 40 spec rows and its sibling with 6.
*Source: published product-information research.*

**D3. Answer category-specific anxieties in the description, not just features.** Fit guidance for apparel, assembly effort for furniture, battery life in real terms for electronics, ingredient concerns for beauty.
*Why:* the description's job is to remove the specific reasons this category's buyers hesitate.
*Violations:* copy-pasted manufacturer boilerplate; feature lists with no use context.
*Source: published product-content research; published CRO practice.*

**D4. On mobile, collapse — but never bury purchase-critical info.** Accordions are correct on mobile (see L3); shipping, returns, and fit info should be near the buy box or clearly labeled, not the last accordion after "About the brand".
*Why:* mobile users decide in the first two screen-heights; critical info at scroll position 9 effectively doesn't exist.
*Violations:* returns policy as the 8th accordion; auto-collapsed description with a 2-line preview that cuts mid-sentence.
*Source: published mobile commerce research.*

**D5. Include key differentiating features in the product headline — and mirror it in a unique `<title>` element.** "Ergonomic Task Chair — Adjustable Lumbar, Mesh Back, 300 lb Capacity" beats a bare model name. Avoid vague, misleading, or needlessly technical headlines. The page's `<title>` element should carry the same differentiating facts, be unique per product, keep the brand name concise at the end, and avoid boilerplate, keyword stuffing, and volatile data like prices.
*Why:* the headline is what users see in browser tabs, search results, comparison shopping, and screen readers — it must qualify the product on its own; jargon-only titles qualify nobody. Duplicated or stuffed title elements get rewritten by search engines, surrendering control of the store's first impression in results.
*Violations:* headline that is only an SKU/model code; marketing phrases with no product facts ("The Future of Comfort"); every product titled "Shop | BrandName"; "50% OFF TODAY" baked into the title element; keyword-stuffed titles written for crawlers, not people.
*Source: published product-naming and findability research; public search-engine documentation on title links.*

**D6. Consider a "product highlights" structure: image or graphic + short title + one-line benefit per key feature.** A scannable strip or stack of feature cards between the description and the full specs.
*Why:* highlights bridge the gap between the 5-second skim and the spec deep-dive — visual, titled, and ordered by importance.
*Violations:* highlight cards that repeat the title verbatim; decorative icons with no information; highlights hidden in a tab (see L2).
*Source: published product-content research.*

**D7. Keep the spec sheet trustworthy: repeat core attributes in both description and specs, define jargon labels, and never render empty rows.** For spec-driven products, the handful of decision-driving attributes appear in the prose and the table. Any spec label using industry terminology ("denier", "CRI", "IP rating") gets a plain-language definition or tooltip. Suppress rows whose values are missing rather than publishing blanks, and make sure values don't contradict each other or the title.
*Why:* researchers cross-check; a spec table with visible blanks or self-contradicting dimensions reads as "unfinished listing" and pushes the buyer to the manufacturer's site or a competitor.
*Violations:* "Motors: [blank]"; Length/Width transposed relative to the title; "IP67" with no explanation on a consumer product.
*Source: published product-information research; established spec-sheet practice (jargon definitions, empty-row suppression).*

**D8. Write PDP copy at a comfortable reading size and a general-audience reading level.** Body text (description, shipping/returns summaries, spec values) needs a reasonably large default size that respects browser text-size settings, and vocabulary simple enough for a broad audience — short words, short sentences, active voice. Reserve technical density for genuinely technical B2B specs.
*Why:* users read only a fraction of page text, and copy that is small or effortful gets skipped, not squinted at — the objection-handling content never does its job; legibility problems compound for older shoppers.
*Violations:* description set in 12px light-weight type; manufacturer copy full of internal jargon and 40-word sentences; fit notes in near-unreadable fine print; fixed font sizes that ignore browser settings.
*Source: published legibility and readability research.*

**D9. Surface genuine sustainability attributes and certifications visibly, with jargon explained.** Where products carry real eco/ethical attributes (certifications, recycled materials, recyclable packaging), present them as scannable labeled elements on the PDP rather than only on a corporate sustainability page — and define the certification terms. Keep claims genuine and specific: unverifiable green claims are a regulatory risk (see T4).
*Why:* a growing user segment filters purchases on these attributes and leaves to verify elsewhere when the PDP is silent; an unexplained leaf icon fails exactly the users the labels are for.
*Violations:* certifications listed only on a footer "About" page; a leaf icon with no label or explanation; sustainability claims in marketing prose with no named certification or specifics.
*Source: published sustainability-communication UX research.*

---

## Cross-sells (X)

**X1. Separate alternatives from complements, and place each where its decision stage happens.** Alternatives ("similar products", comparisons) serve users still deciding; complements ("goes with", accessories) serve users who have decided — never blur the two into one generic row.
*Why:* showing alternatives after the user has decided invites second-guessing; showing complements before they've decided is noise.
*Violations:* one generic "You may also like" row doing both jobs; alternatives in the cart drawer.
*Source: published cross-sell research.*

**X2. Never wedge cross-sells between the buy box and purchase-critical information.** Recommendations must not push shipping/returns/spec content below competitors' products.
*Why:* interrupting the decision path with exits is self-sabotage at the page's most valuable real estate.
*Violations:* recommendation carousel directly under ATC, above shipping info; ads/affiliate modules mid-buy-box.
*Source: published information-hierarchy research.*

**X3. Bundles and "complete the look" need low-friction adding and honest math.** Make adding the bundle easy, show a clear combined price, and display the real saving next to the individual-item total.
*Why:* bundles lift AOV only when adding them is easier than evaluating them; opaque bundle pricing reads as a trick.
*Violations:* "frequently bought together" requiring three separate adds; bundle "discount" equal to zero.
*Source: published CRO practice; marketplace pattern documentation.*

**X4. Provide "recently viewed" items.** A modest strip of the user's own browsing trail, kept out of the way of purchase-critical content.
*Why:* comparison shoppers loop between candidates; re-finding a previously viewed product through navigation or search is pure friction this strip removes.
*Violations:* no way back to compared products except the back button; recently-viewed placed above purchase-critical content (see X2).
*Source: published comparison-shopping research.*

**X5. For spec-driven categories, provide side-by-side comparison — desktop-first, ≤5 items, consistent attributes.** Electronics, appliances, and similar considered purchases warrant a compare feature (persistent selection tray + side-by-side table) or a curated comparison of the product line. Keep it to five items or fewer (2–3 on mobile, where adoption is minimal), keep headers visible while scrolling, use short comparable values, and define jargon rows. The failure mode is usually content, not layout: inconsistent or missing attribute data across products renders the table useless.
*Why:* buyers of multi-attribute products decide by weighing alternatives; without on-site comparison they assemble it in browser tabs or leave for a marketplace that does it for them — in testing, most users on spec-driven sites reach for comparison tools when available.
*Violations:* spec-heavy catalog with no comparison anywhere; compare checkboxes revealed only on hover; a table whose products have half-empty, non-matching attribute rows; 8+ columns unreadable on any screen.
*Source: published comparison-feature and comparison-table research.*

---

## Mobile & performance (M)

**M1. Tap targets ≥44×44px with breathing room.** Swatches, steppers, accordion headers, gallery controls.
*Why:* mis-taps on variant selection cause wrong orders; on ATC they cause rage-quits. Also a WCAG 2.2 requirement at 24px minimum (44px is the practical standard).
*Violations:* 8 color swatches at 24px in one row; accordion chevron as the only tap area.
*Source: WCAG 2.2 SC 2.5.8; Apple HIG and Material Design public guidelines.*

**M2. ⚠ Mobile first screen: image, title, price, rating, and reachable ATC within one scroll.** The buy decision toolkit shouldn't require exploration.
*Why:* mobile PDP bounce happens in seconds; if the first screen is a hero image and a cookie banner, the page has communicated nothing.
*Violations:* full-viewport gallery pushing price below fold; announcement bar + cookie banner + app banner consuming 40% of the viewport.
*Source: published mobile commerce research.*

**M3. No layout shift around the buy box.** Late-loading review widgets, BNPL banners, and personalization must not move the ATC button after render.
*Why:* CLS around the primary CTA causes misclicks and is a Core Web Vitals factor with documented conversion correlation.
*Violations:* ATC jumps when the reviews widget loads; sticky bar pops in and covers the tapped element.
*Source: Google public Core Web Vitals documentation; published performance–conversion studies.*

**M4. Sticky elements must not stack or obscure.** Sticky ATC + cookie banner + chat bubble + "back to top" competing for the bottom 30% of the screen is a common failure state.
*Why:* every sticky layer shrinks the actual page; overlapping stickies block taps on content and each other.
*Violations:* chat widget covering the sticky ATC; cookie banner that can't be dismissed pushing ATC off-screen.
*Source: published overlay-usability research; WCAG 2.2 (focus not obscured).*

**M5. ⚠ The PDP must load fast and respond fast — and the hero image must never be lazy-loaded.** Target "good" Core Web Vitals in field data (LCP ≤2.5s at the 75th percentile). The main product image is almost always the LCP element: keep it in the initial HTML with a real `src`/`srcset` (not injected by JS), give it high fetch priority, serve a modern compressed format, and exclude it from lazy-loading. Interaction latency matters too — variant selections and add-to-cart must respond visibly and quickly.
*Why:* speed has directly documented revenue impact in public case studies (double-digit sales lifts from LCP/INP improvements); conversion drop-off steepens sharply past a few seconds, and a variant tap with no visible response within half a second reads as broken.
*Violations:* hero image lazy-loaded or injected client-side so it paints seconds late; multi-megabyte unoptimized gallery images; variant taps that take >500ms to visibly respond; PDP failing "good" CWV thresholds in field data.
*Source: Google public performance documentation (web.dev) with published conversion case studies.*

---

## Trust, accessibility & page-level (T)

**T1. Trust signals near the point of commitment, proportional to brand recognition.** Payment logos, security mention, guarantee — subtle for known brands, explicit for unknown ones. Never fake badges. For durable goods, surface warranty/guarantee terms as concrete policy statements near the CTA ("2-year warranty", "30-day money-back guarantee") linked to the actual terms — a specific claim beats a decorative shield icon.
*Why:* "can I trust this site with my card" is answered before add-to-cart; unknown merchants that skip this lose the sale silently; a vague "quality guarantee" graphic with no terms behind it adds nothing and can even read as fake.
*Violations:* no payment methods shown anywhere pre-checkout on an unknown-brand store; self-awarded "trusted shop" graphics; warranty mentioned only inside a PDF manual; guarantee badge contradicted by the returns policy.
*Source: published trust-signal research.*

**T2. Breadcrumbs (or equivalent category path) on the PDP.** Users landing from search/ads need context and a lateral path to alternatives on your site rather than back to Google.
*Why:* the PDP is the most common entry page for paid/organic traffic; without upward navigation, the only exits are conversion or departure.
*Violations:* no breadcrumb on desktop; breadcrumb linking only to "Home".
*Source: published navigation research.*

**T3. ⚠ Accessibility baseline on the purchase path.** Text contrast ≥4.5:1 (including price and sale price), visible focus states on all buy-box controls, alt text on product images, labels on form controls, ATC operable by keyboard. Alt text must describe what each specific image shows (angle, color, context) — never one copy-pasted product title across the whole gallery, and never keyword strings.
*Why:* inaccessible buy boxes exclude real customers outright, and contrast failures on price/CTA hurt everyone in sunlight on a phone. Also legal exposure (ADA, European Accessibility Act — in force since June 2025 for ecommerce). Descriptive alt text serves screen-reader users and image-search discovery with the same work; keyword-stuffed alt attributes degrade both.
*Violations:* light-gray sale price on white; focus outline removed globally; swatches with no accessible name; all gallery images sharing one alt string; alt text written as a keyword list.
*Source: WCAG 2.2 AA (public standard); European Accessibility Act public documentation; public search-engine image documentation.*

**T4. No dark patterns.** No fake countdown timers, fabricated stock scarcity, forced continuity, pre-selected paid add-ons, or confirm-shaming. Genuine scarcity/urgency (real stock, real sale end) is fine and effective.
*Why:* fake urgency and sneaked-in fees measurably erode trust and repeat purchase, and regulators now act on them (FTC, EU consumer protection, published dark-pattern enforcement).
*Violations:* countdown that resets on refresh; "only 2 left" on every product; pre-ticked add-ons or paid "protection" bundled into the primary checkout action.
*Source: FTC and EU public enforcement guidance on dark patterns; published deceptive-design research.*

**T5. Structured data must match the visible page.** Product JSON-LD/microdata (price, availability, brand, images, return policy) must agree with what the page displays, and stay current.
*Why:* search engines surface this data directly in results and Shopping listings — markup promising "free returns" a merchant doesn't offer creates disappointed buyers, disputes, and Merchant Center policy risk; a mismatched brand or price undermines both SEO and trust.
*Violations:* `FreeReturn` markup alongside a customer-pays return policy; OEM/supplier name in the brand field instead of the displayed brand; markup listing 3 of 8 gallery images; stale price in markup after a sale ends.
*Source: public search-engine structured-data documentation; merchant-program policies.*

**T6. Navigating back from a PDP must return the user to their exact position in the product list.** Restore scroll position, loaded items, and applied filters; "load more" pagination needs history-state management so the browser back button lands users where they left off.
*Why:* comparison shoppers open many PDPs from one list; dumping them at the top after each one multiplies effort per candidate and causes direct abandonment — especially on mobile, where re-scrolling is slow. Complements G7 (back button within overlays); this covers the PDP-to-list leg.
*Violations:* back button returns to page 1 / top of the list; "load more" results lost on back navigation; filters reset when returning from a product.
*Source: published navigation and back-button-expectation research.*

**T7. ⚠ No full-page interstitials or entry popups on the PDP.** Email-capture modals, discount gates, and app-install overlays must not interrupt arriving shoppers; use a small dismissible banner or inline module instead, and ask for the email after the user has done something. Only legally required dialogs (cookie consent, age gates) are exempt — and even those shouldn't redirect off the page.
*Why:* usability research documents intense hostility to popups demanding commitment before the visitor has seen anything, and search engines both recommend against full-page interstitials as a conversion drag and treat intrusive interstitials as a negative ranking signal on mobile — a double cost on the page most often entered from search.
*Violations:* newsletter modal firing on first pageview or within seconds of scroll; stacked consecutive popups (cookie → discount → app-install); a discount gate with a hidden or shame-worded decline link; an overlay that redirects to a separate page.
*Source: published popup usability research; public search-engine guidance on intrusive interstitials.*

**T8. Support widgets (chat, AI assistants) help when invited and never interrupt.** Make chat reachable from the PDP — especially on high-consideration items — but never auto-open, auto-play sound, or push proactive messages over content (see M4 for placement). Automated assistants must identify themselves as bots, stay within honestly declared capabilities, keep conversation context across pages, and always offer a path to a human or async channel. Mine transcripts: any purchase-critical question asked repeatedly belongs answered on the page itself.
*Why:* at the moment a user is torn between two sizes, a 30-second answer is the difference between a sale and an exit — but users are actively alienated by bots posing as humans, looping failures, and dead ends; an unstaffed "live chat" that never answers is a trust hit worse than no chat.
*Violations:* chat auto-expanding over the buy box with a fake human persona; a bot answering product questions with confident wrong specs; no human escape hatch; the same fit question answered in chat daily while the PDP still omits it.
*Source: published chatbot and live-chat usability research; platform publisher guidance.*

---

## Using this file

During an audit, check each zone that exists on the page against its section, and check the Layout (L) guidelines against the page as a whole. Cite the guideline ID in each finding. Where a violation maps to a ⚠ guideline, consider Critical/High severity. Where the evidence is incomplete (screenshot-only audits especially), route the check to "Verify manually" rather than reporting a finding.
