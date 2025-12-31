// Test Environment Variables
// This script checks if all required environment variables are properly set

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('=== Environment Variables Test ===\n');

const tests = {
    required: [
        { name: 'PORT', value: process.env.PORT },
        { name: 'NODE_ENV', value: process.env.NODE_ENV },
        { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
        { name: 'JWT_ACCESS_SECRET', value: process.env.JWT_ACCESS_SECRET },
        { name: 'JWT_REFRESH_SECRET', value: process.env.JWT_REFRESH_SECRET },
        { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY },
    ],
    optional: [
        { name: 'SMTP_USER', value: process.env.SMTP_USER },
        { name: 'SMTP_PASSWORD', value: process.env.SMTP_PASSWORD },
        { name: 'SEMANTIC_SCHOLAR_API_KEY', value: process.env.SEMANTIC_SCHOLAR_API_KEY },
    ],
};

let allPassed = true;

// Check required variables
console.log('Required Variables:');
console.log('-------------------');
tests.required.forEach(test => {
    const isSet = test.value && test.value.trim() !== '';
    const status = isSet ? '✓' : '✗';
    const color = isSet ? '' : '';

    if (!isSet) allPassed = false;

    // Show partial value for sensitive data
    let displayValue = '';
    if (isSet) {
        if (test.name.includes('SECRET') || test.name.includes('PASSWORD') || test.name.includes('KEY')) {
            displayValue = `${test.value.substring(0, 10)}...`;
        } else if (test.name === 'DATABASE_URL') {
            displayValue = test.value.substring(0, 30) + '...';
        } else {
            displayValue = test.value;
        }
    } else {
        displayValue = '❌ NOT SET';
    }

    console.log(`${status} ${test.name}: ${displayValue}`);
});

console.log('\nOptional Variables:');
console.log('-------------------');
tests.optional.forEach(test => {
    const isSet = test.value && test.value.trim() !== '';
    const status = isSet ? '✓' : '⚠';

    let displayValue = '';
    if (isSet) {
        if (test.name.includes('PASSWORD') || test.name.includes('KEY')) {
            displayValue = `${test.value.substring(0, 10)}...`;
        } else {
            displayValue = test.value;
        }
    } else {
        displayValue = 'Not set (optional)';
    }

    console.log(`${status} ${test.name}: ${displayValue}`);
});

// Validate JWT secrets
console.log('\nJWT Secret Validation:');
console.log('----------------------');

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (accessSecret && accessSecret.length >= 32) {
    console.log(`✓ JWT_ACCESS_SECRET length: ${accessSecret.length} (good)`);
} else {
    console.log(`✗ JWT_ACCESS_SECRET length: ${accessSecret?.length || 0} (should be at least 32)`);
    allPassed = false;
}

if (refreshSecret && refreshSecret.length >= 32) {
    console.log(`✓ JWT_REFRESH_SECRET length: ${refreshSecret.length} (good)`);
} else {
    console.log(`✗ JWT_REFRESH_SECRET length: ${refreshSecret?.length || 0} (should be at least 32)`);
    allPassed = false;
}

if (accessSecret && refreshSecret && accessSecret === refreshSecret) {
    console.log('✗ JWT secrets are the same (they should be different!)');
    allPassed = false;
} else if (accessSecret && refreshSecret) {
    console.log('✓ JWT secrets are different (good)');
}

// Validate OpenAI API key
console.log('\nOpenAI API Key Validation:');
console.log('--------------------------');

const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey && openaiKey.startsWith('sk-')) {
    console.log('✓ OpenAI API key format looks correct');
} else if (openaiKey) {
    console.log('⚠ OpenAI API key doesn\'t start with "sk-" (might be invalid)');
} else {
    console.log('✗ OpenAI API key not set');
    allPassed = false;
}

// Validate Database URL
console.log('\nDatabase URL Validation:');
console.log('------------------------');

const dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('postgresql://')) {
    console.log('✓ Database URL format looks correct (PostgreSQL)');

    // Check if it's the Render database
    if (dbUrl.includes('render.com')) {
        console.log('✓ Using Render PostgreSQL database');
    }
} else if (dbUrl) {
    console.log('⚠ Database URL doesn\'t start with "postgresql://"');
} else {
    console.log('✗ Database URL not set');
    allPassed = false;
}

// Final result
console.log('\n=== Test Result ===');
if (allPassed) {
    console.log('✓ All required environment variables are properly configured! 🎉');
    console.log('\nYou can now proceed with:');
    console.log('1. npm install prisma @prisma/client');
    console.log('2. npx prisma generate');
    console.log('3. npx prisma migrate dev --name init');
    process.exit(0);
} else {
    console.log('✗ Some required environment variables are missing or invalid');
    console.log('\nPlease check your .env file and fix the issues above.');
    process.exit(1);
}
