import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productName = searchParams.get("productName");

    if (!productName) {
        try {
            const products = await prisma.bOM.findMany({
                distinct: ['productName'],
                select: { productName: true }
            });
            return NextResponse.json(products.map(p => p.productName));
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
        }
    }

    try {
        const bom = await prisma.bOM.findMany({
            where: { productName },
        });
        return NextResponse.json(bom);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch BOM" }, { status: 500 });
    }
}
