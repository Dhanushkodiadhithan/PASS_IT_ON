'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import Modal from './Modal';
import { btnPrimary, btnSecondary, inputCls, labelCls } from './ui';
import { REPORT_REASONS } from '@/lib/constants';
import { submitReport } from '@/actions/resources';

export default function ReportButton({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].value);
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function close() { setOpen(false); setDone(false); setDescription(''); setReason(REPORT_REASONS[0].value); }

  function submit() {
    start(async () => {
      const res = await submitReport({ resourceId, reason, description });
      if (!res.ok) return void toast.error(res.error ?? 'Something went wrong.');
      setDone(true);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3.5 py-2.5 rounded-xl border border-error/30 hover:bg-error-container/30 text-error text-title-md transition flex items-center gap-1"
      >
        <Icon name="flag" size={18} /> Report
      </button>

      <Modal open={open} onClose={close} title="Report Resource">
        {done ? (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed mx-auto flex items-center justify-center">
              <Icon name="check" size={26} />
            </div>
            <p className="text-body-md text-on-surface">Thank you. Your report has been submitted.</p>
            <button onClick={close} className={btnPrimary}>Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-body-sm text-on-surface-variant">Why are you reporting this resource?</p>
            <div className="space-y-1">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container-low cursor-pointer text-body-sm">
                  <input type="radio" name="reason" checked={reason === r.value} onChange={() => setReason(r.value)} className="text-error focus:ring-error" />
                  {r.label}
                </label>
              ))}
            </div>
            <div>
              <label className={labelCls}>Additional description (optional)</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Provide extra context..." />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={close} className={btnSecondary}>Cancel</button>
              <button onClick={submit} disabled={pending} className={btnPrimary}>{pending ? 'Submitting…' : 'Submit Report'}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}