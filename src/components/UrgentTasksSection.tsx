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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Mendekati Deadline (≤ 3 Hari) &bull; {urgentTasks.length} Tugas</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {urgentTasks.map((task) => {
          return (
            <div
              key={task.no}
              className="p-4 sm:p-5 rounded-xl bg-white border border-amber-200/70 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
                      {task.matkul}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">#{task.no}</span>
                    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                      {formatDeadlineRelative(task.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      aria-label={`Edit tugas #${task.no}`}
                      title="Edit tugas"
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      aria-label={`Hapus tugas #${task.no}`}
                      title="Hapus tugas"
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-zinc-900 leading-snug">
                  {task.tugas}
                </h4>

                {task.keterangan && (
                  <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/60 rounded-lg p-2.5">
                    {task.keterangan}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatDeadlineDisplay(task.deadline)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(task.no)}
                  disabled={togglingNo === task.no}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer min-h-[34px] disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
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
