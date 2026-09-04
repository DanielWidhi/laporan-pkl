"use client";

import { useState } from "react";
import Link from "next/link";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserCheck, Eye, Trash2 } from "lucide-react";

// Data dummy mahasiswa
const initialStudents = [
    {
        id: "mhs-001",
        nama: "Budi Santoso",
        nim: "123456789",
        tempatPkl: "PT Teknologi Nusantara",
        isApproved: true,
        totalLaporan: 24,
    },
    {
        id: "mhs-002",
        nama: "Siti Aminah",
        nim: "987654321",
        tempatPkl: "CV Kreatif Digital",
        isApproved: true,
        totalLaporan: 12,
    },
    {
        id: "mhs-003",
        nama: "Andi Wijaya",
        nim: "456789123",
        tempatPkl: "Dinas Kominfo Provinsi",
        isApproved: false, // Menunggu persetujuan
        totalLaporan: 0,
    },
];

export default function AdminMahasiswaPage() {
    const [students, setStudents] = useState(initialStudents);
    const [searchQuery, setSearchQuery] = useState("");

    // Fungsi simulasi untuk menyetujui akun mahasiswa
    const handleApprove = (id: string) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === id ? { ...student, isApproved: true } : student
            )
        );
        alert("Akun mahasiswa berhasil disetujui!");
    };

    // Fungsi simulasi untuk menghapus mahasiswa
    const handleDelete = (id: string) => {
        const confirmDelete = confirm(
            "Yakin ingin menghapus mahasiswa ini? Semua laporan hariannya juga akan terhapus permanen!"
        );
        if (confirmDelete) {
            setStudents((prev) => prev.filter((student) => student.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Admin */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Data Mahasiswa PKL</h1>
                <p className="text-sm text-slate-500">
                    Kelola persetujuan akun dan pantau kegiatan mahasiswa.
                </p>
            </div>

            {/* Toolbar (Search) */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        type="search"
                        placeholder="Cari nama atau NIM..."
                        className="pl-8 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabel Data Mahasiswa */}
            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Nama Mahasiswa</TableHead>
                            <TableHead>NIM</TableHead>
                            <TableHead>Tempat PKL</TableHead>
                            <TableHead className="text-center">Total Laporan</TableHead>
                            <TableHead>Status Akun</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students
                            .filter((s) =>
                                s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.nim.includes(searchQuery)
                            )
                            .map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.nama}</TableCell>
                                    <TableCell>{student.nim}</TableCell>
                                    <TableCell>{student.tempatPkl}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                                            {student.totalLaporan}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {student.isApproved ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                                                Aktif
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                Menunggu Approval
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Buka menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                {/* Jika belum diapprove, muncul tombol Approve */}
                                                {!student.isApproved && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleApprove(student.id)}
                                                        className="text-emerald-600 font-medium cursor-pointer"
                                                    >
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        Setujui Akun
                                                    </DropdownMenuItem>
                                                )}

                                                <Link href={`/share/${student.id}`}>
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Lihat Laporan
                                                    </DropdownMenuItem>
                                                </Link>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(student.id)}
                                                    className="text-red-600 font-medium cursor-pointer focus:bg-red-50 focus:text-red-700"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus Mahasiswa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}