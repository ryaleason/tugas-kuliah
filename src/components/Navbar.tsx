'use client';

import React from 'react';
import { Plus, CheckSquare2 } from 'lucide-react';

interface NavbarProps {
  onAddNew: () => void;
  isConfigured: boolean;
}

export function Navbar({ onAddNew, isConfigured }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand: Saweria Style */}
        <div className="flex items-center gap-3">

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-black tracking-tight leading-none">
                My Tugas Kuliah
              </h1>
            </div>
          </div>
        </div>

        {/* Right Actions: Saweria Chunky Yellow Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold font-mono text-black bg-[#F6AF23] hover:bg-[#E59E15] rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
