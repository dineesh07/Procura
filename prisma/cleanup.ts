import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🗑️  Clearing transactional tables...')

    // Order of deletion matters due to foreign key constraints if they existed, 
    // but Prisma's deleteMany handles bulk deletions well.
    // We go from most dependent to least dependent.

    const stats = {
        variances: await prisma.variance.deleteMany(),
        actualConsumption: await prisma.actualConsumption.deleteMany(),
        production: await prisma.production.deleteMany(),
        purchaseOrder: await prisma.purchaseOrder.deleteMany(),
        materialRequestItem: await prisma.materialRequestItem.deleteMany(),
        materialRequest: await prisma.materialRequest.deleteMany(),
    }

    console.log('\n✅ Cleanup Complete!')
    console.log('------------------')
    console.log(`Variances:        ${stats.variances.count} deleted`)
    console.log(`Actual Cons.:     ${stats.actualConsumption.count} deleted`)
    console.log(`Production:       ${stats.production.count} deleted`)
    console.log(`Purchase Orders:  ${stats.purchaseOrder.count} deleted`)
    console.log(`Material Items:   ${stats.materialRequestItem.count} deleted`)
    console.log(`Material Reqs:    ${stats.materialRequest.count} deleted`)
    console.log('------------------\n')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
