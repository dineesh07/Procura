"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Package, AlertTriangle, ArrowDownToLine, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MaterialsDashboard() {
    const [stats, setStats] = useState<any>({ alerts: 0, requests: 0, items: 0 });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [alertsRes, requestsRes, invRes] = await Promise.all([
                fetch("/api/inventory/alerts"),
                fetch("/api/material-requests"),
                fetch("/api/inventory"),
            ]);

            const alertsData = await alertsRes.json();
            const requestsData = await requestsRes.json();
            const invData = await invRes.json();

            setAlerts(alertsData);
            setStats({
                alerts: alertsData.length,
                requests: requestsData.filter((r: any) => r.status === "PENDING").length,
                items: invData.length,
            });
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Materials Dashboard</h1>
                    <p className="text-slate-500">Monitor stock health and process PPC requests.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Stock Alerts"
                    value={stats.alerts}
                    icon={AlertTriangle}
                    className={stats.alerts > 0 ? "border-red-200 bg-red-50/30" : ""}
                    description={stats.alerts > 0 ? "Immediate action required" : "All stock levels healthy"}
                />
                <StatsCard title="Open Requests" value={stats.requests} icon={Clock} />
                <StatsCard title="Total Inventory" value={stats.items} icon={Package} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                        <h3 className="font-semibold text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> 🔴 Reorder Alerts
                        </h3>
                        <Link href="/materials/alerts" className="text-xs text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td className="px-6 py-8 text-center">Loading...</td></tr>
                                ) : alerts.length === 0 ? (
                                    <tr><td className="px-6 py-8 text-center text-slate-400">All good! No alerts.</td></tr>
                                ) : (
                                    alerts.slice(0, 5).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium">{item.itemName}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-slate-500">Stock</div>
                                                <div className="font-mono">{item.currentStock} {item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.alertStatus} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white border rounded-lg shadow-sm flex flex-col justify-center items-center p-8 space-y-4">
                    <Package className="w-12 h-12 text-slate-200" />
                    <div className="text-center">
                        <h4 className="font-semibold">Inventory Management</h4>
                        <p className="text-sm text-slate-500">View detailed stock levels and history.</p>
                    </div>
                    <Link href="/materials/inventory" className="w-full">
                        <Button variant="outline" className="w-full">Open Inventory List</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
