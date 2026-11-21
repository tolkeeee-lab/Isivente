import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Isivente",
    short_name: "Isivente",
    description: "Plateforme e-commerce Paiement à la Livraison (COD) en Afrique",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#F8F5EE",
    theme_color: "#14281D",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
