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
        inputUsdCentsPerMillionTokens: 250,      // $2.50 per 1M tokens
        outputUsdCentsPerMillionTokens: 1000,    // $10.00 per 1M tokens
        cachedInputUsdCentsPerMillionTokens: 125, // $1.25 per 1M tokens (50% off)
        description: 'GPT-4o - Standard tier with prompt caching',
    },
    {
        modelName: 'gpt-4o',
        provider: 'openai',
        pricingTier: 'batch',
        inputUsdCentsPerMillionTokens: 125,      // $1.25 per 1M tokens (50% off)
        outputUsdCentsPerMillionTokens: 500,     // $5.00 per 1M tokens (50% off)
        cachedInputUsdCentsPerMillionTokens: 63,  // $0.63 per 1M tokens
        description: 'GPT-4o - Batch tier (50% discount)',
    },
    {
        modelName: 'gpt-4o-mini',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 2.5,      // $0.025 per 1M tokens
        outputUsdCentsPerMillionTokens: 25,      // $0.25 per 1M tokens
        cachedInputUsdCentsPerMillionTokens: 1.25, // $0.0125 per 1M tokens (50% off)
        description: 'GPT-4o-mini - Standard tier with prompt caching',
    },
    {
        modelName: 'gpt-4o-mini',
        provider: 'openai',
        pricingTier: 'batch',
        inputUsdCentsPerMillionTokens: 1.25,     // $0.0125 per 1M tokens (50% off)
        outputUsdCentsPerMillionTokens: 12.5,    // $0.125 per 1M tokens (50% off)
        cachedInputUsdCentsPerMillionTokens: 0.625, // $0.00625 per 1M tokens
        description: 'GPT-4o-mini - Batch tier (50% discount)',
    },

    // GPT-4 Turbo Models
    {
        modelName: 'gpt-4-turbo',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 1000,     // $10.00 per 1M tokens
        outputUsdCentsPerMillionTokens: 3000,    // $30.00 per 1M tokens
        cachedInputUsdCentsPerMillionTokens: null,
        description: 'GPT-4 Turbo - Standard tier',
    },
    {
        modelName: 'gpt-4-turbo-preview',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 1000,     // $10.00 per 1M tokens
        outputUsdCentsPerMillionTokens: 3000,    // $30.00 per 1M tokens
        cachedInputUsdCentsPerMillionTokens: null,
        description: 'GPT-4 Turbo Preview - Standard tier',
    },

    // GPT-3.5 Turbo
    {
        modelName: 'gpt-3.5-turbo',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 50,       // $0.50 per 1M tokens
        outputUsdCentsPerMillionTokens: 150,     // $1.50 per 1M tokens
        cachedInputUsdCentsPerMillionTokens: null,
        description: 'GPT-3.5 Turbo - Standard tier',
    },

    // Embeddings
    {
        modelName: 'text-embedding-3-small',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 2,        // $0.02 per 1M tokens
        outputUsdCentsPerMillionTokens: 0,       // No output tokens for embeddings
        cachedInputUsdCentsPerMillionTokens: null,
        description: 'Text Embedding 3 Small',
    },
    {
        modelName: 'text-embedding-3-large',
        provider: 'openai',
        pricingTier: 'standard',
        inputUsdCentsPerMillionTokens: 13,       // $0.13 per 1M tokens
        outputUsdCentsPerMillionTokens: 0,       // No output tokens for embeddings
        cachedInputUsdCentsPerMillionTokens: null,
        description: 'Text Embedding 3 Large',
    },
];

async function seedPricing() {
    console.log('🌱 Seeding LLM model pricing data...\n');

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
                    inputUsdCentsPerMillionTokens: pricing.inputUsdCentsPerMillionTokens,
                    outputUsdCentsPerMillionTokens: pricing.outputUsdCentsPerMillionTokens,
                    cachedInputUsdCentsPerMillionTokens: pricing.cachedInputUsdCentsPerMillionTokens,
                    description: pricing.description,
                    isActive: true,
                    isLatest: true,
                    effectiveFrom: new Date(),
                },
            });

            console.log(`✅ Created: ${pricing.modelName} (${pricing.pricingTier})`);
            console.log(`   Input: $${(pricing.inputUsdCentsPerMillionTokens / 100).toFixed(2)}/1M tokens`);
            console.log(`   Output: $${(pricing.outputUsdCentsPerMillionTokens / 100).toFixed(2)}/1M tokens`);
            if (pricing.cachedInputUsdCentsPerMillionTokens) {
                console.log(`   Cached: $${(pricing.cachedInputUsdCentsPerMillionTokens / 100).toFixed(2)}/1M tokens`);
            }
            console.log();
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
