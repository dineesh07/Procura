import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up database...')
    await prisma.variance.deleteMany()
    await prisma.actualConsumption.deleteMany()
    await prisma.production.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.materialRequestItem.deleteMany()
    await prisma.materialRequest.deleteMany()
    await prisma.order.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.bOM.deleteMany()
    await prisma.user.deleteMany()

    console.log('Creating users...')
    const password = await bcrypt.hash('password123', 10)

    // ══════════════════════════════════════════════════════
    // USERS (8 total)
    // ══════════════════════════════════════════════════════
    const fahadh = await prisma.user.create({
        data: { email: 'sales@procura.com', name: 'Fahadh', role: 'SALES', password }
    })

    const ravi = await prisma.user.create({
        data: { email: 'ppc-manager@procura.com', name: 'Ravi', role: 'PPC_MANAGER', password }
    })

    const kavya = await prisma.user.create({
        data: { email: 'ppc-emp1@procura.com', name: 'Kavya', role: 'PPC_EMPLOYEE', managerId: ravi.id, password }
    })

    const siva = await prisma.user.create({
        data: { email: 'ppc-emp2@procura.com', name: 'Siva', role: 'PPC_EMPLOYEE', managerId: ravi.id, password }
    })

    const janani = await prisma.user.create({
        data: { email: 'materials-manager@procura.com', name: 'Janani', role: 'MATERIALS_MANAGER', password }
    })

    const harini = await prisma.user.create({
        data: { email: 'materials-emp1@procura.com', name: 'Harini', role: 'MATERIALS_EMPLOYEE', managerId: janani.id, password }
    })

    const bala = await prisma.user.create({
        data: { email: 'materials-emp2@procura.com', name: 'Bala', role: 'MATERIALS_EMPLOYEE', managerId: janani.id, password }
    })

    const kishore = await prisma.user.create({
        data: { email: 'purchase@procura.com', name: 'Kishore', role: 'PURCHASE', password }
    })

    console.log('✅ Users created')

    // ══════════════════════════════════════════════════════
    // BOM (26 rows)
    // ══════════════════════════════════════════════════════
    console.log('Seeding BOMs...')
    const boms = [
        // LED Driver 12W
        { productName: "LED Driver 12W", itemName: "PCB Board", quantityPerUnit: 1, unit: "pieces", plannedRate: 150 },
        { productName: "LED Driver 12W", itemName: "LED Driver IC", quantityPerUnit: 1, unit: "pieces", plannedRate: 80 },
        { productName: "LED Driver 12W", itemName: "Inductor Coil", quantityPerUnit: 1, unit: "pieces", plannedRate: 25 },
        { productName: "LED Driver 12W", itemName: "Capacitors", quantityPerUnit: 3, unit: "pieces", plannedRate: 5 },
        { productName: "LED Driver 12W", itemName: "Resistors", quantityPerUnit: 5, unit: "pieces", plannedRate: 2 },
        { productName: "LED Driver 12W", itemName: "Heat Sink", quantityPerUnit: 1, unit: "pieces", plannedRate: 30 },
        { productName: "LED Driver 12W", itemName: "Connector Pins", quantityPerUnit: 2, unit: "pieces", plannedRate: 8 },
        { productName: "LED Driver 12W", itemName: "Plastic Enclosure", quantityPerUnit: 1, unit: "pieces", plannedRate: 40 },

        // Mobile Charger 5V 2A
        { productName: "Mobile Charger 5V 2A", itemName: "PCB Board", quantityPerUnit: 1, unit: "pieces", plannedRate: 150 },
        { productName: "Mobile Charger 5V 2A", itemName: "Power IC", quantityPerUnit: 1, unit: "pieces", plannedRate: 120 },
        { productName: "Mobile Charger 5V 2A", itemName: "Transformer Core", quantityPerUnit: 1, unit: "pieces", plannedRate: 90 },
        { productName: "Mobile Charger 5V 2A", itemName: "Copper Wire", quantityPerUnit: 2.5, unit: "meters", plannedRate: 30 },
        { productName: "Mobile Charger 5V 2A", itemName: "Capacitors", quantityPerUnit: 4, unit: "pieces", plannedRate: 5 },
        { productName: "Mobile Charger 5V 2A", itemName: "Resistors", quantityPerUnit: 6, unit: "pieces", plannedRate: 2 },
        { productName: "Mobile Charger 5V 2A", itemName: "Diodes", quantityPerUnit: 2, unit: "pieces", plannedRate: 10 },
        { productName: "Mobile Charger 5V 2A", itemName: "USB Port", quantityPerUnit: 1, unit: "pieces", plannedRate: 15 },
        { productName: "Mobile Charger 5V 2A", itemName: "Plastic Casing", quantityPerUnit: 1, unit: "pieces", plannedRate: 50 },
        { productName: "Mobile Charger 5V 2A", itemName: "Cable Assembly", quantityPerUnit: 1, unit: "pieces", plannedRate: 35 },

        // Timer Control Board
        { productName: "Timer Control Board", itemName: "PCB Board", quantityPerUnit: 1, unit: "pieces", plannedRate: 150 },
        { productName: "Timer Control Board", itemName: "Microcontroller IC", quantityPerUnit: 1, unit: "pieces", plannedRate: 200 },
        { productName: "Timer Control Board", itemName: "Display Module", quantityPerUnit: 1, unit: "pieces", plannedRate: 120 },
        { productName: "Timer Control Board", itemName: "Push Buttons", quantityPerUnit: 4, unit: "pieces", plannedRate: 3 },
        { productName: "Timer Control Board", itemName: "Resistors", quantityPerUnit: 8, unit: "pieces", plannedRate: 2 },
        { productName: "Timer Control Board", itemName: "Capacitors", quantityPerUnit: 3, unit: "pieces", plannedRate: 5 },
        { productName: "Timer Control Board", itemName: "LED Indicators", quantityPerUnit: 2, unit: "pieces", plannedRate: 4 },
        { productName: "Timer Control Board", itemName: "Relay Module", quantityPerUnit: 1, unit: "pieces", plannedRate: 45 },
    ];

    for (const bom of boms) {
        await prisma.bOM.create({ data: bom });
    }
    console.log('✅ BOM created')

    // ══════════════════════════════════════════════════════
    // INVENTORY (20 unique materials)
    // ══════════════════════════════════════════════════════
    console.log('Seeding Inventory...')
    const inventory = [
        { itemName: "PCB Board", currentStock: 120, reorderLevel: 0, dailyConsumption: 40, leadTime: 2, safetyStock: 40, unit: "pieces" },
        { itemName: "LED Driver IC", currentStock: 60, reorderLevel: 0, dailyConsumption: 20, leadTime: 3, safetyStock: 30, unit: "pieces" },
        { itemName: "Inductor Coil", currentStock: 50, reorderLevel: 0, dailyConsumption: 15, leadTime: 3, safetyStock: 20, unit: "pieces" },
        { itemName: "Capacitors", currentStock: 300, reorderLevel: 0, dailyConsumption: 80, leadTime: 2, safetyStock: 100, unit: "pieces" },
        { itemName: "Resistors", currentStock: 500, reorderLevel: 0, dailyConsumption: 120, leadTime: 2, safetyStock: 150, unit: "pieces" },
        { itemName: "Heat Sink", currentStock: 40, reorderLevel: 0, dailyConsumption: 10, leadTime: 4, safetyStock: 20, unit: "pieces" },
        { itemName: "Connector Pins", currentStock: 100, reorderLevel: 0, dailyConsumption: 30, leadTime: 3, safetyStock: 40, unit: "pieces" },
        { itemName: "Plastic Enclosure", currentStock: 35, reorderLevel: 0, dailyConsumption: 10, leadTime: 5, safetyStock: 20, unit: "pieces" },
        { itemName: "Power IC", currentStock: 45, reorderLevel: 0, dailyConsumption: 12, leadTime: 4, safetyStock: 20, unit: "pieces" },
        { itemName: "Transformer Core", currentStock: 30, reorderLevel: 0, dailyConsumption: 10, leadTime: 5, safetyStock: 15, unit: "pieces" },
        { itemName: "Copper Wire", currentStock: 200, reorderLevel: 0, dailyConsumption: 50, leadTime: 3, safetyStock: 80, unit: "meters" },
        { itemName: "Diodes", currentStock: 90, reorderLevel: 0, dailyConsumption: 25, leadTime: 3, safetyStock: 40, unit: "pieces" },
        { itemName: "USB Port", currentStock: 50, reorderLevel: 0, dailyConsumption: 15, leadTime: 4, safetyStock: 20, unit: "pieces" },
        { itemName: "Plastic Casing", currentStock: 40, reorderLevel: 0, dailyConsumption: 10, leadTime: 5, safetyStock: 20, unit: "pieces" },
        { itemName: "Cable Assembly", currentStock: 35, reorderLevel: 0, dailyConsumption: 10, leadTime: 4, safetyStock: 15, unit: "pieces" },
        { itemName: "Microcontroller IC", currentStock: 30, reorderLevel: 0, dailyConsumption: 8, leadTime: 6, safetyStock: 15, unit: "pieces" },
        { itemName: "Display Module", currentStock: 25, reorderLevel: 0, dailyConsumption: 6, leadTime: 6, safetyStock: 10, unit: "pieces" },
        { itemName: "Push Buttons", currentStock: 120, reorderLevel: 0, dailyConsumption: 40, leadTime: 2, safetyStock: 60, unit: "pieces" },
        { itemName: "LED Indicators", currentStock: 90, reorderLevel: 0, dailyConsumption: 30, leadTime: 3, safetyStock: 40, unit: "pieces" },
        { itemName: "Relay Module", currentStock: 20, reorderLevel: 0, dailyConsumption: 6, leadTime: 6, safetyStock: 10, unit: "pieces" },
    ];

    for (const item of inventory) {
        await prisma.inventory.create({ data: item });
    }
    console.log('✅ Inventory created')

    // ══════════════════════════════════════════════════════
    // ORDERS (one order per product)
    // ══════════════════════════════════════════════════════
    console.log('Seeding Sample Orders...')
    const orders = [
        {
            customerName: "ABC Pvt Ltd",
            productName: "LED Driver 12W",
            quantity: 100,
            deliveryDate: new Date("2026-03-10"),
            status: "PENDING" as any
        },
        {
            customerName: "Bright Power",
            productName: "Mobile Charger 5V 2A",
            quantity: 80,
            deliveryDate: new Date("2026-03-12"),
            status: "PENDING" as any
        },
        {
            customerName: "Smart Controls",
            productName: "Timer Control Board",
            quantity: 60,
            deliveryDate: new Date("2026-03-15"),
            status: "PENDING" as any
        }
    ]

    for (const order of orders) {
        await prisma.order.create({ data: order });
    }
    console.log('✅ Orders created')

    console.log('\n═══════════════════════════════════════')
    console.log('✅ Seed complete!')
    console.log('═══════════════════════════════════════')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
