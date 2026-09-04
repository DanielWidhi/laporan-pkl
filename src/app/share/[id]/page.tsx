"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Printer,
    Loader2,
    Radio,
    CalendarDays,
    LogIn,
    LogOut as LogOutIcon,
    CheckCircle2,
    Clock,
    User,
    GraduationCap,
    Building2,
    CalendarRange,
    BookOpen,
    IdCard,
    Users,
} from "lucide-react";
import { Footer } from "@/components/footer";

interface Profile {
    nama: string;
    nim: string;
    tempat_pkl: string;
    waktu_pkl: string;
    dosen_pembimbing: string;
    nip_pembimbing: string;
    mentor_lapangan: string;
}

interface Laporan {
    id: string;
    tanggal: string;
    deskripsi: string;
    absensi_masuk: string;
    absensi_pulang: string | null;
}

export default function SharedLaporanPage() {
    const params = useParams();
    const studentId = params?.id as string;
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLaporan = useCallback(async () => {
        if (!studentId) return;
        const { data } = await supabase
            .from("laporan_harian")
            .select("*")
            .eq("mahasiswa_id", studentId)
            .order("tanggal", { ascending: true });

        if (data) setLaporanList(data);
    }, [studentId, supabase]);

    useEffect(() => {
        async function loadInitialData() {
            if (!studentId) return;

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", studentId)
                .single();

            if (profileData) setProfile(profileData);

            await fetchLaporan();
            setIsLoading(false);
        }

        loadInitialData();

        // Realtime listener
        const channel = supabase
            .channel(`realtime-laporan-${studentId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "laporan_harian",
                    filter: `mahasiswa_id=eq.${studentId}`,
                },
                () => { fetchLaporan(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [studentId, supabase, fetchLaporan]);

    const handlePrint = () => window.print();

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const formatDateShort = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const formatTime = (isoString: string | null) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Data Tidak Ditemukan</h2>
                    <p className="text-sm text-slate-500 mt-1">Mahasiswa tidak terdaftar di sistem.</p>
                </div>
            </div>
        );
    }

    // Baris info profil untuk reuse
    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <div className="flex gap-2 text-sm">
            <span className="font-semibold text-slate-600 min-w-[130px] shrink-0">{label}</span>
            <span className="text-slate-500 shrink-0">:</span>
            <span className="text-slate-900">{value || "-"}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 py-4 sm:py-8 px-2 sm:px-4 md:px-8 font-sans print:bg-white print:p-0">

            {/* ===== ACTION BAR (tidak di-print) ===== */}
            <div className="max-w-4xl mx-auto mb-4 flex flex-wrap justify-between items-center gap-3 print:hidden">
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Live Update Aktif
                </div>
                <Button onClick={handlePrint} variant="outline" className="bg-white shadow-sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak PDF
                </Button>
            </div>

            {/* ===== CONTAINER DOKUMEN ===== */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none">

                {/* ===== KOP DOKUMEN (Selalu tampil, termasuk saat print) ===== */}
                <div className="p-5 sm:p-8 md:p-12 pb-0 sm:pb-0 md:pb-0">
                    <div className="text-center mb-6">
                        <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900">
                            Laporan Harian Praktik Kerja Lapangan
                        </h1>
                        <p className="text-slate-600 mt-1.5 font-medium text-sm sm:text-base">{profile.tempat_pkl}</p>
                    </div>

                    <Separator className="my-5" />

                    {/* Info Mahasiswa & Pembimbing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        <div className="space-y-2">
                            <InfoRow label="Nama Mahasiswa" value={profile.nama} />
                            <InfoRow label="NIM" value={profile.nim} />
                            <InfoRow label="Waktu PKL" value={profile.waktu_pkl} />
                        </div>
                        <div className="space-y-2">
                            <InfoRow label="Dosen Pembimbing" value={profile.dosen_pembimbing} />
                            <InfoRow label="NIP Dosen" value={profile.nip_pembimbing} />
                            <InfoRow label="Mentor Lapangan" value={profile.mentor_lapangan} />
                        </div>
                    </div>

                    <Separator className="mb-0" />
                </div>

                {/* ===== MOBILE: Card per Laporan (hanya tampil di layar, tidak di-print) ===== */}
                <div className="block md:hidden print:hidden p-4 space-y-3">
                    {laporanList.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="mt-3 text-sm text-slate-500">Belum ada aktivitas harian yang tercatat.</p>
                        </div>
                    ) : (
                        laporanList.map((laporan, index) => (
                            <div key={laporan.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                {/* Card Header: nomor + tanggal */}
                                <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                            {formatDateShort(laporan.tanggal)}
                                        </div>
                                    </div>
                                    {laporan.absensi_pulang ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Selesai
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                            <Clock className="w-3 h-3" />
                                            Belum Pulang
                                        </span>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="px-4 py-3 space-y-3">
                                    {/* Jam masuk & pulang */}
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <LogIn className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="font-medium">Masuk:</span>
                                            <span className="font-bold text-slate-900 font-mono">{formatTime(laporan.absensi_masuk)}</span>
                                        </div>
                                        <div className="h-3 w-px bg-slate-200" />
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <LogOutIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-medium">Pulang:</span>
                                            <span className={`font-bold font-mono ${laporan.absensi_pulang ? "text-slate-900" : "text-slate-400 italic font-sans"}`}>
                                                {laporan.absensi_pulang ? formatTime(laporan.absensi_pulang) : "Belum"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Deskripsi */}
                                    <p className="text-sm text-slate-700 leading-relaxed">{laporan.deskripsi}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ===== DESKTOP + PRINT: Tabel Formal ===== */}
                <div className="hidden md:block print:block p-5 sm:p-8 md:p-12 pt-5 sm:pt-6">
                    <div className="border border-slate-300 rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-[46px] font-bold text-black border-r text-center">No</TableHead>
                                    <TableHead className="w-[120px] font-bold text-black border-r">Tanggal</TableHead>
                                    <TableHead className="font-bold text-black border-r">Deskripsi Kegiatan</TableHead>
                                    <TableHead className="w-[100px] font-bold text-black border-r text-center">Jam Masuk</TableHead>
                                    <TableHead className="w-[100px] font-bold text-black text-center">Jam Pulang</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laporanList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            Belum ada riwayat aktivitas harian yang tercatat.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    laporanList.map((laporan, index) => (
                                        <TableRow key={laporan.id} className="border-b">
                                            <TableCell className="text-center border-r font-medium text-slate-700">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="border-r whitespace-nowrap text-sm text-slate-800">
                                                {formatDateShort(laporan.tanggal)}
                                            </TableCell>
                                            <TableCell className="border-r text-sm text-slate-800">
                                                {laporan.deskripsi}
                                            </TableCell>
                                            <TableCell className="text-center border-r whitespace-nowrap text-sm font-medium font-mono text-slate-800">
                                                {formatTime(laporan.absensi_masuk)}
                                            </TableCell>
                                            <TableCell className="text-center whitespace-nowrap text-sm font-medium font-mono">
                                                {laporan.absensi_pulang ? (
                                                    <span className="text-slate-900">{formatTime(laporan.absensi_pulang)}</span>
                                                ) : (
                                                    <span className="text-slate-400 italic font-sans text-xs">Belum Pulang</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Ringkasan total */}
                    {laporanList.length > 0 && (
                        <p className="mt-3 text-right text-xs text-slate-500">
                            Total: <strong className="text-slate-700">{laporanList.length} hari kegiatan</strong>
                        </p>
                    )}
                </div>

                {/* ===== KOLOM TANDA TANGAN (hanya saat print) ===== */}
                <div className="hidden print:block px-12 pb-12 pt-4">
                    <div className="grid grid-cols-2 gap-16 mt-8">
                        <div className="text-center text-sm">
                            <p className="font-semibold text-slate-700 mb-16">Mengetahui,</p>
                            <p className="font-semibold">Dosen Pembimbing</p>
                            <p className="text-slate-600 text-xs mt-1">{profile.dosen_pembimbing}</p>
                            <p className="text-slate-500 text-xs">NIP. {profile.nip_pembimbing}</p>
                        </div>
                        <div className="text-center text-sm">
                            <p className="font-semibold text-slate-700 mb-16">Mahasiswa,</p>
                            <p className="font-semibold">{profile.nama}</p>
                            <p className="text-slate-500 text-xs">NIM. {profile.nim}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* ===== PROFIL CARD (Mobile, tidak di-print) ===== */}
            <div className="max-w-4xl mx-auto mt-4 print:hidden md:hidden">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informasi PKL</h3>
                    <div className="grid grid-cols-1 gap-2.5 text-sm">
                        <div className="flex items-start gap-2.5">
                            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-900">{profile.nama}</p>
                                <p className="text-xs text-slate-500">NIM: {profile.nim}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-slate-700">{profile.tempat_pkl || "-"}</p>
                                <p className="text-xs text-slate-500">{profile.waktu_pkl || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-slate-700">{profile.dosen_pembimbing || "-"}</p>
                                <p className="text-xs text-slate-500">NIP: {profile.nip_pembimbing || "-"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-slate-700">{profile.mentor_lapangan || "-"}</p>
                                <p className="text-xs text-slate-500">Mentor Lapangan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - tidak tampil saat print */}
            <div className="max-w-4xl mx-auto mt-6 print:hidden">
                <Footer />
            </div>
        </div>
    );
}