import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import FilterPanel from '@/components/FilterPanel';
import Icon from '@/components/Icon';
import ResourceCard from '@/components/ResourceCard';
import { btnPrimary } from '@/components/ui';
import { yearLabel } from '@/lib/format';
import { RESOURCE_COLUMNS, applyResourceFilters, getSavedIds } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Filters, Resource } from '@/lib/types';

export default async function BrowsePage({ searchParams }: { searchParams: Filters }) {
  const { supabase, user } = await requireUser();
  const sp = searchParams;

  const resourcesQ = applyResourceFilters(
    supabase.from('resources_view').select(RESOURCE_COLUMNS, { count: 'exact' }).order('created_at', { ascending: false }).limit(60),
    sp
  );
  const subjectsQ = applyResourceFilters(
    supabase.from('subjects_view').select('id,name').order('name'),
    { dept: sp.dept, reg: sp.reg, year: sp.year, sem: sp.sem }
  );

  const [{ data, count }, { data: subjects }, saved] = await Promise.all([resourcesQ, subjectsQ, getSavedIds(supabase, user.id)]);
  const resources = (data ?? []) as Resource[];
  const subjectList = (subjects ?? []) as { id: number; name: string }[];
  const subjectName = sp.subject ? subjectList.find((s) => String(s.id) === sp.subject)?.name : undefined;

  const crumbs = [sp.dept, sp.reg, sp.year && yearLabel(Number(sp.year)), sp.sem && `Semester ${sp.sem}`, subjectName].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-on-surface-variant text-label-md flex-wrap">
        <Link href="/" className="hover:text-primary">Home</Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">/ <span className={i === crumbs.length - 1 ? 'text-on-surface font-semibold' : ''}>{c}</span></span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">Browse Academic Resources</h2>
          <p className="text-body-md text-on-surface-variant">
            {count ?? resources.length} resource{(count ?? resources.length) === 1 ? '' : 's'} found
            {sp.subject && <> · <Link href={`/subject/${sp.subject}`} className="text-primary hover:underline">Open subject page</Link></>}
          </p>
        </div>
        <Link href="/upload" className={btnPrimary}><Icon name="upload" size={18} /> Upload</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <FilterPanel subjects={subjectList} />
        <div className="lg:col-span-3">
          {resources.length === 0 ? (
            <EmptyState icon="folder_off" title="No resources found for this selection yet" text="Be the first student hero to upload material for it!" href="/upload" cta="Upload Resource" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((r) => <ResourceCard key={r.id} r={r} saved={saved.has(r.id)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}