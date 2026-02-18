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
                const { days, status } = calculateDaysRemaining(item.currentStock, item.dailyConsumption);
                return { ...item, daysRemaining: days, alertStatus: status };
            })
            .filter((item) => item.alertStatus !== "HEALTHY" || item.currentStock < item.reorderLevel);

        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}
