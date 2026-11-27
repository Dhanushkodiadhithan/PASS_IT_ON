import Icon from '@/components/Icon';
import ProfileForm from '@/components/ProfileForm';
import { initials } from '@/lib/format';
import { getProfile, requireUser } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const [me, { count }] = await Promise.all([
    getProfile(),
    supabase.from('resources').select('id', { count: 'exact', head: true }).eq('uploaded_by', user.id),
  ]);
  const name = me?.full_name ?? 'Student';

  return (
    <section className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-headline-lg text-on-surface">Student Profile</h2>
        <p className="text-body-sm text-on-surface-variant">Your account details.</p>
      </div>

      <div className="p-6 sm:p-8 bg-white border border-outline-variant/30 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-headline-sm shadow-md">{initials(name)}</div>
          <div>
            <h3 className="text-headline-sm text-on-surface">{name}</h3>
            <p className="text-body-sm text-on-surface-variant">{user.email}</p>
          </div>
        </div>

        <ProfileForm
          fullName={name}
          department={me?.department ?? 'CSE'}
          email={user.email ?? ''}
          academicYear={me?.academic_year ?? 1}
        />

        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
            <Icon name="upload_file" size={18} className="text-primary" /> Uploads
          </span>
          <span className="text-title-md text-primary">{count ?? 0}</span>
        </div>
      </div>
    </section>
  );
}