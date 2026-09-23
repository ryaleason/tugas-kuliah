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
      {/* Overview Stat Badges: Clean White Cards with Crisp Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500">Total Tugas</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">{totalCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500">Belum Selesai</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">{pendingCount}</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-900">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500">Deadline &le; 3 Hari</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">{urgentCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas atau mata kuliah..."
            className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all text-sm font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Matkul Dropdown */}
        <div className="relative min-w-[190px]">
          <select
            value={matkulFilter}
            onChange={(e) => onMatkulFilterChange(e.target.value)}
            aria-label="Filter berdasarkan mata kuliah"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all cursor-pointer font-medium"
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
        <div className="inline-flex p-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-zinc-900 border border-zinc-300 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Belum Selesai')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === 'Belum Selesai'
                ? 'bg-white text-zinc-900 border border-zinc-300 shadow-xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Selesai')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              statusFilter === 'Selesai'
                ? 'bg-white text-zinc-900 border border-zinc-300 shadow-xs font-bold'
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
