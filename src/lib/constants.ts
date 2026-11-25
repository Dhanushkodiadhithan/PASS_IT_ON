export const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', short: 'Comp. Science' },
  { code: 'ECE', name: 'Electronics & Communication', short: 'Electronics' },
  { code: 'MECH', name: 'Mechanical Engineering', short: 'Mechanical' },
  { code: 'IT', name: 'Information Technology', short: 'Information Tech' },
  { code: 'AI-DS', name: 'AI & Data Science', short: 'AI & Data Science' },
  { code: 'CIVIL', name: 'Civil Engineering', short: 'Civil Engineering' },
] as const;

export const REGULATIONS = ['R23', 'R21', 'R19', 'R16'] as const;
export const YEARS = [1, 2, 3, 4] as const;
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const RESOURCE_TYPES = [
  { slug: 'pyq', name: 'Previous Year Question Papers', short: 'PYQ', icon: 'history_edu', blurb: 'Exam papers & keys', badge: 'bg-secondary-fixed text-on-secondary-fixed', tile: 'bg-secondary-fixed text-on-secondary-fixed' },
  { slug: 'syllabus', name: 'Syllabus', short: 'Syllabus', icon: 'format_list_bulleted', blurb: 'Curriculum & regulations', badge: 'bg-tertiary-fixed text-on-tertiary-fixed', tile: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  { slug: 'notes', name: 'Unit-wise Notes', short: 'Unit Notes', icon: 'menu_book', blurb: 'Handwritten & slides', badge: 'bg-primary-fixed text-on-primary-fixed', tile: 'bg-primary-fixed text-on-primary-fixed' },
  { slug: 'lab', name: 'Lab Stuff', short: 'Lab Stuff', icon: 'science', blurb: 'Manuals, records & viva', badge: 'bg-surface-container-high text-primary', tile: 'bg-surface-container-high text-primary' },
  { slug: 'important', name: 'Important Questions', short: 'Important Qs', icon: 'priority_high', blurb: 'Most repeated questions', badge: 'bg-secondary-container/20 text-secondary', tile: 'bg-secondary-container/20 text-secondary' },
] as const;

export const typeBySlug = (slug: string) => RESOURCE_TYPES.find((t) => t.slug === slug);

export const FILE_TYPES: string[] = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'png', 'zip'];
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  jpg: 'image/jpeg',
  png: 'image/png',
  zip: 'application/zip',
};

export const normalizeExt = (fileName: string) => {
  const e = fileName.split('.').pop()?.toLowerCase() ?? '';
  return e === 'jpeg' ? 'jpg' : e;
};

export const REPORT_REASONS = [
  { value: 'Wrong file', label: 'Wrong file or corrupted document' },
  { value: 'Duplicate resource', label: 'Duplicate resource already available' },
  { value: 'Incorrect subject or semester', label: 'Incorrect subject, regulation, or semester' },
  { value: 'Inappropriate content', label: 'Inappropriate content' },
  { value: 'Other issue', label: 'Other issue' },
] as const;