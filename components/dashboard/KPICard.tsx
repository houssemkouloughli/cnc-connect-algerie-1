import { Card, CardContent } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: LucideIcon;
    color?: string;
}

export default function KPICard({ title, value, trend, trendUp, icon: Icon, color = "blue" }: KPICardProps) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", colorClasses[color as keyof typeof colorClasses] || colorClasses.blue)}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className={cn("text-xs font-bold px-2 py-1 rounded-full", trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
                </div>
            </CardContent>
        </Card>
    );
}
