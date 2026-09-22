import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uelognqedzqtvupwzejh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
