'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import { btnPrimary, inputCls, labelCls } from './ui';
import { DEPARTMENTS } from '@/lib/constants';
import { updateProfile } from '@/actions/auth';

export default function ProfileForm({
  fullName, department, email, yearText,
}: { fullName: string; department: string; email: string; yearText: string }) {
  const [name, setName] = useState(fullName);
  const [dept, setDept] = useState(department);
  const [pending, start] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfile({ fullName: name, department: dept });
      if (res.ok) toast.success('Profile saved.'); else toast.error(res.error);
    });
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className={labelCls}>Full Name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Department</label>
        <select className={inputCls} value={dept} onChange={(e) => setDept(e.target.value)}>
          {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
        </select>
      </div>
      <div>
        <label className={`${labelCls} flex items-center gap-1.5`}>College Email <Icon name="lock" size={14} className="text-on-surface-variant" /></label>
        <input disabled value={email} className={`${inputCls} bg-surface-container-low text-on-surface-variant cursor-not-allowed`} />
      </div>
      <div>
        <label className={`${labelCls} flex items-center gap-1.5`}>Academic Year <Icon name="lock" size={14} className="text-on-surface-variant" /></label>
        <input disabled value={yearText} className={`${inputCls} bg-surface-container-low text-on-surface-variant cursor-not-allowed`} />
      </div>
      <button type="submit" disabled={pending} className={btnPrimary}>
        <Icon name="save" size={18} /> {pending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}