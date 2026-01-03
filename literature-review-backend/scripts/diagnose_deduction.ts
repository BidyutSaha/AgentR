import { PrismaClient } from '@prisma/client';
import { logLlmUsage } from '../src/services/llmUsageLogger.service';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 STARTING DEDUCTION DIAGNOSIS...');

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('❌ No user found in DB!');
        return;
    }
    console.log(`👤 User found: ${user.email} (ID: ${user.id})`);
    console.log(`💰 Initial Balance: ${user.aiCreditsBalance}`);

    // 2. Simulate LLM Usage (Cost ~$0.001 -> ~0.1 Credits)
    console.log('🤖 Simulating LLM Usage...');
    await logLlmUsage({
        userId: user.id,
        stage: 'diagnosis_test',
        modelName: 'gpt-5-mini', // Must match seeded pricing
        inputTokens: 1000,
        outputTokens: 100,
        totalTokens: 1100,
        provider: 'openai'
    });

    // 3. Check Balance Again
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`💰 Final Balance: ${updatedUser?.aiCreditsBalance}`);

    if (updatedUser!.aiCreditsBalance < user.aiCreditsBalance) {
        console.log('✅ SUCCESS: Balance decreased!');
        console.log(`   Diff: ${user.aiCreditsBalance - updatedUser!.aiCreditsBalance} credits`);
    } else {
        console.log('❌ FAILURE: Balance did NOT decrease.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
