import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking ai_credits_balance column type...');

    // Raw query to check column definition in Postgres
    const result = await prisma.$queryRaw`
        SELECT column_name, data_type, numeric_precision, numeric_scale 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'ai_credits_balance';
    `;

    console.log('Schema Definition:', result);

    const user = await prisma.user.findFirst();
    if (user) {
        console.log('Sample User Balance:', user.aiCreditsBalance, 'Type:', typeof user.aiCreditsBalance);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
