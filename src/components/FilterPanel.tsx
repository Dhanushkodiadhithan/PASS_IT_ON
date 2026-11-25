'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Icon from './Icon';
import { labelCls } from './ui';
import { DEPARTMENTS, REGULATIONS, RESOURCE_TYPES, SEMESTERS, YEARS } from '@/lib/constants';
import { yearLabel } from '@/lib/format';

type Opt = { value: string; label: string };
const selectCls =
  'w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-white text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary';

export default function FilterPanel({ subjects }: { subjects: { id: number; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const fields: { key: string; label: string; options: Opt[] }[] = [
    { key: 'dept', label: 'Department', options: DEPARTMENTS.map((d) => ({ value: d.code, label: `${d.name} (${d.code})` })) },
    { key: 'reg', label: 'Regulation', options: REGULATIONS.map((r) => ({ value: r, label: r })) },
    { key: 'year', label: 'Academic Year', options: YEARS.map((y) => ({ value: String(y), label: yearLabel(y) })) },
    { key: 'sem', label: 'Semester', options: SEMESTERS.map((s) => ({ value: String(s), label: `Semester ${s}` })) },
    { key: 'subject', label: 'Subject', options: subjects.map((s) => ({ value: String(s.id), label: s.name })) },
    { key: 'type', label: 'Resource Type', options: RESOURCE_TYPES.map((t) => ({ value: t.slug, label: t.name })) },
    { key: 'ftype', label: 'File Type', options: ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'jpg', 'png', 'zip'].map((f) => ({ value: f, label: f.toUpperCase() })) },
  ];

  function set(key: string, value: string) {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    if (['dept', 'reg', 'year', 'sem'].includes(key)) p.delete('subject'); // subject list depends on these
    router.push(`${pathname}?${p.toString()}`);
  }

  function reset() {
    const p = new URLSearchParams();
    const q = sp.get('q');
    if (q) p.set('q', q);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl p-5 space-y-4 h-fit">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <span className="text-title-md text-on-surface flex items-center gap-1.5"><Icon name="filter_list" size={18} /> Filters</span>
        <button onClick={reset} className="text-label-sm text-primary hover:underline">Reset All</button>
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <label className={labelCls}>{f.label}</label>
          <select className={selectCls} value={sp.get(f.key) ?? ''} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">All</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}