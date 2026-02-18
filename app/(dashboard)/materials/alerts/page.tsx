"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertTriangle, Package, TrendingDown, Clock } from "lucide-react";
import { toast } from "sonner";

export default function MaterialsAlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingId, setCreatingId] = useState<string | null>(null);

    const fetchData = () => {
        setLoading(true);
        fetch("/api/inventory/alerts")
            .then((res) => res.json())
            .then((data) => {
                setAlerts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                toast.error("Failed to load inventory alerts");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRequest = async (item: any) => {
        setCreatingId(item.id);
        try {
            const res = await fetch("/api/material-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: null,
                    items: [{
                        material: item.itemName,
                        required: item.reorderLevel, // Defaulting to reorder level
                        shortage: Math.max(0, item.reorderLevel - item.currentStock)
                    }]
                })
            });

            if (!res.ok) throw new Error();
            toast.success(`Purchase request created for ${item.itemName}`);
            fetchData();
        } catch (e) {
            toast.error("Failed to create purchase request");
        }
        setCreatingId(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-8 h-8" /> Stock Alerts
                </h1>
                <p className="text-slate-500">Critical items requiring immediate reordering or replenishment.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Checking stock levels...</div>
                ) : alerts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <Package className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                        <h3 className="text-emerald-900 font-bold">All clear!</h3>
                        <p className="text-emerald-700 text-sm">No critical stock alerts at this time.</p>
                    </div>
                ) : (
                    alerts.map((item) => (
                        <div key={item.id} className="bg-white border-2 border-red-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-slate-900 text-lg">{item.itemName}</h3>
                                    <StatusBadge status={item.alertStatus} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <div className="text-[10px] text-red-600 uppercase font-bold tracking-wider mb-1">Current Stock</div>
                                        <div className="text-xl font-mono font-black text-red-700">{item.currentStock} <span className="text-xs">{item.unit}</span></div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Reorder Level</div>
                                        <div className="text-xl font-mono font-black text-slate-700">{item.reorderLevel} <span className="text-xs">{item.unit}</span></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-slate-500">
                                            <TrendingDown className="w-4 h-4 text-amber-500" /> Daily Use
                                        </span>
                                        <span className="font-bold text-slate-700">{item.dailyConsumption} / day</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-slate-500">
                                            <TrendingDown className="w-4 h-4 text-amber-500" /> Lead Time / Safety
                                        </span>
                                        <span className="font-bold text-slate-700">{item.leadTime}d / {item.safetyStock} {item.unit}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                                            <Clock className="w-4 h-4 text-blue-500" /> Predicted Level
                                        </span>
                                        <span className="font-black text-blue-700">
                                            {item.predictedLevel} {item.unit}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 italic">Formula: (Consumption × Lead Time) + Safety Stock</p>
                                </div>
                            </div>
                            <div
                                className={`px-5 py-3 text-center text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${creatingId === item.id ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                onClick={() => creatingId !== item.id && handleCreateRequest(item)}
                            >
                                {creatingId === item.id ? "Creating Request..." : "Create Purchase Request"}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
