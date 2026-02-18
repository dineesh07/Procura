"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ShoppingBag, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PurchaseOrdersPage() {
    const [pos, setPos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/purchase-orders")
            .then((res) => res.json())
            .then((data) => {
                setPos(data);
                setLoading(false);
            });
    }, []);

    const handleReceive = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/purchase-orders/${id}/receive`, {
                method: "PUT",
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Stock received and inventory updated");
            // Refresh list
            const updated = pos.map(p => p.id === id ? { ...p, status: "RECEIVED" } : p);
            setPos(updated);
        } catch (e) {
            toast.error("Error updating stock");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-slate-500">Track and receive orders from suppliers.</p>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">PO ID</th>
                                <th className="px-6 py-3 font-medium">Supplier</th>
                                <th className="px-6 py-3 font-medium">Qty × Rate</th>
                                <th className="px-6 py-3 font-medium">Expected</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : pos.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No purchase orders found.</td></tr>
                            ) : (
                                pos.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-xs">{po.id}</td>
                                        <td className="px-6 py-4 font-medium">{po.supplierName}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 font-mono">{po.quantity} units</div>
                                            <div className="text-xs text-slate-500">at ₹{po.rate}/unit</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(po.expectedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={po.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {po.status === "ORDERED" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReceive(po.id)}
                                                    disabled={processingId === po.id}
                                                >
                                                    {processingId === po.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                                    Receive Stock
                                                </Button>
                                            )}
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
