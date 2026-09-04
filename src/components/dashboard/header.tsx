"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Menu, FileText, User, LogOut, ChevronDown, IdCard } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header({
    role,
    userName,
}: {
    role?: string | null;
    userName?: string | null;
}) {
    const router = useRouter();
    const supabase = createClient();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Menutup dropdown secara otomatis jika klik di luar area
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Menutup dropdown jika menekan tombol Escape di keyboard
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLogout = async () => {
        setIsOpen(false);
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
            {/* Menu Mobile */}
            <div className="flex items-center gap-3">
                <Sheet>
                    <SheetTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground md:hidden shrink-0">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col">
                        <nav className="grid gap-4 text-lg font-medium mt-6">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-lg font-semibold mb-4"
                            >
                                <FileText className="h-6 w-6 text-blue-600" />
                                <span>SiPekal (PKL)</span>
                            </Link>
                            <Link href="/dashboard" className="hover:text-slate-900">
                                Beranda
                            </Link>
                            <Link
                                href="/dashboard/laporan"
                                className="text-slate-500 hover:text-slate-900"
                            >
                                Laporan Harian
                            </Link>

                            {role === "admin" && (
                                <>
                                    <div className="mt-4 mb-2 text-xs font-semibold uppercase text-slate-400">
                                        Area Admin
                                    </div>
                                    <Link
                                        href="/dashboard/admin/mahasiswa"
                                        className="text-slate-500 hover:text-slate-900"
                                    >
                                        Data Mahasiswa
                                    </Link>
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="w-full flex-1" />

            {/* Profil Dropdown dengan Transisi Halus (Smooth Transition) */}
            <div className="relative" ref={dropdownRef}>
                {/* Tombol Profil Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 rounded-full p-1 pl-2 pr-3 hover:bg-slate-100 transition-colors duration-200 outline-none cursor-pointer"
                >
                    {/* Avatar Lingkaran Inisial */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs tracking-wider shadow-inner">
                        {userName ? getInitials(userName) : <User className="h-4 w-4 text-slate-500" />}
                    </div>

                    {/* Nama & Role */}
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-slate-900 leading-tight">
                            {userName || "Pengguna PKL"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                            {role === "admin" ? "Admin & Mahasiswa" : "Mahasiswa"}
                        </span>
                    </div>

                    {/* Ikon Panah dengan Animasi Rotasi Halus */}
                    <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-out ml-0.5 ${isOpen ? "rotate-180 text-slate-600" : ""
                            }`}
                    />
                </button>

                {/* Menu Dropdown Popup dengan Animasi Fade & Scale Smooth */}
                <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl transition-all duration-200 ease-out origin-top-right z-50 ${isOpen
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
                >
                    {/* Info Singkat di Header Menu */}
                    <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Masuk sebagai</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">
                            {userName || "Akun PKL"}
                        </p>
                    </div>

                    <div className="py-1">
                        {/* Menu Profil PKL */}
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push("/dashboard/profil");
                            }}
                            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer"
                        >
                            <IdCard className="h-4 w-4 text-slate-500" />
                            Profil PKL
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                        {/* Menu Logout / Keluar */}
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