/**
 * Quick script to list all clients from Supabase
 * Run: cd apps/arugami-dashboard && npx tsx scripts/list-clients.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  const content = readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex);
    let value = trimmed.slice(eqIndex + 1);

    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

async function listClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing SUPABASE env vars');
    console.log('URL:', url ? 'set' : 'missing');
    console.log('KEY:', key ? 'set' : 'missing');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('clients')
    .select('client_id, business_name, slug, status, billing_tier, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('\n=== SUPABASE CLIENTS ===\n');

  if (!data || data.length === 0) {
    console.log('No clients found in Supabase.');
    console.log('\nYou may need to create clients in Supabase first.');
    return;
  }

  for (const client of data) {
    console.log(`${client.business_name} (${client.slug})`);
    console.log(`  client_id: ${client.client_id}`);
    console.log(`  status: ${client.status}, tier: ${client.billing_tier}`);
    console.log(`  created: ${client.created_at}`);
    console.log('');
  }

  console.log(`Total: ${data.length} client(s)`);
}

listClients().catch(console.error);
