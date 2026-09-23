export const MATA_KULIAH_LIST = [
  'Arsitektur dan Organisasi Komputer',
  'Pengantar Teknologi Informasi dan Ilmu Komputer',
  'Matematika Diskrit',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Pemrograman Dasar',
  'Sistem Digital',
] as const;

export type MataKuliah = (typeof MATA_KULIAH_LIST)[number];

export type TaskStatus = 'Belum Selesai' | 'Selesai';

export interface Task {
  no: number;
  matkul: string;
  tugas: string;
  deadline: string; // Format: YYYY-MM-DD
  keterangan: string;
  status: TaskStatus;
  rowIndex?: number; // 1-indexed row in Google Sheet
}

export type CreateTaskInput = {
  matkul: string;
  tugas: string;
  deadline: string;
  keterangan?: string;
  status?: TaskStatus;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskFilterOptions {
  search?: string;
  matkul?: string;
  status?: 'ALL' | TaskStatus;
  sortBy?: 'deadline-asc' | 'deadline-desc' | 'no-asc' | 'no-desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
