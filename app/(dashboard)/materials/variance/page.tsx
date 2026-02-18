"use client";

import { useEffect, useState } from "react";
import { TrendingDown, Scale, DollarSign, Package } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { toast } from "sonner";

export default function MaterialsVariancePage() {
    const [variances, setVariances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/variance")
            .then((res) => res.json())
            .then((data) => {
                setVariances(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                toast.error("Failed to load materials variance data");
                setLoading(false);
            });
    }, []);

    const totalLoss = variances.filter(v => v.totalVariance < 0).reduce((acc, v) => acc + v.totalVariance, 0);
    const wasteCount = variances.filter(v => v.qtyVariance < 0).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-emerald-700">Stock Waste & Variance</h1>
                <p className="text-slate-500">Track material consumption discrepancies and financial impact.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Financial Impact"
                    value={`₹${Math.abs(totalLoss).toLocaleString()}`}
                    icon={DollarSign}
                    className="border-red-200 bg-red-50/30"
                    description="Lost due to excess consumption"
                />
                <StatsCard title="Inefficiency Flags" value={wasteCount} icon={TrendingDown} />
                <StatsCard title="Materials Tracked" value={[...new Set(variances.map(v => v.itemName))].length} icon={Package} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-emerald-50">
                    <h3 className="font-semibold text-emerald-900">Discrepancy Detail</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Material Item</th>
                                <th className="px-6 py-3 font-medium">Order Reference</th>
                                <th className="px-6 py-3 font-medium text-right">Planned Use</th>
                                <th className="px-6 py-3 font-medium text-right">Actual Use</th>
                                <th className="px-6 py-3 font-medium text-right">Qty Diff</th>
                                <th className="px-6 py-3 font-medium text-right">Cost Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : variances.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No discrepancies recorded.</td></tr>
                            ) : (
                                variances.map((v) => (
                                    <tr key={v.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-900">{v.itemName}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{v.order?.orderNumber || v.orderId.slice(-6)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{v.plannedQty}</td>
                                        <td className="px-6 py-4 text-right font-mono">{v.actualQty}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${v.qtyVariance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                                            {v.qtyVariance > 0 ? "+" : ""}{v.qtyVariance}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${v.totalVariance < 0 ? "text-red-700" : "text-emerald-700"}`}>
                                            ₹{v.totalVariance.toLocaleString()}
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
