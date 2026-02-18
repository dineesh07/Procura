import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "PPC_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const order = await prisma.order.update({
            where: { id },
            data: {
                assignedToId: null,
                assignedAt: null,
            },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to unassign order" }, { status: 500 });
    }
}
