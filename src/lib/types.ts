export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  uploaded_by: string;
  uploader_name: string;
  subject_id: number;
  subject_name: string;
  dept_code: string;
  reg_name: string;
  academic_year: number;
  semester: number;
  type_slug: string;
  type_name: string;
}

export interface SubjectRow {
  id: number;
  name: string;
  dept_code: string;
  reg_name: string;
  academic_year: number;
  semester: number;
}

export type Filters = Record<string, string | undefined>;