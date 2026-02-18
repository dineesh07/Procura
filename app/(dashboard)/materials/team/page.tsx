"use client";

import { useEffect, useState } from "react";
import { Users, Mail, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function MaterialsTeamPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/team/materials")
            .then((res) => res.json())
            .then((data) => {
                setTeam(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                toast.error("Failed to load team data");
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Materials Team Management</h1>
                <p className="text-slate-500">Monitor team workload and task distribution.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Loading team members...</div>
                ) : team.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">No team members found.</div>
                ) : (
                    team.map((member) => (
                        <div key={member.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{member.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Mail className="w-3 h-3" /> {member.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                            <ClipboardList className="w-4 h-4 text-emerald-500" /> Active Tasks
                                        </div>
                                        <span className="font-bold text-slate-900">{member._count.assignedMaterialReqs}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full ${member._count.assignedMaterialReqs > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${Math.min(member._count.assignedMaterialReqs * 15, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 uppercase tracking-tighter">
                                        {member._count.assignedMaterialReqs > 5 ? "Capacity Warning" : "Accepting Tasks"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
