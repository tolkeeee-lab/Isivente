import { createBrowserClient } from "@supabase/ssr";

const defaultUrl = "https://biiqpaobegdukcbbskfz.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaXFwYW9iZWdkdWtjYmJza2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU3MDIsImV4cCI6MjA5NzkxMTcwMn0.KEJI5mDjoVwA5aNJypa9DQ_3YCUPQebM6bYZ8gWICvY";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "YOUR_SUPABASE_URL"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : defaultUrl;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : defaultKey;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

