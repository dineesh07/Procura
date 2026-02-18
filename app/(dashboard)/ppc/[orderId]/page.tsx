import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calculateOrderRequirements } from "@/lib/logic";
import { StatsCard } from "@/components/shared/StatsCard";
import {
    Package,
    ShoppingCart,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function PPCOrderCalculationPage({
    params,
}: {
    params: { orderId: string };
}) {
    const session = await auth();
    if (!session || session.user.role !== "PPC") {
        redirect("/login");
    }

    const { orderId } = await params;

    // Fetch calculation data using our logic utility
    const { order, requirements } = await calculateOrderRequirements(orderId);

    const totalShortages = requirements.reduce((acc, req) => acc + (req.shortage > 0 ? 1 : 0), 0);
    const criticalImpact = requirements.some(req => req.utilizationPercent > 80);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Material Requirement Calculation</h1>
                    <p className="text-slate-500">Order #{order.id.slice(-6)} • {order.productName} • {order.quantity} units</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/ppc">
                        <Button variant="ghost">Cancel</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Required Items"
                    value={requirements.length}
                    icon={Package}
                />
                <StatsCard
                    title="Shortages Detected"
                    value={totalShortages}
                    icon={AlertTriangle}
                    className={totalShortages > 0 ? "border-red-200 bg-red-50/30" : ""}
                />
                <StatsCard
                    title="Math Verified"
                    value="BOM Check"
                    icon={CheckCircle2}
                    className="border-green-200 bg-green-50/30"
                />
            </div>

            {/* Recipe Summary Card */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-slate-50/50">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-500" />
                        Industry-Grade Recipe Summary
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {requirements.map((req) => (
                            <div key={req.material} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="font-medium text-sm">{req.material}</p>
                                        <p className="text-xs text-slate-500">
                                            Req: {req.required} | Stock: {req.physicalStock} | Available: {req.softAvailable}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold ${req.shortage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {req.shortage > 0 ? `Shortage: ${req.shortage}` : 'Stock Sufficient'}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min(100, req.utilizationPercent)}
                                    className={`h-2 ${req.utilizationPercent > 80 ? 'bg-red-100' : ''}`}
                                />
                                <p className="text-[10px] text-right text-slate-400">
                                    {Math.round(req.utilizationPercent)}% of physical stock utilized
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 rounded-lg border flex items-start gap-4 ${totalShortages > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                        {totalShortages > 0 ? (
                            <>
                                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Action Required: Inventory Shortage</p>
                                    <p className="text-xs opacity-90">
                                        Clicking "Request Materials" will notify the Materials team to initiate procurements for the shortage items.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Action Ready: Stocks Confirmed</p>
                                    <p className="text-xs opacity-90">
                                        All recipe components are available (including soft reservations). Proceed to material reservation.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <form action={async () => {
                            "use server"
                            const payload = {
                                orderId: order.id,
                                items: requirements.map(r => ({
                                    material: r.material,
                                    required: r.required,
                                    shortage: r.shortage
                                }))
                            };

                            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                            await fetch(`${baseUrl}/api/material-requests`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });

                            redirect("/ppc");
                        }}>
                            <Button size="lg" className="w-full md:w-auto gap-2">
                                {totalShortages > 0 ? "Request Materials" : "Reserve Materials"}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
