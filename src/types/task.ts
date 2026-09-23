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
