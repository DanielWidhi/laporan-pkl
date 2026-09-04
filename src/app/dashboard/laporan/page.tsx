"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
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
import { Badge } from "@/components/ui/badge";
import {
    PlusCircle,
    Share2,
    MapPin,
    Pencil,
    Trash2,
    Clock,
    Loader2,
    FileText,
} from "lucide-react";

interface Laporan {
    id: string;
    tanggal: string;
    deskripsi: string;
    absensi_masuk: string;
    absensi_pulang: string | null;
    lokasi: string;
    status_paraf: boolean;
}

export default function LaporanPage() {
    const router = useRouter();
    const supabase = createClient();

    const [laporanList, setLaporanList] = useState<Laporan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // 1. Ambil data laporan asli dari Supabase
    const fetchLaporan = async (uid: string) => {
        const { data, error } = await supabase
            .from("laporan_harian")
            .select("*")
            .eq("mahasiswa_id", uid)
            .order("tanggal", { ascending: false });

        if (error) {
            console.error("Error fetching data:", error);
        } else {
            setLaporanList(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        async function initUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUserId(user.id);
            fetchLaporan(user.id);
        }

        initUser();
    }, [router, supabase]);

    // Format jam dari timestamp (contoh: 08:30)
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 2. ABSEN PULANG LANGSUNG KE SUPABASE
    const handleAbsenPulang = (id: string) => {
        const now = new Date();
        const jamFormat = now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

        Swal.fire({
            title: "Absen Pulang Sekarang?",
            text: `Pukul ${jamFormat} akan dicatat sebagai waktu pulang Anda.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Absen Pulang!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from("laporan_harian")
                    .update({ absensi_pulang: now.toISOString() })
                    .eq("id", id);

                if (error) {
                    Swal.fire("Gagal", error.message, "error");
                    return;
                }

                // Update tampilan state lokal
                setLaporanList((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, absensi_pulang: now.toISOString() } : item
                    )
                );

                Swal.fire({
                    title: "Berhasil!",
                    text: `Absen pulang tercatat pada ${jamFormat}.`,
                    icon: "success",
                    confirmButtonColor: "#0f172a",
                });
            }
        });
    };

    // 3. EDIT DESKRIPSI KE SUPABASE
    const handleEdit = (laporan: Laporan) => {
        Swal.fire({
            title: "Edit Laporan Kegiatan",
            input: "textarea",
            inputValue: laporan.deskripsi,
            inputLabel: "Deskripsi Kegiatan",
            inputPlaceholder: "Tuliskan revisi kegiatan...",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Simpan Perubahan",
            cancelButtonText: "Batal",
            inputValidator: (value) => {
                if (!value) return "Deskripsi tidak boleh kosong!";
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from("laporan_harian")
                    .update({ deskripsi: result.value })
                    .eq("id", laporan.id);

                if (error) {
                    Swal.fire("Gagal", error.message, "error");
                    return;
                }

                setLaporanList((prev) =>
                    prev.map((item) =>
                        item.id === laporan.id ? { ...item, deskripsi: result.value } : item
                    )
                );

                Swal.fire("Tersimpan!", "Deskripsi kegiatan berhasil diperbarui.", "success");
            }
        });
    };

    // 4. HAPUS LAPORAN DARI SUPABASE
    const handleDelete = (id: string) => {
        Swal.fire({
            title: "Hapus Laporan Ini?",
            text: "Data yang dihapus dari Supabase tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { error } = await supabase
                    .from("laporan_harian")
                    .delete()
                    .eq("id", id);

                if (error) {
                    Swal.fire("Gagal", error.message, "error");
                    return;
                }

                setLaporanList((prev) => prev.filter((item) => item.id !== id));
                Swal.fire("Terhapus!", "Laporan telah dihapus dari database.", "success");
            }
        });
    };

    // 5. BAGIKAN LINK KE DOSEN (COPY TO CLIPBOARD)
    const handleShareLink = () => {
        if (!userId) return;
        const shareUrl = `${window.location.origin}/share/${userId}`;

        navigator.clipboard.writeText(shareUrl);
        Swal.fire({
            icon: "success",
            title: "Link Berhasil Disalin!",
            text: "Link laporan Anda telah disalin ke clipboard. Kirimkan link ini kepada Dosen Pembimbing Anda.",
            confirmButtonColor: "#0f172a",
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riwayat Laporan Harian</h1>
                    <p className="text-sm text-slate-500">
                        Daftar kegiatan PKL/Magang Anda yang tersimpan di sistem.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleShareLink}>
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
            {laporanList.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center bg-white">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Belum Ada Laporan</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Anda belum mengisi laporan harian. Mulai catat aktivitas pertama Anda hari ini!
                    </p>
                    <Link href="/dashboard/laporan/buat" className="mt-6 inline-block">
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Buat Laporan Sekarang
                        </Button>
                    </Link>
                </div>
            ) : (
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
                                    <TableCell>{formatTime(laporan.absensi_masuk)}</TableCell>
                                    <TableCell>
                                        {laporan.absensi_pulang ? (
                                            formatTime(laporan.absensi_pulang)
                                        ) : (
                                            <span className="text-slate-400 font-mono">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="line-clamp-2 text-sm">{laporan.deskripsi}</p>
                                    </TableCell>
                                    <TableCell>
                                        {laporan.lokasi ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${laporan.lokasi}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                                                title="Buka titik koordinat di Google Maps"
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                Buka Maps
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>

                                    {/* Status & Absen Pulang Cepat */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {laporan.status_paraf ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                                                    Disetujui
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                    Menunggu
                                                </Badge>
                                            )}

                                            {!laporan.absensi_pulang && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title="Klik untuk Absen Pulang sekarang"
                                                    onClick={() => handleAbsenPulang(laporan.id)}
                                                    className="h-7 px-2 text-xs flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Pulang
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Edit & Delete */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(laporan)}
                                                title="Edit Deskripsi"
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
            )}
        </div>
    );
}