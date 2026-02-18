import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    console.log("[API/Orders] GET request received");
    const session = await auth();
    console.log("[API/Orders] Session:", !!session, "Role:", session?.user?.role);

    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                materialRequests: true,
                production: true,
            },
        });
        console.log("[API/Orders] Fetched orders:", orders.length);
        return NextResponse.json(orders);
    } catch (error) {
        console.error("[API/Orders] Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const order = await prisma.order.create({
            data: {
                customerName: body.customerName,
                productName: body.productName,
                quantity: parseInt(body.quantity),
                deliveryDate: new Date(body.deliveryDate),
                status: "PENDING",
            },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
