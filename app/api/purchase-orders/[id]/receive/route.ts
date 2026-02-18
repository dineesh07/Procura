import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                materialRequest: true,
            },
        });

        if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });
        if (po.status === "RECEIVED") return NextResponse.json({ error: "Already received" }, { status: 400 });

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Mark PO as received
            const updatedPo = await tx.purchaseOrder.update({
                where: { id },
                data: { status: "RECEIVED" },
            });

            // 2. Update the specific MaterialRequestItem status
            if (po.materialRequestItemId) {
                await tx.materialRequestItem.update({
                    where: { id: po.materialRequestItemId },
                    data: { status: "RECEIVED" } as any, // Cast in case types are lagging
                });
            }

            // 3. Update Inventory (increase stock)
            const inventory = await tx.inventory.findUnique({
                where: { itemName: po.itemName }
            });

            if (inventory) {
                await tx.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        currentStock: inventory.currentStock + po.quantity,
                        onOrderStock: Math.max(0, inventory.onOrderStock - po.quantity) // Reduce on-order stock
                    },
                });
            }

            // 4. Check if all items in the parent request are now received
            const allItems = await tx.materialRequestItem.findMany({
                where: { materialRequestId: (po.materialRequestId || "") as string },
            });

            const allReceived = allItems.every((item: any) => item.status === "RECEIVED");

            // 5. Update parent request status only if all items are done
            if (allReceived && po.materialRequestId) {
                await tx.materialRequest.update({
                    where: { id: po.materialRequestId },
                    data: { status: "RECEIVED" },
                });
            }

            return updatedPo;
        });

        return NextResponse.json({ message: "Stock received and inventory updated", po: result });

        return NextResponse.json({ message: "PO received and inventory updated" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to receive PO" }, { status: 500 });
    }
}
