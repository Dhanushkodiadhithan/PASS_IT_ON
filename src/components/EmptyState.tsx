import Link from 'next/link';
import Icon from './Icon';
import { btnPrimary } from './ui';

export default function EmptyState({
  icon, title, text, href, cta,
}: { icon: string; title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="py-16 px-6 bg-white border border-dashed border-outline-variant/50 rounded-2xl text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary">
        <Icon name={icon} size={32} />
      </div>
      <div className="max-w-md mx-auto">
        <h3 className="text-headline-sm text-on-surface">{title}</h3>
        {text && <p className="text-body-sm text-on-surface-variant mt-1">{text}</p>}
      </div>
      {href && cta && <Link href={href} className={btnPrimary}>{cta}</Link>}
    </div>
  );
}