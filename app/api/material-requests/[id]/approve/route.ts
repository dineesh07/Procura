import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "MATERIALS_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await prisma.materialRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API/MaterialRequests/Approve] POST Error:", error);
        return NextResponse.json({ error: "Failed to approve request" }, { status: 500 });
    }
}
