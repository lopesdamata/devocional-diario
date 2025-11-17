import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export default function Header() {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-20">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-yellow-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Devocional Diário</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
