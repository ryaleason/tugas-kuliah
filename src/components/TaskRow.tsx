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

  return (
    <>
      {/* Desktop Table Row */}
      <tr className={`hidden md:table-row transition-colors hover:bg-zinc-50 ${isDone ? 'opacity-50 bg-zinc-50/50' : 'bg-white'}`}>
        {/* No */}
        <td className="py-3 px-4 text-xs font-mono font-bold text-black w-14 text-center">
          #{task.no}
        </td>

        {/* Matkul */}
        <td className="py-3 px-3 text-sm whitespace-nowrap">
          <span className="sketch-border-sm inline-block px-2.5 py-0.5 text-xs font-bold bg-white text-black">
            {task.matkul}
          </span>
        </td>

        {/* Tugas */}
        <td className="py-3 px-3 text-sm">
          <div className={`font-bold text-black ${isDone ? 'line-through decoration-2 decoration-black text-zinc-400' : ''}`}>
            {task.tugas}
          </div>
          {task.keterangan && (
            <div className="text-xs text-zinc-600 mt-0.5 line-clamp-1">
              {task.keterangan}
            </div>
          )}
        </td>

        {/* Deadline */}
        <td className="py-3 px-3 text-sm whitespace-nowrap">
          <div className="text-xs text-black font-bold">
            {formatDeadlineDisplay(task.deadline)}
          </div>
          <div className="text-xs mt-0.5">
            <span className={`sketch-border-sm inline-flex items-center gap-1 px-2 py-0.2 text-[11px] font-bold bg-white text-black ${urgency === 'urgent' || urgency === 'today' || urgency === 'overdue' ? 'border-dashed' : ''}`}>
              {(urgency === 'urgent' || urgency === 'today') && <AlertCircle className="w-3 h-3 text-black stroke-[2.5]" />}
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>
        </td>

        {/* Status Toggle (Hand-drawn Checkbox Box) */}
        <td className="py-3 px-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            aria-label={isDone ? `Ubah status tugas #${task.no} ke Belum Selesai` : `Tandai tugas #${task.no} Selesai`}
            title="Klik untuk ubah status tugas"
            className="sketch-btn inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-100 cursor-pointer"
          >
            <span
              className={`w-4 h-4 sketch-border-sm flex items-center justify-center ${
                isDone ? 'bg-black text-white' : 'bg-white text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>{task.status}</span>
          </button>
        </td>

        {/* Actions: Edit & Delete */}
        <td className="py-3 px-4 text-right whitespace-nowrap w-24">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              title="Edit tugas"
              className="sketch-btn p-1.5 bg-white text-black hover:bg-zinc-100 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              title="Hapus tugas"
              className="sketch-btn p-1.5 bg-white text-black hover:bg-zinc-100 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card View */}
      <div
        className={`md:hidden sketch-card p-4 space-y-2.5 ${
          isDone ? 'opacity-60 bg-zinc-50' : 'bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="sketch-border-sm text-xs font-bold px-2 py-0.5 bg-white text-black">
                {task.matkul}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">#{task.no}</span>
            </div>
            <h4 className={`text-base font-bold text-black ${isDone ? 'line-through decoration-2 decoration-black text-zinc-400' : ''}`}>
              {task.tugas}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit tugas #${task.no}`}
              className="sketch-btn p-1.5 bg-white text-black hover:bg-zinc-100 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Hapus tugas #${task.no}`}
              className="sketch-btn p-1.5 bg-white text-black hover:bg-zinc-100 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {task.keterangan && (
          <p className="text-xs text-zinc-700 bg-zinc-50 border-2 border-dashed border-black/30 rounded-lg p-2">
            {task.keterangan}
          </p>
        )}

        <div className="pt-2.5 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-black font-bold">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{formatDeadlineDisplay(task.deadline)}</span>
            <span className="sketch-border-sm ml-1 px-1.5 py-0.2 text-[10px] bg-white">
              {formatDeadlineRelative(task.deadline)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleStatus(task.no)}
            disabled={isToggling}
            className="sketch-btn px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-100 cursor-pointer"
          >
            <span
              className={`w-3.5 h-3.5 sketch-border-sm flex items-center justify-center ${
                isDone ? 'bg-black text-white' : 'bg-white text-transparent'
              }`}
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>{isDone ? 'Selesai' : 'Belum'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
