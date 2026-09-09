"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, Loader2, ArrowLeft, Send, CalendarDays, CalendarRange } from "lucide-react";

export default function BuatLaporanPage() {
    const router = useRouter();
    const supabase = createClient();

    const today = new Date().toISOString().split("T")[0];

    // State untuk membedakan mode input
    const [mode, setMode] = useState<"harian" | "mingguan">("harian");

    // State Form
    const [tanggal, setTanggal] = useState(today);
    const [tanggalSelesai, setTanggalSelesai] = useState(today);
    const [lewatiLibur, setLewatiLibur] = useState(true);

    const [deskripsi, setDeskripsi] = useState("");
    const [waktu, setWaktu] = useState("");
    const [lokasi, setLokasi] = useState("");

    const [isLoadingLokasi, setIsLoadingLokasi] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }
            setUserId(user.id);
        }
        getUser();
    }, [router, supabase]);

    const handleAmbilLokasi = () => {
        setIsLoadingLokasi(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLokasi(`${lat}, ${lng}`);
                    setIsLoadingLokasi(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    Swal.fire({
                        icon: "warning",
                        title: "Izin Lokasi Ditolak",
                        text: "Pastikan GPS atau izin lokasi pada browser Anda telah diaktifkan.",
                        confirmButtonColor: "#0f172a",
                    });
                    setIsLoadingLokasi(false);
                }
            );
        } else {
            Swal.fire({
                icon: "error",
                title: "Tidak Didukung",
                text: "Browser Anda tidak mendukung fitur Geolocation.",
                confirmButtonColor: "#0f172a",
            });
            setIsLoadingLokasi(false);
        }
    };

    const handleSetWaktuSekarang = () => {
        const now = new Date();
        const jam = now.getHours().toString().padStart(2, "0");
        const menit = now.getMinutes().toString().padStart(2, "0");
        setWaktu(`${jam}:${menit}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setIsSubmitting(true);

        // LOGIKA MODE HARIAN
        if (mode === "harian") {
            if (!lokasi || !waktu) {
                Swal.fire("Perhatian", "Silakan lengkapi Jam Masuk dan Titik Lokasi terlebih dahulu.", "warning");
                setIsSubmitting(false);
                return;
            }

            // === VALIDASI TANGGAL DUPLIKAT (HARIAN) ===
            const { data: existingReport } = await supabase
                .from("laporan_harian")
                .select("id")
                .eq("mahasiswa_id", userId)
                .eq("tanggal", tanggal)
                .limit(1);

            if (existingReport && existingReport.length > 0) {
                Swal.fire({
                    icon: "error",
                    title: "Tanggal Sudah Ada",
                    text: `Anda sudah membuat laporan untuk tanggal ${tanggal}. Silakan edit laporan tersebut di menu Riwayat.`,
                    confirmButtonColor: "#0f172a",
                });
                setIsSubmitting(false);
                return;
            }
            // ==========================================

            const absensiMasukIso = new Date(`${tanggal}T${waktu}:00`).toISOString();

            const { error } = await supabase.from("laporan_harian").insert({
                mahasiswa_id: userId,
                tanggal: tanggal,
                deskripsi: deskripsi,
                absensi_masuk: absensiMasukIso,
                lokasi: lokasi,
            });

            if (error) {
                Swal.fire("Gagal", error.message, "error");
                setIsSubmitting(false);
                return;
            }
        }
        // LOGIKA MODE MINGGUAN (MULTI-HARI)
        else {
            const start = new Date(tanggal);
            const end = new Date(tanggalSelesai);

            if (end < start) {
                Swal.fire("Perhatian", "Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai.", "warning");
                setIsSubmitting(false);
                return;
            }

            const inserts = [];
            const datesToCheck = [];
            let curr = new Date(start);

            while (curr <= end) {
                const dayOfWeek = curr.getDay(); // 0 = Minggu, 6 = Sabtu

                if (lewatiLibur && (dayOfWeek === 0 || dayOfWeek === 6)) {
                    curr.setDate(curr.getDate() + 1);
                    continue;
                }

                const currDateStr = curr.toISOString().split("T")[0];
                datesToCheck.push(currDateStr);

                inserts.push({
                    mahasiswa_id: userId,
                    tanggal: currDateStr,
                    deskripsi: deskripsi,
                    absensi_masuk: null,
                    lokasi: null,
                });

                curr.setDate(curr.getDate() + 1);
            }

            if (inserts.length === 0) {
                Swal.fire("Perhatian", "Tidak ada hari kerja di rentang tanggal yang dipilih.", "warning");
                setIsSubmitting(false);
                return;
            }

            // === VALIDASI TANGGAL DUPLIKAT (MINGGUAN) ===
            const { data: existingDates } = await supabase
                .from("laporan_harian")
                .select("tanggal")
                .eq("mahasiswa_id", userId)
                .in("tanggal", datesToCheck);

            if (existingDates && existingDates.length > 0) {
                const duplicateList = existingDates.map(d => d.tanggal).join(", ");
                Swal.fire({
                    icon: "error",
                    title: "Ditemukan Tanggal Ganda",
                    text: `Laporan gagal dibuat karena tanggal berikut sudah ada di database Anda: ${duplicateList}`,
                    confirmButtonColor: "#0f172a",
                });
                setIsSubmitting(false);
                return;
            }
            // ===========================================

            const { error } = await supabase.from("laporan_harian").insert(inserts);

            if (error) {
                Swal.fire("Gagal", error.message, "error");
                setIsSubmitting(false);
                return;
            }
        }

        setIsSubmitting(false);

        Swal.fire({
            icon: "success",
            title: "Laporan Terkirim!",
            text: mode === "harian" ? "Laporan harian Anda berhasil disimpan." : "Laporan mingguan berhasil dijadwalkan.",
            confirmButtonColor: "#0f172a",
        }).then(() => {
            router.push("/dashboard/laporan");
        });
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-4">
            <Button
                variant="ghost"
                className="mb-2"
                onClick={() => router.push("/dashboard/laporan")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Riwayat
            </Button>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Buat Laporan Harian</CardTitle>
                    <CardDescription>
                        Isi aktivitas dan kehadiran PKL/Magang Anda.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">

                        {/* TOGGLE MODE HARIAN / MINGGUAN */}
                        <div className="flex p-1 space-x-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setMode("harian")}
                                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${mode === "harian" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <CalendarDays className="w-4 h-4 mr-2" />
                                1 Hari (Harian)
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("mingguan")}
                                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${mode === "mingguan" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <CalendarRange className="w-4 h-4 mr-2" />
                                Multi-Hari (Mingguan)
                            </button>
                        </div>

                        {/* Tanggal Laporan */}
                        {mode === "harian" ? (
                            <div className="space-y-2">
                                <Label htmlFor="tanggal">Tanggal Kegiatan</Label>
                                <Input
                                    id="tanggal"
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                                        <Input
                                            id="tanggalMulai"
                                            type="date"
                                            value={tanggal}
                                            onChange={(e) => setTanggal(e.target.value)}
                                            required
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                                        <Input
                                            id="tanggalSelesai"
                                            type="date"
                                            value={tanggalSelesai}
                                            onChange={(e) => setTanggalSelesai(e.target.value)}
                                            required
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="lewatiLibur"
                                        checked={lewatiLibur}
                                        onChange={(e) => setLewatiLibur(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                                    />
                                    <Label htmlFor="lewatiLibur" className="text-sm font-medium cursor-pointer">
                                        Lewati Hari Libur (Sabtu & Minggu)
                                    </Label>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Catatan: Jam Absen Masuk & Lokasi dapat Anda klik langsung pada menu "Riwayat Laporan" setiap harinya.
                                </p>
                            </div>
                        )}

                        {/* Deskripsi Kegiatan */}
                        <div className="space-y-2">
                            <Label htmlFor="deskripsi">Deskripsi Aktivitas</Label>
                            <Textarea
                                id="deskripsi"
                                placeholder={mode === "harian" ? "Tuliskan aktivitas yang Anda kerjakan hari ini..." : "Tuliskan aktivitas rutinitas untuk beberapa hari ke depan..."}
                                className="min-h-[120px]"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                required
                            />
                        </div>

                        {/* JAM MASUK & LOKASI (HANYA TAMPIL DI MODE HARIAN) */}
                        {mode === "harian" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="waktu">Jam Masuk</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="waktu"
                                            type="time"
                                            value={waktu}
                                            onChange={(e) => setWaktu(e.target.value)}
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="shrink-0"
                                            onClick={handleSetWaktuSekarang}
                                        >
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="hidden xs:inline">Jam Sekarang</span>
                                            <span className="xs:hidden">Sekarang</span>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Gunakan tombol "Jam Sekarang" untuk mencatat waktu hadir saat ini.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Titik Koordinat Kehadiran</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="lokasi"
                                            type="text"
                                            placeholder="Klik 'Ambil Lokasi' untuk mendeteksi GPS..."
                                            value={lokasi}
                                            readOnly
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="shrink-0"
                                            onClick={handleAmbilLokasi}
                                            disabled={isLoadingLokasi}
                                        >
                                            {isLoadingLokasi ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <MapPin className="w-4 h-4 mr-2 text-rose-600" />
                                            )}
                                            {isLoadingLokasi ? "Mencari..." : "Ambil Lokasi"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Koordinat diambil otomatis dari perangkat Anda sebagai bukti validitas kehadiran.
                                    </p>
                                </div>
                            </>
                        )}

                    </CardContent>
                    <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t pt-4">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full sm:w-auto"
                            onClick={() => router.push("/dashboard/laporan")}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Simpan Laporan
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}