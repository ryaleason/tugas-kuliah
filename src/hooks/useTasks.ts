'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [missingEnvs, setMissingEnvs] = useState<string[]>([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingNo, setTogglingNo] = useState<number | null>(null);

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
        throw new Error(json.error || 'Gagal menambahkan tugas baru.');
      }
      setTasks((prev) => [...prev, json.data]);
    }
  };

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

  return {
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
  };
}
