"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Package, AlertTriangle, ArrowDownToLine, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MaterialsDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>({ alerts: 0, requests: 0, items: 0 });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const sessionRes = await fetch("/api/auth/session");
                const sessionData = await sessionRes.json();

                if (sessionData?.user?.role === "MATERIALS_EMPLOYEE") {
                    router.push("/materials/my-tasks");
                    return;
                }

                const [alertsRes, requestsRes, invRes, teamRes] = await Promise.all([
                    fetch("/api/inventory/alerts"),
                    fetch("/api/material-requests"),
                    fetch("/api/inventory"),
                    fetch("/api/team/materials"),
                ]);

                const alertsData = await alertsRes.json();
                const requestsData = await requestsRes.json();
                const invData = await invRes.json();
                const teamData = await teamRes.json();

                // Validate responses
                const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
                const safeRequests = Array.isArray(requestsData) ? requestsData : [];
                const safeInv = Array.isArray(invData) ? invData : [];
                const safeTeam = Array.isArray(teamData) ? teamData : [];

                setAlerts(safeAlerts);
                setTeam(safeTeam);
                setStats({
                    alerts: safeAlerts.length,
                    requests: safeRequests.filter((r: any) => r.status === "PENDING").length,
                    items: safeInv.length,
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error("Failed to load materials data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Materials Operations</h1>
                    <p className="text-slate-500">Manage stock, alerts, and team assignments.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard
                    title="Stock Alerts"
                    value={stats.alerts}
                    icon={AlertTriangle}
                    className={stats.alerts > 0 ? "border-red-200 bg-red-50/30" : ""}
                />
                <StatsCard title="Open Requests" value={stats.requests} icon={Clock} />
                <StatsCard title="Total Inventory" value={stats.items} icon={Package} />
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Team Workload</h4>
                    <div className="space-y-2">
                        {team.map(member => (
                            <div key={member.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">{member.name}</span>
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{member._count.assignedMaterialReqs} tasks</span>
                            </div>
                        ))}
                    </div>
                </div>
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
                                    alerts.slice(0, 5).map((item) => {
                                        const runway = item.daysRemaining ?? 0;
                                        const isCritical = runway < 3 || item.alertStatus === "CRITICAL";

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-xs">
                                                        {item.itemName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {isCritical ? '🚨 CRITICAL SHORTAGE' : '⏳ LOW STOCK'}
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Stock: <span className="font-mono text-slate-900">{item.currentStock}</span> |
                                                        Min: <span className="font-mono text-slate-400">{item.predictedLevel}</span>
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className={`text-lg font-black font-mono tracking-tighter ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                                            {runway <= 0 ? "NOW" : `${runway.toFixed(1)}d`}
                                                        </span>
                                                        <span className="text-[9px] uppercase font-bold text-slate-400">Runway Remaining</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
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
