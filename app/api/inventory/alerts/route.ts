import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateDaysRemaining } from "@/lib/calculations";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const inventory = await prisma.inventory.findMany();

        const alerts = inventory
            .map((item) => {
                const result = calculateDaysRemaining(item.currentStock, item.dailyConsumption);
                const { days, status } = typeof result === "number" ? { days: result, status: "HEALTHY" as const } : result;
                const predictedReorderLevel = (item.dailyConsumption * item.leadTime) + item.safetyStock;

                // Use the formula for status check
                const alertStatus = (item.currentStock < predictedReorderLevel) ? "CRITICAL" : status;

                return {
                    ...item,
                    daysRemaining: days,
                    alertStatus: alertStatus,
                    predictedLevel: predictedReorderLevel
                };
            })
            .filter((item) => item.alertStatus !== "HEALTHY" || item.currentStock < item.reorderLevel);

        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}
