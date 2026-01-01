import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed LLM Model Pricing Data
 * Based on OpenAI pricing as of January 2026
 * Prices are in cents per million tokens
 */
async function seedModelPricing() {
    console.log('🌱 Seeding LLM model pricing...');

    const pricingData = [
        {
            modelName: 'gpt-4o-mini',
            provider: 'openai',
            inputUsdCentsPerMillionTokens: 150000,    // $1.50 per 1M tokens
            outputUsdCentsPerMillionTokens: 600000,   // $6.00 per 1M tokens
            description: 'GPT-4o Mini - Fast and affordable model for simple tasks',
            isActive: true,
            isLatest: true,
        },
        {
            modelName: 'gpt-4o',
            provider: 'openai',
            inputUsdCentsPerMillionTokens: 2500000,   // $25.00 per 1M tokens
            outputUsdCentsPerMillionTokens: 10000000, // $100.00 per 1M tokens
            description: 'GPT-4o - Advanced model with vision capabilities',
            isActive: true,
            isLatest: true,
        },
        {
            modelName: 'gpt-4-turbo',
            provider: 'openai',
            inputUsdCentsPerMillionTokens: 10000000,  // $100.00 per 1M tokens
            outputUsdCentsPerMillionTokens: 30000000, // $300.00 per 1M tokens
            description: 'GPT-4 Turbo - Most capable model for complex tasks',
            isActive: true,
            isLatest: true,
        },
        {
            modelName: 'gpt-3.5-turbo',
            provider: 'openai',
            inputUsdCentsPerMillionTokens: 50000,     // $0.50 per 1M tokens
            outputUsdCentsPerMillionTokens: 150000,   // $1.50 per 1M tokens
            description: 'GPT-3.5 Turbo - Legacy model, still fast and affordable',
            isActive: true,
            isLatest: true,
        },
    ];

    for (const pricing of pricingData) {
        await prisma.llmModelPricing.upsert({
            where: {
                modelName_provider_pricingTier_effectiveFrom: {
                    modelName: pricing.modelName,
                    provider: pricing.provider,
                    pricingTier: 'standard',
                    effectiveFrom: new Date(),
                },
            },
            update: {
                inputUsdCentsPerMillionTokens: pricing.inputUsdCentsPerMillionTokens,
                outputUsdCentsPerMillionTokens: pricing.outputUsdCentsPerMillionTokens,
                description: pricing.description,
                isActive: pricing.isActive,
                isLatest: pricing.isLatest,
            },
            create: pricing,
        });

        console.log(`  ✓ Added pricing for ${pricing.modelName}`);
    }

    console.log('✅ Model pricing seeded successfully!\n');
}

async function main() {
    try {
        await seedModelPricing();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
