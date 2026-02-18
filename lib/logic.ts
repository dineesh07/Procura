import { prisma } from "./prisma";

/**
 * Calculates the current "Soft Available" stock for a material.
 * Soft Available = Physical Stock - Allocated (Sum of PENDING material requests)
 */
export async function getSoftAvailableStock(itemName: string, excludeOrderId?: string) {
    const inventory = await prisma.inventory.findUnique({
        where: { itemName },
    });

    if (!inventory) return 0;

    // We only care about orders that are ALREADY in the pipeline (CALCULATING/REQUESTED)
    // but we must exclude the current order being calculated to avoid self-allocation
    const pendingOrders = await prisma.order.findMany({
        where: {
            status: { in: ["CALCULATING", "MATERIAL_REQUESTED"] },
            ...(excludeOrderId && {
                id: { not: excludeOrderId }
            })
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

    return inventory.currentStock - allocatedAmount;
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

        // Pass order.id to exclude THIS order from allocation check
        const softAvailable = await getSoftAvailableStock(item.itemName, order.id);

        // User Defined Logic: Reorder Shortage Calculation
        // Reorder Level = (Daily Consumption * Lead Time) + Safety Stock
        // Shortage = Max(0, Reorder Level - Current Stock)

        const dailyConsumption = inventory?.dailyConsumption || 0;
        const leadTime = inventory?.leadTime || 0;
        const safetyStock = inventory?.safetyStock || 0;

        const reorderLevel = (dailyConsumption * leadTime) + safetyStock;
        const reorderShortage = Math.max(0, reorderLevel - physicalStock);

        // PPC Logic: Shortage for specific order
        const orderShortage = Math.max(0, required - softAvailable);

        return {
            material: item.itemName,
            required, // Planned Qty for this order
            physicalStock,
            softAvailable,

            // Distinguish the two shortage types
            shortage: orderShortage, // Default binding for PPC Dashboard (Kavya)
            reorderShortage,         // For future Materials Manager views

            utilizationPercent: physicalStock > 0 ? (required / physicalStock) * 100 : 100
        };
    }));

    return {
        order,
        requirements: inventoryImpact
    };
}
