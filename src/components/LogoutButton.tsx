'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Modal from './Modal';
import { btnPrimary, btnSecondary } from './ui';
import { logout } from '@/actions/auth';

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnPrimary}>
      {pending ? 'Logging out…' : 'Log Out'}
    </button>
  );
}

export default function LogoutButton({
  className, children,
}: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Log out?">
        <p className="text-body-sm text-on-surface-variant">
          Are you sure you want to log out of PassItOn?
        </p>
        <form action={logout} className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>Cancel</button>
          <ConfirmButton />
        </form>
      </Modal>
    </>
  );
}