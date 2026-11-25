'use server';

import { revalidatePath } from 'next/cache';
import { createClient, requireUser } from '@/lib/supabase/server';
import { FILE_TYPES, MAX_FILE_SIZE, REPORT_REASONS } from '@/lib/constants';
import { deleteObject, headObject } from '@/lib/b2';

type Scope = { department: string; regulation: string; academicYear: number; semester: number };
type SB = ReturnType<typeof createClient>;

// Find the subject for this scope + name (case-insensitive) or create it.
async function resolveSubject(supabase: SB, scope: Scope, rawName: string): Promise<{ id?: number; error?: string }> {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) return { error: 'Enter a valid subject name.' };

  const [d, g, y, s] = await Promise.all([
    supabase.from('departments').select('id').eq('code', scope.department).single(),
    supabase.from('regulations').select('id').eq('name', scope.regulation).single(),
    supabase.from('academic_years').select('id').eq('year', scope.academicYear).single(),
    supabase.from('semesters').select('id').eq('number', scope.semester).single(),
  ]);
  if (!d.data || !g.data || !y.data || !s.data) return { error: 'Invalid academic scope.' };

  const match = {
    department_id: d.data.id, regulation_id: g.data.id,
    academic_year_id: y.data.id, semester_id: s.data.id,
  };
  const escaped = name.replace(/[\\%_]/g, (m) => '\\' + m);
  const { data: existing } = await supabase.from('subjects').select('id').match(match).ilike('name', escaped).maybeSingle();
  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase.from('subjects').insert({ ...match, name }).select('id').single();
  if (error || !created) return { error: 'Could not create the subject.' };
  return { id: created.id };
}

export async function getSubjectNames(department: string, regulation: string, academicYear: number, semester: number) {
  const supabase = createClient();
  const { data } = await supabase
    .from('subjects_view').select('name')
    .eq('dept_code', department).eq('reg_name', regulation)
    .eq('academic_year', academicYear).eq('semester', semester).order('name');
  return (data ?? []).map((r: { name: string }) => r.name);
}

export async function createResource(input: {
  department: string; regulation: string; academicYear: number; semester: number;
  subjectName: string; typeSlug: string; title: string; description: string;
  storageKey: string; fileName: string; fileType: string;
}) {
  const { supabase, user } = await requireUser();

  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) return { ok: false, error: 'Enter a title (3–200 characters).' };
  if (!FILE_TYPES.includes(input.fileType)) return { ok: false, error: 'Unsupported file type.' };
  if (!input.storageKey.startsWith(`${user.id}/`)) return { ok: false, error: 'Invalid upload.' };

  // Verify the file really landed in B2 and check its real size
  const size = await headObject(input.storageKey);
  if (!size) return { ok: false, error: 'File was not found in storage. Please try again.' };
  if (size > MAX_FILE_SIZE) {
    await deleteObject(input.storageKey).catch(() => {});
    return { ok: false, error: 'File is larger than 25 MB.' };
  }

  const sub = await resolveSubject(supabase, input, input.subjectName);
  if (!sub.id) return { ok: false, error: sub.error };

  const { data: type } = await supabase.from('resource_types').select('id').eq('slug', input.typeSlug).single();
  if (!type) return { ok: false, error: 'Invalid resource type.' };

  const { data, error } = await supabase.from('resources').insert({
    subject_id: sub.id,
    resource_type_id: type.id,
    uploaded_by: user.id,
    title,
    description: input.description.trim() || null,
    file_name: input.fileName.slice(0, 200),
    file_size: size,
    file_type: input.fileType,
    storage_key: input.storageKey,
  }).select('id').single();

  if (error || !data) return { ok: false, error: 'Could not save the resource.' };
  revalidatePath('/', 'layout');
  return { ok: true, id: data.id as string };
}

export async function updateResource(input: {
  id: string; title: string; description: string; subjectName: string; typeSlug: string;
}) {
  const { supabase, user } = await requireUser();
  const title = input.title.trim();
  if (title.length < 3 || title.length > 200) return { ok: false, error: 'Enter a title (3–200 characters).' };

  const { data: cur } = await supabase
    .from('resources_view').select('dept_code,reg_name,academic_year,semester')
    .eq('id', input.id).eq('uploaded_by', user.id).maybeSingle();
  if (!cur) return { ok: false, error: 'Resource not found.' };

  const sub = await resolveSubject(
    supabase,
    { department: cur.dept_code, regulation: cur.reg_name, academicYear: cur.academic_year, semester: cur.semester },
    input.subjectName
  );
  if (!sub.id) return { ok: false, error: sub.error };

  const { data: type } = await supabase.from('resource_types').select('id').eq('slug', input.typeSlug).single();
  if (!type) return { ok: false, error: 'Invalid resource type.' };

  const { error } = await supabase.from('resources').update({
    title, description: input.description.trim() || null, subject_id: sub.id, resource_type_id: type.id,
  }).eq('id', input.id).eq('uploaded_by', user.id);

  if (error) return { ok: false, error: 'Could not update the resource.' };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteResource(id: string) {
  const { supabase, user } = await requireUser();
  const { data: r } = await supabase.from('resources').select('storage_key').eq('id', id).eq('uploaded_by', user.id).maybeSingle();
  if (!r) return { ok: false, error: 'Resource not found.' };

  const { error } = await supabase.from('resources').delete().eq('id', id).eq('uploaded_by', user.id);
  if (error) return { ok: false, error: 'Could not delete the resource.' };

  await deleteObject(r.storage_key).catch(() => {}); // file cleanup is best-effort
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function toggleBookmark(resourceId: string) {
  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase
    .from('bookmarks').select('id').eq('student_id', user.id).eq('resource_id', resourceId).maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    revalidatePath('/saved');
    return { ok: true, saved: false };
  }
  const { error } = await supabase.from('bookmarks').insert({ student_id: user.id, resource_id: resourceId });
  if (error) return { ok: false, error: 'Could not save this resource.' };
  revalidatePath('/saved');
  return { ok: true, saved: true };
}

export async function submitReport(input: { resourceId: string; reason: string; description: string }) {
  const { supabase, user } = await requireUser();
  if (!REPORT_REASONS.some((r) => r.value === input.reason)) return { ok: false, error: 'Select a reason.' };
  const { error } = await supabase.from('reports').insert({
    resource_id: input.resourceId,
    reported_by: user.id,
    reason: input.reason,
    description: input.description.trim().slice(0, 1000) || null,
  });
  if (error) return { ok: false, error: 'Could not submit the report.' };
  return { ok: true };
}