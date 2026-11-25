import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MIME } from '@/lib/constants';
import { presignDownload } from '@/lib/b2';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const preview = new URL(req.url).searchParams.get('mode') === 'preview';
  const { data: r } = await supabase
    .from('resources').select('storage_key,file_name,file_type').eq('id', params.id).maybeSingle();
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = await presignDownload(r.storage_key, r.file_name, preview, MIME[r.file_type]);
  const res = NextResponse.redirect(url);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}