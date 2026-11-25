import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { requireUser } from '@/lib/supabase/server';
import { initials } from '@/lib/format';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: me } = await supabase.from('students').select('full_name').eq('id', user.id).single();

  return (
    <>
      <Header showNav initials={initials(me?.full_name ?? user.email ?? 'S')} />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">{children}</main>
      <Footer />
    </>
  );
}