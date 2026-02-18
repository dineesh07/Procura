/**
 * Core Calculations for the Inventory Reorder Prediction + Variance Analysis System
 */

// Calculation 1: BOM × Order Quantity
export const calculateRequiredQuantity = (bomQtyPerUnit: number, orderQty: number) => {
    return bomQtyPerUnit * orderQty;
};

// Calculation 2: Stock Availability Check
export const checkStockAvailability = (currentStock: number, onOrderStock: number, requiredQty: number) => {
    const available = currentStock + onOrderStock;
    const shortage = requiredQty - available;
    return {
        available,
        shortage: shortage > 0 ? shortage : 0,
        isAvailable: shortage <= 0,
    };
};

// Calculation 3: Reorder Level
export const calculateReorderLevel = (dailyConsumption: number, leadTime: number, safetyStock: number) => {
    return dailyConsumption * leadTime + safetyStock;
};

// Calculation 4: Reorder Quantity
export const calculateReorderQuantity = (reorderLevel: number, currentStock: number) => {
    const qty = reorderLevel - currentStock;
    return qty > 0 ? qty : 0;
};

// Calculation 5: Days Remaining & Alert Levels
export const calculateDaysRemaining = (currentStock: number, dailyConsumption: number) => {
    if (dailyConsumption <= 0) return 999;
    const days = currentStock / dailyConsumption;

    let status: "CRITICAL" | "WARNING" | "HEALTHY" = "HEALTHY";
    if (days < 2) status = "CRITICAL";
    else if (days < 5) status = "WARNING";

    return { days, status };
};

// Calculation 6: Variance Analysis
export const calculateVariance = (
    plannedQty: number,
    actualQty: number,
    plannedRate: number,
    actualRate: number
) => {
    const plannedAmount = plannedQty * plannedRate;
    const actualAmount = actualQty * actualRate;

    // Qty Variance = (Actual Qty - Planned Qty) × Planned Rate
    const qtyVariance = (actualQty - plannedQty) * plannedRate;

    // Price Variance = (Actual Rate - Planned Rate) × Actual Qty
    const priceVariance = (actualRate - plannedRate) * actualQty;

    const totalVariance = actualAmount - plannedAmount; // or qtyVariance + priceVariance

    return {
        plannedAmount,
        actualAmount,
        qtyVariance,
        priceVariance,
        totalVariance,
        isUnfavorable: totalVariance > 0,
    };
};
