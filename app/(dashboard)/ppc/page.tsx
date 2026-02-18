"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ListChecks, AlertCircle, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PPCDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lockingId, setLockingId] = useState<string | null>(null);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ordersRes, teamRes] = await Promise.all([
                fetch("/api/orders"),
                fetch("/api/team/ppc")
            ]);
            const ordersData = await ordersRes.json();
            const teamData = await teamRes.json();

            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setTeam(Array.isArray(teamData) ? teamData : []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load dashboard data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.user?.role?.includes("_EMPLOYEE")) {
                    router.push("/ppc/my-tasks");
                } else {
                    fetchDashboardData();
                }
            });
    }, []);

    const handleAssign = async (orderId: string, employeeId: string) => {
        setAssigningId(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId }),
            });
            if (!res.ok) throw new Error();
            toast.success("Task assigned successfully");
            fetchDashboardData();
        } catch (e) {
            toast.error("Failed to assign task");
        }
        setAssigningId(null);
    };

    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const unassignedCount = pendingOrders.filter(o => !o.assignedToId).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">PPC Planning & Assignment</h1>
                <p className="text-slate-500">Assign orders to your team and monitor production.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Unassigned" value={unassignedCount} icon={AlertCircle} className="border-amber-200 bg-amber-50/30" />
                <StatsCard title="In Production" value={orders.filter(o => o.status === "IN_PRODUCTION").length} icon={Play} />
                <StatsCard title="Completed" value={orders.filter(o => o.status === "COMPLETED").length} icon={CheckCircle} />
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Team Workload</h4>
                    <div className="space-y-2">
                        {team.map(member => (
                            <div key={member.id} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">{member.name}</span>
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{member._count.assignedOrders} orders</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-semibold">Order Assignment Queue</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order#</th>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Qty</th>
                                <th className="px-6 py-3 font-medium">Assigned To</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : pendingOrders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No pending orders.</td></tr>
                            ) : (
                                pendingOrders.map((order) => {
                                    const assignedMember = team.find(t => t.id === order.assignedToId);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-xs">{order.orderNumber || order.id.slice(-6)}</td>
                                            <td className="px-6 py-4 font-medium">{order.productName}</td>
                                            <td className="px-6 py-4">{order.quantity}</td>
                                            <td className="px-6 py-4">
                                                {assignedMember ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                                        {assignedMember.name}
                                                    </span>
                                                ) : (
                                                    <select
                                                        className="text-xs border rounded px-2 py-1 bg-white"
                                                        disabled={assigningId === order.id}
                                                        onChange={(e) => handleAssign(order.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Assign to...</option>
                                                        {team.map(member => (
                                                            <option key={member.id} value={member.id}>{member.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.id === lockingId ? "CALCULATING" : order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={lockingId !== null || !order.assignedToId}
                                                    onClick={async () => {
                                                        setLockingId(order.id);
                                                        try {
                                                            const res = await fetch("/api/ppc/lock", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ orderId: order.id }),
                                                            });
                                                            if (!res.ok) throw new Error();
                                                            router.push(`/ppc/${order.id}`);
                                                        } catch (e) {
                                                            toast.error("Failed to lock order");
                                                            setLockingId(null);
                                                        }
                                                    }}
                                                >
                                                    {lockingId === order.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : "Calculate BOM"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
