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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-base">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <h2 id="delete-dialog-title">Hapus Tugas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-zinc-600 text-sm mb-3">
            Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1 mb-6">
            <div className="text-xs text-zinc-500 font-medium">
              #{task.no} &bull; {task.matkul}
            </div>
            <div className="text-sm font-semibold text-zinc-900">
              {task.tugas}
            </div>
            <div className="text-xs text-zinc-600">
              Deadline: {task.deadline}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
