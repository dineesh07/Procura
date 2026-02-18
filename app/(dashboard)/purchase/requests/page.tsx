"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Truck, Package, Clock, ShoppingCart, CheckCircle2, AlertTriangle, Info, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatINR } from "@/lib/utils";

export default function PurchaseRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGeneratingPO, setIsGeneratingPO] = useState<any | null>(null);
    const [poData, setPoData] = useState({
        supplierName: "",
        rate: "",
        quantity: "",
        expectedDate: new Date().toISOString().split("T")[0],
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/material-requests");
            const data = await res.json();

            // Revert back to flattening nested items because the API now returns requests
            const allItems: any[] = [];
            if (Array.isArray(data)) {
                data.forEach((req: any) => {
                    if (req.items) {
                        req.items.forEach((item: any) => {
                            // Only show items that are not already ordered
                            // And only for approved requests
                            if (item.status !== "ORDERED" && req.status === "APPROVED") {
                                allItems.push({
                                    ...item,
                                    materialRequest: req, // Attach parent for UI
                                    materialRequestId: req.id
                                });
                            }
                        });
                    }
                });
            }
            setRequests(allItems);
        } catch (error) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePO = async () => {
        if (!isGeneratingPO || !poData.supplierName || !poData.rate || !poData.expectedDate) {
            toast.error("Please fill all fields");
            return;
        }

        const purchaseQty = isGeneratingPO.shortageQty || isGeneratingPO.requiredQty;

        setSubmitting(true);
        try {
            const res = await fetch("/api/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    materialRequestId: isGeneratingPO.requestId,
                    materialRequestItemId: isGeneratingPO.itemId, // Match the schema/API field name
                    itemName: isGeneratingPO.itemName,
                    quantity: parseFloat(poData.quantity) || purchaseQty,
                    supplierName: poData.supplierName,
                    rate: poData.rate,
                    expectedDate: poData.expectedDate,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create PO");
            }

            toast.success(`Purchase Order created for ${isGeneratingPO.itemName}`);
            setIsGeneratingPO(null);
            setPoData({ supplierName: "", rate: "", quantity: "", expectedDate: new Date().toISOString().split("T")[0] });
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to create purchase order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Purchase Requests</h1>
                    <p className="text-slate-500">Generate purchase orders for approved material requests.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Approved Items"
                    value={requests.filter(item => item.materialRequest?.status === "APPROVED").length}
                    icon={CheckCircle2}
                    className="border-green-200 bg-green-50/30"
                />
                <StatsCard
                    title="Items Unverified"
                    value={requests.filter(item => item.materialRequest?.status === "PENDING").length}
                    icon={Clock}
                />
                <StatsCard
                    title="Procurement Items"
                    value={requests.length}
                    icon={Package}
                />
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Request</th>
                                <th className="px-6 py-3 font-medium">Item Name</th>
                                <th className="px-6 py-3 font-medium">Buying Requirement</th>
                                <th className="px-6 py-3 font-medium text-center">Reference Required</th>
                                <th className="px-6 py-3 font-medium Status">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-600">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading items...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No items ready for procurement.</td></tr>
                            ) : (
                                requests.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-[10px] text-slate-400">#{item.materialRequestId.slice(-6)}</div>
                                            <div className="text-xs font-semibold text-slate-900">
                                                {item.materialRequest?.order ? item.materialRequest.order.productName : "Stock Replenishment"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{item.itemName}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-red-600 relative group cursor-help">
                                            {item.shortageQty || item.requiredQty}
                                            <div className="flex items-center gap-1 text-[10px] font-normal text-slate-400">
                                                <Info className="w-2.5 h-2.5" />
                                                <span>Includes Debt</span>
                                            </div>

                                            {/* Hover Breakdown Bubble */}
                                            <div className="absolute left-full ml-2 top-0 invisible group-hover:visible bg-slate-900 text-white p-3 rounded-lg shadow-xl z-50 w-48 text-xs font-normal">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1">
                                                        <span className="text-slate-400 uppercase text-[9px] font-bold">Requirement Breakdown</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>For Order:</span>
                                                        <span className="font-mono text-blue-400">{item.requiredQty}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Warehouse Debt:</span>
                                                        <span className="font-mono text-red-400">
                                                            {(item.shortageQty || item.requiredQty) - item.requiredQty}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-slate-700 pt-1 mt-1 font-bold">
                                                        <span>Total to Buy:</span>
                                                        <span>{item.shortageQty || item.requiredQty}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute left-[-6px] top-4 w-3 h-3 bg-slate-900 rotate-45"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-slate-500">{item.requiredQty}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status || item.materialRequest?.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant={item.materialRequest?.status === "APPROVED" ? "default" : "outline"}
                                                disabled={item.materialRequest?.status !== "APPROVED"}
                                                className={item.materialRequest?.status === "APPROVED" ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                onClick={() => setIsGeneratingPO({
                                                    requestId: item.materialRequestId,
                                                    itemId: item.id,
                                                    itemName: item.itemName,
                                                    requiredQty: item.requiredQty,
                                                    shortageQty: item.shortageQty,
                                                    actualPhysicalCount: item.actualPhysicalCount
                                                })}
                                            >
                                                <ShoppingCart className="w-3 h-3 mr-2" /> Generate PO
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PO Generation Modal */}
            {isGeneratingPO && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border">
                        <div className="px-6 py-4 border-b bg-slate-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-blue-600" /> New Purchase Order
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Procurement for <strong>{isGeneratingPO.itemName}</strong> ({isGeneratingPO.shortageQty || isGeneratingPO.requiredQty} units)
                            </p>
                            <p className="text-[10px] text-amber-600 italic">Buying extra to cover warehouse shortages.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 text-blue-800">
                                    <Target className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Procurement Intelligent Assistant</span>
                                </div>

                                {(() => {
                                    const currentShortage = isGeneratingPO.shortageQty || isGeneratingPO.requiredQty;
                                    const consumption = isGeneratingPO.dailyConsumption || 0;
                                    const leadTime = isGeneratingPO.leadTime || 0;
                                    // Suggestion: Cover current debt + next (LeadTime * 2) days of production
                                    const suggestedBuffer = Math.ceil(consumption * leadTime * 2);
                                    const totalSuggested = currentShortage + suggestedBuffer;

                                    return (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-[11px] text-slate-600 leading-tight">
                                                    Order <strong>{totalSuggested} units</strong> to resolve debt + cover <strong>{leadTime * 2} days</strong> of safety buffer.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setPoData({ ...poData, quantity: totalSuggested.toString() })}
                                                className="h-7 text-[10px] bg-blue-600 text-white hover:bg-blue-700 border-none shadow-sm"
                                            >
                                                Apply Suggestion
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Purchase Quantity</label>
                                <Input
                                    type="number"
                                    value={poData.quantity}
                                    onChange={(e) => setPoData({ ...poData, quantity: e.target.value })}
                                    placeholder="Units to buy..."
                                    className="font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Name</label>
                                <Input
                                    placeholder="Enter vendor name..."
                                    value={poData.supplierName}
                                    onChange={(e) => setPoData({ ...poData, supplierName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rate (per unit)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7"
                                            placeholder="0.00"
                                            value={poData.rate}
                                            onChange={(e) => setPoData({ ...poData, rate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Date</label>
                                    <Input
                                        type="date"
                                        value={poData.expectedDate}
                                        onChange={(e) => setPoData({ ...poData, expectedDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {poData.rate && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                                    <span className="text-xs font-medium text-blue-700">Total Valuation:</span>
                                    <span className="text-lg font-black text-blue-900">
                                        {formatINR(parseFloat(poData.rate) * (isGeneratingPO.shortageQty || isGeneratingPO.requiredQty))}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsGeneratingPO(null)}>Cancel</Button>
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                disabled={submitting || !poData.supplierName || !poData.rate || !poData.expectedDate}
                                onClick={handleCreatePO}
                            >
                                {submitting ? "Processing..." : "Create Order"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
