"use client";

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
import { User, Building, BookOpen, Save } from "lucide-react";

export default function ProfilPage() {
    return (
        <div className="max-w-4xl mx-auto w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profil PKL / Magang</h1>
                <p className="text-sm text-slate-500">
                    Lengkapi data di bawah ini. Data ini akan ditampilkan pada kop surat laporan Anda.
                </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
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
                            <Input id="nama" placeholder="Masukkan nama lengkap" required defaultValue="Budi Santoso" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nim">NIM (Nomor Induk Mahasiswa)</Label>
                            <Input id="nim" placeholder="Masukkan NIM" required defaultValue="123456789" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="w-5 h-5 text-emerald-600" />
                            Data Instansi & Pelaksanaan
                        </CardTitle>
                        <CardDescription>Informasi tempat Anda melaksanakan PKL.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tempat_pkl">Nama Instansi / Perusahaan</Label>
                            <Input id="tempat_pkl" placeholder="Contoh: PT Teknologi Nusantara" required defaultValue="PT Teknologi Nusantara" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="waktu_pkl">Waktu Pelaksanaan</Label>
                            <Input id="waktu_pkl" placeholder="Contoh: 1 Sep - 31 Des 2026" required defaultValue="1 Sep 2026 - 31 Des 2026" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                            Data Pembimbing & Mentor
                        </CardTitle>
                        <CardDescription>Informasi dosen dari kampus dan mentor di lapangan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Kolom Dosen Pembimbing */}
                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-semibold text-sm text-slate-700">Dosen Pembimbing Kampus</h3>
                            <div className="space-y-2">
                                <Label htmlFor="dosen_pembimbing">Nama Dosen & Gelar</Label>
                                <Input id="dosen_pembimbing" placeholder="Nama Dosen Pembimbing" required defaultValue="Dr. Anita Wijaya, M.Kom" className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nip_pembimbing">NIP / NIDN Dosen</Label>
                                <Input id="nip_pembimbing" placeholder="NIP Dosen" required defaultValue="198001012005012001" className="bg-white" />
                            </div>
                        </div>

                        {/* Kolom Mentor Lapangan */}
                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-semibold text-sm text-slate-700">Mentor / Pembimbing Lapangan</h3>
                            <div className="space-y-2">
                                <Label htmlFor="mentor_lapangan">Nama Mentor & Gelar</Label>
                                <Input id="mentor_lapangan" placeholder="Nama Mentor di Instansi" required defaultValue="Agus Pratama" className="bg-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nip_mentor">NIP / NIK Mentor (Opsional)</Label>
                                <Input id="nip_mentor" placeholder="NIP/NIK Jika ada" className="bg-white" />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-slate-50 border-t py-4 rounded-b-xl">
                        <Button type="button" variant="outline">Batal</Button>
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Profil
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}