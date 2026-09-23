'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { UrgentTasksSection } from '@/components/UrgentTasksSection';
import { TaskModal } from '@/components/TaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { getDaysUntilDeadline, formatDeadlineDisplay, formatDeadlineRelative } from '@/lib/date-utils';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    tasks,
    loading,
    refreshing,
    error,
    isConfigured,
    missingEnvs,
    fetchTasks,
    handleToggleStatus,
    handleSaveTask,
    handleConfirmDelete,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    isDeleting,
    togglingNo,
  } = useTasks();

  const totalCount = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Belum Selesai');
  const pendingCount = pendingTasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Selesai').length;
  const urgentCount = tasks.filter((t) => {
    if (t.status !== 'Belum Selesai') return false;
    const diff = getDaysUntilDeadline(t.deadline);
    return diff <= 3;
  }).length;

  // Next upcoming tasks (sorted by nearest deadline)
  const upcomingTasks = [...pendingTasks]
    .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black flex flex-col font-hand">
      <Navbar
        onAddNew={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        isConfigured={isConfigured}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Setup Notification Banner when in Demo Mode */}
        {!isConfigured && (
          <div className="sketch-card p-4 sm:p-5 flex items-start gap-3 text-black">
            <Info className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="text-xs sm:text-sm space-y-1">
              <div>
                <span className="font-bold mr-1.5">Mode Demo:</span>
                Google Sheets belum terhubung. Data saat ini disimpan sementara di memori server.
              </div>
              {missingEnvs.length > 0 ? (
                <div className="text-xs text-zinc-700">
                  Variabel environment berikut belum terbaca:{' '}
                  <span className="font-mono font-bold sketch-border-sm bg-zinc-100 px-1.5 py-0.5 text-black">
                    {missingEnvs.join(', ')}
                  </span>
                  . Pastikan sudah ditambahkan di Project Settings &gt; Environment Variables.
                </div>
              ) : (
                <div className="text-xs text-zinc-700">
                  Variabel terdeteksi namun belum terhubung.{' '}
                  <a href="/api/debug-env" target="_blank" rel="noreferrer" className="underline font-bold hover:text-black">
                    Buka /api/debug-env
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Title & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Dashboard Kuliah
            </h2>
            <p className="text-sm text-zinc-600 mt-0.5">
              Ringkasan progres belajar dan pantauan deadline tugas terdekat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTasks(true)}
              disabled={refreshing || loading}
              aria-label="Segarkan data tugas"
              className="sketch-btn inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-bold text-black bg-white hover:bg-zinc-100 cursor-pointer min-h-[36px] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>

        {/* Overview Stat Cards (B&W Sketch Style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Total Tugas</div>
              <div className="text-3xl font-black text-black mt-0.5">{totalCount}</div>
            </div>
            <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
              <ListTodo className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Belum Selesai</div>
              <div className="text-3xl font-black text-black mt-0.5">{pendingCount}</div>
            </div>
            <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Deadline ≤ 3 Hari</div>
              <div className="text-3xl font-black text-black mt-0.5">{urgentCount}</div>
            </div>
            <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="sketch-card p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Selesai</div>
              <div className="text-3xl font-black text-black mt-0.5">{completedCount}</div>
            </div>
            <div className="w-10 h-10 sketch-border-sm flex items-center justify-center bg-white text-black">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Section: Urgent Tasks */}
        {!loading && !error && (
          <UrgentTasksSection
            tasks={tasks}
            onToggleStatus={handleToggleStatus}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={(task) => {
              setDeletingTask(task);
            }}
            togglingNo={togglingNo}
          />
        )}

        {/* Section: Upcoming Tasks Preview & Quick Links */}
        <section aria-labelledby="upcoming-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="sketch-border-sm px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black bg-white">
              Tugas Aktif Segera Dikumpulkan
            </span>

            <Link
              href="/tugas"
              className="sketch-btn inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white text-black hover:bg-zinc-100 cursor-pointer"
            >
              <span>Lihat Semua ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="sketch-border bg-white border-dashed p-8 text-center space-y-3">
              <div className="text-lg font-bold text-black">
                🎉 Hore! Tidak ada tugas yang tertunda.
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-sm mx-auto">
                Semua tugas kuliah Anda sudah selesai atau belum ada tugas yang ditambahkan.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="sketch-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Tambah Tugas Baru</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {upcomingTasks.map((t) => (
                <div
                  key={t.no}
                  className="sketch-card p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="sketch-border-sm px-2 py-0.5 text-xs font-bold bg-white text-black">
                        {t.matkul}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500">#{t.no}</span>
                    </div>
                    <h4 className="text-base font-bold text-black leading-snug">
                      {t.tugas}
                    </h4>
                    {t.keterangan && (
                      <p className="text-xs text-zinc-600 line-clamp-1">{t.keterangan}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t-2 border-dashed border-black/15 flex items-center justify-between text-xs font-bold text-black">
                    <span>{formatDeadlineDisplay(t.deadline)}</span>
                    <span className="sketch-border-sm px-1.5 py-0.2 bg-white">
                      {formatDeadlineRelative(t.deadline)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Action Banner */}
        <section className="sketch-card p-5 sm:p-6 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-black">
              Kelola Seluruh Arsip Tugas
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600">
              Buka halaman List Tugas untuk melakukan pencarian mendalam, filter mata kuliah, dan pengeditan tugas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/tugas"
              className="sketch-btn inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer min-h-[40px]"
            >
              <span>Buka List Tugas</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-black bg-white py-6 text-center text-xs font-bold text-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            tugas-kuliah.co
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        task={deletingTask}
        loading={isDeleting}
      />
    </div>
  );
}
