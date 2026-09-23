'use client';

import React from 'react';
import { Task } from '@/types/task';
import {
  formatDeadlineDisplay,
  formatDeadlineRelative,
  getUrgencyLevel,
} from '@/lib/date-utils';
import { AlertCircle, Calendar, Check, Edit2, Trash2 } from 'lucide-react';

interface UrgentTasksSectionProps {
  tasks: Task[];
  onToggleStatus: (no: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  togglingNo: number | null;
}

export function UrgentTasksSection({
  tasks,
  onToggleStatus,
  onEdit,
  onDelete,
  togglingNo,
}: UrgentTasksSectionProps) {
  const urgentTasks = tasks.filter((t) => {
    if (t.status !== 'Belum Selesai') return false;
    const level = getUrgencyLevel(t.deadline, false);
    return level === 'overdue' || level === 'today' || level === 'urgent';
  });

  if (urgentTasks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="urgent-heading" className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="sketch-border bg-white px-3 py-1 inline-flex items-center gap-2 text-xs font-bold text-black uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Deadline Dekat (≤ 3 Hari) &bull; {urgentTasks.length} Tugas</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {urgentTasks.map((task) => {
          return (
            <div
              key={task.no}
              className="sketch-card p-4 sm:p-5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="sketch-border-sm px-2 py-0.5 text-xs font-bold bg-white text-black">
                      {task.matkul}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">#{task.no}</span>
                    <span className="sketch-border-sm px-2 py-0.5 text-xs font-bold border-dashed bg-zinc-50 text-black">
                      {formatDeadlineRelative(task.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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
                </div>

                <h4 className="text-lg font-bold text-black leading-snug">
                  {task.tugas}
                </h4>

                {task.keterangan && (
                  <p className="text-xs text-zinc-700 bg-zinc-50 border-2 border-dashed border-black/30 rounded-lg p-2.5">
                    {task.keterangan}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                  <span>{formatDeadlineDisplay(task.deadline)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(task.no)}
                  disabled={togglingNo === task.no}
                  className="sketch-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer min-h-[34px] disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tandai Selesai</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
