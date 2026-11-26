import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import ResourceCard from '@/components/ResourceCard';
import { btnPrimary } from '@/components/ui';
import { RESOURCE_TYPES } from '@/lib/constants';
import { yearLabel } from '@/lib/format';
import { RESOURCE_COLUMNS, getSavedIds } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Resource, SubjectRow } from '@/lib/types';

export default async function SubjectPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
const [{ data: subject }, { data }, saved] = await Promise.all([
    supabase.from('subjects_view').select('*').eq('id', id).maybeSingle(),
    supabase.from('resources_view').select(RESOURCE_COLUMNS).eq('subject_id', id).order('created_at', { ascending: false }),
    getSavedIds(supabase, user.id),
  ]);
  if (!subject) notFound();
  const s = subject as SubjectRow;
  const resources = (data ?? []) as Resource[];
  const semLink = `/browse?dept=${s.dept_code}&reg=${s.reg_name}&year=${s.academic_year}&sem=${s.semester}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-on-surface-variant text-label-md flex-wrap">
        <Link href="/" className="hover:text-primary">Home</Link> /
        <Link href={`/browse?dept=${s.dept_code}`} className="hover:text-primary">{s.dept_code}</Link> /
        <Link href={semLink} className="hover:text-primary">Semester {s.semester}</Link> /
        <span className="text-on-surface font-semibold">{s.name}</span>
      </div>

      <div className="p-6 sm:p-8 bg-white border border-outline-variant/30 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">{s.name}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-on-surface-variant text-label-md mt-2">
            <span>Department: <strong className="text-on-surface">{s.dept_code}</strong></span>•
            <span>Regulation: <strong className="text-on-surface">{s.reg_name}</strong></span>•
            <span>{yearLabel(s.academic_year)}</span>•
            <span>Semester {s.semester}</span>
          </div>
        </div>
        <Link href={`/upload?subject=${s.id}`} className={`${btnPrimary} shrink-0`}><Icon name="add" size={18} /> Upload for this subject</Link>
      </div>

      {RESOURCE_TYPES.map((t) => {
        const items = resources.filter((r) => r.type_slug === t.slug);
        return (
          <section key={t.slug} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.tile}`}><Icon name={t.icon} size={18} /></span>
                {t.name}
              </h3>
              <span className="text-on-surface-variant text-label-md">{items.length} file{items.length === 1 ? '' : 's'}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant px-1">Nothing here yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((r) => <ResourceCard key={r.id} r={r} saved={saved.has(r.id)} />)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}