import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "MATERIALS_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const request = await prisma.materialRequest.update({
            where: { id },
            data: {
                assignedToId: null,
                assignedAt: null,
            },
        });
        return NextResponse.json(request);
    } catch (error) {
        return NextResponse.json({ error: "Failed to unassign material request" }, { status: 500 });
    }
}
