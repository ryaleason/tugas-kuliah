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
      {/* Overview Stat Badges: Saweria Neo-Brutalist Colorful Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#F0F9FF] border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] transition-all">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-950">Total Tugas</div>
            <div className="text-3xl font-black font-mono text-black mt-1">{totalCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#85D7E8] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Clock className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] transition-all">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-950">Belum Selesai</div>
            <div className="text-3xl font-black font-mono text-black mt-1">{pendingCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#F6AF23] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <AlertCircle className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#FFF1F2] border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] transition-all">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-950">Deadline &le; 3 Hari</div>
            <div className="text-3xl font-black font-mono text-black mt-1">{urgentCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FDA4AF] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <AlertCircle className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas atau mata kuliah..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border-2 border-black bg-white text-black placeholder-zinc-500 shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all text-sm font-mono font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black hover:bg-zinc-100 rounded-md border border-black/30"
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
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white text-black text-sm font-mono font-bold shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all cursor-pointer"
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
        <div className="inline-flex p-1 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
          <button
            type="button"
            onClick={() => onStatusFilterChange('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#85D7E8] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Belum Selesai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              statusFilter === 'Belum Selesai'
                ? 'bg-[#F6AF23] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Belum Selesai
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('Selesai')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              statusFilter === 'Selesai'
                ? 'bg-[#86EFAC] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
