import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import MyUploadsTable from '@/components/MyUploadsTable';
import { btnPrimary } from '@/components/ui';
import { RESOURCE_COLUMNS } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Resource } from '@/lib/types';

export default async function MyUploadsPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from('resources_view').select(RESOURCE_COLUMNS).eq('uploaded_by', user.id).order('created_at', { ascending: false });
  const rows = (data ?? []) as Resource[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-lg text-on-surface">My Uploads</h2>
          <p className="text-body-md text-on-surface-variant">Manage the resources you have passed on.</p>
        </div>
        <Link href="/upload" className={btnPrimary}><Icon name="add" size={18} /> Upload New</Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="cloud_off" title="You have not uploaded any resources yet." text="Your contributions help future batches revise efficiently." href="/upload" cta="Upload Your First Resource" />
      ) : (
        <MyUploadsTable rows={rows} />
      )}
    </div>
  );
}