'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';
import { btnPrimary, btnSecondary, inputCls, labelCls } from './ui';
import {
  DEPARTMENTS, FILE_TYPES, MAX_FILE_SIZE, REGULATIONS, RESOURCE_TYPES, SEMESTERS, YEARS, normalizeExt,
} from '@/lib/constants';
import { formatBytes, yearLabel } from '@/lib/format';
import { createResource, getSubjectNames } from '@/actions/resources';

export interface UploadInitial {
  department: string; regulation: string; academicYear: number; semester: number; subject: string;
}
const STEPS = ['Academic Scope', 'Resource Category', 'Title & Details', 'Attach File & Submit'];

export default function UploadForm({ initial }: { initial: UploadInitial }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ ...initial, typeSlug: 'notes', title: '', description: '' });
  const [file, setFile] = useState<File | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [createdId, setCreatedId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    getSubjectNames(f.department, f.regulation, f.academicYear, f.semester).then(setNames).catch(() => {});
  }, [f.department, f.regulation, f.academicYear, f.semester]);

  function next() {
    if (step === 1 && f.subject.trim().length < 2) return void toast.error('Enter the subject name.');
    if (step === 3 && f.title.trim().length < 3) return void toast.error('Enter a descriptive title.');
    setStep(step + 1);
  }

  function pickFile(picked?: File) {
    if (!picked) return;
    if (!FILE_TYPES.includes(normalizeExt(picked.name)))
      return void toast.error('Unsupported file. Use PDF, DOC/DOCX, PPT/PPTX, JPG, PNG or ZIP.');
    if (picked.size > MAX_FILE_SIZE) return void toast.error('File is larger than 25 MB.');
    setFile(picked);
  }

  async function submit() {
    if (!file) return void toast.error('Please choose a file.');
    setStatus('uploading');
    setProgress(0);
    try {
      const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });
      const presign = await res.json();
      if (!res.ok) throw new Error(presign.error ?? 'Could not start upload.');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presign.uploadUrl);
        xhr.setRequestHeader('Content-Type', presign.contentType);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error('Upload to storage failed.')));
        xhr.onerror = () => reject(new Error('Network error during upload (check B2 CORS).'));
        xhr.send(file);
      });

      const created = await createResource({
        department: f.department, regulation: f.regulation, academicYear: f.academicYear, semester: f.semester,
        subjectName: f.subject, typeSlug: f.typeSlug, title: f.title, description: f.description,
        storageKey: presign.storageKey, fileName: file.name, fileType: normalizeExt(file.name),
      });
      if (!created.ok) throw new Error(created.error);

      setCreatedId(created.id!);
      setStatus('done');
      toast.success('Resource uploaded successfully.');
    } catch (err) {
      setStatus('idle');
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    }
  }

  function reset() {
    setF((p) => ({ ...p, title: '', description: '' }));
    setFile(null); setProgress(0); setStatus('idle'); setStep(1);
  }

  return (
    <section className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-headline-lg text-on-surface">Contribute an Academic Resource</h2>
        <p className="text-body-sm text-on-surface-variant">Share your notes, solved papers, and lab material with your peers.</p>
      </div>

      {status !== 'done' && (
        <>
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${i < step ? 'bg-primary' : 'bg-surface-container'}`} />
            ))}
          </div>
          <p className="text-label-sm text-primary">Step {step} of 4: {STEPS[step - 1]}</p>
        </>
      )}

      <div className="p-6 sm:p-8 bg-white border border-outline-variant/30 rounded-2xl shadow-sm">
        {status === 'done' ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed mx-auto flex items-center justify-center">
              <Icon name="check_circle" size={36} />
            </div>
            <h3 className="text-headline-md text-on-surface">Resource uploaded successfully.</h3>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href={`/resource/${createdId}`} className={btnPrimary}>View Resource</Link>
              <button onClick={reset} className={btnSecondary}>Upload Another</button>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Department</label>
                    <select className={inputCls} value={f.department} onChange={(e) => set('department', e.target.value)}>
                      {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Regulation</label>
                    <select className={inputCls} value={f.regulation} onChange={(e) => set('regulation', e.target.value)}>
                      {REGULATIONS.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Academic Year</label>
                    <select className={inputCls} value={f.academicYear} onChange={(e) => set('academicYear', Number(e.target.value))}>
                      {YEARS.map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Semester</label>
                    <select className={inputCls} value={f.semester} onChange={(e) => set('semester', Number(e.target.value))}>
                      {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Subject Name</label>
                  <input list="subject-list" className={inputCls} value={f.subject} onChange={(e) => set('subject', e.target.value)} placeholder="e.g. Database Management Systems" />
                  <datalist id="subject-list">{names.map((n) => <option key={n} value={n} />)}</datalist>
                  <p className="text-label-sm text-on-surface-variant mt-1">Pick an existing subject or type a new one.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RESOURCE_TYPES.map((t, i) => (
                  <label
                    key={t.slug}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                      f.typeSlug === t.slug ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/30 hover:border-primary/50'
                    } ${i === 4 ? 'sm:col-span-2' : ''}`}
                  >
                    <input type="radio" name="type" checked={f.typeSlug === t.slug} onChange={() => set('typeSlug', t.slug)} className="text-primary focus:ring-primary" />
                    <div>
                      <span className="block text-title-md text-on-surface">{t.name}</span>
                      <span className="text-body-sm text-on-surface-variant">{t.blurb}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Resource Title *</label>
                  <input className={inputCls} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Unit 3 Normalization Solved Notes" />
                  <p className="text-label-sm text-on-surface-variant mt-1">Be descriptive so other students can find it.</p>
                </div>
                <div>
                  <label className={labelCls}>Description (optional)</label>
                  <textarea rows={3} className={inputCls} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Key topics, faculty referenced, exam tips..." />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
                  className="p-8 border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl bg-surface-container-low text-center cursor-pointer transition flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <Icon name="cloud_upload" size={32} />
                  </div>
                  <p className="text-title-md text-on-surface">Click to browse or drop your file here</p>
                  <p className="text-body-sm text-on-surface-variant">PDF, DOC/DOCX, PPT/PPTX, JPG, PNG, ZIP (max 25 MB)</p>
                  <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip" onChange={(e) => pickFile(e.target.files?.[0])} />
                </div>

                {file && (
                  <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-body-sm text-on-surface min-w-0">
                      <Icon name="description" className="text-primary" />
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-on-surface-variant text-label-sm shrink-0">({formatBytes(file.size)})</span>
                    </div>
                    {status !== 'uploading' && (
                      <button onClick={() => setFile(null)} aria-label="Remove file" className="p-1 rounded-full hover:bg-surface-container-high">
                        <Icon name="close" size={18} />
                      </button>
                    )}
                  </div>
                )}

                {status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-label-md">
                      <span className="text-on-surface">Uploading…</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 flex justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} disabled={status === 'uploading'} className={btnSecondary}>Back</button>
              ) : <span />}
              {step < 4 ? (
                <button onClick={next} className={btnPrimary}>Continue <Icon name="arrow_forward" size={18} /></button>
              ) : (
                <button onClick={submit} disabled={status === 'uploading'} className={btnPrimary}>
                  <Icon name="publish" size={18} /> {status === 'uploading' ? 'Uploading…' : 'Publish Resource'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}