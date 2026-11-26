import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// cache(): one Supabase client per request (never shared between requests/users)
export const createClient = cache(() => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component – middleware refreshes the session instead
          }
        },
      },
    }
  );
});

// One auth check per request, shared by the layout and the page
export const getUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) redirect('/login');
  return { supabase: createClient(), user };
});

// One profile query per request, shared by the layout and pages
export const getProfile = cache(async () => {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from('students')
    .select('full_name,department,academic_year')
    .eq('id', user.id)
    .single();
  return data;
});