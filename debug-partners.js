// Script de debug pour tester l'accès à la table partners
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPartnerAccess() {
    console.log('🔍 Test d\'accès à la table partners...\n');

    const { data, error } = await supabase
        .from('partners')
        .select('id, profile_id, company_name')
        .eq('profile_id', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
        .single();

    if (error) {
        console.error('❌ ERREUR:', error);
        console.log('\n💡 Solution: Exécutez enable-partners-access.sql dans Supabase');
        return;
    }

    if (!data) {
        console.log('⚠️  Aucun partenaire trouvé pour cet UUID');
        console.log('💡 Solution: Exécutez switch-to-partner.sql pour créer le profil');
        return;
    }

    console.log('✅ Partenaire trouvé:', data);
    console.log('\n🎉 L\'accès fonctionne ! Le problème vient d\'ailleurs.');
}

testPartnerAccess();
