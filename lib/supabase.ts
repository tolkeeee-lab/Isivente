import { createBrowserClient } from "@supabase/ssr";

const defaultUrl = "https://uelognqedzqtvupwzejh.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : defaultUrl;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : defaultKey;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


