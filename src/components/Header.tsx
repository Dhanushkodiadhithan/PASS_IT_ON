'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Icon from './Icon';
import { logout } from '@/actions/auth';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/upload', label: 'Upload' },
  { href: '/my-uploads', label: 'My Uploads' },
  { href: '/saved', label: 'Saved' },
  { href: '/profile', label: 'Profile' },
];

export default function Header({ showNav = true, initials = '' }: { showNav?: boolean; initials?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const cls = (a: boolean) =>
    `px-3 py-1.5 rounded-lg text-title-md whitespace-nowrap transition-colors ${
      a ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="justify-self-start hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-label-sm">
            Campus Peer Network
          </div>
          <div className="col-start-2 text-center">
            <h1 className="text-headline-sm font-bold text-primary tracking-tight">PassItOn</h1>
            <p className="text-label-sm text-on-surface-variant">Share. Learn. Pass It On.</p>
          </div>
          <div className="col-start-3 justify-self-end flex items-center gap-3">
            {showNav && initials && (
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-md">
                {initials}
              </div>
            )}
            {showNav && (
              <button
                aria-label="Toggle navigation menu"
                onClick={() => setOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
              >
                <Icon name={open ? 'close' : 'menu'} />
              </button>
            )}
          </div>
        </div>

        {showNav && (
          <nav className="hidden lg:flex items-center justify-center gap-1 pb-3 pt-1 border-t border-outline-variant/20">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={cls(isActive(l.href))}>{l.label}</Link>
            ))}
            <form action={logout}>
              <button type="submit" className={cls(false)}>Logout</button>
            </form>
          </nav>
        )}
      </div>

      {showNav && open && (
        <nav className="lg:hidden bg-white border-t border-outline-variant/30 px-4 py-4 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cls(isActive(l.href))}>
              {l.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className={`${cls(false)} w-full text-left`}>Logout</button>
          </form>
        </nav>
      )}
    </header>
  );
}