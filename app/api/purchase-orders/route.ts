import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const orders = await prisma.purchaseOrder.findMany({
            include: {
                materialRequest: {
                    include: { order: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("PO BODY 👉", body);

        const { materialRequestItemId, supplierName, rate, expectedDate, quantity, itemName } = body;

        if (!materialRequestItemId) {
            return NextResponse.json({ error: "Missing materialRequestItemId" }, { status: 400 });
        }

        // Helper to parse DD/MM/YYYY or other formats
        const parseDate = (dateStr: string) => {
            if (!dateStr) return new Date();
            // Handle DD/MM/YYYY
            if (dateStr.includes('/')) {
                const [d, m, y] = dateStr.split('/').map(Number);
                if (d && m && y) return new Date(y, m - 1, d);
            }
            return new Date(dateStr);
        };

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch item to get parent ID and details
            const item = await tx.materialRequestItem.findUnique({
                where: { id: materialRequestItemId },
            });

            if (!item) throw new Error(`Material Request Item ${materialRequestItemId} not found`);

            // 2. Create Purchase Order
            const po = await tx.purchaseOrder.create({
                data: {
                    materialRequestId: item.materialRequestId,
                    materialRequestItemId: item.id,
                    itemName: itemName || item.itemName,
                    supplierName: supplierName,
                    quantity: parseFloat(quantity),
                    rate: parseFloat(rate),
                    expectedDate: parseDate(expectedDate),
                    status: "ORDERED",
                },
            });

            // 3. Update Item Status
            await tx.materialRequestItem.update({
                where: { id: item.id },
                data: { status: "ORDERED" } as any, // Cast to any in case types are lagging
            });

            // 4. Update Parent Request if all items are ordered
            const allItems = await tx.materialRequestItem.findMany({
                where: { materialRequestId: item.materialRequestId },
            });

            const allOrdered = allItems.every((i: any) => i.status === "ORDERED");

            if (allOrdered) {
                await tx.materialRequest.update({
                    where: { id: item.materialRequestId },
                    data: { status: "ORDERED" },
                });
            }

            return po;
        });

        return NextResponse.json(result);

    } catch (err: any) {
        console.error("CREATE PO ERROR ❌", err);
        return NextResponse.json(
            { error: String(err.message || err) },
            { status: 500 }
        );
    }
}
