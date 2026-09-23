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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="sketch-card w-full max-w-md bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-50">
          <div className="flex items-center gap-2 text-black font-bold text-lg">
            <Trash2 className="w-5 h-5 stroke-[2.5]" />
            <h2 id="delete-dialog-title">Hapus Tugas</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup dialog"
            className="sketch-btn p-1 bg-white text-black hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-black text-sm mb-3 font-medium">
            Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="p-3.5 sketch-border-sm bg-zinc-50 space-y-1 mb-6">
            <div className="text-xs text-zinc-600 font-bold uppercase tracking-wider">
              #{task.no} &bull; {task.matkul}
            </div>
            <div className="text-base font-bold text-black">
              {task.tugas}
            </div>
            <div className="text-xs text-black font-bold">
              Deadline: {task.deadline}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black/15">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="sketch-btn px-4 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="sketch-btn inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 disabled:opacity-50 cursor-pointer min-h-[38px]"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
