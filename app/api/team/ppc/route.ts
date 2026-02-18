import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session || session.user.role !== "PPC_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const team = await prisma.user.findMany({
            where: {
                role: "PPC_EMPLOYEE",
            },
            select: {
                id: true,
                name: true,
                email: true,
                _count: {
                    select: { assignedOrders: { where: { status: { not: "COMPLETED" } } } }
                }
            }
        });
        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}
