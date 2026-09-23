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

  // Dominant white monochrome styling
  let rowStyle = 'hover:bg-zinc-50/80 bg-white';
  let badgeStyle = 'bg-zinc-100 text-zinc-800 border-zinc-200';

  if (isDone) {
    rowStyle += ' opacity-55 bg-zinc-50/30';
    badgeStyle = 'bg-zinc-100 text-zinc-500 border-zinc-200';
  } else if (urgency === 'overdue' || urgency === 'today') {
    rowStyle += ' border-l-3 border-l-zinc-900 bg-zinc-50/50';
    badgeStyle = 'bg-zinc-900 text-white font-bold';
  } else if (urgency === 'urgent') {
    rowStyle += ' border-l-3 border-l-zinc-500 bg-zinc-50/30';
    badgeStyle = 'bg-zinc-200 text-zinc-900 font-semibold';
  }

  return (
    <>
      {/* Desktop Table Row */}
      <tr className={`hidden md:table-row border-b border-zinc-100 transition-colors ${rowStyle}`}>
        {/* No */}
        <td className="py-3.5 px-4 text-xs font-mono font-medium text-zinc-400 w-12 text-center">
          {task.no}
        </td>

        {/* Matkul */}
        <td className="py-3.5 px-3 text-sm font-semibold text-zinc-900 whitespace-nowrap">
          <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold">
            {task.matkul}
          </span>
        </td>

        {/* Tugas */}
        <td className="py-3.5 px-3 text-sm text-zinc-900">
          <div className={`font-semibold ${isDone ? 'line-through text-zinc-400' : ''}`}>
            {task.tugas}
          </div>
          {task.keterangan && (
            <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
              {task.keterangan}
            </div>
          )}
        </td>

        {/* Deadline */}
        <td className="py-3.5 px-3 text-sm whitespace-nowrap">
          <div className="font-semibold text-zinc-800">
            {formatDeadlineDisplay(task.deadline)}
          </div>
          <div className="text-xs mt-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${badgeStyle}`}>
              {urgency === 'urgent' && <AlertCircle className="w-3 h-3 text-current" />}
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>
        </td>

        {/* Status Toggle (Dominant White: ⬜ / ✅) */}
        <td className="py-3.5 px-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            aria-label={isDone ? `Ubah status tugas #${task.no} ke Belum Selesai` : `Tandai tugas #${task.no} Selesai`}
            title="Klik untuk toggle status selesai/belum selesai"
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isDone
                ? 'bg-zinc-100 text-zinc-700 border-zinc-300 shadow-2xs hover:bg-zinc-200'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                isDone
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'border-zinc-400 bg-white'
              }`}
            >
              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>{task.status}</span>
          </button>
        </td>

        {/* Aksi: [✎] [🗑] */}
        <td className="py-3.5 px-4 text-right whitespace-nowrap w-24">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              title="Edit tugas"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              title="Hapus tugas"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card (Dominant white stacked card) */}
      <div
        className={`md:hidden p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-3 ${
          isDone ? 'opacity-55' : ''
        } ${
          !isDone && (urgency === 'overdue' || urgency === 'today')
            ? 'border-l-3 border-l-zinc-900'
            : !isDone && urgency === 'urgent'
            ? 'border-l-3 border-l-zinc-500'
            : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
                {task.matkul}
              </span>
              <span className="text-xs font-mono text-zinc-400">#{task.no}</span>
            </div>
            <h4 className={`text-base font-bold text-zinc-900 ${isDone ? 'line-through text-zinc-400' : ''}`}>
              {task.tugas}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {task.keterangan && (
          <p className="text-xs text-zinc-500">
            {task.keterangan}
          </p>
        )}

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatDeadlineDisplay(task.deadline)}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full border text-[10px] ${badgeStyle}`}>
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            className={`min-h-[44px] px-3.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              isDone
                ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-300'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                isDone ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-400 bg-white'
              }`}
            >
              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span>{isDone ? 'Selesai' : 'Belum Selesai'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
