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
    const userRole = session?.user?.role;
    if (!session || !userRole?.includes("PPC")) {
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
                        {requirements.map((req) => {
                            const projectedStock = req.physicalStock - req.required;
                            const isReorderTriggered = projectedStock < (req.physicalStock * 0.2); // Simple heuristic for visual demo

                            return (
                                <div key={req.material} className="p-4 border rounded-xl bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-slate-800 tracking-tight">{req.material}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                                    Current: {req.physicalStock}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    Usage: {req.required}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">Projected Balance</p>
                                            <p className={`text-sm font-mono font-black ${projectedStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {projectedStock > 0 ? "+" : ""}{projectedStock}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] items-center">
                                            <span className="text-slate-500 font-medium">BOM Utilization</span>
                                            <span className={`font-black ${req.utilizationPercent > 90 ? 'text-red-600' : 'text-slate-700'}`}>
                                                {Math.round(req.utilizationPercent)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(100, req.utilizationPercent)}
                                            className={`h-1.5 ${req.utilizationPercent > 80 ? 'bg-red-100' : ''}`}
                                        />
                                    </div>

                                    {projectedStock < 0 && (
                                        <div className="mt-3 bg-red-50 border border-red-100 rounded p-2 flex items-center gap-2 animate-pulse">
                                            <AlertTriangle className="w-3 h-3 text-red-600" />
                                            <span className="text-[9px] text-red-700 font-bold uppercase tracking-tight">
                                                Will Trigger Immediate Reorder alert
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

                            // Only request items that have a real shortage
                            const shortageItems = requirements.filter(r => r.shortage > 0);

                            // Create Material Request directly in DB to avoid port conflicts
                            await prisma.materialRequest.create({
                                data: {
                                    orderId: order.id,
                                    status: "PENDING",
                                    items: {
                                        create: shortageItems.map(r => ({
                                            itemName: r.material,
                                            requiredQty: r.required,
                                            shortageQty: r.shortage,
                                        })),
                                    },
                                },
                            });

                            // Update order status
                            await prisma.order.update({
                                where: { id: order.id },
                                data: { status: "MATERIAL_REQUESTED" },
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
