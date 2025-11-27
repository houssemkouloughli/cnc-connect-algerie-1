"use client";

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import QuickAccess from '@/components/sections/QuickAccess';
import Industries from '@/components/sections/Industries';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Hero />
        <Services />
        <QuickAccess />
        <Industries />
      </main>

      <BottomNav />
    </div>
  );
}

