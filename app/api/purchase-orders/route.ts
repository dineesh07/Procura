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
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const order = await prisma.purchaseOrder.create({
            data: {
                materialRequestId: body.materialRequestId,
                supplierName: body.supplierName,
                quantity: parseFloat(body.quantity),
                rate: parseFloat(body.rate),
                expectedDate: new Date(body.expectedDate),
                status: "ORDERED",
            },
        });

        // Update material request status
        await prisma.materialRequest.update({
            where: { id: body.materialRequestId },
            data: { status: "ORDERED" },
        });

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
    }
}
