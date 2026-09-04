"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    PlusCircle,
    Share2,
    MapPin,
    LogOut,
    Pencil,
    Trash2,
    Clock,
} from "lucide-react";

// Data awal (dummy)
const initialLaporan = [
    {
        id: "1",
        tanggal: "2026-09-01",
        deskripsi: "Mempelajari struktur folder Next.js dan setup awal Shadcn UI.",
        absenMasuk: "08:00",
        absenPulang: "17:00",
        lokasi: "-6.200000, 106.816666",
        statusParaf: true,
    },
    {
        id: "2",
        tanggal: "2026-09-02",
        deskripsi: "Mendesain database PostgreSQL dan mencoba koneksi Supabase.",
        absenMasuk: "08:15",
        absenPulang: "-", // Belum absen pulang
        lokasi: "-6.200000, 106.816666",
        statusParaf: false,
    },
    {
        id: "3",
        tanggal: "2026-09-03",
        deskripsi: "Mengerjakan UI Dashboard dan form input laporan harian.",
        absenMasuk: "07:50",
        absenPulang: "-", // Belum absen pulang
        lokasi: "-6.200000, 106.816666",
        statusParaf: false,
    },
];

export default function LaporanPage() {
    const [laporanList, setLaporanList] = useState(initialLaporan);

    // 1. FITUR ABSEN PULANG DENGAN SWEETALERT2
    const handleAbsenPulang = (id: string) => {
        const now = new Date();
        const jamPulang = `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

        Swal.fire({
            title: "Absen Pulang?",
            text: `Waktu saat ini (${jamPulang}) akan dicatat sebagai jam pulang Anda.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0f172a", // Slate-900
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Absen Sekarang!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                setLaporanList((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, absenPulang: jamPulang } : item
                    )
                );

                Swal.fire({
                    title: "Berhasil!",
                    text: `Absen pulang berhasil dicatat pada pukul ${jamPulang}.`,
                    icon: "success",
                    confirmButtonColor: "#0f172a",
                });
            }
        });
    };

    // 2. FITUR EDIT LAPORAN DENGAN SWEETALERT2
    const handleEdit = (laporan: (typeof initialLaporan)[0]) => {
        Swal.fire({
            title: "Edit Laporan Kegiatan",
            input: "textarea",
            inputValue: laporan.deskripsi,
            inputLabel: "Deskripsi Kegiatan",
            inputPlaceholder: "Tuliskan revisi kegiatan Anda di sini...",
            inputAttributes: {
                "aria-label": "Tuliskan revisi kegiatan Anda di sini",
            },
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Simpan Perubahan",
            cancelButtonText: "Batal",
            inputValidator: (value) => {
                if (!value) {
                    return "Deskripsi kegiatan tidak boleh kosong!";
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setLaporanList((prev) =>
                    prev.map((item) =>
                        item.id === laporan.id ? { ...item, deskripsi: result.value } : item
                    )
                );

                Swal.fire({
                    title: "Tersimpan!",
                    text: "Deskripsi kegiatan harian Anda telah diperbarui.",
                    icon: "success",
                    confirmButtonColor: "#0f172a",
                });
            }
        });
    };

    // 3. FITUR DELETE LAPORAN DENGAN SWEETALERT2
    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Hapus Laporan Ini?",
            text: "Data laporan yang dihapus tidak dapat dipulihkan kembali!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626", // Red-600
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                setLaporanList((prev) => prev.filter((item) => item.id !== id));

                Swal.fire({
                    title: "Terhapus!",
                    text: "Laporan berhasil dihapus.",
                    icon: "success",
                    confirmButtonColor: "#0f172a",
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riwayat Laporan Harian</h1>
                    <p className="text-sm text-slate-500">
                        Daftar kegiatan PKL/Magang yang telah Anda laporkan.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Share2 className="w-4 h-4 mr-2" />
                        Bagikan ke Dosen
                    </Button>
                    <Link href="/dashboard/laporan/buat" className="w-full sm:w-auto">
                        <Button className="w-full">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Buat Laporan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table className="min-w-[950px]">
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[120px]">Tanggal</TableHead>
                            <TableHead className="w-[90px]">Masuk</TableHead>
                            <TableHead className="w-[100px]">Pulang</TableHead>
                            <TableHead className="min-w-[260px]">Deskripsi Kegiatan</TableHead>
                            <TableHead className="w-[130px]">Lokasi</TableHead>
                            <TableHead className="w-[160px]">Status / Absen</TableHead>
                            <TableHead className="w-[100px] text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {laporanList.map((laporan) => (
                            <TableRow key={laporan.id}>
                                <TableCell className="font-medium">
                                    {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </TableCell>
                                <TableCell>{laporan.absenMasuk}</TableCell>
                                <TableCell>
                                    {laporan.absenPulang === "-" ? (
                                        <span className="text-slate-400 font-mono">-</span>
                                    ) : (
                                        laporan.absenPulang
                                    )}
                                </TableCell>
                                <TableCell>
                                    <p className="line-clamp-2 text-sm">{laporan.deskripsi}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 cursor-pointer">
                                        <MapPin className="w-3 h-3" />
                                        Lihat Peta
                                    </div>
                                </TableCell>

                                {/* Kolom Status & Ikon Absen Pulang */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {laporan.statusParaf ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                                                Disetujui
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                Menunggu
                                            </Badge>
                                        )}

                                        {/* Ikon Absen Pulang cepat jika jam pulang belum tercatat */}
                                        {laporan.absenPulang === "-" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                title="Klik untuk Absen Pulang sekarang"
                                                onClick={() => handleAbsenPulang(laporan.id)}
                                                className="h-7 px-2 text-xs flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                Pulang
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Kolom Edit & Delete */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleEdit(laporan)}
                                            title="Edit Kegiatan"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(laporan.id)}
                                            title="Hapus Laporan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}