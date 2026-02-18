import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "PPC_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const variances = await prisma.variance.findMany({
            include: {
                order: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Enrich with Supplier Info from Purchase Orders
        const enriched = await Promise.all(variances.map(async (v) => {
            const po = await prisma.purchaseOrder.findFirst({
                where: {
                    itemName: v.itemName,
                    materialRequest: {
                        orderId: v.orderId
                    }
                }
            });
            return {
                ...v,
                supplierName: po?.supplierName || "Internal Inventory"
            };
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("[API/Variance] GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch variances" }, { status: 500 });
    }
}
