'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onAddNew: () => void;
  isConfigured: boolean;
}

export function Navbar({ onAddNew, isConfigured }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand: User's title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight leading-none">
              My Tugas Kuliah
            </h1>
            {isConfigured && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terhubung</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action: Clean Primary CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
