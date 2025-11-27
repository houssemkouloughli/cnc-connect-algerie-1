"use client";

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h1 className="text-2xl font-bold text-slate-900">Authentification en cours...</h1>
                <p className="text-slate-500 mt-2">Veuillez patienter pendant que nous vous connectons.</p>
            </div>
        </div>
    );
}
