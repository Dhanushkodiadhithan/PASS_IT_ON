import Link from 'next/link';
import Icon from '@/components/Icon';
import SearchBar from '@/components/SearchBar';
import ResourceCard from '@/components/ResourceCard';
import { btnPrimary } from '@/components/ui';
import { DEPARTMENTS, RESOURCE_TYPES } from '@/lib/constants';
import { getRecentResources } from '@/lib/cache';
import { getSavedIds } from '@/lib/queries';
import { requireUser } from '@/lib/supabase/server';

export default async function HomePage() {
  const { supabase, user } = await requireUser();
  const [recent, saved] = await Promise.all([getRecentResources(), getSavedIds(supabase, user.id)]);

  return (
    <div className="space-y-8">
      <div className="relative rounded-2xl bg-gradient-to-br from-primary via-primary-container to-secondary p-8 sm:p-10 text-on-primary overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-label-sm">
            <Icon name="verified" size={16} /> Verified Campus Academic Repository
          </div>
          <h2 className="text-display-mobile sm:text-display">Welcome to PassItOn</h2>
          <p className="text-body-lg text-on-primary/90 max-w-2xl">
            Your campus hub for peer-shared notes, lab material, and previous year question papers.
          </p>
          <div className="pt-2 max-w-2xl text-on-surface"><SearchBar /></div>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Icon name="auto_stories" size={280} />
        </div>
      </div>

      <section>
        <h3 className="text-headline-sm text-on-surface mb-4">Browse by Resource Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {RESOURCE_TYPES.map((t) => (
            <Link key={t.slug} href={`/browse?type=${t.slug}`} className="flex flex-col items-start p-4 rounded-xl bg-surface-container-low hover:bg-surface-container hover:shadow-md border border-outline-variant/20 transition-all group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${t.tile}`}>
                <Icon name={t.icon} size={22} />
              </div>
              <span className="text-title-md text-on-surface">{t.name}</span>
              <span className="text-body-sm text-on-surface-variant mt-0.5">{t.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-headline-sm text-on-surface mb-4">Browse by Department</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEPARTMENTS.map((d) => (
            <Link key={d.code} href={`/browse?dept=${d.code}`} className="p-3.5 bg-white border border-outline-variant/30 hover:border-primary rounded-xl text-center transition">
              <span className="text-title-md text-primary">{d.code}</span>
              <p className="text-body-sm text-on-surface-variant mt-0.5">{d.short}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm text-on-surface">Recently Uploaded</h3>
          <Link href="/browse" className="text-primary hover:underline text-label-md">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Nothing uploaded yet — be the first to share something!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((r) => <ResourceCard key={r.id} r={r} saved={saved.has(r.id)} />)}
          </div>
        )}
      </section>
    </div>
  );
}