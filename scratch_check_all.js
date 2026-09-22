const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const parts = line.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  if (k && v) env[k] = v;
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function checkAll() {
  // Check orders table without filters
  const { data: allOrders, error: err1 } = await supabase.from('orders').select('*');
  console.log('Total in orders table:', allOrders?.length, 'error:', err1);
  console.log(allOrders);

  // Check if any deleted or status
  const { data: sessions } = await supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(10);
  console.log('Recent sessions count:', sessions?.length);
  if (sessions) {
    sessions.forEach(s => console.log('Session:', s.product_slug, s.created_at, s.is_order_clicked));
  }
}

checkAll();
