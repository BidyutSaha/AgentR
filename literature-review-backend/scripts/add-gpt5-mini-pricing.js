const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addGpt5Pricing() {
    console.log('🔧 Adding fallback pricing for gpt-5-mini (if needed)...\n');

    const existing = await prisma.llmModelPricing.findFirst({
        where: {
            modelName: 'gpt-5-mini',
            isLatest: true,
        },
    });

    if (existing) {
        console.log('✅ Pricing for gpt-5-mini already exists.');
        return;
    }

    // Create pricing for gpt-5-mini (using gpt-4o-mini pricing as fallback)
    // Pricing: $0.15 input / $0.60 output (USD)
    await prisma.llmModelPricing.create({
        data: {
            modelName: 'gpt-5-mini',
            provider: 'openai',
            pricingTier: 'standard',
            inputUsdPricePerMillionTokens: 0.15,
            outputUsdPricePerMillionTokens: 0.60,
            cachedInputUsdPricePerMillionTokens: 0.075,
            description: 'gpt-5-mini - FALLBACK PRICING (model does not exist, using gpt-4o-mini pricing)',
            isActive: true,
            isLatest: true,
            effectiveFrom: new Date(),
        },
    });

    console.log('✅ Created: gpt-5-mini (standard)');
    console.log('   Input: $0.15 per 1M tokens');
    console.log('   Output: $0.60 per 1M tokens');
    console.log('   ⚠️  WARNING: gpt-5-mini does not exist!');
    console.log('   ⚠️  Using gpt-4o-mini pricing as fallback');
    console.log('   ⚠️  Please update your .env file to use a real model\n');
}

addGpt5Pricing()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
