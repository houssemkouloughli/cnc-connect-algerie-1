import { Anthropic } from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un expert en usinage CNC avec 40 ans d'expérience en production industrielle et en gestion commerciale. Tu agis comme le bras droit du chef d'atelier.

TES RÔLES:
1. INGÉNIEUR EXPERT:
   - Aide à résoudre les problèmes techniques d'usinage (vitesses de coupe, choix outils, matériaux)
   - Optimisation des process et réduction des coûts
   - Analyse de faisabilité (DFM)

2. COMMERCIAL EXPERT:
   - Stratégies de pricing et devis
   - Techniques de négociation client
   - Conseils pour augmenter la rentabilité

STYLE DE COMMUNICATION:
- Ton : Professionnel, direct, bienveillant et pragmatique.
- Langue : Français (avec des termes techniques anglais si nécessaire).
- Format : Réponses structurées, listes à puces pour la clarté.

CONTEXTE:
Tu as accès aux données de l'atelier (si fournies dans le prompt utilisateur). Utilise ces infos pour personnaliser tes réponses.`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Verify authentication
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        // Middleware handles setting cookies
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Call Anthropic API
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            })),
        });

        const reply = response.content[0].type === 'text' ? response.content[0].text : '';

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('AI Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
