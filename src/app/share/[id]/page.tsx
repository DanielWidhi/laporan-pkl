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
import { Printer, Loader2, Radio } from "lucide-react";

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

    // Fungsi ambil daftar laporan (dipakai juga saat ada update realtime)
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

            // 1. Ambil Profil Mahasiswa
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", studentId)
                .single();

            if (profileData) setProfile(profileData);

            // 2. Ambil Laporan Mahasiswa
            await fetchLaporan();
            setIsLoading(false);
        }

        loadInitialData();

        // 3. FITUR REALTIME SUPABASE: Pantau perubahan secara langsung
        const channel = supabase
            .channel(`realtime-laporan-${studentId}`)
            .on(
                "postgres_changes",
                {
                    event: "*", // Tangkap INSERT, UPDATE, dan DELETE
                    schema: "public",
                    table: "laporan_harian",
                    filter: `mahasiswa_id=eq.${studentId}`,
                },
                () => {
                    // Ketika ada perubahan data di database, otomatis fetch ulang secara instan!
                    fetchLaporan();
                }
            )
            .subscribe();

        // Cleanup realtime listener saat halaman ditutup
        return () => {
            supabase.removeChannel(channel);
        };
    }, [studentId, supabase, fetchLaporan]);

    const handlePrint = () => {
        window.print();
    };

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
                    <p className="text-sm text-slate-500">Mahasiswa tidak terdaftar di sistem.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8 font-sans">
            {/* Container Kertas A4 */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm p-8 sm:p-12 rounded-lg print:border-none print:shadow-none print:p-0 font-sans">

                {/* Header Action (Print & Realtime Status) */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                        Live Update Aktif
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="bg-white">
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak PDF
                    </Button>
                </div>

                {/* KOP LAPORAN */}
                <div className="text-center mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900">
                        Laporan Harian Praktik Kerja Lapangan
                    </h1>
                    <p className="text-slate-600 mt-1 font-medium">{profile.tempat_pkl}</p>
                </div>

                <Separator className="my-6" />

                {/* INFORMASI MAHASISWA & PEMBIMBING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="space-y-2">
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Nama Mahasiswa</span>
                            <span>:</span>
                            <span className="font-bold text-slate-900">{profile.nama}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">NIM</span>
                            <span>:</span>
                            <span>{profile.nim}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Waktu PKL</span>
                            <span>:</span>
                            <span>{profile.waktu_pkl}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Dosen Pembimbing</span>
                            <span>:</span>
                            <span>{profile.dosen_pembimbing}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">NIP Dosen</span>
                            <span>:</span>
                            <span>{profile.nip_pembimbing}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Mentor Lapangan</span>
                            <span>:</span>
                            <span>{profile.mentor_lapangan}</span>
                        </div>
                    </div>
                </div>

                {/* TABEL KEGIATAN DENGAN KOLOM JAM MASUK & JAM PULANG */}
                <div className="mb-6 border border-slate-200 rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[50px] font-bold text-black border-r text-center">No</TableHead>
                                <TableHead className="w-[120px] font-bold text-black border-r">Tanggal</TableHead>
                                <TableHead className="font-bold text-black border-r">Deskripsi Kegiatan</TableHead>
                                <TableHead className="w-[110px] font-bold text-black border-r text-center">Jam Masuk</TableHead>
                                <TableHead className="w-[110px] font-bold text-black text-center">Jam Pulang</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {laporanList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                                        Belum ada riwayat aktivitas harian yang tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                laporanList.map((laporan, index) => (
                                    <TableRow key={laporan.id} className="border-b">
                                        <TableCell className="text-center border-r font-medium">{index + 1}</TableCell>
                                        <TableCell className="border-r whitespace-nowrap">
                                            {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="border-r text-sm">{laporan.deskripsi}</TableCell>
                                        <TableCell className="text-center text-xs border-r whitespace-nowrap font-medium">
                                            {formatTime(laporan.absensi_masuk)}
                                        </TableCell>
                                        <TableCell className="text-center text-xs whitespace-nowrap font-medium">
                                            {laporan.absensi_pulang ? (
                                                <span className="text-slate-900">{formatTime(laporan.absensi_pulang)}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">Belum Pulang</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

            </div>
        </div>
    );
}