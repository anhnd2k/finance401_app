const darkModeScript = `
(function(){
  try {
    var v = localStorage.getItem('adminDarkMode');
    if (v === 'true') document.documentElement.classList.add('dark');
    else if (v === 'false') document.documentElement.classList.remove('dark');
  } catch(e){}
})();
`;

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
                {children}
            </div>
        </>
    );
}
