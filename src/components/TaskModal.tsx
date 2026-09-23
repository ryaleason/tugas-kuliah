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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="sketch-card w-full max-w-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-50">
          <h2 id="modal-title" className="text-xl font-bold text-black">
            {initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-2.5 text-xs text-black bg-zinc-100 sketch-border-sm font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="select-matkul" className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Mata Kuliah <span className="text-black">*</span>
            </label>
            <div className="relative">
              <select
                id="select-matkul"
                ref={firstInputRef}
                required
                value={matkul}
                onChange={(e) => setMatkul(e.target.value)}
                className="sketch-input w-full px-3.5 py-2 text-sm font-bold text-black appearance-none pr-9 cursor-pointer"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                <ChevronDown className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Nama Tugas <span className="text-black">*</span>
            </label>
            <input
              type="text"
              required
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              placeholder="Contoh: Implementasi API & Frontend Next.js"
              className="sketch-input w-full px-3.5 py-2 text-sm font-bold text-black placeholder-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Deadline <span className="text-black">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="sketch-input w-full px-3.5 py-2 text-sm font-bold text-black cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Keterangan Tambahan (opsional)
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kumpul di Google Classroom, catatan dosen, dll..."
              className="sketch-input w-full px-3.5 py-2 text-sm font-bold text-black placeholder-zinc-400 resize-none"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
              Status Tugas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Belum Selesai')}
                className={`sketch-btn p-2.5 text-xs font-bold flex items-center justify-center cursor-pointer ${
                  status === 'Belum Selesai'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                Belum Selesai
              </button>

              <button
                type="button"
                onClick={() => setStatus('Selesai')}
                className={`sketch-btn p-2.5 text-xs font-bold flex items-center justify-center cursor-pointer ${
                  status === 'Selesai'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black/15">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="sketch-btn px-4 py-2 text-sm font-bold text-black bg-white hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sketch-btn inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 disabled:opacity-50 cursor-pointer min-h-[38px] min-w-[100px]"
            >
              {loading ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
