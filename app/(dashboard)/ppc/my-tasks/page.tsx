"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertCircle, Play, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PPCEmployeeTasks() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lockingId, setLockingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/orders/my-tasks")
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
    }, []);

    const handleStartProduction = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/start-production`, {
                method: "POST",
            });
            if (!res.ok) throw new Error();
            toast.success("Production started!");
            fetch("/api/orders/my-tasks")
                .then((res) => res.json())
                .then((data) => setTasks(Array.isArray(data) ? data : []));
        } catch (e) {
            toast.error("Failed to start production");
        }
    };

    const activeTasks = tasks.filter(t => t.status !== "COMPLETED" && t.status !== "IN_PRODUCTION");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Assigned Tasks</h1>
                <p className="text-slate-500">Plan and process orders assigned to you.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard title="Active Tasks" value={activeTasks.length} icon={AlertCircle} className="border-blue-200 bg-blue-50/30" />
                <StatsCard title="In Production" value={tasks.filter(t => t.status === "IN_PRODUCTION").length} icon={Play} />
                <StatsCard title="Completed" value={tasks.filter(t => t.status === "COMPLETED").length} icon={CheckCircle} />
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h3 className="font-semibold">Task Queue</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order#</th>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Qty</th>
                                <th className="px-6 py-3 font-medium">Assigned At</th>
                                <th className="px-6 py-3 font-medium text-center">Materials</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : activeTasks.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No tasks assigned to you.</td></tr>
                            ) : (
                                activeTasks.map((task) => {
                                    const allRequestItems = task.materialRequests?.flatMap((mr: any) => mr.items || []) || [];
                                    const hasItems = allRequestItems.length > 0;
                                    const receivedItems = allRequestItems.filter((item: any) => item.status === "RECEIVED").length;
                                    const allReceived = hasItems && receivedItems === allRequestItems.length;

                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-mono text-xs">{task.orderNumber || task.id.slice(-6)}</td>
                                            <td className="px-6 py-4 font-medium">{task.productName}</td>
                                            <td className="px-6 py-4">{task.quantity}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {hasItems ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${allReceived ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {allReceived ? 'STOCKED' : 'AWAITING'}
                                                        </span>
                                                        <span className="text-[8px] text-slate-400 mt-0.5">
                                                            {receivedItems}/{allRequestItems.length} Ready
                                                        </span>
                                                    </div>
                                                ) : task.status === "MATERIAL_REQUESTED" ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">AWAITING</span>
                                                        <span className="text-[8px] text-slate-400 mt-0.5 whitespace-nowrap">Linking items...</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 italic">Not Calculated</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={task.id === lockingId ? "CALCULATING" : task.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {allReceived ? (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 gap-1.5"
                                                        onClick={() => handleStartProduction(task.id)}
                                                    >
                                                        <Play className="w-3 h-3 fill-current" /> Start Production
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={lockingId !== null}
                                                        onClick={async () => {
                                                            setLockingId(task.id);
                                                            try {
                                                                const res = await fetch("/api/ppc/lock", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ orderId: task.id }),
                                                                });
                                                                if (!res.ok) throw new Error();
                                                                router.push(`/ppc/${task.id}`);
                                                            } catch (e) {
                                                                toast.error("Failed to lock task");
                                                                setLockingId(null);
                                                            }
                                                        }}
                                                    >
                                                        {lockingId === task.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : hasItems ? "Review BOM" : "Calculate BOM"}
                                                    </Button>
                                                )}
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
