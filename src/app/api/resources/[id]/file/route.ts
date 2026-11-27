import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MIME } from '@/lib/constants';
import { presignDownload } from '@/lib/b2';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Middleware already rejects unauthenticated /api calls, and RLS only returns rows to
  // logged-in students, so no separate getUser() round trip is needed here.
  const supabase = createClient();
  const preview = new URL(req.url).searchParams.get('mode') === 'preview';
  const { data: r } = await supabase
    .from('resources').select('storage_key,file_name,file_type').eq('id', params.id).maybeSingle();
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = await presignDownload(r.storage_key, r.file_name, preview, MIME[r.file_type]);
  const res = NextResponse.redirect(url);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}