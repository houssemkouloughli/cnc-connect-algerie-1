import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
    return (
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
    );
}
