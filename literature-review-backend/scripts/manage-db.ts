import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Define the order of tables to respect foreign key constraints during restore
const TABLES = [
    // Standalone tables (Configuration)
    'creditsMultiplierHistory',
    'defaultCreditsHistory',
    'llmModelPricing',

    // Core User tables
    'user',
    'refreshToken',
    'emailVerificationToken',
    'passwordResetToken',

    // User Data
    'userProject',
    'candidatePaper',
    'llmUsageLog',
    'userCreditsTransaction'
];

const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-');
};

const backup = async () => {
    try {
        const timestamp = getTimestamp();
        const filename = `backup-${timestamp}.json`;
        const filepath = path.join(BACKUP_DIR, filename);

        console.log('Starting dictionary backup...');
        const data: Record<string, any[]> = {};

        for (const table of TABLES) {
            console.log(`Backing up ${table}...`);
            // @ts-ignore - Dynamic access to prisma models
            data[table] = await prisma[table].findMany();
        }

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Backup successful! Saved to: ${filepath}`);

    } catch (error: any) {
        console.error(`❌ Backup failed: ${error.message}`);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

const restore = async (fileArg: string) => {
    if (!fileArg) {
        console.error('Error: Please specify the backup file to restore.');
        console.log('Usage: npm run db:restore <path/to/backup.json>');
        process.exit(1);
    }

    const filepath = path.resolve(fileArg);

    if (!fs.existsSync(filepath)) {
        console.error(`Error: File not found: ${filepath}`);
        process.exit(1);
    }

    try {
        console.warn(`⚠️  WARNING: This will overwrite data in the database.`);
        console.log(`Restoring from: ${filepath}...`);

        const rawData = fs.readFileSync(filepath, 'utf-8');
        const data = JSON.parse(rawData);

        // Transactional restore
        await prisma.$transaction(async (tx) => {
            // 1. Clear existing data (Reverse order to respect FKs)
            for (let i = TABLES.length - 1; i >= 0; i--) {
                const table = TABLES[i];
                console.log(`Clearing table: ${table}`);
                // @ts-ignore
                await tx[table].deleteMany();
            }

            // 2. Insert new data (Forward order)
            for (const table of TABLES) {
                if (data[table] && data[table].length > 0) {
                    console.log(`Restoring ${table} (${data[table].length} records)...`);
                    // @ts-ignore
                    await tx[table].createMany({
                        data: data[table],
                        skipDuplicates: true
                    });
                }
            }
        });

        console.log(`✅ Restore successful!`);

    } catch (error: any) {
        console.error(`❌ Restore failed: ${error.message}`);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

const listBackups = () => {
    console.log(`Backups in ${BACKUP_DIR}:`);
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.log('(No backups found)');
        return;
    }
    files.forEach(file => console.log(` - ${file}`));
};

const main = () => {
    const args = process.argv.slice(2);
    const action = args[0];
    const file = args[1];

    if (!action) {
        console.log('Usage: tsx scripts/manage-db.ts <backup|restore|list> [file]');
        return;
    }

    switch (action) {
        case 'backup':
            backup();
            break;
        case 'restore':
            restore(file);
            break;
        case 'list':
            listBackups();
            break;
        default:
            console.log(`Unknown action: ${action}`);
            console.log('Usage: tsx scripts/manage-db.ts <backup|restore|list> [file]');
    }
};

main();
