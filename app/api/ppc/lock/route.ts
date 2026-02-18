import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session || !userRole?.includes("PPC")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId } = await req.json();

        // Lock the order
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: "CALCULATING" }
        });

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to lock order" }, { status: 500 });
    }
}
