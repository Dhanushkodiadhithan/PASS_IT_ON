'use client';
import { useState } from 'react';
import Icon from './Icon';
import { inputCls, labelCls } from './ui';
import { DEPARTMENTS } from '@/lib/constants';

export default function ProfileForm({
  fullName, department, email, yearText,
}: { fullName: string; department: string; email: string; yearText: string }) {
  const [editing, setEditing] = useState(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-title-md text-on-surface">Profile Details</h4>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
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
          Your name, department, email and academic year are tied to your college account and can’t be edited.
        </p>
      )}

      {field('Full Name', fullName)}
      {field('Department', deptText)}
      {field('College Email', email)}
      {field('Academic Year', yearText)}
    </div>
  );
}