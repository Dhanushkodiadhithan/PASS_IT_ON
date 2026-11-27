'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import Modal from './Modal';
import TypeBadge from './TypeBadge';
import { btnPrimary, btnSecondary, inputCls, labelCls } from './ui';
import { RESOURCE_TYPES } from '@/lib/constants';
import { formatBytes, formatDate } from '@/lib/format';
import { deleteResource, updateResource } from '@/actions/resources';
import type { Resource } from '@/lib/types';

export default function MyUploadsTable({ rows }: { rows: Resource[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const [form, setForm] = useState({ title: '', description: '', subjectName: '', typeSlug: 'notes' });
  const [pending, start] = useTransition();

  function openEdit(r: Resource) {
    setForm({ title: r.title, description: r.description ?? '', subjectName: r.subject_name, typeSlug: r.type_slug });
    setEditing(r);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateResource({ id: editing!.id, ...form });
      if (!res.ok) return void toast.error(res.error);
      toast.success('Resource updated.');
      setEditing(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    start(async () => {
      const res = await deleteResource(deleting!.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success('Resource deleted.');
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden cursor-pointer">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-label-md text-on-surface">
              <tr>
                {['Resource Title', 'Subject', 'Type', 'Size', 'Uploaded', ''].map((h, i) => (
                  <th key={i} className={`py-3.5 px-4 ${i === 5 ? 'text-right' : ''}`}>{h || 'Actions'}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low/50 transition">
                  <td className="py-3.5 px-4 max-w-xs">
                    <Link href={`/resource/${r.id}`} className="font-semibold hover:text-primary line-clamp-2">{r.title}</Link>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{r.subject_name}<br /><span className="text-label-sm">{r.dept_code} • {r.reg_name} • Sem {r.semester}</span></td>
                  <td className="py-3.5 px-4"><TypeBadge slug={r.type_slug} /></td>
                  <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">{formatBytes(r.file_size)}</td>
                  <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(r)} title="Edit" className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant"><Icon name="edit" size={18} /></button>
                    <button onClick={() => setDeleting(r)} title="Delete" className="p-1.5 rounded hover:bg-error-container/30 text-error"><Icon name="delete" size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Resource">
        <form onSubmit={save} className="space-y-3.5">
          <div>
            <label className={labelCls}>Title</label>
            <input required minLength={3} className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Subject</label>
            <input required className={inputCls} value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Resource Type</label>
            <select className={inputCls} value={form.typeSlug} onChange={(e) => setForm({ ...form, typeSlug: e.target.value })}>
              {RESOURCE_TYPES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={pending} className={btnPrimary}>{pending ? 'Saving…' : 'Save Updates'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Resource?">
        <p className="text-body-sm text-on-surface-variant">
          Are you sure you want to delete “{deleting?.title}”? This removes it for all students and cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => setDeleting(null)} className={btnSecondary}>Cancel</button>
          <button onClick={confirmDelete} disabled={pending} className="px-5 py-2.5 rounded-xl bg-error text-on-error text-title-md hover:opacity-90 transition disabled:opacity-60">
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}