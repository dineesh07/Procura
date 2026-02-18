"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { Truck, ShoppingBag, Clock, CheckCircle } from "lucide-react";

export default function PurchaseDashboard() {
    const [stats, setStats] = useState({ pendingRequests: 0, activePOs: 0, delivered: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reqRes, poRes] = await Promise.all([
                    fetch("/api/material-requests"),
                    fetch("/api/purchase-orders"),
                ]);
                const reqs = await reqRes.json();
                const pos = await poRes.json();

                const safeReqs = Array.isArray(reqs) ? reqs : [];
                const safePos = Array.isArray(pos) ? pos : [];

                if (!Array.isArray(reqs)) console.error("Requests API error:", reqs?.error);
                if (!Array.isArray(pos)) console.error("POs API error:", pos?.error);

                setStats({
                    pendingRequests: safeReqs.filter((r: any) => r.status === "APPROVED").length,
                    activePOs: safePos.filter((p: any) => p.status === "ORDERED").length,
                    delivered: safePos.filter((p: any) => p.status === "RECEIVED").length,
                });
            } catch (error) {
                console.error("Failed to fetch purchase dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Purchase Dashboard</h1>
                <p className="text-slate-500">Manage supplier orders and procurement requests.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Pending Requests" value={stats.pendingRequests} icon={Clock} className="border-orange-200 bg-orange-50/30" />
                <StatsCard title="Active POs" value={stats.activePOs} icon={ShoppingBag} />
                <StatsCard title="Completed" value={stats.delivered} icon={CheckCircle} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm flex flex-col justify-center items-center p-12 space-y-4">
                <Truck className="w-16 h-16 text-slate-200" />
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Supply Chain Management</h2>
                    <p className="text-sm text-slate-500 max-w-md">Use the sidebar to view incoming purchase requests or track existing purchase orders sent to suppliers.</p>
                </div>
            </div>
        </div>
    );
}
