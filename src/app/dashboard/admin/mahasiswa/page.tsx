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
import {
    Search,
    UserCheck,
    Eye,
    Trash2,
    Loader2,
    Users,
    Mail,
    Building2,
    FileText,
    Hash,
    CheckCircle2,
    Clock,
    ExternalLink,
} from "lucide-react";

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

    // 1. Ambil data mahasiswa
    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, email, nama, nim, tempat_pkl, is_approved, laporan_harian(count)")
            .eq("role", "mahasiswa")
            .order("is_approved", { ascending: true }); // Pending di atas

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

    // 2. APPROVE AKUN
    const handleApprove = async (student: Student) => {
        const identitas = student.nama || student.email || "mahasiswa ini";

        Swal.fire({
            title: "Setujui Akun Mahasiswa?",
            text: `Akun (${identitas}) akan diaktifkan dan dapat mulai login serta mengisi laporan.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#059669",
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

    // 3. HAPUS MAHASISWA
    const handleDelete = (student: Student) => {
        const identitas = student.nama || student.email || "mahasiswa ini";

        Swal.fire({
            title: "Hapus Mahasiswa Ini?",
            text: `PERINGATAN: Menghapus (${identitas}) akan otomatis menghapus seluruh riwayat laporannya!`,
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
                Swal.fire("Terhapus!", "Mahasiswa dan seluruh laporannya telah terhapus.", "success");
            }
        });
    };

    // Filter berdasarkan search
    const filtered = students.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
            (s.email || "").toLowerCase().includes(q) ||
            (s.nama || "").toLowerCase().includes(q) ||
            (s.nim || "").includes(q)
        );
    });

    // ===== MOBILE CARD =====
    const StudentCard = ({ student }: { student: Student }) => (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            {/* Baris atas: nama + badge status */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                        {student.nama || (
                            <span className="italic text-slate-400 font-normal">Belum isi profil</span>
                        )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-500 font-mono">{student.nim || "-"}</span>
                    </div>
                </div>
                {student.is_approved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktif
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700 shrink-0">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                )}
            </div>

            {/* Info email & instansi */}
            <div className="space-y-1.5 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono truncate">{student.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.tempat_pkl || "Instansi belum diisi"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.laporan_count} laporan tersimpan</span>
                </div>
            </div>

            {/* Tombol aksi */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                {!student.is_approved && (
                    <Button
                        size="sm"
                        onClick={() => handleApprove(student)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-medium"
                    >
                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                        Setujui Akun
                    </Button>
                )}
                <Link href={`/share/${student.id}`} target="_blank" className={student.is_approved ? "flex-1" : ""}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Lihat Laporan
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(student)}
                    className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Hapus mahasiswa"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ===== HEADER ===== */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Manajemen Mahasiswa PKL</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    {students.length > 0
                        ? `${students.length} mahasiswa terdaftar · ${students.filter(s => !s.is_approved).length} menunggu persetujuan`
                        : "Kelola persetujuan akun dan data mahasiswa."}
                </p>
            </div>

            {/* ===== SEARCH BAR ===== */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="search"
                    placeholder="Cari nama, email, atau NIM..."
                    className="pl-9 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* ===== KONTEN ===== */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : students.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-white">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Belum Ada Mahasiswa</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Belum ada mahasiswa yang mendaftar di sistem ini.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center bg-white">
                    <Search className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">
                        Tidak ada mahasiswa yang cocok dengan pencarian <strong>&ldquo;{searchQuery}&rdquo;</strong>
                    </p>
                    <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => setSearchQuery("")}>
                        Hapus pencarian
                    </Button>
                </div>
            ) : (
                <>
                    {/* MOBILE: Card List */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {filtered.map((student) => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </div>

                    {/* DESKTOP: Tabel */}
                    <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                        <Table className="min-w-[860px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="font-semibold text-slate-700">Nama Mahasiswa</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Email</TableHead>
                                    <TableHead className="font-semibold text-slate-700">NIM</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Instansi PKL</TableHead>
                                    <TableHead className="text-center font-semibold text-slate-700">Laporan</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                    <TableHead className="text-right pr-6 font-semibold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-slate-50/50">
                                        {/* Nama */}
                                        <TableCell className="font-medium text-slate-900">
                                            {student.nama || (
                                                <span className="italic text-slate-400 text-xs">Belum isi profil</span>
                                            )}
                                        </TableCell>

                                        {/* Email */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                {student.email || "-"}
                                            </div>
                                        </TableCell>

                                        {/* NIM */}
                                        <TableCell className="text-sm text-slate-700">
                                            {student.nim || "-"}
                                        </TableCell>

                                        {/* Instansi */}
                                        <TableCell className="text-sm text-slate-700 max-w-[180px]">
                                            <span className="truncate block">{student.tempat_pkl || "-"}</span>
                                        </TableCell>

                                        {/* Total Laporan */}
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {student.laporan_count}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {student.is_approved ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Aksi */}
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {!student.is_approved && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(student)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3"
                                                        title="Setujui akun"
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                        Setujui
                                                    </Button>
                                                )}
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
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(student)}
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Hapus akun"
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
                </>
            )}
        </div>
    );
}