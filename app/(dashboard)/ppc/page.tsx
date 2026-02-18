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
    const [loading, setLoading] = useState(true);
    const [lockingId, setLockingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setLoading(false);
            });
    }, []);

    const pendingOrders = orders.filter((o) => o.status === "PENDING");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">PPC Dashboard</h1>
                <p className="text-slate-500">Plan production and calculate material requirements.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="New Orders" value={pendingOrders.length} icon={AlertCircle} className="border-blue-200 bg-blue-50/30" />
                <StatsCard title="In Production" value={orders.filter(o => o.status === "IN_PRODUCTION").length} icon={Play} />
                <StatsCard title="Completed" value={orders.filter(o => o.status === "COMPLETED").length} icon={CheckCircle} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-semibold">Planning Queue</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Qty</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : pendingOrders.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No new orders to plan.</td></tr>
                            ) : (
                                pendingOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4 font-medium">{order.productName}</td>
                                        <td className="px-6 py-4">{order.quantity}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.id === lockingId ? "CALCULATING" : order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={lockingId !== null}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
