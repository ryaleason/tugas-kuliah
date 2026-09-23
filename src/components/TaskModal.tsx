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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-zinc-50">
          <h2 id="modal-title" className="text-base sm:text-lg font-black text-black font-mono">
            {initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs sm:text-sm text-black bg-zinc-100 rounded-xl border-2 border-black font-mono font-bold shadow-[2px_2px_0px_#000]">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Mata Kuliah <span className="text-black">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              required
              value={matkul}
              onChange={(e) => setMatkul(e.target.value)}
              placeholder="Contoh: Pemrograman Web, Basis Data Lanjut"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white text-black placeholder-zinc-400 font-mono text-sm shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Nama Tugas <span className="text-black">*</span>
            </label>
            <input
              type="text"
              required
              value={tugas}
              onChange={(e) => setTugas(e.target.value)}
              placeholder="Contoh: Implementasi API & Frontend Next.js"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white text-black placeholder-zinc-400 font-mono text-sm shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Deadline <span className="text-black">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white text-black font-mono text-sm shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all cursor-pointer font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-1.5">
              Keterangan Tambahan (opsional)
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kumpul di Google Classroom, catatan dosen, dll..."
              className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-white text-black placeholder-zinc-400 font-mono text-sm shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] outline-none transition-all resize-none"
            />
          </div>

          {/* Status Radio */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-black mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-2.5 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000] transition-all ${
                status === 'Belum Selesai' ? 'bg-[#F6AF23] text-black' : 'bg-white text-black hover:bg-amber-50'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Belum Selesai"
                  checked={status === 'Belum Selesai'}
                  onChange={() => setStatus('Belum Selesai')}
                  className="sr-only"
                />
                <span>Belum Selesai</span>
              </label>

              <label className={`p-2.5 rounded-xl border-2 border-black font-mono text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000] transition-all ${
                status === 'Selesai' ? 'bg-[#86EFAC] text-black' : 'bg-white text-black hover:bg-emerald-50'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Selesai"
                  checked={status === 'Selesai'}
                  onChange={() => setStatus('Selesai')}
                  className="sr-only"
                />
                <span>Selesai</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-bold font-mono text-black hover:bg-zinc-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-bold font-mono text-black bg-[#F6AF23] hover:bg-[#E59E15] disabled:opacity-50 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[40px] min-w-[100px]"
            >
              {loading ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
