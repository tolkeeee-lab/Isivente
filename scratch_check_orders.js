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

async function check() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  console.log('Total orders in Supabase:', data ? data.length : 0);
  if (data) {
    data.forEach((o, i) => {
      console.log(`[${i + 1}] CMD: ${o.order_number} | Client: ${o.customer_name} | Tel: ${o.customer_phone} | Montant: ${o.total_amount} | Date: ${o.created_at} | Statut: ${o.status}`);
    });
  }
  if (error) console.error('Supabase Error:', error);
}

check();
