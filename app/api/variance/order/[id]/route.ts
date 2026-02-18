import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session || session.user.role !== "PPC_MANAGER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const variances = await prisma.variance.findMany({
            where: {
                orderId: id,
            },
            include: {
                order: true,
            },
        });
        return NextResponse.json(variances);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch variances for order" }, { status: 500 });
    }
}
