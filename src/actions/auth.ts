'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEPARTMENTS } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function login(fd: FormData) {
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  if (!email || !password) return { ok: false, error: 'Enter your email and password.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: 'Invalid email or password.' };
  return { ok: true };
}

export async function signup(fd: FormData) {
  const fullName = String(fd.get('fullName') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const password = String(fd.get('password') ?? '');
  const department = String(fd.get('department') ?? '');
  const academicYear = Number(fd.get('academicYear'));

  if (fullName.length < 2) return { ok: false, error: 'Enter your full name.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!DEPARTMENTS.some((d) => d.code === department)) return { ok: false, error: 'Select a department.' };
  if (![1, 2, 3, 4].includes(academicYear)) return { ok: false, error: 'Select your academic year.' };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { full_name: fullName, department, academic_year: academicYear },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, verified: !!data.session };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
export async function updateAcademicYear(year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };
  if (![1, 2, 3, 4].includes(year)) return { ok: false, error: 'Select a valid academic year.' };

  const { data, error } = await supabase
    .from('students').update({ academic_year: year }).eq('id', user.id).select('id');
  if (error || !data?.length) return { ok: false, error: 'Could not update your academic year.' };

  revalidatePath('/', 'layout');
  return { ok: true };
}