import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Hero() {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005f9e] via-[#0095e8] to-[#00b4ff] text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-20 text-center space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
                    La production à la demande <br className="hidden sm:block" /> pour vos projets
                </h1>
                <p className="text-blue-50 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                    De la pièce unique à la série, accédez à un réseau de 500+ ateliers qualifiés en Algérie.
                    Usinage CNC, Impression 3D, Tôlerie et plus encore.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href="/devis" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto bg-white text-[#005f9e] hover:bg-blue-50 hover:text-blue-700 border-none font-bold text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                            Obtenir un devis instantané <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-8">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> ISO 9001
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Livraison J+3
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> Partout en Algérie
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </section>
    );
}
