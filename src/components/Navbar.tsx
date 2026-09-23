'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onAddNew: () => void;
  isConfigured: boolean;
}

export function Navbar({ onAddNew, isConfigured }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight leading-none group-hover:underline">
              My Tugas Kuliah
            </h1>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              className={`px-3 py-1 text-sm font-bold transition-all cursor-pointer ${
                pathname === '/'
                  ? 'sketch-border-sm bg-black text-white'
                  : 'text-black hover:bg-zinc-100 rounded'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/tugas"
              className={`px-3 py-1 text-sm font-bold transition-all cursor-pointer ${
                pathname === '/tugas'
                  ? 'sketch-border-sm bg-black text-white'
                  : 'text-black hover:bg-zinc-100 rounded'
              }`}
            >
              List Tugas
            </Link>
          </nav>
        </div>

        {/* Right Action: Hand-drawn Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onAddNew}
            className="sketch-btn inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-white bg-black hover:bg-zinc-800 cursor-pointer min-h-[36px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">+ Tambah Tugas</span>
            <span className="sm:hidden">+ Tugas</span>
          </button>
        </div>
      </div>
    </header>
  );
}
