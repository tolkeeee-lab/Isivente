import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Isivente Admin",
    short_name: "Isivente",
    description: "Tableau de bord et gestion des commandes Isivente",
    start_url: "/admin/orders",
    scope: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#1e293b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
