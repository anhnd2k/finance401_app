export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <h2>About Sidebar</h2>
            <div>{children}</div>
        </div>
    );
}
