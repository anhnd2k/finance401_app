import PostForm from '../PostForm';

export default function NewPostPage() {
    return (
        <div className="p-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                New Post
            </h1>
            <PostForm />
        </div>
    );
}
