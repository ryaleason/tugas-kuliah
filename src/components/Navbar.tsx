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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center border-2 border-black shadow-[2.5px_2.5px_0px_#000] shrink-0">
            <CheckSquare2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-black tracking-tight leading-none">
                tugas-kuliah<span className="text-zinc-500 font-mono text-sm sm:text-base font-bold">.co</span>
              </h1>
              {isConfigured && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-black text-[10px] font-mono font-bold bg-zinc-100 text-black shadow-[1.5px_1.5px_0px_#000]">
                  ● Connected
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-600 font-mono mt-0.5 hidden sm:block">
              Jembatan interaksi dengan deadline tugasmu!
            </p>
          </div>
        </div>

        {/* Right Actions: Saweria Chunky Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold font-mono text-white bg-black hover:bg-zinc-800 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>
    </header>
  );
}

