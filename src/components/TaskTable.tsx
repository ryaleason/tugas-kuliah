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
      <div className="sketch-card p-6 space-y-4">
        <div className="h-6 bg-zinc-200 sketch-border-sm w-40 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 bg-zinc-100 sketch-border-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sketch-card p-8 sm:p-10 text-center space-y-4">
        <div className="inline-flex p-3 sketch-border-sm bg-white text-black">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">
            Gagal Memuat Data
          </h3>
          <p className="text-sm text-zinc-600 mt-1 max-w-md mx-auto">
            {error}
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="sketch-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="sketch-border bg-white border-dashed p-10 sm:p-12 text-center space-y-4">
        <div className="inline-flex p-3 sketch-border-sm bg-zinc-50 text-black">
          <Inbox className="w-8 h-8 stroke-[2]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">
            {hasFilters ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas kuliah'}
          </h3>
          <p className="text-sm text-zinc-600 mt-1 max-w-sm mx-auto">
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
              className="sketch-btn inline-flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-black bg-white hover:bg-zinc-100 cursor-pointer"
            >
              Reset Filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddNew}
              className="sketch-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
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
        <span className="sketch-border-sm px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black bg-white">
          Semua Tugas ({tasks.length})
        </span>
      </div>

      {/* Desktop Table View: Hand-drawn Sketch Style */}
      <div className="hidden md:block sketch-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-zinc-100/70 text-xs font-bold text-black uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center" scope="col">
                  No
                </th>
                <th className="py-3 px-3 w-48" scope="col">
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
            <tbody className="divide-y-2 border-black/15">
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
