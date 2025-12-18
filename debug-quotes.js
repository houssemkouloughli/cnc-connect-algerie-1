const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jvmnfweammcentqnzage.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugQuotes() {
    console.log('🔍 Debugging Quotes...\n');

    // 1. Check Profiles
    console.log('--- Checking Profiles ---');
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) console.error('Error fetching profiles:', profileError);
    else console.log(`Found ${profiles.length} profiles.`);

    // 2. Check Quotes
    console.log('\n--- Checking Quotes ---');
    const { data: quotes, error: quoteError } = await supabase
        .from('quotes')
        .select('*');

    if (quoteError) {
        console.error('Error fetching quotes:', quoteError);
    } else {
        console.log(`Found ${quotes.length} quotes.`);
        quotes.forEach(q => console.log(`- ${q.part_name} (${q.status})`));
    }

    // 3. Check Join
    console.log('\n--- Checking Join ---');
    const { data: joinData, error: joinError } = await supabase
        .from('quotes')
        .select('*, profiles(full_name)');

    if (joinError) console.error('Error fetching join:', joinError);
    else console.log('Join successful, count:', joinData.length);
}

debugQuotes();
