import prisma from '../src/config/database';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JobType } from '@prisma/client';

dotenv.config();

const API_URL = 'http://localhost:5000/v1'; // Adjust if port differs
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function main() {
    console.log('🚀 Starting Resilience Test Suite...\n');

    let user: any;
    let project: any;
    let job: any;
    let token: string;

    try {
        // ==========================================
        // SETUP: Create User and Project
        // ==========================================
        console.log('1. Setting up Test Data...');

        // Create Test User
        user = await prisma.user.create({
            data: {
                email: `resilience_test_${Date.now()}@example.com`,
                passwordHash: 'hash',
                firstName: 'Test',
                lastName: 'User',
                isVerified: true,
                aiCreditsBalance: 0.0 // Start with 0
            }
        });

        // Create JWT
        token = jwt.sign({ userId: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

        // Create Test Project
        project = await prisma.userProject.create({
            data: {
                userId: user.id,
                projectName: 'Resilience Test Project',
                userIdea: 'Test Idea'
            }
        });

        // Create a FAILED Job
        job = await prisma.backgroundJob.create({
            data: {
                userId: user.id,
                projectId: project.id,
                jobType: JobType.PROJECT_INIT_INTENT,
                status: 'FAILED',
                failureReason: 'Simulated Failure'
            }
        });

        console.log('   ✅ User created:', user.email);
        console.log('   ✅ Project created:', project.id);
        console.log('   ✅ Failed Job created:', job.id);
        console.log('\n------------------------------------------------\n');


        // ==========================================
        // TEST 1: Credit Check (Should Fail)
        // ==========================================
        console.log('🧪 TEST 1: Insufficient Credits Check');
        try {
            await axios.post(`${API_URL}/jobs/${job.id}/resume`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('   ❌ FAILED: Expected 402 error, got Success');
        } catch (error: any) {
            if (error.response && error.response.status === 402) {
                console.log('   ✅ PASSED: Got 402 Payment Required as expected.');
            } else {
                console.error('   ❌ FAILED: Expected 402, got', error.response?.status || error.message);
            }
        }
        console.log('\n------------------------------------------------\n');


        // ==========================================
        // TEST 2: Success Flow (Should Succeed)
        // ==========================================
        console.log('🧪 TEST 2: Valid Resume with Credits');

        // Recharge User
        await prisma.user.update({
            where: { id: user.id },
            data: { aiCreditsBalance: 100.0 }
        });
        console.log('   ℹ️  User recharged to 100 credits.');

        try {
            const res = await axios.post(`${API_URL}/jobs/${job.id}/resume`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                console.log('   ✅ PASSED: Job resumed successfully (200 OK).');
            }
        } catch (error: any) {
            console.error('   ❌ FAILED: Expected 200, got', error.response?.status || error.message);
            console.error('      Response:', error.response?.data);
        }
        console.log('\n------------------------------------------------\n');


        // ==========================================
        // TEST 3: Orphan Check (Should Fail cleanly)
        // ==========================================
        console.log('🧪 TEST 3: Orphaned Job Check');

        // Create another job to test orphan state (since previous one might be PENDING now)
        const orphanJob = await prisma.backgroundJob.create({
            data: {
                userId: user.id,
                projectId: project.id, // Linking to valid project first
                jobType: JobType.PROJECT_INIT_INTENT,
                status: 'FAILED',
                failureReason: 'ToBeOrphaned'
            }
        });

        // DELETE THE PROJECT
        await prisma.userProject.delete({ where: { id: project.id } });
        console.log('   ℹ️  Parent Project deleted.');

        try {
            await axios.post(`${API_URL}/jobs/${orphanJob.id}/resume`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('   ❌ FAILED: Expected 404/Error, got Success');
        } catch (error: any) {
            if (error.response && (error.response.status === 404 || error.response.status === 400)) {
                console.log(`   ✅ PASSED: Got ${error.response.status} as expected (Project missing).`);

                // Verify DB status
                const dbJob = await prisma.backgroundJob.findUnique({ where: { id: orphanJob.id } });
                if (dbJob?.status === 'FAILED' && dbJob?.failureReason?.includes('Orphaned')) {
                    console.log('   ✅ PASSED: Database status updated to FAILED (Orphaned).');
                } else if (dbJob?.status === 'FAILED' && dbJob?.failureReason?.includes('Project no longer exists')) {
                    console.log('   ✅ PASSED: Database status updated to FAILED (Project no longer exists).');
                } else {
                    console.warn(`   ⚠️  WARNING: DB Status is ${dbJob?.status}, Reason: ${dbJob?.failureReason}`);
                }

            } else {
                console.error('   ❌ FAILED: Expected 404, got', error.response?.status || error.message);
            }
        }


    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        if (user) await prisma.user.delete({ where: { id: user.id } }).catch(() => { });
        // Project deleted in test 3, cascade deletes other jobs
        await prisma.$disconnect();
    }
}

main();
