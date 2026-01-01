#!/usr/bin/env node

/**
 * Seed LLM Model Pricing Data
 * 
 * This script populates the llm_model_pricing table with current OpenAI pricing.
 * Run this after database setup to enable cost tracking.
 * 
 * Usage: node seed-pricing.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// OpenAI Pricing as of January 2026
// Source: https://openai.com/api/pricing/
const PRICING_DATA = [
    // GPT-4o Models
    {
        modelName: 'gpt-4o',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 2.50,      // $2.50 per 1M tokens
        outputUsdPricePerMillionTokens: 10.00,    // $10.00 per 1M tokens
        cachedInputUsdPricePerMillionTokens: 1.25, // $1.25 per 1M tokens (50% off)
        description: 'GPT-4o - Standard tier with prompt caching',
    },
    {
        modelName: 'gpt-4o',
        provider: 'openai',
        pricingTier: 'batch',
        inputUsdPricePerMillionTokens: 1.25,      // $1.25 per 1M tokens (50% off)
        outputUsdPricePerMillionTokens: 5.00,     // $5.00 per 1M tokens (50% off)
        cachedInputUsdPricePerMillionTokens: 0.63,  // $0.63 per 1M tokens
        description: 'GPT-4o - Batch tier (50% discount)',
    },
    {
        modelName: 'gpt-4o-mini',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 0.15,      // $0.15 per 1M tokens (Corrected from earlier 2.5c which was wrong/too low)
        outputUsdPricePerMillionTokens: 0.60,      // $0.60 per 1M tokens
        cachedInputUsdPricePerMillionTokens: 0.075, // $0.075 per 1M tokens
        description: 'GPT-4o-mini - Standard tier',
    },
    {
        modelName: 'gpt-4o-mini',
        provider: 'openai',
        pricingTier: 'batch',
        inputUsdPricePerMillionTokens: 0.075,
        outputUsdPricePerMillionTokens: 0.30,
        cachedInputUsdPricePerMillionTokens: 0.0375,
        description: 'GPT-4o-mini - Batch tier (50% discount)',
    },

    // GPT-4 Turbo Models
    {
        modelName: 'gpt-4-turbo',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 10.00,     // $10.00 per 1M tokens
        outputUsdPricePerMillionTokens: 30.00,    // $30.00 per 1M tokens
        cachedInputUsdPricePerMillionTokens: null,
        description: 'GPT-4 Turbo - Standard tier',
    },
    {
        modelName: 'gpt-4-turbo-preview',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 10.00,     // $10.00 per 1M tokens
        outputUsdPricePerMillionTokens: 30.00,    // $30.00 per 1M tokens
        cachedInputUsdPricePerMillionTokens: null,
        description: 'GPT-4 Turbo Preview - Standard tier',
    },

    // GPT-3.5 Turbo
    {
        modelName: 'gpt-3.5-turbo',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 0.50,       // $0.50 per 1M tokens
        outputUsdPricePerMillionTokens: 1.50,     // $1.50 per 1M tokens
        cachedInputUsdPricePerMillionTokens: null,
        description: 'GPT-3.5 Turbo - Standard tier',
    },

    // Embeddings
    {
        modelName: 'text-embedding-3-small',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 0.02,        // $0.02 per 1M tokens
        outputUsdPricePerMillionTokens: 0.00,       // No output tokens for embeddings
        cachedInputUsdPricePerMillionTokens: null,
        description: 'Text Embedding 3 Small',
    },
    {
        modelName: 'text-embedding-3-large',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdPricePerMillionTokens: 0.13,       // $0.13 per 1M tokens
        outputUsdPricePerMillionTokens: 0.00,       // No output tokens for embeddings
        cachedInputUsdPricePerMillionTokens: null,
        description: 'Text Embedding 3 Large',
    },
];

async function seedPricing() {
    console.log('🌱 Seeding LLM model pricing data (USD)...\n');

    let created = 0;
    let skipped = 0;

    for (const pricing of PRICING_DATA) {
        try {
            // Check if pricing already exists
            const existing = await prisma.llmModelPricing.findFirst({
                where: {
                    modelName: pricing.modelName,
                    provider: pricing.provider,
                    pricingTier: pricing.pricingTier,
                    isLatest: true,
                },
            });

            if (existing) {
                console.log(`⏭️  Skipped: ${pricing.modelName} (${pricing.pricingTier}) - already exists`);
                skipped++;
                continue;
            }

            // Create pricing entry
            await prisma.llmModelPricing.create({
                data: {
                    modelName: pricing.modelName,
                    provider: pricing.provider,
                    pricingTier: pricing.pricingTier,
                    inputUsdPricePerMillionTokens: pricing.inputUsdPricePerMillionTokens,
                    outputUsdPricePerMillionTokens: pricing.outputUsdPricePerMillionTokens,
                    cachedInputUsdPricePerMillionTokens: pricing.cachedInputUsdPricePerMillionTokens,
                    description: pricing.description,
                    isActive: true,
                    isLatest: true,
                    effectiveFrom: new Date(),
                },
            });

            console.log(`✅ Created: ${pricing.modelName} (${pricing.pricingTier})`);
            console.log(`   Input: $${pricing.inputUsdPricePerMillionTokens}/1M tokens`);
            created++;
        } catch (error) {
            console.error(`❌ Error creating pricing for ${pricing.modelName}:`, error.message);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${PRICING_DATA.length}`);
    console.log('\n✨ Pricing data seeded successfully!\n');
}

async function main() {
    try {
        await seedPricing();
    } catch (error) {
        console.error('❌ Error seeding pricing:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
