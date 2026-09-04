"use client";

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
import { Printer, MapPin, CheckCircle2 } from "lucide-react";

// Dummy Data Profil Mahasiswa
const dummyProfile = {
    nama: "Budi Santoso",
    nim: "123456789",
    tempatPkl: "PT Teknologi Nusantara",
    waktuPkl: "1 Sep 2026 - 31 Des 2026",
    dosenPembimbing: "Dr. Anita Wijaya, M.Kom",
    nipPembimbing: "198001012005012001",
    mentorLapangan: "Agus Pratama",
};

// Dummy Data Laporan
const dummyLaporan = [
    {
        id: "1",
        tanggal: "2026-09-01",
        deskripsi: "Pengenalan lingkungan kerja dan setup perangkat development.",
        absenMasuk: "08:00",
        absenPulang: "17:00",
        statusParaf: true,
    },
    {
        id: "2",
        tanggal: "2026-09-02",
        deskripsi: "Meeting awal proyek dan merancang skema database PostgreSQL.",
        absenMasuk: "08:15",
        absenPulang: "17:30",
        statusParaf: true,
    },
    {
        id: "3",
        tanggal: "2026-09-03",
        deskripsi: "Mengerjakan UI/UX Dashboard menggunakan Next.js dan Tailwind.",
        absenMasuk: "07:50",
        absenPulang: "17:10",
        statusParaf: false,
    },
];

export default function SharedLaporanPage({ params }: { params: { id: string } }) {
    // Fungsi untuk mencetak halaman (Print to PDF)
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-8">
            {/* Container utama (Dibuat mirip kertas A4) */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm p-8 sm:p-12 rounded-lg">

                {/* Tombol Print (Akan disembunyikan saat dicetak pakai CSS 'print:hidden') */}
                <div className="flex justify-end mb-8 print:hidden">
                    <Button onClick={handlePrint} variant="outline" className="bg-white">
                        <Printer className="w-4 h-4 mr-2" />
                        Cetak PDF
                    </Button>
                </div>

                {/* HEADER LAPORAN */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">
                        Laporan Harian Praktik Kerja Lapangan
                    </h1>
                    <p className="text-slate-600 mt-1">{dummyProfile.tempatPkl}</p>
                </div>

                <Separator className="my-6" />

                {/* INFO MAHASISWA & PEMBIMBING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div className="space-y-2">
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Nama Mahasiswa</span>
                            <span>:</span>
                            <span className="font-medium">{dummyProfile.nama}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">NIM</span>
                            <span>:</span>
                            <span>{dummyProfile.nim}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Waktu Pelaksanaan</span>
                            <span>:</span>
                            <span>{dummyProfile.waktuPkl}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Dosen Pembimbing</span>
                            <span>:</span>
                            <span>{dummyProfile.dosenPembimbing}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">NIP Dosen</span>
                            <span>:</span>
                            <span>{dummyProfile.nipPembimbing}</span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr]">
                            <span className="font-semibold text-slate-600">Mentor Lapangan</span>
                            <span>:</span>
                            <span>{dummyProfile.mentorLapangan}</span>
                        </div>
                    </div>
                </div>

                {/* TABEL LAPORAN */}
                <div className="mb-12 border border-slate-200 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[50px] font-bold text-black border-r text-center">No</TableHead>
                                <TableHead className="w-[120px] font-bold text-black border-r">Tanggal</TableHead>
                                <TableHead className="font-bold text-black border-r">Deskripsi Kegiatan</TableHead>
                                <TableHead className="w-[100px] font-bold text-black border-r text-center">Jam Kerja</TableHead>
                                <TableHead className="w-[100px] font-bold text-black text-center">Paraf</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dummyLaporan.map((laporan, index) => (
                                <TableRow key={laporan.id} className="border-b">
                                    <TableCell className="text-center border-r">{index + 1}</TableCell>
                                    <TableCell className="border-r">
                                        {new Date(laporan.tanggal).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="border-r">
                                        {laporan.deskripsi}
                                    </TableCell>
                                    <TableCell className="text-center text-xs border-r">
                                        {laporan.absenMasuk} - {laporan.absenPulang}
                                    </TableCell>
                                    <TableCell className="text-center flex justify-center">
                                        {laporan.statusParaf ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* KOLOM TANDA TANGAN */}
                <div className="grid grid-cols-2 gap-8 text-center text-sm pt-8">
                    <div>
                        <p className="mb-20">Mengetahui,<br />Mentor Lapangan</p>
                        <p className="font-bold underline">{dummyProfile.mentorLapangan}</p>
                        <p className="text-slate-600">NIP/NIK: -</p>
                    </div>
                    <div>
                        <p className="mb-20">Menyetujui,<br />Dosen Pembimbing</p>
                        <p className="font-bold underline">{dummyProfile.dosenPembimbing}</p>
                        <p className="text-slate-600">NIP: {dummyProfile.nipPembimbing}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}