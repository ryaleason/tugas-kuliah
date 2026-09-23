'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Task, CreateTaskInput, TaskStatus, MATA_KULIAH_LIST } from '@/types/task';
import { X, ChevronDown } from 'lucide-react';

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

  const firstInputRef = useRef<HTMLSelectElement>(null);

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
      setErrorMessage('Pilih mata kuliah terlebih dahulu.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h2 id="modal-title" className="text-base font-semibold text-zinc-900">
            {initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-lg border border-rose-200/80 font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="select-matkul" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Mata Kuliah <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-matkul"
                ref={firstInputRef}
                required
                value={matkul}
                onChange={(e) => setMatkul(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 appearance-none pr-9 transition-colors shadow-xs cursor-pointer"
              >
                <option value="" disabled>-- Pilih Mata Kuliah --</option>
                {MATA_KULIAH_LIST.map((mk) => (
                  <option key={mk} value={mk}>
                    {mk}
                  </option>
                ))}
                {initialTask && initialTask.matkul && !(MATA_KULIAH_LIST as readonly string[]).includes(initialTask.matkul) && (
                  <option value={initialTask.matkul}>{initialTask.matkul}</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <ChevronDown className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Nama Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              placeholder="Contoh: Implementasi API & Frontend Next.js"
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-xs cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Keterangan Tambahan (opsional)
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kumpul di Google Classroom, catatan dosen, dll..."
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors resize-none shadow-xs"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Status Tugas
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('Belum Selesai')}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                  status === 'Belum Selesai'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Belum Selesai
              </button>

              <button
                type="button"
                onClick={() => setStatus('Selesai')}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                  status === 'Selesai'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px] min-w-[100px]"
            >
              {loading ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
