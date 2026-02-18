"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingCart,
    Calculator,
    Package,
    Truck,
    BarChart3,
    AlertTriangle,
    History,
    TrendingDown,
} from "lucide-react";

interface SidebarProps {
    role: string;
}

const roleMenus: Record<string, any[]> = {
    SALES: [
        { label: "Dashboard", href: "/sales", icon: LayoutDashboard },
        { label: "Orders", href: "/sales/orders", icon: ShoppingCart },
        { label: "New Order", href: "/sales/new", icon: LayoutDashboard }, // Using LayoutDashboard for now if ShoppingCart is used
    ],
    PPC_MANAGER: [
        { label: "Dashboard", href: "/ppc", icon: LayoutDashboard },
        { label: "All Orders", href: "/ppc/orders", icon: ShoppingCart },
        { label: "Production", href: "/ppc/production", icon: Calculator },
        { label: "Variance Reports", href: "/ppc/variance", icon: TrendingDown },
        { label: "Team", href: "/ppc/team", icon: Package },
    ],
    PPC_EMPLOYEE: [
        { label: "Dashboard", href: "/ppc", icon: LayoutDashboard },
        { label: "My Tasks", href: "/ppc/my-tasks", icon: ShoppingCart },
        { label: "Production", href: "/ppc/production", icon: Calculator },
    ],
    MATERIALS_MANAGER: [
        { label: "Dashboard", href: "/materials", icon: LayoutDashboard },
        { label: "All Requests", href: "/materials/requests", icon: Truck },
        { label: "Inventory", href: "/materials/inventory", icon: Package },
        { label: "Alerts", href: "/materials/alerts", icon: AlertTriangle },
        { label: "Variance Reports", href: "/materials/variance", icon: TrendingDown },
        { label: "Team", href: "/materials/team", icon: Package },
    ],
    MATERIALS_EMPLOYEE: [
        { label: "Dashboard", href: "/materials", icon: LayoutDashboard },
        { label: "My Tasks", href: "/materials/my-tasks", icon: ShoppingCart },
        { label: "Inventory", href: "/materials/inventory", icon: Package },
        { label: "Alerts", href: "/materials/alerts", icon: AlertTriangle },
    ],
    PURCHASE: [
        { label: "Dashboard", href: "/purchase", icon: LayoutDashboard },
        { label: "Requests", href: "/purchase/requests", icon: Truck },
        { label: "Orders", href: "/purchase/orders", icon: History },
    ],
};

export const Sidebar = ({ role }: SidebarProps) => {
    const pathname = usePathname();
    const menu = roleMenus[role.toUpperCase()] || [];

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4">
            <div className="mb-8 px-2">
                <h1 className="text-2xl font-black tracking-tighter text-blue-500">PROCURA</h1>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold font-mono">{role}</p>
            </div>

            <nav className="flex-1 space-y-1">
                {menu.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
