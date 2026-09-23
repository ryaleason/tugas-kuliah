'use client';

import React, { useEffect, useRef } from 'react';
import { Task } from '@/types/task';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  task: Task | null;
  loading: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  task,
  loading,
}: DeleteConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white border border-zinc-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-900 font-bold">
            <Trash2 className="w-5 h-5" />
            <h2 id="delete-dialog-title">Hapus Tugas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-zinc-600 text-sm mb-3">
            Apakah Anda yakin ingin menghapus tugas berikut?
          </p>

          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1 mb-6">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              #{task.no} &bull; {task.matkul}
            </div>
            <div className="text-sm font-bold text-zinc-900">
              {task.tugas}
            </div>
            <div className="text-xs text-zinc-500 font-medium">
              Deadline: {task.deadline}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
            >
              Batal
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black disabled:opacity-50 rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 min-h-[40px]"
            >
              {loading ? 'Menghapus...' : 'Hapus Tugas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
