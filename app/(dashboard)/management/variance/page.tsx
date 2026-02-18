"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TrendingDown, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function VarianceReportPage() {
    const [variances, setVariances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/variance")
            .then((res) => res.json())
            .then((data) => {
                setVariances(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Variance Analysis Report</h1>
                <p className="text-slate-500">Deep dive into Quantity and Price variances per order.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order / Item</th>
                                <th className="px-6 py-3 font-medium text-right">Planned Cost</th>
                                <th className="px-6 py-3 font-medium text-right">Actual Cost</th>
                                <th className="px-6 py-3 font-medium text-right">Qty Var</th>
                                <th className="px-6 py-3 font-medium text-right">Price Var</th>
                                <th className="px-6 py-3 font-medium text-center">Net Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : variances.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No variance data available.</td></tr>
                            ) : (
                                variances.map((v) => {
                                    const plannedCost = v.plannedQty * v.plannedRate;
                                    const actualCost = v.actualQty * v.actualRate;
                                    const isLoss = v.totalVariance > 0;

                                    return (
                                        <tr key={v.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{v.itemName}</div>
                                                <div className="text-xs text-slate-500">Order: {v.orderId}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                                ₹{plannedCost.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-medium">
                                                ₹{actualCost.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={v.qtyVariance > 0 ? "text-red-500 font-bold" : "text-green-600"}>
                                                    {v.qtyVariance > 0 ? "↑" : "↓"} ₹{Math.abs(v.qtyVariance).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={v.priceVariance > 0 ? "text-red-500 font-bold" : "text-green-600"}>
                                                    {v.priceVariance > 0 ? "↑" : "↓"} ₹{Math.abs(v.priceVariance).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={isLoss ? "text-red-600 font-bold bg-red-50 py-1 rounded" : "text-green-600 font-bold bg-green-50 py-1 rounded"}>
                                                    {isLoss ? "LOSS" : "SAVING"}
                                                </div>
                                                <div className="text-[10px] uppercase text-slate-400 mt-1">₹{Math.abs(v.totalVariance).toLocaleString()}</div>
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
