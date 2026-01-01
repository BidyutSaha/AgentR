const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addGpt5MiniPricing() {
    console.log('🔧 Adding pricing for gpt-5-mini (non-existent model)...\n');

    try {
        // Check if it already exists
        const existing = await prisma.llmModelPricing.findFirst({
            where: {
                modelName: 'gpt-5-mini',
                isLatest: true,
            },
        });

        if (existing) {
            console.log('⏭️  gpt-5-mini pricing already exists\n');
            return;
        }

        // Create pricing for gpt-5-mini (using gpt-4o-mini pricing as fallback)
        await prisma.llmModelPricing.create({
            data: {
                modelName: 'gpt-5-mini',
                provider: 'openai',
                pricingTier: 'standard',
                inputUsdCentsPerMillionTokens: 2.5,      // Same as gpt-4o-mini
                outputUsdCentsPerMillionTokens: 25,      // Same as gpt-4o-mini
                cachedInputUsdCentsPerMillionTokens: 1.25,
                description: 'gpt-5-mini - FALLBACK PRICING (model does not exist, using gpt-4o-mini pricing)',
                isActive: true,
                isLatest: true,
                effectiveFrom: new Date(),
            },
        });

        console.log('✅ Created: gpt-5-mini (standard)');
        console.log('   Input: $0.025 per 1M tokens (2.5 cents)');
        console.log('   Output: $0.25 per 1M tokens (25 cents)');
        console.log('   ⚠️  WARNING: gpt-5-mini does not exist!');
        console.log('   ⚠️  Using gpt-4o-mini pricing as fallback');
        console.log('   ⚠️  Please update your .env file to use a real model\n');

        console.log('✨ Pricing added successfully!\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

addGpt5MiniPricing()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error('❌ Failed:', error);
        prisma.$disconnect();
        process.exit(1);
    });
