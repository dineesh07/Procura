import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_bMko8tUQCz2R@ep-wild-mouse-a1sid40z-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function main() {
    // 1. Create Users
    const password = await bcrypt.hash("password123", 10);

    const users = [
        { email: "sales@procura.com", name: "Sales User", role: Role.SALES },
        { email: "ppc@procura.com", name: "PPC Planner", role: Role.PPC },
        { email: "materials@procura.com", name: "Materials Manager", role: Role.MATERIALS },
        { email: "purchase@procura.com", name: "Purchase Officer", role: Role.PURCHASE },
        { email: "management@procura.com", name: "Manager", role: Role.MANAGEMENT },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: { ...user, password },
        });
    }

    // 2. Create BOM (Recipes)
    const boms = [
        { productName: "Shirt", itemName: "Fabric", quantityPerUnit: 2.5 },
        { productName: "Shirt", itemName: "Thread", quantityPerUnit: 0.5 },
        { productName: "Shirt", itemName: "Buttons", quantityPerUnit: 8 },
    ];

    for (const bom of boms) {
        await prisma.bOM.upsert({
            where: {
                productName_itemName: {
                    productName: bom.productName,
                    itemName: bom.itemName,
                },
            },
            update: {},
            create: bom,
        });
    }

    // 3. Create Inventory
    const inventoryItems = [
        {
            itemName: "Fabric",
            currentStock: 5000,
            onOrderStock: 0,
            reorderLevel: 2000,
            dailyConsumption: 500,
            leadTime: 5,
            safetyStock: 500,
            unit: "meters",
        },
        {
            itemName: "Thread",
            currentStock: 200,
            onOrderStock: 0,
            reorderLevel: 500,
            dailyConsumption: 100,
            leadTime: 3,
            safetyStock: 100,
            unit: "cones",
        },
        {
            itemName: "Buttons",
            currentStock: 10000,
            onOrderStock: 0,
            reorderLevel: 5000,
            dailyConsumption: 2000,
            leadTime: 4,
            safetyStock: 1000,
            unit: "pieces",
        },
    ];

    for (const item of inventoryItems) {
        await prisma.inventory.upsert({
            where: { itemName: item.itemName },
            update: {},
            create: item,
        });
    }

    // 4. Create Sample Orders
    const sampleOrders = [
        {
            customerName: "Global Textiles Ltd",
            productName: "Shirt",
            quantity: 100,
            deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "PENDING" as const,
        },
        {
            customerName: "Elite Fashion",
            productName: "Shirt",
            quantity: 50,
            deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: "IN_PRODUCTION" as const,
        }
    ];

    for (const order of sampleOrders) {
        const createdOrder = await prisma.order.create({
            data: order
        });

        // Create a material request for the pending order
        if (order.status === "PENDING") {
            await prisma.materialRequest.create({
                data: {
                    orderId: createdOrder.id,
                    status: "PENDING"
                }
            });
        }
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
