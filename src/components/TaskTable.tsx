'use client';

import React from 'react';
import { Task } from '@/types/task';
import { TaskRow } from './TaskRow';
import { PlusCircle, Inbox, AlertTriangle } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddNew: () => void;
  onToggleStatus: (no: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  togglingNo: number | null;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function TaskTable({
  tasks,
  loading,
  error,
  onRetry,
  onAddNew,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingNo,
  hasFilters,
  onClearFilters,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
        <div className="h-5 bg-zinc-100 rounded-md w-32 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-zinc-50 rounded-lg animate-pulse border border-zinc-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-zinc-100 text-zinc-900">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900">
          Gagal Memuat Data
        </h3>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          {error}
        </p>
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center space-y-4">
        <div className="inline-flex p-3.5 rounded-full bg-zinc-100 text-zinc-400">
          <Inbox className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            {hasFilters ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas kuliah'}
          </h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {hasFilters
              ? 'Sesuaikan kata kunci pencarian atau ubah filter status/mata kuliah.'
              : 'Tambahkan tugas kuliah pertama Anda atau catat langsung lewat Telegram Bot.'}
          </p>
        </div>
        <div>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Tugas
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="all-tasks-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          id="all-tasks-heading"
          className="text-xs font-bold tracking-wider uppercase text-zinc-500"
        >
          Semua Tugas &bull; {tasks.length} Total
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center" scope="col">
                  No
                </th>
                <th className="py-3 px-3 w-40" scope="col">
                  Matkul
                </th>
                <th className="py-3 px-3" scope="col">
                  Tugas
                </th>
                <th className="py-3 px-3 w-44" scope="col">
                  Deadline
                </th>
                <th className="py-3 px-3 w-36" scope="col">
                  Status
                </th>
                <th className="py-3 px-4 text-right w-24" scope="col">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskRow
                  key={task.no}
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isToggling={togglingNo === task.no}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => (
          <TaskRow
            key={task.no}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
            isToggling={togglingNo === task.no}
          />
        ))}
      </div>
    </section>
  );
}
