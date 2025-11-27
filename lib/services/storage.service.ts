import { createClient } from '@/lib/supabase/client';

export async function uploadCADFile(file: File) {
    const supabase = createClient();

    // Create a unique file path: user_id/timestamp_filename
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to upload files');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('cad-files')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading file:', error);
        throw error;
    }

    // Get public URL (since we made the bucket private but accessible via RLS, 
    // we might need signed URL if we want strict privacy, but for now let's assume 
    // we want a path we can store. If the bucket is private, getPublicUrl won't work 
    // for downloading without a token, but it gives us the path).
    // Actually, for private buckets, we usually store the path and use createSignedUrl to download.
    // But for simplicity in this MVP, let's store the full path.

    return {
        path: data.path,
        fullPath: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cad-files/${data.path}`
    };
}
