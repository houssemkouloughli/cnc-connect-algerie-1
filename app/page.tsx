import Hero from '@/components/sections/Hero';
import Services from '@/components/sections/Services';
import Industries from '@/components/sections/Industries';
import QuickAccess from '@/components/sections/QuickAccess';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <Hero />
      <Services />
      <Industries />
      <QuickAccess />
    </div>
  );
}
