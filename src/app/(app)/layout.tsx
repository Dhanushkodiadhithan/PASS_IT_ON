import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getProfile, requireUser } from '@/lib/supabase/server';
import { initials } from '@/lib/format';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const me = await getProfile();

  return (
    <div className="app-shell">
      <Header showNav initials={initials(me?.full_name ?? user.email ?? 'S')} />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 py-4 w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}