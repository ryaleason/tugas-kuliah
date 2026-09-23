'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Search, X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
      {/* Overview Stat Cards: Clean, Calm & Structured */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <span className="text-xs font-medium text-zinc-500">Total Tugas</span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <span className="text-xs font-medium text-zinc-500">Belum Selesai</span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
          <div>
            <span className="text-xs font-medium text-zinc-500">Deadline ≤ 3 Hari</span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 ${urgentCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
              {urgentCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls: Clean & Spacious */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas atau mata kuliah..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Matkul Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={matkulFilter}
            onChange={(e) => onMatkulFilterChange(e.target.value)}
            aria-label="Filter berdasarkan mata kuliah"
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors cursor-pointer shadow-xs"
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {uniqueMatkuls.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Segmented Tabs */}
        <div className="inline-flex p-1 rounded-lg bg-zinc-100 border border-zinc-200/80">
          <button
            type="button"
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Belum Selesai')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'Belum Selesai'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Selesai')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              statusFilter === 'Selesai'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
