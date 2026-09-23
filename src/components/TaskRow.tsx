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

  // Clean, modern semantic badge styles
  let badgeStyle = 'bg-zinc-100 text-zinc-700 border border-zinc-200/60';

  if (isDone) {
    badgeStyle = 'bg-zinc-100 text-zinc-400 border border-zinc-200/50';
  } else if (urgency === 'overdue' || urgency === 'today') {
    badgeStyle = 'bg-rose-50 text-rose-700 border border-rose-200/80 font-medium';
  } else if (urgency === 'urgent') {
    badgeStyle = 'bg-amber-50 text-amber-800 border border-amber-200/80 font-medium';
  }

  return (
    <>
      {/* Desktop Table Row */}
      <tr className={`hidden md:table-row transition-colors hover:bg-zinc-50/70 ${isDone ? 'opacity-50 bg-zinc-50/30' : ''}`}>
        {/* No */}
        <td className="py-3 px-4 text-xs font-mono text-zinc-400 w-14 text-center">
          #{task.no}
        </td>

        {/* Matkul */}
        <td className="py-3 px-3 text-sm whitespace-nowrap">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200/60">
            {task.matkul}
          </span>
        </td>

        {/* Tugas */}
        <td className="py-3 px-3 text-sm">
          <div className={`font-medium text-zinc-900 ${isDone ? 'line-through text-zinc-400' : ''}`}>
            {task.tugas}
          </div>
          {task.keterangan && (
            <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
              {task.keterangan}
            </div>
          )}
        </td>

        {/* Deadline */}
        <td className="py-3 px-3 text-sm whitespace-nowrap">
          <div className="text-xs text-zinc-700 font-medium">
            {formatDeadlineDisplay(task.deadline)}
          </div>
          <div className="text-xs mt-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[11px] ${badgeStyle}`}>
              {urgency === 'urgent' && <AlertCircle className="w-3 h-3 text-current stroke-[2.5]" />}
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>
        </td>

        {/* Status Toggle (Clean interactive pill) */}
        <td className="py-3 px-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            aria-label={isDone ? `Ubah status tugas #${task.no} ke Belum Selesai` : `Tandai tugas #${task.no} Selesai`}
            title="Klik untuk ubah status tugas"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              isDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-xs'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 bg-white'
              }`}
            >
              {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </span>
            <span>{task.status}</span>
          </button>
        </td>

        {/* Actions: Edit & Delete */}
        <td className="py-3 px-4 text-right whitespace-nowrap w-24">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              title="Edit tugas"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              title="Hapus tugas"
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card View */}
      <div
        className={`md:hidden p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-2.5 ${
          isDone ? 'opacity-60 bg-zinc-50/50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                {task.matkul}
              </span>
              <span className="text-xs font-mono text-zinc-400">#{task.no}</span>
            </div>
            <h4 className={`text-sm font-semibold text-zinc-900 ${isDone ? 'line-through text-zinc-400' : ''}`}>
              {task.tugas}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {task.keterangan && (
          <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/50 rounded-lg p-2">
            {task.keterangan}
          </p>
        )}

        <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>{formatDeadlineDisplay(task.deadline)}</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${badgeStyle}`}>
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              isDone
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-xs'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 bg-white'
              }`}
            >
              {isDone && <Check className="w-2 h-2 stroke-[3]" />}
            </span>
            <span>{isDone ? 'Selesai' : 'Belum'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
