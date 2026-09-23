'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, CreateTaskInput, TaskStatus } from '@/types/task';
import { Navbar } from '@/components/Navbar';
import { TaskFilterBar } from '@/components/TaskFilterBar';
import { UrgentTasksSection } from '@/components/UrgentTasksSection';
import { TaskTable } from '@/components/TaskTable';
import { TaskModal } from '@/components/TaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Info, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [missingEnvs, setMissingEnvs] = useState<string[]>([]);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [matkulFilter, setMatkulFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingNo, setTogglingNo] = useState<number | null>(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch('/api/tasks');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengambil data tugas.');
      }

      setTasks(json.data || []);
      if (typeof json.isConfigured === 'boolean') {
        setIsConfigured(json.isConfigured);
      }
      if (Array.isArray(json.missingEnvs)) {
        setMissingEnvs(json.missingEnvs);
      } else {
        setMissingEnvs([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan jaringan.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Unique list of matkuls for dropdown
  const uniqueMatkuls = useMemo(() => {
    const list = tasks.map((t) => t.matkul.trim()).filter(Boolean);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by Status
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }
      // Filter by Matkul
      if (matkulFilter !== 'ALL' && task.matkul !== matkulFilter) {
        return false;
      }
      // Filter by Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchMatkul = task.matkul.toLowerCase().includes(query);
        const matchTugas = task.tugas.toLowerCase().includes(query);
        const matchKet = task.keterangan?.toLowerCase().includes(query);
        if (!matchMatkul && !matchTugas && !matchKet) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, matkulFilter, search]);

  // Toggle status
  const handleToggleStatus = async (no: number) => {
    try {
      setTogglingNo(no);
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.no === no
            ? { ...t, status: t.status === 'Selesai' ? 'Belum Selesai' : 'Selesai' }
            : t
        )
      );

      const res = await fetch(`/api/tasks/${no}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengubah status.');
      }

      setTasks((prev) => prev.map((t) => (t.no === no ? json.data : t)));
    } catch (err) {
      console.error(err);
      await fetchTasks(true);
    } finally {
      setTogglingNo(null);
    }
  };

  // Create or Update task
  const handleSaveTask = async (data: CreateTaskInput) => {
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.no}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperbarui tugas.');
      }
      setTasks((prev) => prev.map((t) => (t.no === editingTask.no ? json.data : t)));
    } else {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan tugas.');
      }
      setTasks((prev) => [...prev, json.data].sort((a, b) => a.deadline.localeCompare(b.deadline)));
    }
  };

  // Delete task
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks/${deletingTask.no}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus tugas.');
      }
      setTasks((prev) => prev.filter((t) => t.no !== deletingTask.no));
      setDeletingTask(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(search || statusFilter !== 'ALL' || matkulFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setMatkulFilter('ALL');
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] text-black flex flex-col font-sans">
      <Navbar
        onAddNew={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        isConfigured={isConfigured}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Setup Notification Banner when in Demo Mode (Saweria Info Box style) */}
        {!isConfigured && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-black shadow-[5px_5px_0px_#000] flex items-start gap-3.5 font-mono">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_#000]">
              <Info className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm text-black space-y-1.5 leading-relaxed">
              <div>
                <span className="font-black bg-black text-white px-1.5 py-0.5 rounded text-xs mr-1.5">MODE DEMO</span>
                <span className="font-bold">Google Sheets Belum Terhubung:</span> Data saat ini disimpan sementara di memori server.
              </div>
              {missingEnvs.length > 0 ? (
                <div className="text-xs text-zinc-700">
                  Variabel environment berikut belum terbaca oleh server Vercel:{' '}
                  <span className="font-mono font-black border border-black bg-zinc-100 px-1.5 py-0.5 rounded text-black">
                    {missingEnvs.join(', ')}
                  </span>
                  . Pastikan variabel sudah ditambahkan di Project Settings &gt; Environment Variables dan lakukan Redeploy.
                </div>
              ) : (
                <div className="text-xs text-zinc-700">
                  Variabel environment terdeteksi, namun kredensial belum valid atau belum tersambung ke Sheet.{' '}
                  <a href="/api/debug-env" target="_blank" rel="noreferrer" className="underline font-bold hover:text-black">
                    Buka /api/debug-env
                  </a>{' '}
                  untuk melihat status diagnostik.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Title & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black flex items-center gap-2">
              Daftar Tugas Kuliah
            </h2>
            <p className="text-xs sm:text-sm font-mono text-zinc-600 mt-1">
              Pantau deadline dan kelola tugas kuliah Anda secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTasks(true)}
              disabled={refreshing || loading}
              aria-label="Segarkan data tugas"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold font-mono text-black bg-[#85D7E8] hover:bg-[#68CBE0] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[40px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <TaskFilterBar
          tasks={tasks}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          matkulFilter={matkulFilter}
          onMatkulFilterChange={setMatkulFilter}
          uniqueMatkuls={uniqueMatkuls}
        />

        {/* Section 1: DEADLINE DEKAT (≤3 hari) as per design.md Section 1.1 */}
        {!loading && !error && (
          <UrgentTasksSection
            tasks={filteredTasks}
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

        {/* Section 2: SEMUA TUGAS Table / Cards as per design.md Section 1.1 */}
        <TaskTable
          tasks={filteredTasks}
          loading={loading}
          error={error}
          onRetry={() => fetchTasks()}
          onAddNew={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
          onEdit={(task) => {
            setEditingTask(task);
            setIsModalOpen(true);
          }}
          onDelete={(task) => {
            setDeletingTask(task);
          }}
          togglingNo={togglingNo}
          hasFilters={hasActiveFilters}
          onClearFilters={handleResetFilters}
        />
      </main>

      {/* Footer: Saweria style badge */}
      <footer className="mt-auto border-t-2 border-black bg-white py-6 text-center text-xs font-mono font-bold text-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            tugas-kuliah.co &bull; Terhubung ke Google Sheets &amp; Telegram Bot
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black bg-[#FDA4AF] shadow-[2px_2px_0px_#000] text-[11px] text-black font-black">
            <span>⚡ Saweria Palette Edition</span>
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
