"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MaterialRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/material-requests")
            .then((res) => res.json())
            .then((data) => {
                setRequests(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Material Requests</h1>
                <p className="text-slate-500">Respond to requests from the PPC planning team.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Request ID</th>
                                <th className="px-6 py-3 font-medium">Order / Product</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No requests found.</td></tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-xs">{req.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{req.order.productName} × {req.order.quantity}</div>
                                            <div className="text-xs text-slate-500 font-mono">Order: {req.orderId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.status === "PENDING" && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="success" className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm px-4">
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm px-4">
                                                        Shortage
                                                    </Button>
                                                </div>
                                            )}
                                            {req.status !== "PENDING" && (
                                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Processed
                                                </span>
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
