'use client';

import React from 'react';
import { Task } from '@/types/task';
import {
  formatDeadlineDisplay,
  formatDeadlineRelative,
  getUrgencyLevel,
} from '@/lib/date-utils';
import { AlertCircle, Calendar, Edit2, Trash2 } from 'lucide-react';

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
        <span className="p-1 rounded-md bg-zinc-100 border border-zinc-300 text-zinc-900">
          <AlertCircle className="w-3.5 h-3.5" />
        </span>
        <h3
          id="urgent-heading"
          className="text-xs font-bold tracking-wider uppercase text-zinc-800"
        >
          Deadline Dekat (&le; 3 Hari) &bull; {urgentTasks.length} Tugas
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {urgentTasks.map((task) => {
          return (
            <div
              key={task.no}
              className="p-4 rounded-xl bg-white border border-zinc-300 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
                      {task.matkul}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">#{task.no}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                      {formatDeadlineRelative(task.deadline)}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-zinc-900 truncate">
                    {task.tugas}
                  </h4>

                  {task.keterangan && (
                    <p className="text-xs text-zinc-600 line-clamp-1">
                      {task.keterangan}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    aria-label={`Edit tugas #${task.no}`}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    aria-label={`Hapus tugas #${task.no}`}
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatDeadlineDisplay(task.deadline)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(task.no)}
                  disabled={togglingNo === task.no}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition-colors min-h-[36px]"
                >
                  <span className="w-3.5 h-3.5 rounded-xs border border-zinc-400" />
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
