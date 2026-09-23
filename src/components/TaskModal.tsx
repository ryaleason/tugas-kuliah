'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, CreateTaskInput, TaskStatus } from '@/types/task';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  initialTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSubmit, initialTask }: TaskModalProps) {
  const [matkul, setMatkul] = useState('');
  const [tugas, setTugas] = useState('');
  const [deadline, setDeadline] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Belum Selesai');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTask) {
      setMatkul(initialTask.matkul);
      setTugas(initialTask.tugas);
      setDeadline(initialTask.deadline);
      setKeterangan(initialTask.keterangan || '');
      setStatus(initialTask.status);
    } else {
      setMatkul('');
      setTugas('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDeadline(defaultDate.toISOString().split('T')[0]);
      setKeterangan('');
      setStatus('Belum Selesai');
    }
    setErrorMessage('');
  }, [initialTask, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matkul.trim()) {
      setErrorMessage('Mata kuliah wajib diisi.');
      return;
    }
    if (!tugas.trim()) {
      setErrorMessage('Nama tugas wajib diisi.');
      return;
    }
    if (!deadline) {
      setErrorMessage('Tanggal deadline wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      await onSubmit({
        matkul: matkul.trim(),
        tugas: tugas.trim(),
        deadline,
        keterangan: keterangan.trim(),
        status,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan tugas.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white border border-zinc-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 id="modal-title" className="text-base font-bold text-zinc-900">
            {initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm text-zinc-900 bg-zinc-100 rounded-lg border border-zinc-200 font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Mata Kuliah <span className="text-zinc-900">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              required
              value={matkul}
              onChange={(e) => setMatkul(e.target.value)}
              placeholder="Contoh: Pemrograman Web, Basis Data Lanjut"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Nama Tugas <span className="text-zinc-900">*</span>
            </label>
            <input
              type="text"
              required
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              placeholder="Contoh: ERD Toko Buku, Laporan Praktikum"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Deadline <span className="text-zinc-900">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Keterangan Tambahan (opsional)
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kumpul di Google Classroom, catatan dosen, dll..."
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-hidden transition-all text-sm resize-none font-medium"
            />
          </div>

          {/* Status Radio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Status
            </label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-zinc-800 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="status"
                  value="Belum Selesai"
                  checked={status === 'Belum Selesai'}
                  onChange={() => setStatus('Belum Selesai')}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 focus:ring-zinc-900"
                />
                <span>Belum Selesai</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-zinc-800 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="status"
                  value="Selesai"
                  checked={status === 'Selesai'}
                  onChange={() => setStatus('Selesai')}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 focus:ring-zinc-900"
                />
                <span>Selesai</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-zinc-900"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black disabled:opacity-50 rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 min-h-[40px] min-w-[100px]"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
