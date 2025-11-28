'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function AuthUI() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Link href="/profile">Profile</Link>
            </Button>
            <Button
                onClick={handleSignOut}
                disabled={loading}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
            >
                {loading ? 'Signing out...' : 'Sign out'}
            </Button>
        </div>
    )
}
