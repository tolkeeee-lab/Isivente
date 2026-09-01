import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase n'est pas configuré, laisser passer toutes les requêtes
  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl === "YOUR_SUPABASE_URL" ||
    supabaseUrl.includes("placeholder") ||
    supabaseKey === "YOUR_SUPABASE_ANON_KEY" ||
    supabaseKey === "placeholder-key"
  ) {
    return NextResponse.next();
  }

  // API routes publiques — toujours laisser passer
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Pages produit publiques — toujours laisser passer
  if (request.nextUrl.pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect /login to /admin if already logged in
    if (request.nextUrl.pathname === "/login" && user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } catch (err) {
    // Si erreur Supabase, laisser passer (mode dégradé)
    console.warn("Middleware Supabase error, allowing request:", err);
    return NextResponse.next();
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
