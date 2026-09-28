export function getUserDataFromStorage() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("isivente_leads_abandoned");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Prendre le lead le plus récent pour avoir les infos client (s'il existe)
        const recent = parsed.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
        if (recent) {
          const nameParts = (recent.customer_name || "").trim().split(/\s+/);
          return {
            phone: recent.customer_phone,
            first_name: nameParts[0] || undefined,
            last_name: nameParts.slice(1).join(" ") || undefined,
            city: recent.city,
            country: "bj",
          };
        }
      }
    }
  } catch (e) {}

  return {};
}
