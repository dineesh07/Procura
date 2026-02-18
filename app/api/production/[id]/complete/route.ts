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

    const { id } = await params;

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
                // Fetch planned rate from BOM to ensure strict source of truth
                const bomRecord = await tx.bOM.findUnique({
                    where: {
                        productName_itemName: {
                            productName: production.order.productName,
                            itemName: item.itemName,
                        }
                    }
                });

                if (!bomRecord) {
                    throw new Error(`BOM record not found for product "${production.order.productName}" and item "${item.itemName}"`);
                }

                // @ts-ignore - plannedRate and unit are new in schema, dev server locking prisma client
                const plannedRate = bomRecord.plannedRate;
                // @ts-ignore
                const plannedQty = item.plannedQty || (bomRecord.quantityPerUnit * production.order.quantity);

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
                    plannedQty,
                    item.actualQty,
                    plannedRate,
                    item.actualRate
                );

                await tx.variance.create({
                    data: {
                        orderId: production.orderId,
                        itemName: item.itemName,
                        plannedQty: plannedQty,
                        actualQty: item.actualQty,
                        plannedRate: plannedRate,
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
