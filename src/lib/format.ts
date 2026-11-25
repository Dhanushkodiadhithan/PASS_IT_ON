export const formatBytes = (b: number) =>
  b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

export const yearLabel = (y: number) => `${['', '1st', '2nd', '3rd', '4th'][y] ?? y} Year`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  if (d < 30) { const w = Math.floor(d / 7); return `${w} week${w > 1 ? 's' : ''} ago`; }
  return formatDate(iso);
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || 'S';

export function fileIcon(type: string) {
  switch (type) {
    case 'pdf': return { name: 'picture_as_pdf', color: 'text-error' };
    case 'doc': case 'docx': return { name: 'description', color: 'text-secondary' };
    case 'ppt': case 'pptx': return { name: 'slideshow', color: 'text-tertiary' };
    case 'jpg': case 'png': return { name: 'image', color: 'text-primary' };
    default: return { name: 'folder_zip', color: 'text-on-surface-variant' };
  }
}