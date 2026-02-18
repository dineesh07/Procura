import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "PPC_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId } = await req.json();
    const { id } = await params;

    try {
        const order = await prisma.order.update({
            where: { id },
            data: {
                assignedToId: employeeId,
                assignedAt: new Date(),
            },
        });
        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: "Failed to assign order" }, { status: 500 });
    }
}
