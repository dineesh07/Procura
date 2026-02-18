import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Verifying migration...");

    const boms = await prisma.bOM.count();
    const inventory = await prisma.inventory.count();
    const orders = await prisma.order.count();
    const users = await prisma.user.count();
    const variances = await prisma.variance.count();

    console.log("--- Summary ---");
    console.log("BOM Items:", boms);
    console.log("Inventory Items:", inventory);
    console.log("Orders:", orders);
    console.log("Users:", users);
    console.log("Variances:", variances);

    console.log("\n--- Products ---");
    const products = await prisma.bOM.findMany({
        distinct: ['productName'],
        select: { productName: true }
    });
    products.forEach(p => console.log("-", p.productName));

    console.log("\n--- Sample Inventory Stock ---");
    const sampleStock = await prisma.inventory.findMany({
        where: { itemName: { in: ['PCB Board', 'LED Driver IC', 'Power IC'] } }
    });
    sampleStock.forEach(s => console.log(`${s.itemName}: ${s.currentStock} (Min: ${s.reorderLevel})`));

    console.log("\n--- Sample Order ---");
    const sampleOrder = await prisma.order.findUnique({
        where: { id: "ORD-TMR-001" },
        include: { variances: true }
    });
    if (sampleOrder) {
        console.log(`Order: ${sampleOrder.id}, Status: ${sampleOrder.status}`);
        console.log(`Variances: ${sampleOrder.variances.length} items`);
    } else {
        console.log("ORD-TMR-001 not found!");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
