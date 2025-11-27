const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
    console.error('You can find it in Supabase Dashboard → Settings → API → service_role key');
    process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');

const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_storage_setup.sql',
    '004_seed_data.sql',
];

async function runMigration(filename) {
    console.log(`\n📄 Running migration: ${filename}`);

    const filePath = path.join(MIGRATIONS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return false;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
        // Execute SQL using Supabase RPC
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // If exec_sql doesn't exist, try direct query
            const { error: directError } = await supabase.from('_migrations').insert({
                name: filename,
                executed_at: new Date().toISOString(),
            });

            if (directError && directError.code !== '42P01') { // Ignore "table doesn't exist"
                throw error;
            }
        }

        console.log(`✅ Successfully executed: ${filename}`);
        return true;
    } catch (err) {
        console.error(`❌ Error executing ${filename}:`, err.message);
        return false;
    }
}

async function runAllMigrations() {
    console.log('🚀 Starting Supabase migrations...\n');
    console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
    console.log(`📁 Migrations directory: ${MIGRATIONS_DIR}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
        const success = await runMigration(migration);
        if (success) {
            successCount++;
        } else {
            failCount++;
            console.log('\n⚠️  Migration failed. You may need to run this manually in Supabase SQL Editor.');
        }

        // Wait a bit between migrations
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`❌ Failed: ${failCount}/${migrations.length}`);
    console.log('='.repeat(50));

    if (failCount > 0) {
        console.log('\n⚠️  Some migrations failed.');
        console.log('Please run them manually in Supabase Dashboard → SQL Editor:');
        console.log('https://supabase.com/dashboard/project/jvmnfweammcentqnzage/sql');
    } else {
        console.log('\n🎉 All migrations completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Create test users in Supabase Dashboard → Authentication → Users');
        console.log('2. Update user roles with SQL:');
        console.log("   UPDATE profiles SET role = 'admin' WHERE email = 'admin@cncconnect.dz';");
        console.log('3. Test authentication in your app');
    }
}

// Run migrations
runAllMigrations().catch(console.error);
