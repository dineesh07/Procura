import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const requests = await prisma.materialRequest.findMany({
            include: {
                order: true,
                items: true,
                purchaseOrders: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Enrich with live shortage calculation (Self-Healing Logic)
        const enriched = await Promise.all(requests.map(async (req) => {
            const enrichedItems = await Promise.all(req.items.map(async (item) => {
                const inventory = await prisma.inventory.findUnique({
                    where: { itemName: item.itemName }
                });
                if (!inventory) return item;

                // Warehouse Debt (negative stock) must be added to the order's requirements
                const debt = inventory.currentStock < 0 ? Math.abs(inventory.currentStock) : 0;
                const liveShortage = item.requiredQty + debt;

                return {
                    ...item,
                    shortageQty: liveShortage,
                    actualPhysicalCount: inventory.currentStock,
                    dailyConsumption: inventory.dailyConsumption,
                    leadTime: inventory.leadTime
                };
            }));
            return { ...req, items: enrichedItems };
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("[API/MaterialRequests] GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { orderId, items } = body;

        const request = await prisma.materialRequest.create({
            data: {
                orderId: orderId || null,
                status: "PENDING",
                items: {
                    create: items.map((item: any) => ({
                        itemName: item.material,
                        requiredQty: item.required,
                        shortageQty: item.shortage,
                    })),
                },
            },
        });

        // Update order status if orderId is provided
        if (orderId) {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: "MATERIAL_REQUESTED" },
            });
        }

        return NextResponse.json(request);
    } catch (error) {
        console.error("[API/MaterialRequests] POST Error:", error);
        return NextResponse.json({ error: "Failed to create material request" }, { status: 500 });
    }
}
