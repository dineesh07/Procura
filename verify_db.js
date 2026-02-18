const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- DATABASE USERS ---');
        users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}`));
        console.log('----------------------');
        process.exit(0);
    } catch (e) {
        console.error('Error fetching users:', e.message);
        process.exit(1);
    }
}

check();
