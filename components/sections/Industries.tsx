import { INDUSTRIES_DATA } from '@/lib/data';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function Industries() {
    return (
        <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 px-1">Industries</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {INDUSTRIES_DATA.map((industry) => {
                    // Dynamically get the icon component
                    // @ts-ignore - We know the icon names are valid Lucide icons from our data
                    const IconComponent = Icons[industry.icon.charAt(0).toUpperCase() + industry.icon.slice(1)] || Icons.HelpCircle;

                    return (
                        <Card key={industry.id} className="p-4 flex flex-col items-center justify-center gap-3 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group text-center h-full">
                            <div className="p-3 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors">
                                <IconComponent className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{industry.title}</div>
                                <div className="text-[10px] text-slate-400 mt-1 hidden sm:block leading-tight">{industry.description}</div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
