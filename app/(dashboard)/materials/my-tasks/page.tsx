"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Package, Truck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function MaterialsEmployeeTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState<any | null>(null);
    const [actualCounts, setActualCounts] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const fetchTasks = () => {
        setLoading(true);
        fetch("/api/material-requests/my-tasks")
            .then((res) => res.json())
            .then((data) => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                toast.error("Failed to load tasks");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleVerify = async () => {
        if (!isVerifying) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/material-requests/${isVerifying.id}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actuals: actualCounts })
            });
            if (!res.ok) throw new Error();
            toast.success("Verification submitted for manager approval");
            setIsVerifying(null);
            fetchTasks();
        } catch (e) {
            toast.error("Failed to submit verification");
        } finally {
            setSubmitting(false);
        }
    };

    const pendingTasks = tasks.filter(t => t.status === "PENDING" || t.status === "VERIFIED_BY_STAFF");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Assigned Requests</h1>
                <p className="text-slate-500">Verify stock counts for allocated electronic components.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Active Tasks" value={pendingTasks.length} icon={Clock} className="border-blue-200 bg-blue-50/30" />
                <StatsCard title="Verified Today" value={tasks.filter(t => t.status === "VERIFIED_BY_STAFF").length} icon={CheckCircle2} className="border-purple-200 bg-purple-50/30" />
                <StatsCard title="Processed" value={tasks.filter(t => t.status === "APPROVED").length} icon={Package} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Request</th>
                                <th className="px-6 py-3 font-medium">Items to Verify</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : pendingTasks.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No pending tasks.</td></tr>
                            ) : (
                                pendingTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-[10px] text-slate-400 mb-1">#{task.id.slice(-6)}</div>
                                            {task.order ? (
                                                <div className="font-semibold text-slate-900">{task.order.productName}</div>
                                            ) : (
                                                <div className="font-semibold text-orange-600 uppercase text-[10px]">Stock Replenishment</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-3 max-w-sm">
                                                {task.items.map((item: any) => (
                                                    <div key={item.id} className="space-y-1">
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="font-medium">{item.itemName}</span>
                                                            <span className="font-mono">{item.requiredQty} units</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={item.consumptionPercent} className="h-1" />
                                                            {item.netAvailable < item.requiredQty && (
                                                                <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-[8px] font-bold uppercase shrink-0">Shortage</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 flex justify-between">
                                                            <span>Consumption: {Math.round(item.consumptionPercent)}%</span>
                                                            <span>Net Avail: {item.netAvailable}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {task.status === "PENDING" ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const initial: any = {};
                                                        task.items.forEach((i: any) => initial[i.id] = "");
                                                        setActualCounts(initial);
                                                        setIsVerifying(task);
                                                    }}
                                                >
                                                    Verify Stock
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Awaiting Approval</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {isVerifying && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border">
                        <div className="px-6 py-4 border-b bg-slate-50">
                            <h3 className="font-bold text-slate-900">Physical Stock Count</h3>
                            <p className="text-xs text-slate-500">Record actual warehouse quantities found.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {isVerifying.items.map((item: any) => (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold">{item.itemName}</span>
                                        <span className="text-slate-500">Required: {item.requiredQty}</span>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="Enter actual physical count..."
                                        value={actualCounts[item.id] || ""}
                                        onChange={(e) => setActualCounts({ ...actualCounts, [item.id]: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t flex gap-3">
                            <Button variant="ghost" className="flex-1" onClick={() => setIsVerifying(null)}>Cancel</Button>
                            <Button
                                className="flex-1"
                                disabled={submitting || Object.values(actualCounts).some(v => !v)}
                                onClick={handleVerify}
                            >
                                {submitting ? "Submitting..." : "Complete Verification"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
