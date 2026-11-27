'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import { btnPrimary, btnSecondary, inputCls, labelCls } from './ui';
import { DEPARTMENTS, YEARS } from '@/lib/constants';
import { yearLabel } from '@/lib/format';
import { updateAcademicYear } from '@/actions/auth';

export default function ProfileForm({
  fullName, department, email, academicYear,
}: { fullName: string; department: string; email: string; academicYear: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [year, setYear] = useState(academicYear);
  const [pending, start] = useTransition();

  const dept = DEPARTMENTS.find((d) => d.code === department);
  const deptText = dept ? `${dept.name} (${dept.code})` : department;
  const lockedCls = `${inputCls} bg-surface-container-low text-on-surface-variant cursor-not-allowed`;

  const field = (label: string, value: string) => (
    <div>
      <label className={`${labelCls} flex items-center gap-1.5`}>
        {label} <Icon name="lock" size={14} className="text-on-surface-variant" />
      </label>
      <input disabled readOnly value={value} className={lockedCls} />
    </div>
  );

  function cancel() {
    setYear(academicYear);
    setEditing(false);
  }

  function save() {
    if (year === academicYear) return setEditing(false);
    start(async () => {
      const res = await updateAcademicYear(year);
      if (!res.ok) return void toast.error(res.error ?? 'Something went wrong.');
      toast.success('Academic year updated.');
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-title-md text-on-surface">Profile Details</h4>
        <button
          type="button"
          onClick={() => (editing ? cancel() : setEditing(true))}
          aria-label={editing ? 'Close edit mode' : 'Edit profile'}
          aria-pressed={editing}
          title={editing ? 'Close' : 'Edit profile'}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition"
        >
          <Icon name={editing ? 'close' : 'edit'} size={18} />
        </button>
      </div>

      {editing && (
        <p className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface-variant">
          You can change your academic year. Your name, department and email are tied to your college account and can’t be edited.
        </p>
      )}

      {field('Full Name', fullName)}
      {field('Department', deptText)}
      {field('Email', email)}

      {editing ? (
        <div>
          <label className={labelCls}>Academic Year</label>
          <select className={inputCls} value={year} onChange={(e) => setYear(Number(e.target.value))} disabled={pending}>
            {YEARS.map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
          </select>
        </div>
      ) : (
        field('Academic Year', yearLabel(academicYear))
      )}

      {editing && (
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={cancel} disabled={pending} className={btnSecondary}>Cancel</button>
          <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
            {pending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}