"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    PlusCircle,
    Share2,
    MapPin,
    Pencil,
    Trash2,
    Clock,
    Loader2,
    FileText,
    X,
    Save,
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

    // State Modal Edit Lengkap
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isLoadingGps, setIsLoadingGps] = useState(false);
    const [editForm, setEditForm] = useState({
        id: "",
        tanggal: "",
        deskripsi: "",
        jamMasuk: "",
        jamPulang: "",
        lokasi: "",
    });

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

    // Format jam (contoh: "08:30")
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getHourMinute = (isoString: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const jam = date.getHours().toString().padStart(2, "0");
        const menit = date.getMinutes().toString().padStart(2, "0");
        return `${jam}:${menit}`;
    };

    // 2. BUKA MODAL EDIT
    const handleOpenEdit = (laporan: Laporan) => {
        setEditForm({
            id: laporan.id,
            tanggal: laporan.tanggal,
            deskripsi: laporan.deskripsi,
            jamMasuk: getHourMinute(laporan.absensi_masuk),
            jamPulang: getHourMinute(laporan.absensi_pulang),
            lokasi: laporan.lokasi || "",
        });
        setIsEditModalOpen(true);
    };

    const handleAmbilGpsEdit = () => {
        setIsLoadingGps(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setEditForm((prev) => ({
                        ...prev,
                        lokasi: `${pos.coords.latitude}, ${pos.coords.longitude}`,
                    }));
                    setIsLoadingGps(false);
                },
                () => {
                    Swal.fire("Peringatan", "Gagal mendeteksi GPS. Pastikan izin lokasi aktif.", "warning");
                    setIsLoadingGps(false);
                }
            );
        } else {
            setIsLoadingGps(false);
        }
    };

    // 3. SIMPAN EDIT
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEdit(true);

        const absensiMasukIso = new Date(`${editForm.tanggal}T${editForm.jamMasuk}:00`).toISOString();
        const absensiPulangIso = editForm.jamPulang
            ? new Date(`${editForm.tanggal}T${editForm.jamPulang}:00`).toISOString()
            : null;

        const { error } = await supabase
            .from("laporan_harian")
            .update({
                tanggal: editForm.tanggal,
                deskripsi: editForm.deskripsi,
                absensi_masuk: absensiMasukIso,
                absensi_pulang: absensiPulangIso,
                lokasi: editForm.lokasi,
            })
            .eq("id", editForm.id);

        setIsSavingEdit(false);

        if (error) {
            Swal.fire("Gagal", error.message, "error");
            return;
        }

        setLaporanList((prev) =>
            prev.map((item) =>
                item.id === editForm.id
                    ? {
                        ...item,
                        tanggal: editForm.tanggal,
                        deskripsi: editForm.deskripsi,
                        absensi_masuk: absensiMasukIso,
                        absensi_pulang: absensiPulangIso,
                        lokasi: editForm.lokasi,
                    }
                    : item
            )
        );

        setIsEditModalOpen(false);

        Swal.fire({
            icon: "success",
            title: "Perubahan Tersimpan!",
            text: "Seluruh data laporan kegiatan berhasil diperbarui.",
            confirmButtonColor: "#0f172a",
        });
    };

    // 4. ABSEN PULANG INSTAN
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

    // 5. HAPUS LAPORAN
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

    // 6. BAGIKAN LINK KE DOSEN
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

            {/* Table Section (Tanpa Kolom Status) */}
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
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[120px]">Tanggal</TableHead>
                                <TableHead className="w-[90px]">Masuk</TableHead>
                                <TableHead className="w-[110px]">Pulang</TableHead>
                                <TableHead className="min-w-[280px]">Deskripsi Kegiatan</TableHead>
                                <TableHead className="w-[120px]">Lokasi</TableHead>
                                <TableHead className="w-[90px] text-right pr-4">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {laporanList.map((laporan) => (
                                <TableRow key={laporan.id}>
                                    {/* Tanggal */}
                                    <TableCell className="font-medium">
                                        {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </TableCell>

                                    {/* Jam Masuk */}
                                    <TableCell className="text-slate-700">
                                        {formatTime(laporan.absensi_masuk)}
                                    </TableCell>

                                    {/* Jam Pulang (Jika belum, langsung tombol Pulang) */}
                                    <TableCell>
                                        {laporan.absensi_pulang ? (
                                            <span className="font-medium text-slate-900">
                                                {formatTime(laporan.absensi_pulang)}
                                            </span>
                                        ) : (
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
                                    </TableCell>

                                    {/* Deskripsi */}
                                    <TableCell>
                                        <p className="line-clamp-2 text-sm text-slate-800">{laporan.deskripsi}</p>
                                    </TableCell>

                                    {/* Lokasi Maps */}
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
                                                Maps
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>

                                    {/* Tombol Edit & Delete */}
                                    <TableCell className="text-right pr-4">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleOpenEdit(laporan)}
                                                title="Edit Seluruh Data Laporan"
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

            {/* MODAL EDIT LENGKAP */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Edit Laporan Harian</h3>
                                <p className="text-xs text-slate-500">Perbarui data tanggal, jam, kegiatan, atau koordinat lokasi.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tanggal" className="text-xs font-semibold text-slate-700">Tanggal Kegiatan</Label>
                                <Input
                                    id="edit-tanggal"
                                    type="date"
                                    value={editForm.tanggal}
                                    onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-masuk" className="text-xs font-semibold text-slate-700">Jam Masuk</Label>
                                    <Input
                                        id="edit-masuk"
                                        type="time"
                                        value={editForm.jamMasuk}
                                        onChange={(e) => setEditForm({ ...editForm, jamMasuk: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-pulang" className="text-xs font-semibold text-slate-700">Jam Pulang (Opsional)</Label>
                                    <Input
                                        id="edit-pulang"
                                        type="time"
                                        value={editForm.jamPulang}
                                        onChange={(e) => setEditForm({ ...editForm, jamPulang: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-deskripsi" className="text-xs font-semibold text-slate-700">Deskripsi Kegiatan Harian</Label>
                                <Textarea
                                    id="edit-deskripsi"
                                    rows={4}
                                    value={editForm.deskripsi}
                                    onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                                    placeholder="Tuliskan detail pekerjaan Anda..."
                                    required
                                    className="resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-lokasi" className="text-xs font-semibold text-slate-700">Titik Koordinat Lokasi</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="edit-lokasi"
                                        value={editForm.lokasi}
                                        onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
                                        placeholder="Contoh: -8.7900, 115.1700"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAmbilGpsEdit}
                                        disabled={isLoadingGps}
                                        className="shrink-0 text-xs"
                                    >
                                        {isLoadingGps ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1" />
                                        )}
                                        Ambil GPS
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSavingEdit}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={isSavingEdit} className="bg-slate-900 hover:bg-slate-800">
                                    {isSavingEdit ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}