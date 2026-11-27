import Link from 'next/link';
import Icon from './Icon';
import TypeBadge from './TypeBadge';
import BookmarkButton from './BookmarkButton';
import { fileIcon, formatBytes, initials, timeAgo } from '@/lib/format';
import type { Resource } from '@/lib/types';

export default function ResourceCard({ r, saved }: { r: Resource; saved: boolean }) {
  const icon = fileIcon(r.file_type);
  return (
    <div className="p-5 bg-white border cursor-pointer border-outline-variant/30 rounded-xl hover:border-primary/50 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <TypeBadge slug={r.type_slug} />
          <span className="text-on-surface-variant text-label-sm">{timeAgo(r.created_at)}</span>
        </div>
        <Link href={`/resource/${r.id}`} className="text-title-md text-on-surface hover:text-primary line-clamp-2 block">
          {r.title}
        </Link>
        <Link href={`/subject/${r.subject_id}`} className="text-body-sm text-on-surface-variant hover:text-primary mt-1 block">
          {r.subject_name} • {r.dept_code} {r.reg_name} • Sem {r.semester}
        </Link>
        <div className="mt-3 flex items-center gap-2 text-on-surface-variant text-body-sm">
          <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary text-[11px]">
            {initials(r.uploader_name)}
          </div>
          <span className="truncate">Uploaded by {r.uploader_name}</span>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-on-surface-variant text-body-sm">
          <Icon name={icon.name} size={18} className={icon.color} />
          <span className="uppercase">{r.file_type}</span>
          <span>• {formatBytes(r.file_size)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookmarkButton resourceId={r.id} initialSaved={saved} />
          <Link href={`/resource/${r.id}`} className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-label-md transition">
            Preview
          </Link>
          {/* plain <a>: the API route redirects to a short-lived B2 link */}
          <a
            href={`/api/resources/${r.id}/file?mode=download`}
            title="Download"
            className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary transition flex items-center"
          >
            <Icon name="download" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}