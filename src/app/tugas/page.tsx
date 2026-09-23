'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { TaskFilterBar } from '@/components/TaskFilterBar';
import { TaskTable } from '@/components/TaskTable';
import { TaskModal } from '@/components/TaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus, MATA_KULIAH_LIST } from '@/types/task';
import { RefreshCw } from 'lucide-react';

export default function ListTugasPage() {
  const {
    tasks,
    loading,
    refreshing,
    error,
    isConfigured,
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

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [matkulFilter, setMatkulFilter] = useState('ALL');

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

  const hasActiveFilters = Boolean(search || statusFilter !== 'ALL' || matkulFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setMatkulFilter('ALL');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black flex flex-col font-hand">
      <Navbar
        onAddNew={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        isConfigured={isConfigured}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Title & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Daftar Tugas Kuliah
            </h2>
            <p className="text-sm text-zinc-600 mt-0.5">
              Kelola, cari, dan perbarui seluruh data tugas perkuliahan Anda.
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

        {/* SEMUA TUGAS Table / Cards */}
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
