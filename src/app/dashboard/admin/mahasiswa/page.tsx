"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Eye, Trash2, Loader2, Users, Mail } from "lucide-react";

interface Student {
    id: string;
    email: string | null;
    nama: string | null;
    nim: string | null;
    tempat_pkl: string | null;
    is_approved: boolean;
    laporan_count: number;
}

export default function AdminMahasiswaPage() {
    const supabase = createClient();

    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // 1. Ambil data seluruh mahasiswa dari Supabase
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, email, nama, nim, tempat_pkl, is_approved, laporan_harian(count)")
            .eq("role", "mahasiswa")
            .order("is_approved", { ascending: true }); // Yang belum di-approve muncul paling atas

        if (error) {
            console.error("Gagal mengambil data mahasiswa:", error);
        } else if (data) {
            const formatted = data.map((item: any) => ({
                id: item.id,
                email: item.email,
                nama: item.nama,
                nim: item.nim,
                tempat_pkl: item.tempat_pkl,
                is_approved: item.is_approved,
                laporan_count: item.laporan_harian?.[0]?.count || 0,
            }));
            setStudents(formatted);
        }

        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // 2. APPROVE AKUN MAHASISWA
    const handleApprove = async (student: Student) => {
        const identitas = student.nama || student.email || "mahasiswa ini";

        Swal.fire({
            title: "Setujui Akun Mahasiswa?",
            text: `Akun (${identitas}) akan diaktifkan dan dapat mulai login serta mengisi laporan.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#059669", // Emerald-600
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Setujui Akun!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ is_approved: true })
                    .eq("id", student.id);

                if (error) {
                    Swal.fire("Gagal", error.message, "error");
                    return;
                }

                setStudents((prev) =>
                    prev.map((s) => (s.id === student.id ? { ...s, is_approved: true } : s))
                );

                Swal.fire("Berhasil Disetujui!", "Akun mahasiswa sekarang telah aktif.", "success");
            }
        });
    };

    // 3. HAPUS MAHASISWA (CASCADE DELETE KE LAPORAN)
    const handleDelete = (student: Student) => {
        const identitas = student.nama || student.email || "mahasiswa ini";

        Swal.fire({
            title: "Hapus Mahasiswa Ini?",
            text: `PERINGATAN: Menghapus (${identitas}) akan otomatis menghapus BERSIH seluruh riwayat laporan hariannya!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus Permanen!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from("profiles")
                    .delete()
                    .eq("id", student.id);

                if (error) {
                    Swal.fire("Gagal", error.message, "error");
                    return;
                }

                setStudents((prev) => prev.filter((s) => s.id !== student.id));
                Swal.fire("Terhapus!", "Mahasiswa dan seluruh laporannya telah terhapus bersih.", "success");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Mahasiswa PKL</h1>
                <p className="text-sm text-slate-500">
                    Kelola persetujuan akun pendaftar baru, pantau riwayat, dan manajemen data mahasiswa.
                </p>
            </div>

            {/* Toolbar Pencarian */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        type="search"
                        placeholder="Cari email, nama, atau NIM..."
                        className="pl-8 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabel Mahasiswa */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                </div>
            ) : students.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center bg-white">
                    <Users className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Belum Ada Mahasiswa</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Belum ada mahasiswa yang mendaftar di sistem ini.
                    </p>
                </div>
            ) : (
                <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                    <Table className="min-w-[950px]">
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Nama Mahasiswa</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>NIM</TableHead>
                                <TableHead>Instansi PKL</TableHead>
                                <TableHead className="text-center">Total Laporan</TableHead>
                                <TableHead>Status Akun</TableHead>
                                <TableHead className="text-right pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students
                                .filter((s) => {
                                    const query = searchQuery.toLowerCase();
                                    return (
                                        (s.email || "").toLowerCase().includes(query) ||
                                        (s.nama || "").toLowerCase().includes(query) ||
                                        (s.nim || "").includes(query)
                                    );
                                })
                                .map((student) => (
                                    <TableRow key={student.id}>
                                        {/* Nama Mahasiswa */}
                                        <TableCell className="font-medium">
                                            {student.nama ? (
                                                student.nama
                                            ) : (
                                                <span className="italic text-slate-400 text-xs">Belum isi profil</span>
                                            )}
                                        </TableCell>

                                        {/* Email Mahasiswa */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {student.email || "-"}
                                            </div>
                                        </TableCell>

                                        <TableCell>{student.nim || "-"}</TableCell>
                                        <TableCell>{student.tempat_pkl || "-"}</TableCell>

                                        {/* Total Laporan */}
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {student.laporan_count} Laporan
                                            </span>
                                        </TableCell>

                                        {/* Status Approval */}
                                        <TableCell>
                                            {student.is_approved ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                    Menunggu Approval
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Tombol Aksi Langsung */}
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* 1. TOMBOL SETUJUI LANGSUNG (Khusus akun belum di-approve) */}
                                                {!student.is_approved && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(student)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3 font-medium shadow-sm transition-all"
                                                        title="Setujui pendaftaran mahasiswa ini"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                        Setujui
                                                    </Button>
                                                )}

                                                {/* 2. TOMBOL LIHAT LAPORAN */}
                                                <Link href={`/share/${student.id}`} target="_blank">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                        title="Lihat riwayat laporan"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        Lihat
                                                    </Button>
                                                </Link>

                                                {/* 3. TOMBOL HAPUS MAHASISWA */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(student)}
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Hapus akun dan seluruh laporannya"
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
            )}
        </div>
    );
}