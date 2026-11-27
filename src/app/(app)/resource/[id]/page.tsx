import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookmarkButton from '@/components/BookmarkButton';
import Icon from '@/components/Icon';
import ReportButton from '@/components/ReportButton';
import ResourceCard from '@/components/ResourceCard';
import TypeBadge from '@/components/TypeBadge';
import { btnPrimary } from '@/components/ui';
import { fileIcon, formatBytes, formatDate, initials, yearLabel } from '@/lib/format';
import { RESOURCE_COLUMNS, getSavedIds } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';
import type { Resource } from '@/lib/types';

export default async function ResourcePage({ params }: { params: { id: string } }) {
   const { supabase, user } = await requireUser();
  const [{ data }, saved] = await Promise.all([
    supabase.from('resources_view').select(RESOURCE_COLUMNS).eq('id', params.id).maybeSingle(),
    getSavedIds(supabase, user.id),
  ]);
  if (!data) notFound();
  const r = data as Resource;

  const { data: rel } = await supabase
    .from('resources_view').select(RESOURCE_COLUMNS)
    .eq('subject_id', r.subject_id).neq('id', r.id).order('created_at', { ascending: false }).limit(3);
  const related = (rel ?? []) as Resource[];
  const icon = fileIcon(r.file_type);
  const fileUrl = `/api/resources/${r.id}/file`;

  const rows: [string, string][] = [
    ['Subject', r.subject_name],
    ['Department', r.dept_code],
    ['Regulation', r.reg_name],
    ['Academic Year', yearLabel(r.academic_year)],
    ['Semester', `Semester ${r.semester}`],
    ['Resource Type', r.type_name],
    ['Uploaded By', r.uploader_name],
    ['Upload Date', formatDate(r.created_at)],
    ['File Type', r.file_type.toUpperCase()],
    ['File Size', formatBytes(r.file_size)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-on-surface-variant text-label-md flex-wrap">
        <Link href="/" className="hover:text-primary">Home</Link> /
        <Link href={`/browse?dept=${r.dept_code}`} className="hover:text-primary">{r.dept_code}</Link> /
        <Link href={`/subject/${r.subject_id}`} className="hover:text-primary">{r.subject_name}</Link> /
        <span className="text-on-surface font-semibold truncate max-w-xs">{r.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white border border-outline-variant/30 rounded-2xl shadow-sm">
        <div className="space-y-1 min-w-0">
          <TypeBadge slug={r.type_slug} />
          <h2 className="text-headline-lg text-on-surface">{r.title}</h2>
          {r.description && <p className="text-body-sm text-on-surface-variant">{r.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a href={`${fileUrl}?mode=download`} className={btnPrimary}>
            <Icon name="download" /> Download ({formatBytes(r.file_size)})
          </a>
          <BookmarkButton resourceId={r.id} initialSaved={saved.has(r.id)} variant="full" />
          <ReportButton resourceId={r.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="p-5 bg-white border border-outline-variant/30 rounded-xl space-y-3">
            <h3 className="text-headline-sm text-on-surface border-b border-outline-variant/20 pb-2">Resource Details</h3>
            <dl className="text-body-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                  <dt className="text-on-surface-variant">{k}</dt>
                  <dd className="font-semibold text-on-surface text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center text-title-md">{initials(r.uploader_name)}</div>
            <div>
              <h4 className="text-title-md text-on-surface">{r.uploader_name}</h4>
              <p className="text-body-sm text-on-surface-variant">Contributor</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {r.file_type === 'pdf' ? (
            <iframe src={`${fileUrl}?mode=preview`} title="PDF preview" className="w-full h-[640px] rounded-xl border border-outline-variant/40 bg-white" />
          ) : r.file_type === 'jpg' || r.file_type === 'png' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${fileUrl}?mode=preview`} alt={r.title} className="w-full rounded-xl border border-outline-variant/40" />
          ) : (
            <div className="min-h-[320px] bg-white border border-dashed border-outline-variant/50 rounded-xl flex flex-col items-center justify-center gap-3 text-center p-8">
              <Icon name={icon.name} size={48} className={icon.color} />
              <p className="text-body-md text-on-surface-variant">Preview isn’t available for {r.file_type.toUpperCase()} files. Download it to view.</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-4 pt-2">
          <h3 className="text-headline-sm text-on-surface">Related Resources from this Subject</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((x) => <ResourceCard key={x.id} r={x} saved={saved.has(x.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}