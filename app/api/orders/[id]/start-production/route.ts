import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { materialRequests: true }
        });

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // Ensure all material requests are received
        const allReceived = order.materialRequests.every((mr: any) => mr.status === "RECEIVED");

        if (order.materialRequests.length > 0 && !allReceived) {
            return NextResponse.json({ error: "Cannot start production: Materials not yet received" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Order status
            const updatedOrder = await tx.order.update({
                where: { id },
                data: { status: "IN_PRODUCTION" },
            });

            // 2. Create Production log
            await tx.production.create({
                data: {
                    orderId: id,
                    status: "IN_PRODUCTION",
                    startedAt: new Date(),
                },
            });

            return updatedOrder;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[API/Orders/StartProduction] Error:", error);
        return NextResponse.json({ error: "Failed to start production" }, { status: 500 });
    }
}
