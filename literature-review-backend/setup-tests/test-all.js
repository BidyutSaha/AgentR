// Test All Setup Scripts
// Runs all setup tests in sequence

const { execSync } = require('child_process');
const path = require('path');

console.log('=== Running All Setup Tests ===\n');

const tests = [
    { name: 'Environment Variables', file: 'test-env.js' },
    { name: 'Email Configuration', file: 'test-email.js' },
];

let allPassed = true;
const results = [];

tests.forEach((test, index) => {
    console.log(`\n[${index + 1}/${tests.length}] Running ${test.name} Test...`);
    console.log('='.repeat(60));

    try {
        const testPath = path.join(__dirname, test.file);
        execSync(`node "${testPath}"`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        results.push({ name: test.name, status: 'PASSED', icon: '✓' });
        console.log(`\n✓ ${test.name} Test PASSED\n`);
    } catch (error) {
        results.push({ name: test.name, status: 'FAILED', icon: '✗' });
        console.log(`\n✗ ${test.name} Test FAILED\n`);
        allPassed = false;
    }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('=== Test Summary ===\n');

results.forEach(result => {
    console.log(`${result.icon} ${result.name}: ${result.status}`);
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
    console.log('\n🎉 All tests PASSED! Your setup is complete!\n');
    console.log('Next steps:');
    console.log('1. Install Prisma: npm install prisma @prisma/client');
    console.log('2. Create Prisma schema');
    console.log('3. Run migrations: npx prisma migrate dev --name init');
    console.log('4. Start implementing authentication\n');
    process.exit(0);
} else {
    console.log('\n❌ Some tests FAILED. Please fix the issues and try again.\n');
    process.exit(1);
}
