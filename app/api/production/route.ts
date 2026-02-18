import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const production = await prisma.production.create({
            data: {
                orderId: body.orderId,
                status: "IN_PRODUCTION",
                startedAt: new Date(),
            },
        });

        // Update order status
        await prisma.order.update({
            where: { id: body.orderId },
            data: { status: "IN_PRODUCTION" },
        });

        return NextResponse.json(production);
    } catch (error) {
        return NextResponse.json({ error: "Failed to start production" }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const productions = await prisma.production.findMany({
            include: {
                order: {
                    include: {
                        materialRequests: {
                            include: {
                                purchaseOrders: true
                            }
                        }
                    }
                }
            },
            orderBy: { startedAt: "desc" },
        });
        return NextResponse.json(productions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch productions" }, { status: 500 });
    }
}
