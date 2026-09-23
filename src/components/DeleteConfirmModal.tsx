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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-50">
          <div className="flex items-center gap-2 text-black font-black font-mono">
            <Trash2 className="w-5 h-5 text-black" />
            <h2 id="delete-dialog-title" className="text-base font-bold">Hapus Tugas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
            className="p-1.5 text-black hover:bg-zinc-200 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-black text-sm font-mono font-semibold mb-3">
            Apakah Anda yakin ingin menghapus tugas ini?
          </p>

          <div className="p-4 rounded-xl bg-zinc-50 border-2 border-black shadow-[3px_3px_0px_#000] space-y-1.5 mb-6">
            <div className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">
              #{task.no} &bull; {task.matkul}
            </div>
            <div className="text-base font-black text-black tracking-tight">
              {task.tugas}
            </div>
            <div className="text-xs font-mono font-bold text-black">
              Deadline: {task.deadline}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-bold font-mono text-black hover:bg-zinc-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-bold font-mono text-white bg-black hover:bg-zinc-800 disabled:opacity-50 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[40px]"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
