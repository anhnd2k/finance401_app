import { use } from 'react';

interface PostDetailProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PostDetail({ params }: PostDetailProps) {
    const { id } = use(params); // Unwrap the params Promise using React's `use`

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
            <h1 className="text-3xl font-bold text-black dark:text-white">
                Post Detail - {id}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                This is the detail page for post {id}.
            </p>
        </div>
    );
}