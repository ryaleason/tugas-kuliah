'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onAddNew: () => void;
  isConfigured: boolean;
}

export function Navbar({ onAddNew, isConfigured }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand: Hand-drawn Sketch Style */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight leading-none">
              My Tugas Kuliah
            </h1>
            {isConfigured && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-black sketch-border-sm bg-white">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>Terhubung</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action: Hand-drawn Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="sketch-btn inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tambah Tugas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
