import UploadForm, { type UploadInitial } from '@/components/UploadForm';
import { getProfile, requireUser } from '@/lib/supabase/server';
import type { Filters, SubjectRow } from '@/lib/types';

export default async function UploadPage({ searchParams }: { searchParams: Filters }) {
  const { supabase } = await requireUser();
  const me = await getProfile();

  const year = me?.academic_year ?? 1;
  let initial: UploadInitial = {
    department: me?.department ?? 'CSE',
    regulation: 'R23',
    academicYear: year,
    semester: year * 2 - 1,
    subject: '',
  };

  // "Upload for this subject" → /upload?subject=ID
  if (searchParams.subject) {
    const { data } = await supabase.from('subjects_view').select('*').eq('id', Number(searchParams.subject)).maybeSingle();
    if (data) {
      const s = data as SubjectRow;
      initial = { department: s.dept_code, regulation: s.reg_name, academicYear: s.academic_year, semester: s.semester, subject: s.name };
    }
  }

  return <UploadForm initial={initial} />;
}