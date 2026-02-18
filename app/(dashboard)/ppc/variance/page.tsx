"use client";

import { useEffect, useState } from "react";
import { TrendingDown, Scale, IndianRupee, Package, FileDown, Target, Building2 } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PPCVariancePage() {
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
                toast.error("Failed to load variance reports");
                setLoading(false);
            });
    }, []);

    const totalVariance = variances.reduce((acc: number, v: any) => acc + v.totalVariance, 0);
    const negativeVariances = variances.filter((v: any) => v.totalVariance < 0).length;


    // --- Executive Novelty: CSV Export ---
    const exportToCSV = () => {
        const headers = ["Order#", "Product", "Item", "Supplier", "Planned Qty", "Actual Qty", "Planned Rate", "Actual Rate", "Qty Var", "Price Var", "Cost Impact"];
        const rows = variances.map(v => [
            v.order?.id.slice(-6) || "N/A",
            v.order?.productName || "N/A",
            v.itemName,
            v.supplierName || "Internal",
            v.plannedQty,
            v.actualQty,
            v.plannedRate,
            v.actualRate,
            v.qtyVariance,
            v.priceVariance,
            v.totalVariance
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Executive_Variance_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Executive Boardroom Report Exported!");
    };

    // --- Supplier Performance Scorecard ---
    const supplierStats: Record<string, { total: number, items: number }> = {};
    variances.forEach((v: any) => {
        const s = v.supplierName || "Internal Inventory";
        if (!supplierStats[s]) supplierStats[s] = { total: 0, items: 0 };
        supplierStats[s].total += v.totalVariance;
        supplierStats[s].items += 1;
    });

    // Group variances by Order
    const groupedVariances: Record<string, any[]> = {};
    variances.forEach((v: any) => {
        const key = v.order?.id.slice(-6) || v.orderId.slice(-6);
        if (!groupedVariances[key]) groupedVariances[key] = [];
        groupedVariances[key].push(v);
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Executive Variance Analysis</h1>
                    <p className="text-slate-500">Boardroom-ready insights into supply chain financial performance.</p>
                </div>
                <Button onClick={exportToCSV} variant="outline" className="gap-2 border-green-600 text-green-700 hover:bg-green-50">
                    <FileDown className="w-4 h-4" />
                    Export Boardroom CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard
                    title="Net Financial Impact"
                    value={`₹${totalVariance.toLocaleString()}`}
                    icon={IndianRupee}
                    className={totalVariance < 0 ? "border-red-200 bg-red-50/30 font-mono" : "border-green-200 bg-green-50/30 font-mono"}
                />
                <StatsCard title="Budget Leakages" value={negativeVariances} icon={TrendingDown} />
                <StatsCard title="Production Runs" value={Object.keys(groupedVariances).length} icon={Scale} />
                <StatsCard
                    title="Best Efficiency"
                    value={`${Object.keys(supplierStats).length} Vendors`}
                    icon={Building2}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Novelty: Supplier Scorecard */}
                <div className="md:col-span-2 bg-white border rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <h2 className="font-bold text-sm tracking-wide text-slate-900">SUPPLIER RELIABILITY INDEX (COST IMPACT BY VENDOR)</h2>
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[280px]">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="text-slate-400 uppercase bg-slate-50/50 border-b">
                                    <th className="px-6 py-2 text-left font-medium">Vendor</th>
                                    <th className="px-6 py-2 text-right font-medium">Aggregated Cost Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(supplierStats).sort((a, b) => a[1].total - b[1].total).map(([name, stat]) => (
                                    <tr key={name} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-3 font-semibold text-slate-700 capitalize">{name.toLowerCase()}</td>
                                        <td className={`px-6 py-3 text-right font-mono font-bold ${stat.total < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {stat.total > 0 ? "+" : ""}₹{stat.total.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Card: Net Logic */}
                <div className="md:col-span-1 bg-white border rounded-lg shadow-sm p-6 flex flex-col justify-center text-center">
                    <div className="mb-4 inline-flex items-center justify-center p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto">
                        <div className="text-xl font-black text-blue-600">₹</div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Impact Analysis</h3>
                    <p className="text-xs text-slate-500 mb-4 px-2">The net result of all production activities and material purchases.</p>
                    <div className={`text-2xl font-black font-mono ${totalVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {totalVariance > 0 ? "+" : ""}₹{totalVariance.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">Global P&L Delta</p>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="bg-white border rounded-lg p-12 text-center text-slate-400">Loading intelligence data...</div>
                ) : Object.keys(groupedVariances).length === 0 ? (
                    <div className="bg-white border rounded-lg p-12 text-center text-slate-400">No active production data detected.</div>
                ) : (
                    Object.entries(groupedVariances).map(([orderKey, items]: [string, any[]]) => {
                        const orderTotal = items.reduce((acc: number, v: any) => acc + v.totalVariance, 0);
                        const productName = items[0]?.order?.productName || "Unknown Product";
                        const orderQty = items[0]?.order?.quantity || 1;
                        const unitImpact = orderTotal / orderQty;

                        return (
                            <div key={orderKey} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-md">
                                            <Package className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Order #{orderKey}</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{productName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${unitImpact < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                UNIT COST Δ: {unitImpact > 0 ? "+" : ""}₹{Math.abs(unitImpact).toFixed(2)}
                                            </span>
                                            <p className={`text-md font-mono font-black mt-1 ${orderTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {orderTotal > 0 ? "+" : ""}₹{orderTotal.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px] text-left">
                                        <thead className="text-[9px] text-slate-400 uppercase bg-slate-50/50 border-b">
                                            <tr>
                                                <th className="px-6 py-2 font-medium">Component / Vendor</th>
                                                <th className="px-6 py-2 font-medium text-right">Planned Rate</th>
                                                <th className="px-6 py-2 font-medium text-right">Actual Rate</th>
                                                <th className="px-6 py-2 font-medium text-right">Qty Var</th>
                                                <th className="px-6 py-2 font-medium text-right">Cost Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((v) => (
                                                <tr key={v.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-3">
                                                        <div className="font-semibold text-slate-700">{v.itemName}</div>
                                                        <div className="text-[9px] text-slate-400 uppercase tracking-tighter">via {v.supplierName || "Warehouse"}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-slate-500 font-mono">₹{v.plannedRate}</td>
                                                    <td className="px-6 py-3 text-right text-slate-900 font-mono font-semibold">₹{v.actualRate}</td>
                                                    <td className={`px-6 py-3 text-right font-medium ${v.qtyVariance < 0 ? "text-red-500" : "text-green-500"}`}>
                                                        {v.qtyVariance > 0 ? "+" : ""}{v.qtyVariance}
                                                    </td>
                                                    <td className={`px-6 py-3 text-right font-black ${v.totalVariance < 0 ? "text-red-700" : "text-green-700"}`}>
                                                        ₹{v.totalVariance.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
