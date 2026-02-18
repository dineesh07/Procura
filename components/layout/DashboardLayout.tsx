import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: string;
    userName: string;
}

export default function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header userName={userName} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
