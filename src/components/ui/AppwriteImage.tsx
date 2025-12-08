import { storage } from '@/lib/appwrite';
import { useState, useEffect } from 'react';

interface AppwriteImageProps {
    fileId: string;
    alt: string;
    className?: string;
}

export function AppwriteImage({ fileId, alt, className }: AppwriteImageProps) {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        if (fileId) {
            try {
                const url = storage.getFileView('products', fileId);
                setImageUrl(url.href);
            } catch (error) {
                console.error('Failed to get image view:', error);
            }
        }
    }, [fileId]);

    if (!imageUrl) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
                No Image
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={`object-cover w-full h-full ${className}`}
        />
    );
}
