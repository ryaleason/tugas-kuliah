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
      <div className="rounded-2xl border-2 border-black bg-white p-6 space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="h-6 bg-zinc-200 rounded-lg w-40 animate-pulse border border-black/20" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-zinc-100 rounded-xl animate-pulse border-2 border-black/20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-8 sm:p-10 text-center space-y-4 shadow-[5px_5px_0px_#000]">
        <div className="inline-flex p-3 rounded-xl bg-zinc-100 border-2 border-black text-black shadow-[2px_2px_0px_#000]">
          <AlertTriangle className="w-6 h-6 text-black" />
        </div>
        <h3 className="text-lg font-black text-black font-mono">
          Gagal Memuat Data
        </h3>
        <p className="text-sm font-mono text-zinc-700 max-w-md mx-auto">
          {error}
        </p>
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold font-mono text-white bg-black hover:bg-zinc-800 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white p-10 sm:p-12 text-center space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="inline-flex p-4 rounded-2xl bg-zinc-100 border-2 border-black text-black shadow-[3px_3px_0px_#000]">
          <Inbox className="w-8 h-8 text-black" />
        </div>
        <div>
          <h3 className="text-lg font-black text-black">
            {hasFilters ? 'Tidak ada tugas yang cocok' : 'Belum ada tugas kuliah'}
          </h3>
          <p className="text-xs sm:text-sm font-mono text-zinc-600 mt-1 max-w-sm mx-auto">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold font-mono text-black bg-white hover:bg-zinc-100 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold font-mono text-black bg-[#F6AF23] hover:bg-[#E59E15] rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-black bg-[#BAE6FD] text-sky-950 font-mono text-xs font-black shadow-[2px_2px_0px_#000]">
          <span>SEMUA TUGAS &bull; {tasks.length} TOTAL</span>
        </span>
      </div>

      {/* Desktop Table View: Saweria Neo-Brutalist Table */}
      <div className="hidden md:block rounded-2xl border-2 border-black bg-white overflow-hidden shadow-[5px_5px_0px_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-[#FAF8F5] text-xs font-black font-mono text-black uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center" scope="col">
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
