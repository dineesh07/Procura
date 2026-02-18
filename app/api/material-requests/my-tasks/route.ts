import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "MATERIALS_EMPLOYEE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const requests = await prisma.materialRequest.findMany({
            where: {
                assignedToId: session.user.id,
            },
            include: {
                order: true,
                items: true,
            },
            orderBy: {
                assignedAt: "desc",
            },
        });

        // Enrich with inventory data and Net Available logic
        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const enrichedItems = await Promise.all(req.items.map(async (item) => {
                const inventory = await prisma.inventory.findUnique({
                    where: { itemName: item.itemName }
                });

                if (!inventory) return { ...item, netAvailable: 0, physicalStock: 0 };

                // Sum all pending allocations for this item
                const allPendingItems = await prisma.materialRequestItem.findMany({
                    where: {
                        itemName: item.itemName,
                        materialRequest: {
                            status: { in: ["PENDING", "VERIFIED_BY_STAFF"] }
                        },
                        // Exclude the current item from its own net available calculation if needed, 
                        // but usually Net Available is "what's left for everyone"
                    }
                });

                const totalAllocated = allPendingItems.reduce((acc, i) => acc + i.requiredQty, 0);
                const netAvailable = inventory.currentStock - totalAllocated;

                return {
                    ...item,
                    physicalStock: inventory.currentStock,
                    netAvailable,
                    consumptionPercent: (item.requiredQty / inventory.currentStock) * 100
                };
            }));

            return { ...req, items: enrichedItems };
        }));

        return NextResponse.json(enrichedRequests);
    } catch (error) {
        console.error("[API/MaterialRequests/MyTasks] GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}
