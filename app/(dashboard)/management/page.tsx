"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { BarChart3, TrendingDown, Package, CheckCircle2, IndianRupee } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

export default function ManagementDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [variances, setVariances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [statsRes, varRes] = await Promise.all([
                fetch("/api/management/stats"),
                fetch("/api/variance"),
            ]);
            setStats(await statsRes.json());
            setVariances(await varRes.json());
            setLoading(false);
        }
        fetchData();
    }, []);

    const chartData = variances.slice(0, 6).map(v => ({
        name: v.itemName,
        planned: v.plannedQty * v.plannedRate,
        actual: v.actualQty * v.actualRate,
    }));

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Executive Summary</h1>
                <p className="text-slate-500">Global performance metrics and financial variance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <StatsCard title="Total Orders" value={stats.totalOrders} icon={CheckCircle2} />
                <StatsCard title="Pending" value={stats.pendingOrders} icon={BarChart3} />
                <StatsCard title="In Production" value={stats.inProductionOrders} icon={TrendingDown} />
                <StatsCard
                    title="Net Variance"
                    value={`₹${stats.totalVariance.toLocaleString()}`}
                    icon={IndianRupee}
                    className={stats.totalVariance > 0 ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"}
                    description={stats.totalVariance > 0 ? "Underperforming" : "Saving Costs"}
                />
                <StatsCard title="Completed" value={stats.completedOrders} icon={Package} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 bg-white border rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold mb-6">Planned vs Actual Cost (Top Items)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                />
                                <Bar dataKey="planned" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Planned Cost" />
                                <Bar dataKey="actual" fill="#ef4444" radius={[4, 4, 0, 0]} name="Actual Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border rounded-lg shadow-sm p-6 flex flex-col justify-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-slate-50 w-fit mx-auto">
                        <TrendingDown className="w-12 h-12 text-slate-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-xl">Operational Health</h4>
                        <p className="text-sm text-slate-500 mt-2">Use the detailed variance report to identify specific bottlenecks in production or procurement pricings.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
