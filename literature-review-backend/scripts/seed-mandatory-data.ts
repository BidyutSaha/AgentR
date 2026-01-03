import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    console.log(`🌱 Starting mandatory data seeding...`);
    console.log(`🔌 Connecting to DB: ${dbUrl ? dbUrl.split('@')[1] : 'UNDEFINED'}`);

    // 0. CLEAR EXISTING DATA (Reset to fresh state)
    console.log('\n🧹 Clearing existing configuration data...');
    await prisma.llmModelPricing.deleteMany({});
    await prisma.creditsMultiplierHistory.deleteMany({});
    await prisma.defaultCreditsHistory.deleteMany({});
    console.log('✅ Cleared: llm_model_pricing, credits_multiplier_history, default_credits_history');

    // 1. Seed LLM Pricing
    const models = [
        {
            modelName: 'gpt-5-mini',
            provider: 'openai',
            pricingTier: 'standard',
            inputPrice: 0.25,         // per 1M tokens
            outputPrice: 0.025,       // per 1M tokens
            cachedInputPrice: 2.0     // per 1M tokens
        }

    ];

    console.log('\nPricing Seeding:');
    for (const model of models) {
        // Deactivate old pricing for this model to avoid duplicates
        await prisma.llmModelPricing.updateMany({
            where: {
                modelName: model.modelName,
                provider: model.provider,
                isActive: true
            },
            data: { isActive: false, isLatest: false }
        });

        // Add new active pricing
        await prisma.llmModelPricing.create({
            data: {
                modelName: model.modelName,
                provider: model.provider,
                pricingTier: model.pricingTier,
                inputUsdPricePerMillionTokens: model.inputPrice,
                outputUsdPricePerMillionTokens: model.outputPrice,
                cachedInputUsdPricePerMillionTokens: model.cachedInputPrice,
                isActive: true,
                isLatest: true,
                effectiveFrom: new Date(),
                description: `Seeded pricing for ${model.modelName}`,
                notes: 'Auto-generated via seed-mandatory-data.ts'
            }
        });
        console.log(`✅ Pricing added for ${model.modelName}`);
    }

    // 2. Seed Credits Multiplier (if no active one exists)
    const activeMultiplier = await prisma.creditsMultiplierHistory.findFirst({
        where: { isActive: true }
    });

    console.log('\nMultiplier Config:');
    if (!activeMultiplier) {
        await prisma.creditsMultiplierHistory.create({
            data: {
                usdToCreditsMultiplier: 100.0,
                isActive: true,
                effectiveFrom: new Date(),
                description: 'Initial Seed',
                updatedBy: 'system-seed'
            }
        });
        console.log('✅ Created active Multiplier (100.0)');
    } else {
        console.log('ℹ️ Active Multiplier already exists (Skipping)');
    }

    // 3. Seed Default Credits (if no active one exists)
    const activeDefault = await prisma.defaultCreditsHistory.findFirst({
        where: { isActive: true }
    });

    console.log('\nDefault Credits Config:');
    if (!activeDefault) {
        await prisma.defaultCreditsHistory.create({
            data: {
                defaultCredits: 50.0,
                isActive: true,
                effectiveFrom: new Date(),
                description: 'Initial Seed',
                updatedBy: 'system-seed'
            }
        });
        console.log('✅ Created active Default Credits (50.0)');
    } else {
        console.log('ℹ️ Active Default Credits already exists (Skipping)');
    }

    console.log('\n🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
