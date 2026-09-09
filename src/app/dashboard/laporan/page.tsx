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
    absensi_masuk: string | null;
    absensi_pulang: string | null;
    lokasi: string | null;
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

    const formatDate = (dateStr: string) =>
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

    const getHourMinute = (isoString: string | null) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

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

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEdit(true);

        // === VALIDASI TANGGAL DUPLIKAT SAAT EDIT ===
        const { data: existingReport } = await supabase
            .from("laporan_harian")
            .select("id")
            .eq("mahasiswa_id", userId)
            .eq("tanggal", editForm.tanggal)
            .neq("id", editForm.id)
            .limit(1);

        if (existingReport && existingReport.length > 0) {
            Swal.fire({
                icon: "error",
                title: "Tanggal Bentrok",
                text: `Anda sudah memiliki laporan di tanggal ${editForm.tanggal}. Silakan pilih tanggal lain.`,
                confirmButtonColor: "#0f172a",
            });
            setIsSavingEdit(false);
            return;
        }
        // ============================================

        const absensiMasukIso = editForm.jamMasuk
            ? new Date(`${editForm.tanggal}T${editForm.jamMasuk}:00`).toISOString()
            : null;

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

    const handleAbsenMasuk = (id: string) => {
        Swal.fire({
            title: "Absen Masuk Sekarang?",
            text: "Sistem akan mencatat jam saat ini dan mendeteksi lokasi GPS Anda.",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#0f172a",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Absen Masuk!",
            cancelButtonText: "Batal",
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject("Fitur GPS tidak didukung oleh browser ini.");
                    }
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            const lokasiStr = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                            const absensiMasukIso = new Date().toISOString();

                            const { error } = await supabase
                                .from("laporan_harian")
                                .update({ absensi_masuk: absensiMasukIso, lokasi: lokasiStr })
                                .eq("id", id);

                            if (error) {
                                reject(error.message);
                            } else {
                                resolve({ absensi_masuk: absensiMasukIso, lokasi: lokasiStr });
                            }
                        },
                        () => {
                            reject("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                    );
                }).catch(error => {
                    Swal.showValidationMessage(error);
                });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                setLaporanList((prev) =>
                    prev.map((item) =>
                        item.id === id ? {
                            ...item,
                            absensi_masuk: result.value.absensi_masuk,
                            lokasi: result.value.lokasi
                        } : item
                    )
                );
                Swal.fire({
                    title: "Berhasil!",
                    text: "Absen masuk dan lokasi berhasil dicatat.",
                    icon: "success",
                    confirmButtonColor: "#0f172a",
                });
            }
        });
    };

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

    const LaporanCard = ({ laporan }: { laporan: Laporan }) => (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
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
                ) : laporan.absensi_masuk ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Clock className="w-3 h-3" />
                        Belum Pulang
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        <Clock className="w-3 h-3" />
                        Belum Masuk
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">Masuk:</span>
                    {laporan.absensi_masuk ? (
                        <span className="font-bold text-slate-900">{formatTime(laporan.absensi_masuk)}</span>
                    ) : (
                        <button
                            onClick={() => handleAbsenMasuk(laporan.id)}
                            className="font-bold text-blue-600 underline decoration-blue-300 hover:text-blue-800 transition-colors"
                        >
                            Klik Absen
                        </button>
                    )}
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

            <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{laporan.deskripsi}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
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

                <div className="flex items-center gap-1">
                    {!laporan.absensi_pulang && laporan.absensi_masuk && (
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

            {laporanList.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <div className="flex flex-col gap-3 md:hidden">
                        {laporanList.map((laporan) => (
                            <LaporanCard key={laporan.id} laporan={laporan} />
                        ))}
                    </div>

                    <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
                        <Table className="min-w-[780px]">
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="w-[130px] font-semibold text-slate-700">Tanggal</TableHead>
                                    <TableHead className="w-[100px] font-semibold text-slate-700">Masuk</TableHead>
                                    <TableHead className="w-[120px] font-semibold text-slate-700">Pulang</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Deskripsi Kegiatan</TableHead>
                                    <TableHead className="w-[110px] font-semibold text-slate-700">Lokasi</TableHead>
                                    <TableHead className="w-[90px] text-right pr-4 font-semibold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {laporanList.map((laporan) => (
                                    <TableRow key={laporan.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium text-slate-900">
                                            {formatDate(laporan.tanggal)}
                                        </TableCell>

                                        <TableCell className="text-slate-700 font-mono text-sm">
                                            {laporan.absensi_masuk ? (
                                                formatTime(laporan.absensi_masuk)
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAbsenMasuk(laporan.id)}
                                                    className="h-7 px-2 text-xs flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                                >
                                                    <LogIn className="w-3.5 h-3.5" />
                                                    Masuk
                                                </Button>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {laporan.absensi_pulang ? (
                                                <span className="font-mono text-sm font-medium text-slate-900">
                                                    {formatTime(laporan.absensi_pulang)}
                                                </span>
                                            ) : laporan.absensi_masuk ? (
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
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <p className="line-clamp-2 text-sm text-slate-800">{laporan.deskripsi}</p>
                                        </TableCell>

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

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in-0 duration-200">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                                    <Label htmlFor="edit-masuk" className="text-xs font-semibold text-slate-700">Jam Masuk (Opsional)</Label>
                                    <Input
                                        id="edit-masuk"
                                        type="time"
                                        value={editForm.jamMasuk}
                                        onChange={(e) => setEditForm({ ...editForm, jamMasuk: e.target.value })}
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