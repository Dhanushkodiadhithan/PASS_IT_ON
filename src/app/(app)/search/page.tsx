import EmptyState from '@/components/EmptyState';
import FilterPanel from '@/components/FilterPanel';
import ResourceCard from '@/components/ResourceCard';
import SearchBar from '@/components/SearchBar';
import { RESOURCE_COLUMNS, applyResourceFilters, getSavedIds } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Filters, Resource } from '@/lib/types';

export default async function SearchPage({ searchParams }: { searchParams: Filters }) {
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

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-4">
        <div>
          <span className="text-label-sm text-primary uppercase tracking-wider">Search Resources</span>
          <h2 className="text-headline-lg text-on-surface mt-0.5">
            {sp.q ? <>Results for <span className="text-primary">“{sp.q}”</span></> : 'All resources'}
          </h2>
          <p className="text-body-sm text-on-surface-variant mt-1">{count ?? resources.length} resource{(count ?? resources.length) === 1 ? '' : 's'} found</p>
        </div>
        <SearchBar defaultValue={sp.q ?? ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <FilterPanel subjects={(subjects ?? []) as { id: number; name: string }[]} />
        <div className="lg:col-span-3">
          {resources.length === 0 ? (
            <EmptyState icon="manage_search" title="No results found." text="Try broader terms, or clear some filters." href="/upload" cta="Upload Material" />
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