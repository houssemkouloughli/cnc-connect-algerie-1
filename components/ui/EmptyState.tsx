'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
                {description}
            </p>

            {actionLabel && (
                <>
                    {actionHref ? (
                        <Link href={actionHref}>
                            <Button>
                                {actionLabel}
                            </Button>
                        </Link>
                    ) : onAction ? (
                        <Button onClick={onAction}>
                            {actionLabel}
                        </Button>
                    ) : null}
                </>
            )}
        </div>
    );
}
