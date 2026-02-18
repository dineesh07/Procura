import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "MATERIALS_EMPLOYEE") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json(); // { actuals: { item_id: count } }
        const { actuals } = body;

        // Verify assignment
        const request = await prisma.materialRequest.findUnique({
            where: { id },
            select: { assignedToId: true }
        });

        if (request?.assignedToId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized assignment" }, { status: 403 });
        }

        // Update items in a transaction
        await prisma.$transaction(
            Object.entries(actuals).map(([itemId, count]) =>
                prisma.materialRequestItem.update({
                    where: { id: itemId },
                    data: { actualPhysicalCount: Number(count) }
                })
            )
        );

        // Update request status
        await prisma.materialRequest.update({
            where: { id },
            data: {
                status: "VERIFIED_BY_STAFF",
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API/MaterialRequests/Verify] POST Error:", error);
        return NextResponse.json({ error: "Failed to verify request" }, { status: 500 });
    }
}
