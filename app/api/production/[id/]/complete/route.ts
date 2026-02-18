import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateVariance } from "@/lib/calculations";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;

    try {
        const body = await req.json(); // { actuals: [{ itemName, actualQty, actualRate, plannedQty, plannedRate }] }

        const production = await prisma.production.findUnique({
            where: { id },
            include: { order: true },
        });

        if (!production) return NextResponse.json({ error: "Production not found" }, { status: 404 });

        await prisma.$transaction(async (tx) => {
            // 1. Save Actual Consumption
            for (const item of body.actuals) {
                await tx.actualConsumption.create({
                    data: {
                        productionId: id,
                        itemName: item.itemName,
                        actualQty: parseFloat(item.actualQty),
                        actualRate: parseFloat(item.actualRate),
                    },
                });

                // 2. Calculate and Save Variance
                const varResults = calculateVariance(
                    item.plannedQty,
                    item.actualQty,
                    item.plannedRate,
                    item.actualRate
                );

                await tx.variance.create({
                    data: {
                        orderId: production.orderId,
                        itemName: item.itemName,
                        plannedQty: item.plannedQty,
                        actualQty: item.actualQty,
                        plannedRate: item.plannedRate,
                        actualRate: item.actualRate,
                        qtyVariance: varResults.qtyVariance,
                        priceVariance: varResults.priceVariance,
                        totalVariance: varResults.totalVariance,
                    },
                });

                // 3. Update Inventory (decrease stock)
                await tx.inventory.update({
                    where: { itemName: item.itemName },
                    data: {
                        currentStock: { decrement: parseFloat(item.actualQty) },
                    },
                });
            }

            // 4. Complete Production
            await tx.production.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });

            // 5. Complete Order
            await tx.order.update({
                where: { id: production.orderId },
                data: { status: "COMPLETED" },
            });
        });

        return NextResponse.json({ message: "Production completed and variance calculated" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to complete production" }, { status: 500 });
    }
}
