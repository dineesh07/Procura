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
                purchaseOrders: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
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
                orderId,
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

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "MATERIAL_REQUESTED" },
        });

        return NextResponse.json(request);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create material request" }, { status: 500 });
    }
}
