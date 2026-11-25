import { typeBySlug } from '@/lib/constants';

export default function TypeBadge({ slug }: { slug: string }) {
  const t = typeBySlug(slug);
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-label-sm ${t?.badge ?? 'bg-surface-container text-primary'}`}>
      {t?.short ?? slug}
    </span>
  );
}