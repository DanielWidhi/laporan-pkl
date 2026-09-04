import Link from "next/link";
import { FileText } from "lucide-react";

// Ganti URL ini dengan link portfolio yang sebenarnya
const PORTFOLIO_URL = "https://daniel.gdpartstudio.my.id";

interface FooterProps {
    /** "public" = tampilkan link Login & Daftar (default)
     *  "dashboard" = sembunyikan link Login & Daftar */
    variant?: "public" | "dashboard";
}

export function Footer({ variant = "public" }: FooterProps) {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Top row: logo + nav links */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">

                    {/* Logo */}
                    <Link
                        href={variant === "dashboard" ? "/dashboard" : "/"}
                        className="flex items-center gap-2 text-slate-800 font-bold text-sm hover:text-blue-600 transition-colors"
                    >
                        <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                        SiPekal
                    </Link>

                    {/* Nav Links — hanya tampil di halaman publik */}
                    {variant === "public" && (
                        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                            <Link href="/login" className="hover:text-slate-800 transition-colors">
                                Login
                            </Link>
                            <Link href="/register" className="hover:text-slate-800 transition-colors">
                                Daftar
                            </Link>
                            <a
                                href="mailto:admin@sipekal.id"
                                className="hover:text-slate-800 transition-colors"
                            >
                                Kontak Admin
                            </a>
                        </nav>
                    )}
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-slate-100" />

                {/* Bottom row: copyright + published by */}
                <div className="flex flex-col items-center gap-1.5 text-center text-[11px] text-slate-400 leading-relaxed">
                    <p>
                        &copy; {year} <span className="font-medium text-slate-500">SiPekal</span> &mdash; Sistem Informasi Laporan Harian PKL &amp; Magang.
                    </p>
                    <p>
                        Published by{" "}
                        <a
                            href={PORTFOLIO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-500 underline underline-offset-2 hover:text-blue-600 transition-colors duration-150"
                        >
                            Daniel Widhi
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
