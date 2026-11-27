'use client';
import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Modal from './Modal';
import { btnSecondary } from './ui';
import { logout } from '@/actions/auth';

export default function LogoutButton({ className, children }: { className: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => { setMounted(true); }, []);

  function confirmLogout() {
    start(async () => { await logout(); });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{children}</button>
      {mounted && createPortal(
        <Modal open={open} onClose={() => { if (!pending) setOpen(false); }} title="Log Out">
          <p className="text-body-sm text-on-surface-variant">Are you sure you want to log out?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} disabled={pending} className={btnSecondary}>Cancel</button>
            <button
              type="button" onClick={confirmLogout} disabled={pending}
              className="px-5 py-2.5 rounded-xl bg-error text-on-error text-title-md hover:opacity-90 transition disabled:opacity-60"
            >
              {pending ? 'Logging out…' : 'Log Out'}
            </button>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
}