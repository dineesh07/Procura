"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Truck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MaterialRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reqsRes, teamRes] = await Promise.all([
                fetch("/api/material-requests"),
                fetch("/api/team/materials")
            ]);
            setRequests(await reqsRes.json());
            setTeam(await teamRes.json());
        } catch (e) {
            toast.error("Failed to load requests");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => setRole(data?.user?.role));
        fetchData();
    }, []);

    const handleAssign = async (requestId: string, employeeId: string) => {
        setAssigningId(requestId);
        try {
            const res = await fetch(`/api/material-requests/${requestId}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId }),
            });
            if (!res.ok) throw new Error();
            toast.success("Request assigned successfully");
            fetchData();
        } catch (e) {
            toast.error("Failed to assign request");
        }
        setAssigningId(null);
    };

    const handleApprove = async (requestId: string) => {
        try {
            const res = await fetch(`/api/material-requests/${requestId}/approve`, {
                method: "POST",
            });
            if (!res.ok) throw new Error();
            toast.success("Request approved and moved to purchasing");
            fetchData();
        } catch (e) {
            toast.error("Failed to approve request");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Material Request Queue</h1>
                    <p className="text-slate-500">Monitor warehouse verification and approve component purchases.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-600">
                        <Clock className="w-3 h-3" /> {requests.filter(r => r.status === "PENDING").length} Pending
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-md text-[10px] font-medium text-purple-700">
                        <Truck className="w-3 h-3" /> {requests.filter(r => r.status === "VERIFIED_BY_STAFF").length} Verified
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Request Detail</th>
                                <th className="px-6 py-3 font-medium">Components / Qty</th>
                                <th className="px-6 py-3 font-medium">Assignment</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No active material requests.</td></tr>
                            ) : (
                                requests.map((req) => {
                                    const assignedMember = Array.isArray(team) ? team.find(t => t.id === req.assignedToId) : null;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-[10px] text-slate-400">#{req.id.slice(-6)}</div>
                                                {req.order ? (
                                                    <div className="font-semibold text-slate-900">{req.order.productName}</div>
                                                ) : (
                                                    <div className="font-medium text-orange-600 uppercase text-[10px] tracking-tight">Stock Replenishment</div>
                                                )}
                                                {req.orderId && <div className="text-[10px] text-slate-500">Order: {req.orderId.slice(-6)}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {req.items?.map((item: any) => (
                                                        <div key={item.id} className="flex items-center gap-2 text-xs">
                                                            <span className="font-medium text-slate-700">{item.itemName}</span>
                                                            <span className="text-slate-400">|</span>
                                                            <span className="text-slate-600">{item.requiredQty} units</span>
                                                            {item.actualPhysicalCount !== null && (
                                                                <span className="text-[10px] text-purple-600 font-bold">(Verified: {item.actualPhysicalCount})</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignedMember ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-slate-900">{assignedMember.name}</span>
                                                        <span className="text-[10px] text-slate-500">
                                                            {req.assignedAt ? new Date(req.assignedAt).toLocaleDateString() : "N/A"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <select
                                                        className="text-[10px] border rounded px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500"
                                                        disabled={assigningId === req.id}
                                                        onChange={(e) => handleAssign(req.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select Staff...</option>
                                                        {Array.isArray(team) && team.map(member => (
                                                            <option key={member.id} value={member.id}>{member.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === "VERIFIED_BY_STAFF" ? (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white text-[11px] h-8"
                                                        onClick={() => handleApprove(req.id)}
                                                    >
                                                        Review & Approve
                                                    </Button>
                                                ) : req.status === "PENDING" ? (
                                                    <span className="text-[10px] text-slate-400 italic">Pending Execution</span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 text-green-600 font-medium text-xs">
                                                        <CheckCircle2 className="w-3 h-3" /> Ready for PO
                                                    </div>
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
