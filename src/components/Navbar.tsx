'use client';

import React from 'react';
import { Plus, CheckSquare } from 'lucide-react';

interface NavbarProps {
  onAddNew: () => void;
  isConfigured: boolean;
}

export function Navbar({ onAddNew }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand: Dominant White with Sharp Black Text */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight tracking-tight">
              Task Tracker Kuliah
            </h1>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Web UI & Telegram Bot Dashboard
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black active:bg-zinc-800 rounded-lg shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
}
