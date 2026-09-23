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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6AF23] text-black flex items-center justify-center border-2 border-black shadow-[2.5px_2.5px_0px_#000] shrink-0 font-black">
            <CheckSquare2 className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-black tracking-tight leading-none">
                tugas-kuliah<span className="text-[#E59E15] font-mono text-sm sm:text-base font-black">.co</span>
              </h1>
              {isConfigured && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-2 border-black text-[11px] font-mono font-bold bg-[#BBF7D0] text-black shadow-[1.5px_1.5px_0px_#000]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Online</span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-600 font-mono mt-0.5 hidden sm:block">
              Jembatan interaksi dengan deadline tugasmu!
            </p>
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

