const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('\nMake sure .env.local contains:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=...');
    console.error('SUPABASE_SERVICE_ROLE_KEY=...');
    process.exit(1);
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_storage_setup.sql',
    '004_seed_data.sql',
];

function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

        const postData = JSON.stringify({ sql });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
        };

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, data });
                } else {
                    resolve({ success: false, error: data, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runMigrationDirect(filename) {
    console.log(`\n📄 Running: ${filename}`);

    const filePath = path.join(MIGRATIONS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return false;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`   File size: ${sql.length} bytes`);
    console.log(`   Executing SQL...`);

    try {
        const result = await executeSQL(sql);

        if (result.success) {
            console.log(`✅ Success: ${filename}`);
            return true;
        } else {
            console.error(`❌ Failed: ${filename}`);
            console.error(`   Status: ${result.statusCode}`);
            console.error(`   Error: ${result.error}`);

            // Check if it's a "function doesn't exist" error
            if (result.error && result.error.includes('exec_sql')) {
                console.log('\n⚠️  The exec_sql function does not exist.');
                console.log('   You need to run migrations manually in Supabase SQL Editor.');
                console.log(`   URL: https://supabase.com/dashboard/project/${SUPABASE_URL.split('.')[0].split('//')[1]}/sql`);
            }

            return false;
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        return false;
    }
}

async function runAllMigrations() {
    console.log('🚀 Supabase Migration Runner\n');
    console.log(`📍 URL: ${SUPABASE_URL}`);
    console.log(`📁 Migrations: ${MIGRATIONS_DIR}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
        const success = await runMigrationDirect(migration);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`❌ Failed: ${failCount}/${migrations.length}`);
    console.log('='.repeat(60));

    if (failCount > 0) {
        console.log('\n⚠️  Some migrations failed.');
        console.log('\n📋 Manual Steps Required:');
        console.log('1. Go to: https://supabase.com/dashboard/project/jvmnfweammcentqnzage/sql');
        console.log('2. Open each migration file from supabase/migrations/');
        console.log('3. Copy the SQL content');
        console.log('4. Paste into SQL Editor and click "Run"');
        console.log('\nMigrations to run manually:');
        migrations.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m}`);
        });
    } else {
        console.log('\n🎉 All migrations completed!');
        printNextSteps();
    }
}

function printNextSteps() {
    console.log('\n📋 Next Steps:\n');
    console.log('1. Create test users in Supabase Dashboard:');
    console.log('   → Authentication → Users → Add User');
    console.log('   - admin@cncconnect.dz');
    console.log('   - partner@example.com');
    console.log('   - client@example.com');
    console.log('');
    console.log('2. Update user roles (run in SQL Editor):');
    console.log("   UPDATE profiles SET role = 'admin', full_name = 'Admin'");
    console.log("   WHERE email = 'admin@cncconnect.dz';");
    console.log('');
    console.log("   UPDATE profiles SET role = 'partner', full_name = 'Test Partner'");
    console.log("   WHERE email = 'partner@example.com';");
    console.log('');
    console.log('3. Test login at: http://localhost:3000/login');
}

runAllMigrations().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
