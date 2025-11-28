export function getUserFriendlyError(error: any): string {
    const errorMessage = error?.message || String(error);

    // Mapping erreurs techniques -> messages conviviaux
    const errorMap: Record<string, string> = {
        'foreign key constraint': 'Vous devez être connecté pour effectuer cette action.',
        'duplicate key': 'Cet élément existe déjà.',
        'not found': 'Élément introuvable.',
        'unauthorized': 'Vous n\'avez pas l\'autorisation nécessaire.',
        'network error': 'Problème de connexion. Vérifiez votre internet.',
        'fetch failed': 'Impossible de joindre le serveur. Vérifiez votre connexion.',
        'invalid input': 'Certaines informations sont invalides.',
        'violates row-level security policy': 'Accès refusé par sécurité.',
    };

    for (const [tech, friendly] of Object.entries(errorMap)) {
        if (errorMessage.toLowerCase().includes(tech.toLowerCase())) {
            return friendly;
        }
    }

    // Si c'est une erreur Supabase standard avec un message clair, on l'utilise
    if (error?.code && error?.message && !errorMessage.includes('JSON')) {
        return error.message;
    }

    return 'Une erreur inattendue est survenue. Veuillez réessayer.';
}
