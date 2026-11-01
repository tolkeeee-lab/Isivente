export function getUserDataFromStorage() {
  if (typeof window === "undefined") return {};
  const result: Record<string, any> = {
    country: "bj",
  };

  try {
    const fbc = localStorage.getItem("isivente_fbc");
    const fbp = localStorage.getItem("isivente_fbp");
    if (fbc) result.fbc = fbc;
    if (fbp) result.fbp = fbp;

    const raw = localStorage.getItem("isivente_leads_abandoned");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const recent = parsed.sort(
          (a: any, b: any) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];
        if (recent) {
          const nameParts = (recent.customer_name || "").trim().split(/\s+/);
          result.phone = recent.customer_phone;
          result.first_name = nameParts[0] || undefined;
          result.last_name = nameParts.slice(1).join(" ") || undefined;
          result.city = recent.city || "Cotonou";
        }
      }
    }
  } catch (e) {}

  return result;
}
