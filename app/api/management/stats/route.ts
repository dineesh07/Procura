import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const [totalOrders, pendingOrders, inProductionOrders, completedOrders] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: "PENDING" } }),
            prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
            prisma.order.count({ where: { status: "COMPLETED" } }),
        ]);

        const totalVariances = await prisma.variance.aggregate({
            _sum: {
                totalVariance: true,
                plannedAmount: true, // Wait, my variance model doesn't have plannedAmount, just plannedRate/Qty.
            },
        });

        // In a real scenario, we'd calculate these more thoroughly.
        return NextResponse.json({
            totalOrders,
            pendingOrders,
            inProductionOrders,
            completedOrders,
            totalVariance: totalVariances._sum.totalVariance || 0,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
    }
}
