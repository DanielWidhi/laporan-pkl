"use client";

import { useEffect, useState } from "react";
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
import { User, Building, BookOpen, Save, Loader2 } from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // State Tanggal Mulai dan Selesai
    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalSelesai, setTanggalSelesai] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        nama: "",
        nim: "",
        tempat_pkl: "",
        dosen_pembimbing: "",
        nip_pembimbing: "",
        mentor_lapangan: "",
        nip_mentor: "",
    });

    // 1. Ambil data profil dari Supabase
    useEffect(() => {
        async function loadProfile() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUserId(user.id);

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setFormData({
                    nama: data.nama || "",
                    nim: data.nim || "",
                    tempat_pkl: data.tempat_pkl || "",
                    dosen_pembimbing: data.dosen_pembimbing || "",
                    nip_pembimbing: data.nip_pembimbing || "",
                    mentor_lapangan: data.mentor_lapangan || "",
                    nip_mentor: data.nip_mentor || "",
                });

                // Membaca tanggal mulai & selesai jika sebelumnya sudah tersimpan
                if (data.waktu_pkl && data.waktu_pkl.includes(" s/d ")) {
                    const [mulai, selesai] = data.waktu_pkl.split(" s/d ");
                    setTanggalMulai(mulai || "");
                    setTanggalSelesai(selesai || "");
                }
            }

            setIsLoading(false);
        }

        loadProfile();
    }, [router, supabase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    // 2. Simpan data profil ke Supabase
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        if (!tanggalMulai || !tanggalSelesai) {
            Swal.fire({
                icon: "warning",
                title: "Perhatian",
                text: "Silakan pilih Tanggal Mulai dan Tanggal Selesai PKL!",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        setIsSaving(true);

        // Gabungkan tanggal mulai dan selesai (Contoh: "2026-09-01 s/d 2026-12-31")
        const waktuPklCombined = `${tanggalMulai} s/d ${tanggalSelesai}`;

        const { error } = await supabase
            .from("profiles")
            .update({
                nama: formData.nama,
                nim: formData.nim,
                tempat_pkl: formData.tempat_pkl,
                waktu_pkl: waktuPklCombined,
                dosen_pembimbing: formData.dosen_pembimbing,
                nip_pembimbing: formData.nip_pembimbing,
                mentor_lapangan: formData.mentor_lapangan,
                nip_mentor: formData.nip_mentor,
            })
            .eq("id", userId);

        setIsSaving(false);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menyimpan",
                text: error.message,
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Profil Berhasil Disimpan!",
            text: "Data profil PKL Anda telah diperbarui.",
            confirmButtonColor: "#0f172a",
        }).then(() => {
            router.push("/dashboard");
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
        <div className="max-w-4xl mx-auto w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profil PKL / Magang</h1>
                <p className="text-sm text-slate-500">
                    Lengkapi data di bawah ini. Data ini akan otomatis digunakan pada laporan harian dan kop surat dosen.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* CARD 1: DATA MAHASISWA */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Data Mahasiswa
                        </CardTitle>
                        <CardDescription>Informasi pribadi Anda sebagai peserta PKL.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Lengkap</Label>
                            <Input
                                id="nama"
                                placeholder="Masukkan nama lengkap"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nim">NIM (Nomor Induk Mahasiswa)</Label>
                            <Input
                                id="nim"
                                placeholder="Masukkan NIM"
                                value={formData.nim}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* CARD 2: DATA INSTANSI & TANGGAL PKL (DIPERBARUI) */}
                <Card className="shadow-sm mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="w-5 h-5 text-emerald-600" />
                            Data Instansi & Pelaksanaan
                        </CardTitle>
                        <CardDescription>Informasi tempat dan periode pelaksanaan PKL.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tempat_pkl">Nama Instansi / Perusahaan</Label>
                            <Input
                                id="tempat_pkl"
                                placeholder="Contoh: Kantor Camat Kuta Selatan"
                                value={formData.tempat_pkl}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Pemilihan Tanggal Mulai dan Tanggal Selesai */}
                        <div className="space-y-2">
                            <Label>Waktu Pelaksanaan PKL</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-slate-500 mb-1 block">Mulai:</span>
                                    <Input
                                        type="date"
                                        value={tanggalMulai}
                                        onChange={(e) => setTanggalMulai(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 mb-1 block">Selesai:</span>
                                    <Input
                                        type="date"
                                        value={tanggalSelesai}
                                        onChange={(e) => setTanggalSelesai(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CARD 3: PEMBIMBING & MENTOR */}
                <Card className="shadow-sm mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                            Data Pembimbing & Mentor
                        </CardTitle>
                        <CardDescription>Informasi dosen dari kampus dan mentor di tempat PKL.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-semibold text-sm text-slate-700">Dosen Pembimbing Kampus</h3>
                            <div className="space-y-2">
                                <Label htmlFor="dosen_pembimbing">Nama Dosen & Gelar</Label>
                                <Input
                                    id="dosen_pembimbing"
                                    placeholder="Nama Dosen Pembimbing"
                                    value={formData.dosen_pembimbing}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nip_pembimbing">NIP / NIDN Dosen</Label>
                                <Input
                                    id="nip_pembimbing"
                                    placeholder="NIP Dosen"
                                    value={formData.nip_pembimbing}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-semibold text-sm text-slate-700">Mentor / Pembimbing Lapangan</h3>
                            <div className="space-y-2">
                                <Label htmlFor="mentor_lapangan">Nama Mentor & Gelar</Label>
                                <Input
                                    id="mentor_lapangan"
                                    placeholder="Nama Mentor di Instansi"
                                    value={formData.mentor_lapangan}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nip_mentor">NIP / NIK Mentor (Opsional)</Label>
                                <Input
                                    id="nip_mentor"
                                    placeholder="NIP/NIK Jika ada"
                                    value={formData.nip_mentor}
                                    onChange={handleChange}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-slate-50 border-t py-4 rounded-b-xl">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Simpan Profil
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}