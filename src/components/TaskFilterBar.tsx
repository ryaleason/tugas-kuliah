'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Search, X, Clock, AlertCircle } from 'lucide-react';
import { getDaysUntilDeadline } from '@/lib/date-utils';

interface TaskFilterBarProps {
  tasks: Task[];
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | TaskStatus;
  onStatusFilterChange: (val: 'ALL' | TaskStatus) => void;
  matkulFilter: string;
  onMatkulFilterChange: (val: string) => void;
  uniqueMatkuls: string[];
}

export function TaskFilterBar({
  tasks,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  matkulFilter,
  onMatkulFilterChange,
  uniqueMatkuls,
}: TaskFilterBarProps) {
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Belum Selesai').length;
  const urgentCount = tasks.filter((t) => {
    if (t.status !== 'Belum Selesai') return false;
    const diff = getDaysUntilDeadline(t.deadline);
    return diff <= 3;
  }).length;

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards: Hand-drawn Sketch Style (B&W) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Total Tugas</div>
            <div className="text-3xl font-black text-black mt-0.5">{totalCount}</div>
          </div>
          <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Belum Selesai</div>
            <div className="text-3xl font-black text-black mt-0.5">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Deadline ≤ 3 Hari</div>
            <div className="text-3xl font-black text-black mt-0.5">{urgentCount}</div>
          </div>
          <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[2.5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas atau mata kuliah..."
            className="sketch-input w-full pl-10 pr-9 py-2 text-sm font-medium text-black placeholder-zinc-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-black hover:bg-zinc-100 rounded"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Matkul Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={matkulFilter}
            onChange={(e) => onMatkulFilterChange(e.target.value)}
            aria-label="Filter berdasarkan mata kuliah"
            className="sketch-input w-full px-3.5 py-2 text-sm font-bold text-black cursor-pointer"
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {uniqueMatkuls.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Segmented Buttons */}
        <div className="inline-flex p-1 sketch-border bg-white">
          <button
            type="button"
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-black text-white'
                : 'text-black hover:bg-zinc-100'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Belum Selesai')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
              statusFilter === 'Belum Selesai'
                ? 'bg-black text-white'
                : 'text-black hover:bg-zinc-100'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Selesai')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
              statusFilter === 'Selesai'
                ? 'bg-black text-white'
                : 'text-black hover:bg-zinc-100'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
