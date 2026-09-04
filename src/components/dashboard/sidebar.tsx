"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Users } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Beranda", icon: Home, exact: true },
    { href: "/dashboard/laporan", label: "Laporan Harian", icon: FileText, exact: false },
];

const adminNavItems = [
    { href: "/dashboard/admin/mahasiswa", label: "Data Mahasiswa", icon: Users, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({ role }: { role?: string | null }) {
    const pathname = usePathname();

    return (
        <aside className="hidden flex-col border-r bg-white md:flex h-screen sticky top-0">
            {/* Logo */}
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>SiPekal</span>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-auto py-3">
                <nav className="grid items-start px-3 text-sm font-medium lg:px-4 gap-1">

                    {navItems.map((item) => {
                        const active = isActive(pathname, item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ${
                                    active
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                                <span>{item.label}</span>
                                {active && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Area Admin - Hanya Tampil Jika Role Admin */}
                    {role === "admin" && (
                        <>
                            <div className="mt-5 mb-2 px-3 text-[11px] font-semibold uppercase text-slate-400 tracking-widest">
                                Area Admin
                            </div>
                            {adminNavItems.map((item) => {
                                const active = isActive(pathname, item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 ${
                                            active
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                                        <span>{item.label}</span>
                                        {active && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                                        )}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>
            </div>
        </aside>
    );
}