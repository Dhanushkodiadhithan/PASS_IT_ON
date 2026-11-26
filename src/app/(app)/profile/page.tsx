import Icon from '@/components/Icon';
import ProfileForm from '@/components/ProfileForm';
import { btnSecondary } from '@/components/ui';
import { logout } from '@/actions/auth';
import { initials, yearLabel } from '@/lib/format';
import { getProfile, requireUser } from '@/lib/supabase/server';


export default async function ProfilePage() {
  const { user } = await requireUser();
  const me = await getProfile();
  const name = me?.full_name ?? 'Student';
  return (
    <section className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-headline-lg text-on-surface">Student Profile</h2>
        <p className="text-body-sm text-on-surface-variant">Manage your name and department.</p>
      </div>

      <div className="p-6 sm:p-8 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-headline-sm shadow-md">{initials(name)}</div>
          <div>
            <h3 className="text-headline-sm text-on-surface">{name}</h3>
            <p className="text-body-sm text-on-surface-variant">{user.email}</p>
          </div>
        </div>

        <ProfileForm fullName={name} department={me?.department ?? 'CSE'} email={user.email ?? ''} yearText={yearLabel(me?.academic_year ?? 1)} />

        <form action={logout} className="pt-4 border-t border-outline-variant/20">
          <button type="submit" className={`${btnSecondary} text-error border-error/30 hover:bg-error-container/20`}>
            <Icon name="logout" size={18} /> Log Out
          </button>
        </form>
      </div>
    </section>
  );
}