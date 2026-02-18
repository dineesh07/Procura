import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const variances = await prisma.variance.findMany({
            include: {
                order: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(variances);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch variances" }, { status: 500 });
    }
}
