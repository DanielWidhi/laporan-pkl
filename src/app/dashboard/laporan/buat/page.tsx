"use client";

import { useState } from "react";
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
import { MapPin, Clock } from "lucide-react";

export default function BuatLaporanPage() {
    const [lokasi, setLokasi] = useState("");
    const [waktu, setWaktu] = useState("");
    const [isLoadingLokasi, setIsLoadingLokasi] = useState(false);

    // Fungsi untuk mengambil titik kordinat GPS dari HP/Laptop
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
                    alert("Gagal mengambil lokasi. Pastikan izin lokasi (GPS) diaktifkan.");
                    setIsLoadingLokasi(false);
                }
            );
        } else {
            alert("Browser Anda tidak mendukung fitur lokasi.");
            setIsLoadingLokasi(false);
        }
    };

    // Fungsi untuk set jam otomatis berdasarkan waktu sekarang
    const handleSetWaktuSekarang = () => {
        const now = new Date();
        // Format menjadi HH:MM (contoh: 08:30 atau 17:15)
        const jam = now.getHours().toString().padStart(2, "0");
        const menit = now.getMinutes().toString().padStart(2, "0");
        setWaktu(`${jam}:${menit}`);
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Buat Laporan Harian</CardTitle>
                    <CardDescription>
                        Isi aktivitas PKL/Magang Anda hari ini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Tanggal */}
                    <div className="space-y-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <Input id="tanggal" type="date" required />
                    </div>

                    {/* Deskripsi Aktivitas */}
                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi Aktivitas Harian</Label>
                        <Textarea
                            id="deskripsi"
                            placeholder="Contoh: Hari ini saya mempelajari cara setup Next.js dan Tailwind..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>

                    {/* Jam Absen */}
                    <div className="space-y-2">
                        <Label htmlFor="waktu">Waktu (Absen Masuk / Pulang)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="waktu"
                                type="time"
                                value={waktu}
                                onChange={(e) => setWaktu(e.target.value)}
                                required
                            />
                            <Button type="button" variant="secondary" onClick={handleSetWaktuSekarang}>
                                <Clock className="w-4 h-4 mr-2" />
                                Jam Sekarang
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Pilih waktu secara manual atau klik "Jam Sekarang".
                        </p>
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-2">
                        <Label htmlFor="lokasi">Titik Lokasi (Koordinat)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="lokasi"
                                type="text"
                                placeholder="-6.200000, 106.816666"
                                value={lokasi}
                                onChange={(e) => setLokasi(e.target.value)}
                                readOnly // Supaya user tidak memalsukan kordinat dengan mengetik manual
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAmbilLokasi}
                                disabled={isLoadingLokasi}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                {isLoadingLokasi ? "Mencari..." : "Ambil Lokasi"}
                            </Button>
                        </div>
                    </div>

                    {/* Upload Gambar */}
                    <div className="space-y-2">
                        <Label htmlFor="gambar">Foto Aktivitas (Opsional)</Label>
                        <Input id="gambar" type="file" accept="image/*" />
                        <p className="text-xs text-slate-500">
                            Format: JPG, PNG. Maksimal 2MB.
                        </p>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                    <Button variant="outline" type="button">Batal</Button>
                    <Button type="submit">Simpan Laporan</Button>
                </CardFooter>
            </Card>
        </div>
    );
}