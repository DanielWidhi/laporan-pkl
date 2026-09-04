"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FileText,
    CalendarDays,
    Building2,
    CheckCircle2,
    Clock,
    ArrowRight,
    PlusCircle,
    Users,
    Loader2,
    TrendingUp,
    AlertCircle,
    ExternalLink,
    Briefcase,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [totalLaporan, setTotalLaporan] = useState(0);
    const [sudahLaporHariIni, setSudahLaporHariIni] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        async function loadDashboardData() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // 1. Ambil Profil Pengguna
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setProfile(profileData);

            // 2. Hitung Total Laporan
            const { count: laporanCount } = await supabase
                .from("laporan_harian")
                .select("*", { count: "exact", head: true })
                .eq("mahasiswa_id", user.id);

            setTotalLaporan(laporanCount || 0);

            // 3. Cek laporan hari ini
            const today = new Date().toISOString().split("T")[0];
            const { data: todayReport } = await supabase
                .from("laporan_harian")
                .select("id")
                .eq("mahasiswa_id", user.id)
                .eq("tanggal", today)
                .maybeSingle();

            setSudahLaporHariIni(!!todayReport);

            // 4. Jika Admin, hitung mahasiswa pending
            if (profileData?.role === "admin") {
                const { count: pendingApprovalCount } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true })
                    .eq("role", "mahasiswa")
                    .eq("is_approved", false);

                setPendingCount(pendingApprovalCount || 0);
            }

            setIsLoading(false);
        }

        loadDashboardData();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const namaUser = profile?.nama || "Mahasiswa";
    const isAdmin = profile?.role === "admin";

    return (
        <div className="space-y-5">

            {/* ===== WELCOME BANNER ===== */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 sm:p-8 text-white shadow-md">
                {/* Dekoratif lingkaran background */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-blue-600/10" />
                <div className="pointer-events-none absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-blue-500/10" />

                <div className="relative max-w-xl space-y-3">
                    {/* Badge peran */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1">
                        <Briefcase className="h-3 w-3 text-blue-300" />
                        <span className="text-xs font-semibold text-blue-200">
                            {isAdmin ? "Superadmin & Mahasiswa" : "Peserta PKL / Magang"}
                        </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                        Selamat datang, <span className="text-blue-300">{namaUser}</span>
                    </h1>

                    {/* Sub-teks */}
                    <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                        Pantau kehadiran, catat aktivitas magang harian, dan pastikan laporan selalu terperbarui secara real-time.
                    </p>
                </div>
            </div>

            {/* ===== NOTIFIKASI ADMIN ===== */}
            {isAdmin && pendingCount > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-amber-900">
                                {pendingCount} akun mahasiswa menunggu persetujuan
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Aktifkan akun mereka agar bisa mulai mengisi laporan PKL.
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/admin/mahasiswa" className="shrink-0">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                            Tinjau Sekarang
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* ===== GRID STATISTIK ===== */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* Stat 1: Total Laporan */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-500">
                            Total Laporan
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-extrabold text-slate-900 leading-none">{totalLaporan}</span>
                            <span className="mb-0.5 text-sm text-slate-400 font-medium">laporan</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                            Seluruh laporan harian Anda
                        </div>
                    </CardContent>
                </Card>

                {/* Stat 2: Status Hari Ini */}
                <Card className={`shadow-sm border ${sudahLaporHariIni ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-500">
                            Status Hari Ini
                        </CardTitle>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${sudahLaporHariIni ? "bg-emerald-100" : "bg-amber-100"}`}>
                            {sudahLaporHariIni ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <Clock className="h-4 w-4 text-amber-600" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-lg font-bold ${sudahLaporHariIni ? "text-emerald-700" : "text-amber-700"}`}>
                            {sudahLaporHariIni ? "Sudah Dilaporkan" : "Belum Dilaporkan"}
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            {sudahLaporHariIni
                                ? "Laporan kegiatan hari ini telah tercatat."
                                : "Jangan lupa catat aktivitas magang hari ini."}
                        </p>
                    </CardContent>
                </Card>

                {/* Stat 3: Instansi PKL */}
                <Card className="shadow-sm border-slate-200 sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-500">
                            Instansi Magang
                        </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                            <Building2 className="h-4 w-4 text-slate-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base font-bold text-slate-900 truncate leading-snug">
                            {profile?.tempat_pkl || (
                                <span className="text-slate-400 font-normal text-sm">Belum mengisi profil</span>
                            )}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{profile?.waktu_pkl || "Periode belum diatur"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ===== AKSI CEPAT ===== */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-slate-900">Aksi Cepat</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                        Pintasan untuk mempermudah kegiatan harian Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <Link href="/dashboard/laporan/buat" className="w-full sm:w-auto">
                        <Button className="h-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Buat Laporan Baru
                        </Button>
                    </Link>
                    <Link href="/dashboard/laporan" className="w-full sm:w-auto">
                        <Button variant="outline" className="h-10 w-full sm:w-auto gap-2">
                            <FileText className="h-4 w-4" />
                            Riwayat Laporan
                        </Button>
                    </Link>
                    {profile?.id && (
                        <Link href={`/share/${profile.id}`} target="_blank" className="w-full sm:w-auto">
                            <Button variant="secondary" className="h-10 w-full sm:w-auto gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Preview Dokumen Dosen
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}