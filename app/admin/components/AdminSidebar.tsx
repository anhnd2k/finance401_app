// 'use client';

// import Link from 'next/link';
// import {
//     usePathname,
//     useRouter,
// } from 'next/navigation';
// import {
//     LayoutDashboard,
//     FileText,
//     Users,
//     LogOut,
//     ExternalLink,
//     Info,
// } from 'lucide-react';

// const navItems = [
//     {
//         label: 'Dashboard',
//         href: '/admin',
//         icon: LayoutDashboard,
//     },
//     {
//         label: 'Posts',
//         href: '/admin/posts',
//         icon: FileText,
//     },
//     {
//         label: 'About',
//         href: '/admin/about',
//         icon: Info,
//     },
//     {
//         label: 'Users',
//         href: '/admin/users',
//         icon: Users,
//     },
// ];

// export default function AdminSidebar({
//     username,
//     role,
// }: {
//     username: string;
//     role: string;
// }) {
//     const pathname = usePathname();
//     const router = useRouter();

//     async function handleLogout() {
//         await fetch('/api/auth/logout', {
//             method: 'POST',
//         });
//         router.push('/admin/login');
//         router.refresh();
//     }

//     return (
//         <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
//             {/* Brand */}
//             <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
//                 <Link
//                     href="/"
//                     className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"
//                 >
//                     <span className="text-lg">
//                         Finance401
//                     </span>
//                     <ExternalLink className="h-3 w-3 text-gray-400" />
//                 </Link>
//                 <p className="mt-0.5 text-xs text-gray-400">
//                     Admin Panelll
//                 </p>
//             </div>

//             {/* Nav */}
//             <nav className="flex-1 px-3 py-4">
//                 {navItems.map((item) => {
//                     const active =
//                         item.href === '/admin'
//                             ? pathname ===
//                               '/admin'
//                             : pathname.startsWith(
//                                   item.href
//                               );
//                     const Icon = item.icon;
//                     return (
//                         <Link
//                             key={item.href}
//                             href={item.href}
//                             className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
//                                 active
//                                     ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
//                                     : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
//                             }`}
//                         >
//                             <Icon className="h-4 w-4" />
//                             {item.label}
//                         </Link>
//                     );
//                 })}
//             </nav>

//             {/* Footer */}
//             <div className="border-t border-gray-200 p-4 dark:border-gray-800">
//                 <div className="mb-3 flex items-center gap-2">
//                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
//                         {username[0]?.toUpperCase()}
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {username}
//                         </p>
//                         <p className="text-xs capitalize text-gray-400">
//                             {role.toLowerCase()}
//                         </p>
//                     </div>
//                 </div>
//                 <button
//                     onClick={handleLogout}
//                     className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
//                 >
//                     <LogOut className="h-4 w-4" />
//                     Sign out
//                 </button>
//             </div>
//         </aside>
//     );
// }
