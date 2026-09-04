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
    Calendar,
    Building,
    CheckCircle2,
    Clock,
    ArrowRight,
    PlusCircle,
    Users,
    Loader2,
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

            // 2. Hitung Total Laporan Milik Sendiri
            const { count: laporanCount } = await supabase
                .from("laporan_harian")
                .select("*", { count: "exact", head: true })
                .eq("mahasiswa_id", user.id);

            setTotalLaporan(laporanCount || 0);

            // 3. Cek apakah sudah mengisi laporan hari ini
            const today = new Date().toISOString().split("T")[0];
            const { data: todayReport } = await supabase
                .from("laporan_harian")
                .select("id")
                .eq("mahasiswa_id", user.id)
                .eq("tanggal", today)
                .maybeSingle();

            setSudahLaporHariIni(!!todayReport);

            // 4. Jika role Admin, hitung berapa mahasiswa yang butuh approval
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
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-sm">
                <div className="max-w-2xl space-y-2">
                    <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
                        {profile?.role === "admin" ? "Superadmin & Mahasiswa" : "Peserta PKL"}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Selamat datang, {profile?.nama || "Mahasiswa"}! 👋
                    </h1>
                    <p className="text-sm text-slate-300">
                        Pantau kehadiran, catat aktivitas magang harian, dan pastikan laporanmu selalu terperbarui secara real-time.
                    </p>
                </div>
            </div>

            {/* Widget Admin (Hanya tampil jika Admin & ada yang butuh approval) */}
            {profile?.role === "admin" && pendingCount > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">
                                Ada {pendingCount} mahasiswa baru menunggu persetujuan akun!
                            </p>
                            <p className="text-xs text-amber-700">
                                Segera aktifkan akun mereka agar bisa mulai membuat laporan PKL.
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/admin/mahasiswa">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
                            Tinjau Mahasiswa <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* Grid Statistik Utama */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Laporan */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Total Laporan Saya
                        </CardTitle>
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <FileText className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalLaporan}</div>
                        <p className="text-xs text-slate-500 mt-1">Laporan harian tersimpan</p>
                    </CardContent>
                </Card>

                {/* Card 2: Status Hari Ini */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Status Hari Ini
                        </CardTitle>
                        <div
                            className={`rounded-lg p-2 ${sudahLaporHariIni
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                        >
                            {sudahLaporHariIni ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <Clock className="h-4 w-4" />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-slate-900">
                            {sudahLaporHariIni ? "Sudah Mengisi" : "Belum Mengisi"}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {sudahLaporHariIni
                                ? "Laporan kegiatan hari ini telah tercatat"
                                : "Ayo catat aktivitas magangmu hari ini!"}
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3: Instansi PKL */}
                <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-slate-600">
                            Instansi Magang
                        </CardTitle>
                        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                            <Building className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base font-bold text-slate-900 truncate">
                            {profile?.tempat_pkl || "Belum Mengisi Profil"}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {profile?.waktu_pkl || "Periode belum diatur"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Aksi Cepat (Quick Actions) */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                    <CardDescription>Pintasan untuk mempermudah kegiatan harianmu.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Link href="/dashboard/laporan/buat">
                        <Button className="h-10">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Buat Laporan Baru
                        </Button>
                    </Link>
                    <Link href="/dashboard/laporan">
                        <Button variant="outline" className="h-10">
                            <FileText className="mr-2 h-4 w-4" />
                            Lihat Riwayat Laporan
                        </Button>
                    </Link>
                    {profile?.id && (
                        <Link href={`/share/${profile.id}`} target="_blank">
                            <Button variant="secondary" className="h-10">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Preview Dokumen Dosen
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}