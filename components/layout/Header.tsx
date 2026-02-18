"use client";

import { signOut } from "next-auth/react";
import { User, LogOut, Bell } from "lucide-react";

interface HeaderProps {
    userName: string;
}

export const Header = ({ userName }: HeaderProps) => {
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="font-bold text-blue-600">Procura</span>
                <span>/</span>
                <span className="font-medium text-slate-900">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-600">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="h-6 w-px bg-slate-200" />

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-slate-900">{userName}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User className="w-5 h-5" />
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="p-2 text-slate-400 hover:text-red-600"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};
