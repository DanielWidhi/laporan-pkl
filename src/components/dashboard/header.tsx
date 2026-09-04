"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    Menu, FileText, User, LogOut, ChevronDown, IdCard,
    Home, Users, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

export function Header({
    role,
    userName,
}: {
    role?: string | null;
    userName?: string | null;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Tutup dropdown profil saat klik di luar
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tutup dropdown profil saat tekan Escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsProfileOpen(false);
                setIsSheetOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Tutup sheet otomatis ketika route berubah (navigasi berhasil)
    useEffect(() => {
        setIsSheetOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        setIsProfileOpen(false);
        await supabase.auth.signOut();
        router.replace("/login");
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6 sticky top-0 z-20">

            {/* ====== MOBILE: Hamburger + Sheet Sidebar ====== */}
            <div className="flex items-center gap-3 md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        aria-label="Buka menu navigasi"
                    >
                        <Menu className="h-5 w-5" />
                    </SheetTrigger>

                    <SheetContent side="left" className="flex flex-col w-72 p-0 gap-0">
                        {/* Header Sheet */}
                        <div className="flex h-16 items-center justify-between border-b px-5">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 font-bold text-slate-900"
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>SiPekal</span>
                            </Link>
                            <button
                                onClick={() => setIsSheetOpen(false)}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                aria-label="Tutup menu"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Nav Links Sheet */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                            <p className="px-3 mb-3 text-[11px] font-semibold uppercase text-slate-400 tracking-widest">Menu Utama</p>

                            {navItems.map((item) => {
                                const active = isActive(pathname, item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            active
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                                        <span>{item.label}</span>
                                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
                                    </Link>
                                );
                            })}

                            {/* Area Admin */}
                            {role === "admin" && (
                                <>
                                    <p className="px-3 pt-4 mb-2 text-[11px] font-semibold uppercase text-slate-400 tracking-widest">
                                        Area Admin
                                    </p>
                                    {adminNavItems.map((item) => {
                                        const active = isActive(pathname, item.href, item.exact);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                                    active
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                }`}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                                                <span>{item.label}</span>
                                                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
                                            </Link>
                                        );
                                    })}
                                </>
                            )}
                        </nav>

                        {/* Footer Sheet: Info User + Logout */}
                        <div className="border-t p-4 space-y-2">
                            <button
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    router.push("/dashboard/profil");
                                }}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                                    {userName ? getInitials(userName) : <User className="h-4 w-4" />}
                                </div>
                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className="font-semibold text-slate-900 truncate leading-tight">{userName || "Pengguna"}</span>
                                    <span className="text-xs text-slate-500 truncate leading-tight">{role === "admin" ? "Admin & Mahasiswa" : "Mahasiswa"}</span>
                                </div>
                                <IdCard className="h-4 w-4 shrink-0 ml-auto text-slate-400" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                            >
                                <LogOut className="h-4 w-4 shrink-0" />
                                Keluar dari Akun
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Spacer tengah */}
            <div className="flex-1" />

            {/* ====== PROFIL DROPDOWN (Desktop & Mobile) ====== */}
            <div className="relative" ref={dropdownRef}>
                {/* Tombol Trigger */}
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 rounded-full p-1 pl-2 pr-3 hover:bg-slate-100 transition-colors duration-200 outline-none cursor-pointer"
                >
                    {/* Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs tracking-wider shadow-inner">
                        {userName ? getInitials(userName) : <User className="h-4 w-4 text-slate-500" />}
                    </div>

                    {/* Nama & Role — hanya tampil di xs ke atas */}
                    <div className="hidden xs:flex flex-col text-left max-w-[110px] sm:max-w-[160px]">
                        <span className="text-sm font-bold text-slate-900 leading-tight truncate">
                            {userName || "Pengguna PKL"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
                            {role === "admin" ? "Admin & Mahasiswa" : "Mahasiswa"}
                        </span>
                    </div>

                    {/* Ikon Panah */}
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ease-out ml-0.5 ${
                            isProfileOpen ? "rotate-180 text-slate-600" : ""
                        }`}
                    />
                </button>

                {/* Dropdown Menu */}
                <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl transition-all duration-200 ease-out origin-top-right z-50 ${
                        isProfileOpen
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                >
                    {/* Info User */}
                    <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {userName || "Akun PKL"}
                        </p>
                    </div>

                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsProfileOpen(false);
                                router.push("/dashboard/profil");
                            }}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer"
                        >
                            <IdCard className="h-4 w-4 text-slate-500" />
                            Profil PKL
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors duration-150 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4 text-red-500" />
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}