import { prisma } from '@/lib/prisma';
import { getLocale } from '@/lib/locale.server';
import { BookOpen, Target, Lightbulb, TrendingUp } from 'lucide-react';

export default async function AboutPage() {
    const userLang = await getLocale();
    const page = await prisma.sitePage.findUnique({
        where: { key_language: { key: 'about', language: userLang } },
    });

    if (page?.content) {
        return (
            <div className="min-h-screen bg-gray-50 py-16 dark:bg-gray-900/30">
                <div className="container mx-auto max-w-3xl px-4">
                    <div
                        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </div>
        );
    }

    // Static fallback (shown when no DB content has been saved yet)
    return (
        <div className="min-h-screen bg-gray-50 py-16 dark:bg-gray-900/30">
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                        About Finance401
                    </h1>
                    <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        A personal journal where I document everything I learn
                        about finance — from first principles to advanced
                        concepts.
                    </p>
                </div>

                <div className="mb-12 border-t border-gray-200 dark:border-gray-800" />

                <section className="mb-12">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        The Story
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p>
                            Finance401 started as a simple collection of notes.
                            Every time I read a book, finished a course, or
                            learned something new about money and markets, I
                            wrote it down. Over time, those notes grew into
                            articles — and those articles became this blog.
                        </p>
                        <p>
                            The name &ldquo;401&rdquo; is a nod to going beyond
                            the basics. It&apos;s not Finance 101 — the
                            surface-level stuff everyone already knows. This is
                            where the deeper questions live: how markets really
                            work, how wealth compounds, how risk should be
                            understood and managed.
                        </p>
                        <p>
                            Every post here is something I genuinely studied,
                            questioned, and wanted to remember. If it helps you
                            too, that&apos;s a bonus.
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                        What You&apos;ll Find Here
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            { icon: TrendingUp, title: 'Investing', desc: 'Stocks, ETFs, bonds, and portfolio construction — from fundamentals to strategy.' },
                            { icon: Lightbulb, title: 'Financial Concepts', desc: 'Clear explanations of the ideas that actually matter: valuation, risk, compounding.' },
                            { icon: BookOpen, title: 'Book Notes', desc: 'Distilled takeaways from the best finance and economics books.' },
                            { icon: Target, title: 'Personal Finance', desc: 'Budgeting, saving, and building long-term financial independence.' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-900/40 dark:bg-blue-900/20">
                    <p className="text-gray-700 dark:text-gray-300">
                        This blog is a work in progress — just like my understanding of finance. I write to think clearly, and I publish to stay honest.
                    </p>
                    <p className="mt-3 font-medium text-blue-700 dark:text-blue-400">Thanks for reading.</p>
                </section>
            </div>
        </div>
    );
}
