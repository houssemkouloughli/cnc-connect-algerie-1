import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AIChat from '@/components/dashboard/AIChat';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <DashboardHeader />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
                <AIChat />
            </div>
        </div>
    );
}
