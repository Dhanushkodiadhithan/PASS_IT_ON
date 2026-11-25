import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';
import EmptyState from '@/components/EmptyState';
import ResourceCard from '@/components/ResourceCard';
import { RESOURCE_COLUMNS } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Resource } from '@/lib/types';

export default async function SavedPage() {
  const { supabase, user } = await requireUser();
  const { data: marks } = await supabase
    .from('bookmarks').select('resource_id').eq('student_id', user.id).order('created_at', { ascending: false });
  const ids = (marks ?? []).map((m: { resource_id: string }) => m.resource_id);

  let resources: Resource[] = [];
  if (ids.length) {
    const { data } = await supabase.from('resources_view').select(RESOURCE_COLUMNS).in('id', ids);
    const byId = new Map((data ?? []).map((r: Resource) => [r.id, r]));
    resources = ids.map((id: string) => byId.get(id)).filter(Boolean) as Resource[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-lg text-on-surface">Saved Resources</h2>
        <p className="text-body-md text-on-surface-variant">Quick access to the material you bookmarked.</p>
      </div>

      {resources.length === 0 ? (
        <EmptyState icon="bookmarks" title="No saved resources yet" text="Bookmark helpful notes and question papers while browsing." href="/browse" cta="Browse Resources" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <div key={r.id} className="relative">
              <ResourceCard r={r} saved />
              <div className="absolute top-3.5 right-5 hidden">
                <BookmarkButton resourceId={r.id} initialSaved variant="remove" />
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-label-sm text-on-surface-variant">
        Tip: click the filled bookmark on any card to remove it. <Link href="/browse" className="text-primary hover:underline">Find more</Link>
      </p>
    </div>
  );
}