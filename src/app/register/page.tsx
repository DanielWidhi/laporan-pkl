"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi Password
        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Konfirmasi password tidak cocok!",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Perhatian",
                text: "Password minimal terdiri dari 6 karakter.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        setIsLoading(true);

        // Kirim data registrasi ke Supabase Auth
        const redirectUrl = `${window.location.origin}/verified`;

        // Kirim data registrasi ke Supabase Auth beserta target redirect
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
            },
        });

        setIsLoading(false);

        if (error) {
            Swal.fire({
                icon: "error",
                title: "Pendaftaran Gagal",
                text: error.message,
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        // Berhasil daftar!
        Swal.fire({
            icon: "success",
            title: "Pendaftaran Berhasil!",
            text: "Akun Anda berhasil dibuat. Silakan login.",
            confirmButtonColor: "#0f172a",
        }).then(() => {
            router.push("/login");
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Daftar Akun PKL
                    </CardTitle>
                    <CardDescription className="text-center">
                        Buat akun mahasiswa baru untuk mulai membuat laporan PKL
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@kampus.ac.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Ketik ulang password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
                        </Button>
                        <div className="text-sm text-center text-slate-500">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Masuk di sini
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}