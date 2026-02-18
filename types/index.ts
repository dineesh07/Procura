import { Role, OrderStatus, RequestStatus } from "@prisma/client";

export interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    inProductionOrders: number;
    completedOrders: number;
}

export interface BOMItem {
    id: string;
    productName: string;
    itemName: string;
    quantityPerUnit: number;
}

export interface InventoryItem {
    id: string;
    itemName: string;
    currentStock: number;
    onOrderStock: number;
    reorderLevel: number;
    dailyConsumption: number;
    leadTime: number;
    safetyStock: number;
    unit: string;
    status: "CRITICAL" | "WARNING" | "HEALTHY";
    daysRemaining: number;
}

export interface VarianceReport {
    orderId: string;
    itemName: string;
    plannedQty: number;
    actualQty: number;
    plannedRate: number;
    actualRate: number;
    qtyVariance: number;
    priceVariance: number;
    totalVariance: number;
}
