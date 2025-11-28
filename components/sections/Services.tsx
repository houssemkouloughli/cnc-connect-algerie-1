import { SERVICES_DATA } from '@/lib/data';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Services() {
    return (
        <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 px-1">Nos Services</h2>
            <div className="space-y-3">
                {Object.values(SERVICES_DATA).map((service) => {
                    // Dynamically get the icon component
                    // @ts-ignore
                    const IconComponent = Icons[service.icon.charAt(0).toUpperCase() + service.icon.slice(1)] || Icons.Settings;

                    return (
                        <Link key={service.id} href={`/services/${service.id}`} className="block group">
                            <Card className="p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                                        <IconComponent className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{service.title}</h3>
                                        <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">{service.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
