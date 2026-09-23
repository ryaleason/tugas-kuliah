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
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black bg-[#FDA4AF] text-black font-mono text-xs font-black shadow-[2px_2px_0px_#000]">
          <AlertCircle className="w-4 h-4 text-black stroke-[3]" />
          <span>DEADLINE DEKAT (&le; 3 HARI) &bull; {urgentTasks.length} TUGAS</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {urgentTasks.map((task) => {
          return (
            <div
              key={task.no}
              className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#EDE9FE] text-purple-950 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                      {task.matkul}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">#{task.no}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#FECDD3] text-rose-950 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                      {formatDeadlineRelative(task.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      aria-label={`Edit tugas #${task.no}`}
                      title="Edit tugas"
                      className="p-1.5 text-black bg-white hover:bg-[#E0F2FE] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      aria-label={`Hapus tugas #${task.no}`}
                      title="Hapus tugas"
                      className="p-1.5 text-black bg-white hover:bg-[#FEE2E2] rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base sm:text-lg font-black text-black tracking-tight leading-snug">
                  {task.tugas}
                </h4>

                {task.keterangan && (
                  <p className="text-xs font-mono text-zinc-700 bg-[#FDFBF7] border border-black/20 rounded-xl p-2.5">
                    {task.keterangan}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-black">
                  <Calendar className="w-4 h-4 text-black" />
                  <span>{formatDeadlineDisplay(task.deadline)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStatus(task.no)}
                  disabled={togglingNo === task.no}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl border-2 border-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[36px]"
                >
                  <span className="w-4 h-4 rounded-xs border-2 border-black flex items-center justify-center bg-white" />
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
