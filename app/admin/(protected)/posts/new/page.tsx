import PostForm from '../PostForm';

interface Props {
    searchParams: Promise<{ tgid?: string; lang?: string }>;
}

export default async function NewPostPage({ searchParams }: Props) {
    const { tgid, lang } = await searchParams;
    const translationGroupId = tgid ? parseInt(tgid) : undefined;
    const language = lang === 'en' ? 'en' : lang === 'vi' ? 'vi' : undefined;

    const initialData =
        translationGroupId != null
            ? { translationGroupId, language }
            : undefined;

    return (
        <div className="p-4 md:p-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                New Post
            </h1>
            <PostForm initialData={initialData} />
        </div>
    );
}
