'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, CreateTaskInput, TaskStatus, MATA_KULIAH_LIST } from '@/types/task';
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
    const combined = Array.from(new Set([...MATA_KULIAH_LIST, ...list]));
    return combined;
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
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 flex flex-col font-sans">
      <Navbar
        onAddNew={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        isConfigured={isConfigured}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Setup Notification Banner when in Demo Mode */}
        {!isConfigured && (
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <div>
                <span className="font-semibold mr-1.5">Mode Demo:</span>
                Google Sheets belum terhubung. Data saat ini disimpan sementara di memori server.
              </div>
              {missingEnvs.length > 0 ? (
                <div className="text-xs text-amber-800">
                  Variabel environment berikut belum terbaca:{' '}
                  <span className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-medium">
                    {missingEnvs.join(', ')}
                  </span>
                  . Pastikan sudah ditambahkan di Project Settings &gt; Environment Variables.
                </div>
              ) : (
                <div className="text-xs text-amber-800">
                  Variabel terdeteksi namun belum terhubung.{' '}
                  <a href="/api/debug-env" target="_blank" rel="noreferrer" className="underline font-medium hover:text-amber-950">
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Daftar Tugas Kuliah
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Pantau deadline dan kelola tugas kuliah secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTasks(true)}
              disabled={refreshing || loading}
              aria-label="Segarkan data tugas"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
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

        {/* Section 1: DEADLINE DEKAT (≤3 hari) */}
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

        {/* Section 2: SEMUA TUGAS Table / Cards */}
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

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-6 text-center text-xs text-zinc-500">
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
