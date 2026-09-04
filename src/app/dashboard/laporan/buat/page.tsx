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
import { MapPin, Clock, Loader2, ArrowLeft, Send } from "lucide-react";

export default function BuatLaporanPage() {
    const router = useRouter();
    const supabase = createClient();

    // Ambil tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    const [tanggal, setTanggal] = useState(today);
    const [deskripsi, setDeskripsi] = useState("");
    const [waktu, setWaktu] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [isLoadingLokasi, setIsLoadingLokasi] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Ambil user ID yang sedang login
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

    // Fungsi ambil koordinat GPS
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

    // Fungsi set jam sekarang (HH:MM)
    const handleSetWaktuSekarang = () => {
        const now = new Date();
        const jam = now.getHours().toString().padStart(2, "0");
        const menit = now.getMinutes().toString().padStart(2, "0");
        setWaktu(`${jam}:${menit}`);
    };

    // Kirim data laporan ke Supabase
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return;

        if (!lokasi) {
            Swal.fire({
                icon: "warning",
                title: "Lokasi Belum Diambil",
                text: "Silakan klik tombol 'Ambil Lokasi' untuk memetakan titik koordinat kehadiran Anda.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        setIsSubmitting(true);

        // Format jam masuk ke ISO string timestamp
        const absensiMasukIso = new Date(`${tanggal}T${waktu}:00`).toISOString();

        const { error } = await supabase.from("laporan_harian").insert({
            mahasiswa_id: userId,
            tanggal: tanggal,
            deskripsi: deskripsi,
            absensi_masuk: absensiMasukIso,
            lokasi: lokasi,
            status_paraf: false,
        });

        setIsSubmitting(false);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal Mengirim Laporan",
                text: error.message,
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Laporan Terkirim!",
            text: "Laporan kegiatan harian Anda berhasil disimpan.",
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
                        Isi aktivitas dan kehadiran PKL/Magang Anda hari ini.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">

                        {/* Tanggal Laporan */}
                        <div className="space-y-2">
                            <Label htmlFor="tanggal">Tanggal</Label>
                            <Input
                                id="tanggal"
                                type="date"
                                value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)}
                                required
                            />
                        </div>

                        {/* Deskripsi Kegiatan */}
                        <div className="space-y-2">
                            <Label htmlFor="deskripsi">Deskripsi Aktivitas Harian</Label>
                            <Textarea
                                id="deskripsi"
                                placeholder="Tuliskan aktivitas atau pekerjaan yang Anda kerjakan hari ini secara rinci..."
                                className="min-h-[120px]"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                required
                            />
                        </div>

                        {/* Jam Absen Masuk */}
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

                        {/* Titik Lokasi GPS */}
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