
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { RESOURCE_COLUMNS, applyResourceFilters } from './queries';
import type { Filters, Resource } from './types';

// Service-role client: server-only, used ONLY for data every logged-in student can already read.
const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const pick = (f: Filters): Filters => ({
  dept: f.dept, reg: f.reg, year: f.year, sem: f.sem, subject: f.subject, type: f.type, ftype: f.ftype,
});

async function fetchResources(f: Filters) {
  const { data, count } = await applyResourceFilters(
    admin().from('resources_view').select(RESOURCE_COLUMNS, { count: 'exact' }).order('created_at', { ascending: false }).limit(60),
    f
  );
  return { rows: (data ?? []) as Resource[], count: (count ?? 0) as number };
}

async function fetchSubjects(f: Filters) {
  const { data } = await applyResourceFilters(admin().from('subjects_view').select('id,name').order('name'), {
    dept: f.dept, reg: f.reg, year: f.year, sem: f.sem,
  });
  return (data ?? []) as { id: number; name: string }[];
}

// Cleared immediately by revalidateTag('resources') on upload / edit / delete; 2 min safety net
const cachedResources = unstable_cache(fetchResources, ['resources-list'], { revalidate: 120, tags: ['resources'] });
const cachedSubjects = unstable_cache(fetchSubjects, ['subjects-list'], { revalidate: 120, tags: ['resources'] });

export const listResources = (f: Filters) => (f.q ? fetchResources({ ...pick(f), q: f.q }) : cachedResources(pick(f)));
export const listSubjects = (f: Filters) => cachedSubjects(pick(f));
export const getRecentResources = async () => (await cachedResources({})).rows.slice(0, 6);