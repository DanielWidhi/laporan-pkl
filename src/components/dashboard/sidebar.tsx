import Link from "next/link";
import { Home, FileText, Users } from "lucide-react";

export function Sidebar({ role }: { role?: string | null }) {
    return (
        <aside className="hidden w-64 flex-col border-r bg-slate-50 md:flex h-screen sticky top-0">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>SiPekal (PKL)</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2">
                    {/* Menu Mahasiswa & Admin */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 bg-slate-200 transition-all hover:text-slate-900"
                    >
                        <Home className="h-4 w-4" />
                        Beranda
                    </Link>
                    <Link
                        href="/dashboard/laporan"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
                    >
                        <FileText className="h-4 w-4" />
                        Laporan Harian
                    </Link>

                    {/* Area Admin - Hanya Tampil Jika Role Admin */}
                    {role === "admin" && (
                        <>
                            <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                Area Admin
                            </div>
                            <Link
                                href="/dashboard/admin/mahasiswa"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
                            >
                                <Users className="h-4 w-4" />
                                Data Mahasiswa
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </aside>
    );
}