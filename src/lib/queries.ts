import type { Filters } from './types';
import type { createClient } from './supabase/server';

export const RESOURCE_COLUMNS =
  'id,title,description,file_name,file_size,file_type,created_at,uploaded_by,uploader_name,subject_id,subject_name,dept_code,reg_name,academic_year,semester,type_slug,type_name';

const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : -1);

// Works on both resources_view and subjects_view (same column names)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyResourceFilters(query: any, f: Filters) {
  if (f.dept) query = query.eq('dept_code', f.dept);
  if (f.reg) query = query.eq('reg_name', f.reg);
  if (f.year) query = query.eq('academic_year', num(f.year));
  if (f.sem) query = query.eq('semester', num(f.sem));
  if (f.subject) query = query.eq('subject_id', num(f.subject));
  if (f.type) query = query.eq('type_slug', f.type);
  if (f.ftype) query = query.eq('file_type', f.ftype);
  if (f.q) {
    const q = f.q.replace(/[%,()*\\]/g, ' ').trim();
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,subject_name.ilike.%${q}%,uploader_name.ilike.%${q}%`
      );
    }
  }
  return query;
}

export async function getSavedIds(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase.from('bookmarks').select('resource_id').eq('student_id', userId);
  return new Set<string>((data ?? []).map((b: { resource_id: string }) => b.resource_id));
}