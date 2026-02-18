import { prisma } from "./prisma";

/**
 * Calculates the current "Soft Available" stock for a material.
 * Soft Available = Physical Stock - Allocated (Sum of PENDING material requests)
 */
export async function getSoftAvailableStock(itemName: string) {
    const inventory = await prisma.inventory.findUnique({
        where: { itemName },
    });

    if (!inventory) return 0;

    const pendingRequests = await prisma.materialRequest.findMany({
        where: {
            status: "PENDING",
            // We'd ideally link MaterialRequest to specific Items, 
            // but in this version it's per Order. 
            // For now, we fetch all orders that are CALCULATING or MATERIAL_REQUESTED
            // to estimate allocation.
        }
    });

    // In a more robust system, MaterialRequest would have line items.
    // For this implementation, we'll calculate allocation based on BOM of PENDING orders.
    const pendingOrders = await prisma.order.findMany({
        where: {
            status: { in: ["CALCULATING", "MATERIAL_REQUESTED"] }
        }
    });

    let allocatedAmount = 0;
    for (const order of pendingOrders) {
        const bom = await prisma.bOM.findFirst({
            where: {
                productName: order.productName,
                itemName: itemName
            }
        });
        if (bom) {
            allocatedAmount += order.quantity * bom.quantityPerUnit;
        }
    }

    return Math.max(0, inventory.currentStock - allocatedAmount);
}

/**
 * Calculates material requirements for an order and checks against soft inventory.
 */
export async function calculateOrderRequirements(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    const bom = await prisma.bOM.findMany({
        where: { productName: order.productName },
    });

    const inventoryImpact = await Promise.all(bom.map(async (item) => {
        const required = item.quantityPerUnit * order.quantity;
        const inventory = await prisma.inventory.findUnique({
            where: { itemName: item.itemName },
        });

        const physicalStock = inventory?.currentStock || 0;
        const softAvailable = await getSoftAvailableStock(item.itemName);

        return {
            material: item.itemName,
            required,
            physicalStock,
            softAvailable,
            shortage: Math.max(0, required - softAvailable),
            utilizationPercent: physicalStock > 0 ? (required / physicalStock) * 100 : 100
        };
    }));

    return {
        order,
        requirements: inventoryImpact
    };
}
