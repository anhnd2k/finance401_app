import AboutEditor from './AboutEditor';

export default function AdminAboutPage() {
    return (
        <div className="p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Page</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Edit the public About page content for each language.
                </p>
            </div>
            <AboutEditor />
        </div>
    );
}
