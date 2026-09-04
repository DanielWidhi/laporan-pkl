import Link from "next/link";
import { Menu, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-slate-50 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
            {/* Tombol Hamburger untuk Mobile */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-4 text-lg font-medium mt-6">
                        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <FileText className="h-6 w-6" />
                            <span>SiPekal (PKL)</span>
                        </Link>
                        <Link href="/dashboard" className="hover:text-slate-900">Beranda</Link>
                        <Link href="/dashboard/laporan" className="text-slate-500 hover:text-slate-900">Laporan Harian</Link>
                        <div className="mt-4 mb-2 text-sm font-semibold uppercase text-slate-500">Area Admin</div>
                        <Link href="/dashboard/admin/mahasiswa" className="text-slate-500 hover:text-slate-900">Data Mahasiswa</Link>
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
                {/* Bisa diisi fitur Search nanti jika perlu */}
            </div>

            {/* Profil Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profil PKL</DropdownMenuItem>
                    <DropdownMenuItem>Ganti Password</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 font-medium cursor-pointer">
                        Keluar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}