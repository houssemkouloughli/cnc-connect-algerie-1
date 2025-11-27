"use client";

import { WILAYAS, Wilaya } from '@/lib/constants/wilayas';

interface WilayaSelectorProps {
    value: string;
    onChange: (wilayaCode: string) => void;
    placeholder?: string;
    className?: string;
}

export default function WilayaSelector({ value, onChange, placeholder = "Sélectionner une wilaya", className = "" }: WilayaSelectorProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        >
            <option value="">{placeholder}</option>
            {WILAYAS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                    {wilaya.code} - {wilaya.name}
                </option>
            ))}
        </select>
    );
}
