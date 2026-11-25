import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FILE_TYPES, MAX_FILE_SIZE, MIME, normalizeExt } from '@/lib/constants';
import { presignUpload } from '@/lib/b2';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { fileName, fileSize } = await req.json();
  const ext = normalizeExt(String(fileName ?? ''));
  if (!FILE_TYPES.includes(ext)) return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  if (!(fileSize > 0) || fileSize > MAX_FILE_SIZE) return NextResponse.json({ error: 'File must be 25 MB or smaller.' }, { status: 400 });

  const storageKey = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const contentType = MIME[ext];
  const uploadUrl = await presignUpload(storageKey, contentType);
  return NextResponse.json({ uploadUrl, storageKey, contentType });
}