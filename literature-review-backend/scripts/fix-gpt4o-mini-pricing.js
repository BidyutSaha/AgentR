const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPricing() {
    console.log('🔧 Fixing gpt-4o-mini pricing...\n');

    // Delete old incorrect pricing
    const deleted = await prisma.llmModelPricing.deleteMany({
        where: {
            modelName: 'gpt-4o-mini',
        },
    });

    console.log(`🗑️  Deleted ${deleted.count} old pricing entries for gpt-4o-mini\n`);

    // Create correct pricing - Standard tier
    await prisma.llmModelPricing.create({
        data: {
            modelName: 'gpt-4o-mini',
            provider: 'openai',
            pricingTier: 'standard',
            inputUsdCentsPerMillionTokens: 2.5,      // $0.025 per 1M tokens
            outputUsdCentsPerMillionTokens: 25,      // $0.25 per 1M tokens
            cachedInputUsdCentsPerMillionTokens: 1.25, // $0.0125 per 1M tokens
            description: 'GPT-4o-mini - Standard tier (correct pricing)',
            isActive: true,
            isLatest: true,
            effectiveFrom: new Date(),
        },
    });

    console.log('✅ Created: gpt-4o-mini (standard)');
    console.log('   Input: $0.025 per 1M tokens (2.5 cents)');
    console.log('   Output: $0.25 per 1M tokens (25 cents)');
    console.log('   Cached: $0.0125 per 1M tokens (1.25 cents)\n');

    // Create batch tier
    await prisma.llmModelPricing.create({
        data: {
            modelName: 'gpt-4o-mini',
            provider: 'openai',
            pricingTier: 'batch',
            inputUsdCentsPerMillionTokens: 1.25,     // $0.0125 per 1M tokens
            outputUsdCentsPerMillionTokens: 12.5,    // $0.125 per 1M tokens
            cachedInputUsdCentsPerMillionTokens: 0.625, // $0.00625 per 1M tokens
            description: 'GPT-4o-mini - Batch tier (50% discount)',
            isActive: true,
            isLatest: true,
            effectiveFrom: new Date(),
        },
    });

    console.log('✅ Created: gpt-4o-mini (batch)');
    console.log('   Input: $0.0125 per 1M tokens (1.25 cents)');
    console.log('   Output: $0.125 per 1M tokens (12.5 cents)');
    console.log('   Cached: $0.00625 per 1M tokens (0.625 cents)\n');

    console.log('✨ Pricing fixed successfully!\n');
}

fixPricing()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('❌ Error:', error);
        prisma.$disconnect();
        process.exit(1);
    });
