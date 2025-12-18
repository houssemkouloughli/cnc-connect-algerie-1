// Quick script to check Supabase tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvmnfweammcentqnzage.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 Vérification des tables Supabase...\n');

    const tables = [
        'profiles',
        'partners',
        'quotes',
        'bids',
        'orders',
        'messages',
        'design_service_requests',
        'payments',
        'invoices',
        'shipping_rates',
        'file_access_logs'
    ];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table}: N'existe pas - ${error.message}`);
            } else {
                console.log(`✅ ${table}: Existe (${count || 0} lignes)`);
            }
        } catch (e) {
            console.log(`❌ ${table}: Erreur - ${e.message}`);
        }
    }
}

checkTables();
