"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ShoppingCart, Clock, CheckCircle2, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SalesDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setLoading(false);
            });
    }, []);

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "PENDING").length,
        inProduction: orders.filter((o) => o.status === "IN_PRODUCTION").length,
        completed: orders.filter((o) => o.status === "COMPLETED").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
                    <p className="text-slate-500">Manage and track your customer orders.</p>
                </div>
                <Link href="/sales/new">
                    <Button>New Order</Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Orders" value={stats.total} icon={History} />
                <StatsCard title="Pending" value={stats.pending} icon={Clock} />
                <StatsCard
                    title="In Production"
                    value={stats.inProduction}
                    icon={ShoppingCart}
                />
                <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-semibold">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Customer</th>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Qty</th>
                                <th className="px-6 py-3 font-medium">Delivery</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4 font-medium">{order.customerName}</td>
                                        <td className="px-6 py-4">{order.productName}</td>
                                        <td className="px-6 py-4">{order.quantity}</td>
                                        <td className="px-6 py-4">
                                            {new Date(order.deliveryDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
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
