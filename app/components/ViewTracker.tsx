'use client';

import { useEffect } from 'react';

export default function ViewTracker({ postId }: { postId: number }) {
    useEffect(() => {
        fetch(`/api/posts/${postId}/view`, { method: 'POST' });
    }, [postId]);
    return null;
}
