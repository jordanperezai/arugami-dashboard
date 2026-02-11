import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: clients, error } = await supabase
      .from('clients')
      .select('client_id, business_name, slug')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      dbConnected: true,
      sampleClient: clients && clients.length > 0 ? clients[0] : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
