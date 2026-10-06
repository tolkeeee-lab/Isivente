# SYSTEM INSTRUCTIONS FOR AGENTS (ISIVENTE)

## Core Directive: Fast & Premium Landing Page Creation

When asked to create or modify a Landing Page for Isivente, you must follow this blueprint strictly to ensure zero wasted time and a high-converting, premium output.

### 1. Structure & Layout (The Blueprint)
*   **Do NOT invent from scratch.** Always copy the structural layout and state management from the best converting page: \`components/features/UmeiLanding.tsx\`.
*   **Order Form Placement:** The \`UmeiStyleOrderSection\` MUST be placed directly below the Hero section (carousel) and Trust Badges. It should never be hidden at the bottom of the page.
*   **Hero Carousel:** Must implement auto-play logic using a React \`useEffect\` with a \`setInterval\` (e.g., 3500ms) to ensure dynamic presentation.
*   **Testimonials:** If the user provides images for testimonials (e.g., screenshots of WhatsApp messages or reviews), display **only** the images in a clean grid/carousel. Do NOT add redundant text elements beneath them.
*   **Body Content:** Ensure the page has substance. Add a "Comment ça marche" (How it works) or "Pourquoi choisir ce produit" section to educate the buyer.

### 2. Form & State Management (UmeiStyleOrderSection)
*   Always manage the order state (customerName, customerPhone, city, address, selectedBundle) in the parent Landing Page component.
*   Pass these states down to \`<UmeiStyleOrderSection>\`.
*   The \`onSubmit\` function must:
    1. Construct the \`finalOrder\` object.
    2. Call \`await saveNewOrder(finalOrder)\`.
    3. Trigger \`trackPurchase\` with the correct values.
    4. Call \`await markLeadConverted(customerPhone, PRODUCT_SLUG)\`.
    5. Redirect to the localized success page: \`router.push('/p/\${PRODUCT_SLUG}/success?name=...&orderId=...')\`.

### 3. Tracking & Hooks
*   **Page Presence:** Call \`usePagePresence(PRODUCT_SLUG)\`.
*   **ViewContent:** Trigger \`trackMultiViewContent\` (or \`trackViewContent\`) via an empty dependency array \`useEffect\` on mount.
*   **UTM Tags:** Call \`const utm = useUTM();\` and pass it into the \`finalOrder.extraData.utm\`.

### 4. Routing (Crucial Step)
*   Whenever a new Landing Page component is created (e.g., \`components/features/NewProductLanding.tsx\`), it **must** be connected to the router.
*   Open \`app/p/[slug]/page.tsx\`.
*   Add the slug to the \`generateStaticParams\` array.
*   Import the component and add a \`case "new-slug": return <NewProductLanding />;\` inside the \`switch (normalizedSlug)\` statement.
*   If you skip this step, the user will see a 404 or a generic fallback page.

### 5. Playwright Testing Avoidance
*   Do NOT waste time writing complex Playwright verification scripts unless explicitly asked to verify a specific edge case. If structural changes are made, verify them via code review rather than flaky E2E tests that consume excessive generation time.

## Recommended Codebase Improvements (Future Roadmap)
*   **Universal Template Engine:** Abstract the layout of \`UmeiLanding\` into a true \`<LandingTemplate>\` component that accepts a JSON configuration. This would eliminate code duplication across the 15+ product pages.
*   **Next/Image Optimization:** Standardize width/height props for all testimonial and product images to prevent cumulative layout shifts (CLS) on mobile devices.
