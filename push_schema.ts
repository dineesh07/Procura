import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables
config();

const connectionString = "postgresql://neondb_owner:npg_bMko8tUQCz2R@ep-wild-mouse-a1sid40z.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function pushSchema() {
    const client = new Client({ connectionString });

    try {
        console.log("Connecting to Neon PostgreSQL...");
        await client.connect();
        console.log("✓ Connected successfully!");

        // Create ENUM types
        console.log("\nCreating ENUM types...");
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "Role" AS ENUM ('SALES', 'PPC', 'MATERIALS', 'PURCHASE', 'MANAGEMENT');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'MATERIAL_REQUESTED', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ORDERED', 'RECEIVED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log("✓ ENUM types created");

        // Create tables
        console.log("\nCreating tables...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS "User" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role "Role" NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "Order" (
                id TEXT PRIMARY KEY,
                "customerName" TEXT NOT NULL,
                "productName" TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                "deliveryDate" TIMESTAMP(3) NOT NULL,
                status "OrderStatus" NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "BOM" (
                id TEXT PRIMARY KEY,
                "productName" TEXT NOT NULL,
                "itemName" TEXT NOT NULL,
                "quantityPerUnit" DOUBLE PRECISION NOT NULL,
                UNIQUE("productName", "itemName")
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "Inventory" (
                id TEXT PRIMARY KEY,
                "itemName" TEXT UNIQUE NOT NULL,
                "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "onOrderStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "reorderLevel" DOUBLE PRECISION NOT NULL,
                "dailyConsumption" DOUBLE PRECISION NOT NULL,
                "leadTime" INTEGER NOT NULL,
                "safetyStock" DOUBLE PRECISION NOT NULL,
                unit TEXT NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "MaterialRequest" (
                id TEXT PRIMARY KEY,
                "orderId" TEXT NOT NULL,
                status "RequestStatus" NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                FOREIGN KEY ("orderId") REFERENCES "Order"(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
                id TEXT PRIMARY KEY,
                "materialRequestId" TEXT NOT NULL,
                "itemName" TEXT NOT NULL,
                quantity DOUBLE PRECISION NOT NULL,
                rate DOUBLE PRECISION NOT NULL,
                "supplierName" TEXT NOT NULL,
                "expectedDate" TIMESTAMP(3) NOT NULL,
                status "RequestStatus" NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("materialRequestId") REFERENCES "MaterialRequest"(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "Production" (
                id TEXT PRIMARY KEY,
                "orderId" TEXT UNIQUE NOT NULL,
                status "OrderStatus" NOT NULL DEFAULT 'PENDING',
                "startedAt" TIMESTAMP(3),
                "completedAt" TIMESTAMP(3),
                FOREIGN KEY ("orderId") REFERENCES "Order"(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "ActualConsumption" (
                id TEXT PRIMARY KEY,
                "productionId" TEXT NOT NULL,
                "itemName" TEXT NOT NULL,
                "actualQty" DOUBLE PRECISION NOT NULL,
                "actualRate" DOUBLE PRECISION NOT NULL,
                FOREIGN KEY ("productionId") REFERENCES "Production"(id)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS "Variance" (
                id TEXT PRIMARY KEY,
                "orderId" TEXT NOT NULL,
                "itemName" TEXT NOT NULL,
                "plannedQty" DOUBLE PRECISION NOT NULL,
                "actualQty" DOUBLE PRECISION NOT NULL,
                "plannedRate" DOUBLE PRECISION NOT NULL,
                "actualRate" DOUBLE PRECISION NOT NULL,
                "qtyVariance" DOUBLE PRECISION NOT NULL,
                "priceVariance" DOUBLE PRECISION NOT NULL,
                "totalVariance" DOUBLE PRECISION NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("orderId") REFERENCES "Order"(id)
            );
        `);

        console.log("✓ All tables created successfully!");

        await client.end();
        console.log("\n✓ Schema push completed!");

    } catch (error) {
        console.error("Error pushing schema:", error);
        await client.end();
        process.exit(1);
    }
}

pushSchema();
