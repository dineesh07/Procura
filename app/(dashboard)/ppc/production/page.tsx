"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Play, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductionPage() {
    const [productions, setProductions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/production")
            .then((res) => res.json())
            .then((data) => {
                setProductions(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Production Tracking</h1>
                    <p className="text-slate-500">Monitor active runs and complete production logs.</p>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Production ID</th>
                                <th className="px-6 py-3 font-medium">Order / Product</th>
                                <th className="px-6 py-3 font-medium">Started At</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
                            ) : productions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No production logs found.</td></tr>
                            ) : (
                                productions.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-xs">{prod.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{prod.order.productName}</div>
                                            <div className="text-xs text-slate-500 font-mono">Order: {prod.orderId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(prod.startedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={prod.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {prod.status === "IN_PRODUCTION" && (
                                                <Link href={`/ppc/production/${prod.id}`}>
                                                    <Button size="sm">Complete & Enter Actuals</Button>
                                                </Link>
                                            )}
                                            {prod.status === "COMPLETED" && (
                                                <span className="text-green-600 text-xs font-bold uppercase flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Done
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
