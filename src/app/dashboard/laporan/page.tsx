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
    CheckCircle2,
    CalendarDays,
    LogIn,
    LogOut as LogOutIcon,
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

    // State Modal Edit
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

    // 1. Ambil data laporan — diurutkan tanggal terbaru
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

    // Format tanggal "4 Sep 2026"
    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    // Format jam "08:30"
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getHourMinute = (isoString: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
        const jamFormat = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

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
            text: "Data yang dihapus tidak bisa dikembalikan!",
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
            text: "Kirimkan link ini kepada Dosen Pembimbing Anda.",
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

    // ===== EMPTY STATE =====
    const EmptyState = () => (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Belum Ada Laporan</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                Anda belum mengisi laporan harian. Mulai catat aktivitas pertama Anda hari ini!
            </p>
            <Link href="/dashboard/laporan/buat" className="mt-6 inline-block">
                <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Buat Laporan Sekarang
                </Button>
            </Link>
        </div>
    );

    // ===== MOBILE CARD per laporan =====
    const LaporanCard = ({ laporan }: { laporan: Laporan }) => (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            {/* Baris atas: tanggal + badge status pulang */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{formatDate(laporan.tanggal)}</span>
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

            {/* Jam masuk & pulang */}
            <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">Masuk:</span>
                    <span className="font-bold text-slate-900">{formatTime(laporan.absensi_masuk)}</span>
                </div>
                <div className="h-3 w-px bg-slate-300" />
                <div className="flex items-center gap-1.5">
                    <LogOutIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-medium">Pulang:</span>
                    <span className="font-bold text-slate-900">
                        {laporan.absensi_pulang ? formatTime(laporan.absensi_pulang) : "-"}
                    </span>
                </div>
            </div>

            {/* Deskripsi */}
            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{laporan.deskripsi}</p>

            {/* Footer: lokasi + aksi */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
                {/* Lokasi */}
                {laporan.lokasi ? (
                    <a
                        href={`https://www.google.com/maps?q=${laporan.lokasi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Lihat Lokasi</span>
                    </a>
                ) : (
                    <span className="text-xs text-slate-400">Lokasi tidak ada</span>
                )}

                {/* Tombol Aksi */}
                <div className="flex items-center gap-1">
                    {/* Absen Pulang — hanya tampil jika belum pulang */}
                    {!laporan.absensi_pulang && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAbsenPulang(laporan.id)}
                            className="h-8 px-2.5 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                        >
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Pulang
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleOpenEdit(laporan)}
                        title="Edit laporan"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(laporan.id)}
                        title="Hapus laporan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Riwayat Laporan Harian</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {laporanList.length > 0
                            ? `${laporanList.length} laporan tersimpan · diurutkan terbaru`
                            : "Daftar kegiatan PKL/Magang Anda."}
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleShareLink}>
                        <Share2 className="w-4 h-4 mr-2 shrink-0" />
                        <span className="hidden xs:inline">Bagikan ke </span>Dosen
                    </Button>
                    <Link href="/dashboard/laporan/buat" className="flex-1 sm:flex-none">
                        <Button className="w-full">
                            <PlusCircle className="w-4 h-4 mr-2 shrink-0" />
                            <span className="hidden xs:inline">Buat </span>Laporan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ===== CONTENT ===== */}
            {laporanList.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* MOBILE: Card List (hanya tampil di < md) */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {laporanList.map((laporan) => (
                            <LaporanCard key={laporan.id} laporan={laporan} />
                        ))}
                    </div>

                    {/* DESKTOP: Tabel (hanya tampil di >= md) */}
                    <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                        <Table className="min-w-[780px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="w-[130px] font-semibold text-slate-700">Tanggal</TableHead>
                                    <TableHead className="w-[90px] font-semibold text-slate-700">Masuk</TableHead>
                                    <TableHead className="w-[120px] font-semibold text-slate-700">Pulang</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Deskripsi Kegiatan</TableHead>
                                    <TableHead className="w-[110px] font-semibold text-slate-700">Lokasi</TableHead>
                                    <TableHead className="w-[90px] text-right pr-4 font-semibold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laporanList.map((laporan) => (
                                    <TableRow key={laporan.id} className="hover:bg-slate-50/50">
                                        {/* Tanggal */}
                                        <TableCell className="font-medium text-slate-900">
                                            {formatDate(laporan.tanggal)}
                                        </TableCell>

                                        {/* Jam Masuk */}
                                        <TableCell className="text-slate-700 font-mono text-sm">
                                            {formatTime(laporan.absensi_masuk)}
                                        </TableCell>

                                        {/* Jam Pulang */}
                                        <TableCell>
                                            {laporan.absensi_pulang ? (
                                                <span className="font-mono text-sm font-medium text-slate-900">
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

                                        {/* Lokasi */}
                                        <TableCell>
                                            {laporan.lokasi ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${laporan.lokasi}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                                                >
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    Maps
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </TableCell>

                                        {/* Aksi */}
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleOpenEdit(laporan)}
                                                    title="Edit laporan"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(laporan.id)}
                                                    title="Hapus laporan"
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

            {/* ===== MODAL EDIT ===== */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in-0 duration-200">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b pb-3 mb-4 gap-2">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-slate-900">Edit Laporan Harian</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Perbarui data tanggal, jam, kegiatan, atau koordinat lokasi.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full text-slate-400 hover:text-slate-700"
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

                            {/* Footer Modal */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSavingEdit}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSavingEdit}
                                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
                                >
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