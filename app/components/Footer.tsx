export default function Footer() {
    return (
        <footer className="mt-auto border-t">
            <div className="container mx-auto px-4 py-12">
                {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"> */}
                {/* Explore Section */}

                {/* Social Links Section */}
                {/* <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Follow Finance401
                        </h3>
                        <div className="mb-8 flex flex-wrap gap-3">
                            {socialLinks.map(
                                (social) => (
                                    <a
                                        key={
                                            social.name
                                        }
                                        href={
                                            social.href
                                        }
                                        className="rounded-lg bg-gray-200 p-2 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                                        aria-label={
                                            social.name
                                        }
                                    >
                                        <social.icon className="h-5 w-5" />
                                    </a>
                                )
                            )}
                        </div>
                    </div> */}
                {/* </div> */}

                {/* Copyright */}
                <div className="mt-5 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © runtocoast 2026
                    </p>
                </div>
            </div>
        </footer>
    );
}
