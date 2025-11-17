import React from 'react';
import Header from './components/Header';
import Devotional from './components/Devotional';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <Devotional />
      </main>
    </div>
  );
}
