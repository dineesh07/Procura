"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function ActualConsumptionPage() {
    const { id } = useParams();
    const router = useRouter();
    const [production, setProduction] = useState<any>(null);
    const [bom, setBom] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actuals, setActuals] = useState<Record<string, { qty: string; rate: string }>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/api/production");
            const prods = await res.json();
            const current = prods.find((p: any) => p.id === id);
            setProduction(current);

            if (current) {
                const bomRes = await fetch(`/api/bom?productName=${current.order.productName}`);
                const bomData = await bomRes.json();
                setBom(bomData);

                // Initialize actuals with the most accurate "Actual" data available
                const initial: any = {};
                bomData.forEach((item: any) => {
                    // Try to find if we bought this item specifically for this order
                    let actualPurchaseRate = item.plannedRate;

                    if (current.order.materialRequests) {
                        for (const req of current.order.materialRequests) {
                            const po = req.purchaseOrders?.find((p: any) => p.itemName === item.itemName);
                            if (po) {
                                actualPurchaseRate = po.rate;
                                break;
                            }
                        }
                    }

                    initial[item.itemName] = {
                        qty: (item.quantityPerUnit * current.order.quantity).toString(),
                        rate: (actualPurchaseRate || 100).toString(),
                    };
                });
                setActuals(initial);
            }
            setLoading(false);
        }
        fetchData();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                actuals: bom.map(item => ({
                    itemName: item.itemName,
                    actualQty: parseFloat(actuals[item.itemName].qty),
                    actualRate: parseFloat(actuals[item.itemName].rate),
                    plannedQty: item.quantityPerUnit * production.order.quantity,
                    plannedRate: item.plannedRate || 100,
                }))
            };

            const res = await fetch(`/api/production/${id}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed");
            toast.success("Production completed and actuals saved");
            router.push("/ppc/production");
        } catch (e) {
            toast.error("Error saving consumption");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Tracking
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Actual Consumption Entry</h1>
                    <p className="text-slate-500">Enter real material usage and rates for Order {production.orderId}.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-600">
                        Consumption Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Material</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Planned Qty</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Actual Qty Used</th>
                                <th className="px-6 py-3 text-left font-medium text-slate-600">Rate per Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bom.map((item) => {
                                const plannedQty = item.quantityPerUnit * production.order.quantity;
                                return (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 font-semibold">{item.itemName}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">{plannedQty}</td>
                                        <td className="px-6 py-4">
                                            <Input
                                                type="number"
                                                value={actuals[item.itemName]?.qty}
                                                onChange={(e) => setActuals({ ...actuals, [item.itemName]: { ...actuals[item.itemName], qty: e.target.value } })}
                                                className="w-32 h-8"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={actuals[item.itemName]?.rate}
                                                onChange={(e) => setActuals({ ...actuals, [item.itemName]: { ...actuals[item.itemName], rate: e.target.value } })}
                                                className="w-32 h-8"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Finalize Production
                </Button>
            </div>
        </div>
    );
}
