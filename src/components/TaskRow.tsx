'use client';

import React from 'react';
import { Task } from '@/types/task';
import {
  formatDeadlineDisplay,
  formatDeadlineRelative,
  getUrgencyLevel,
} from '@/lib/date-utils';
import { Check, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface TaskRowProps {
  task: Task;
  onToggleStatus: (no: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isToggling?: boolean;
}

export function TaskRow({ task, onToggleStatus, onEdit, onDelete, isToggling }: TaskRowProps) {
  const isDone = task.status === 'Selesai';
  const urgency = getUrgencyLevel(task.deadline, isDone);

  // Neo-brutalist colorful styling (Saweria theme)
  let rowStyle = 'hover:bg-amber-50/40 bg-white';
  let badgeStyle = 'bg-[#BAE6FD] text-sky-950 border-2 border-black shadow-[1.5px_1.5px_0px_#000]';

  if (isDone) {
    rowStyle += ' opacity-60 bg-zinc-50/70';
    badgeStyle = 'bg-zinc-100 text-zinc-500 border border-black/30';
  } else if (urgency === 'overdue' || urgency === 'today') {
    rowStyle += ' bg-rose-50/40';
    badgeStyle = 'bg-[#FDA4AF] text-rose-950 font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]';
  } else if (urgency === 'urgent') {
    rowStyle += ' bg-amber-50/30';
    badgeStyle = 'bg-[#FEF08A] text-amber-950 font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]';
  }

  return (
    <>
      {/* Desktop Table Row */}
      <tr className={`hidden md:table-row border-b-2 border-black/10 transition-colors ${rowStyle}`}>
        {/* No */}
        <td className="py-3.5 px-4 text-xs font-mono font-bold text-black w-14 text-center">
          #{task.no}
        </td>

        {/* Matkul */}
        <td className="py-3.5 px-3 text-sm font-semibold text-black whitespace-nowrap">
          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#EDE9FE] text-purple-950 border-2 border-black text-xs font-mono font-bold shadow-[1.5px_1.5px_0px_#000]">
            {task.matkul}
          </span>
        </td>

        {/* Tugas */}
        <td className="py-3.5 px-3 text-sm text-black">
          <div className={`font-black tracking-tight ${isDone ? 'line-through text-zinc-400' : ''}`}>
            {task.tugas}
          </div>
          {task.keterangan && (
            <div className="text-xs font-mono text-zinc-600 mt-0.5 line-clamp-1">
              {task.keterangan}
            </div>
          )}
        </td>

        {/* Deadline */}
        <td className="py-3.5 px-3 text-sm whitespace-nowrap">
          <div className="font-mono font-bold text-black text-xs">
            {formatDeadlineDisplay(task.deadline)}
          </div>
          <div className="text-xs mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${badgeStyle}`}>
              {urgency === 'urgent' && <AlertCircle className="w-3 h-3 text-current stroke-[2.5]" />}
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>
        </td>

        {/* Status Toggle (Saweria Pill Toggle) */}
        <td className="py-3.5 px-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            aria-label={isDone ? `Ubah status tugas #${task.no} ke Belum Selesai` : `Tandai tugas #${task.no} Selesai`}
            title="Klik untuk toggle status selesai/belum selesai"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-mono font-bold transition-all cursor-pointer ${
              isDone
                ? 'bg-[#86EFAC] text-black shadow-[2px_2px_0px_#000] hover:bg-[#4ADE80]'
                : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-amber-50 hover:shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-xs border-2 border-black flex items-center justify-center ${
                isDone ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {isDone && <Check className="w-3 h-3 stroke-[4]" />}
            </span>
            <span>{task.status}</span>
          </button>
        </td>

        {/* Aksi: [✎] [🗑] */}
        <td className="py-3.5 px-4 text-right whitespace-nowrap w-24">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              title="Edit tugas"
              className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#BAE6FD] shadow-[2px_2px_0px_#000] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-black" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              title="Hapus tugas"
              className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-[#FDA4AF] shadow-[2px_2px_0px_#000] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card: Saweria Neo-Brutalist Stacked Card */}
      <div
        className={`md:hidden p-4 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 ${
          isDone ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#EDE9FE] text-purple-950 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                {task.matkul}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">#{task.no}</span>
            </div>
            <h4 className={`text-base font-black text-black ${isDone ? 'line-through text-zinc-400' : ''}`}>
              {task.tugas}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              className="p-2 rounded-lg border-2 border-black bg-white hover:bg-[#BAE6FD] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-black" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              className="p-2 rounded-lg border-2 border-black bg-white hover:bg-[#FDA4AF] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {task.keterangan && (
          <p className="text-xs font-mono text-zinc-700 bg-[#FDFBF7] border border-black/20 rounded-xl p-2.5">
            {task.keterangan}
          </p>
        )}

        <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-black">
            <Calendar className="w-3.5 h-3.5 text-black" />
            <span>{formatDeadlineDisplay(task.deadline)}</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${badgeStyle}`}>
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            className={`px-3 py-1.5 rounded-xl border-2 border-black flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
              isDone
                ? 'bg-[#86EFAC] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-amber-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-xs border-2 border-black flex items-center justify-center ${
                isDone ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {isDone && <Check className="w-3 h-3 stroke-[4]" />}
            </span>
            <span>{isDone ? 'Selesai' : 'Belum Selesai'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
