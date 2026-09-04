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
import { Footer } from "@/components/footer";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Cek Login ke Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setIsLoading(false);
            Swal.fire({
                icon: "error",
                title: "Login Gagal",
                text: "Email atau password yang Anda masukkan salah!",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        // 2. Ambil data profil user dari tabel profiles
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

        setIsLoading(false);

        if (profileError || !profile) {
            Swal.fire({
                icon: "error",
                title: "Kesalahan",
                text: "Gagal mengambil data profil Anda.",
                confirmButtonColor: "#0f172a",
            });
            return;
        }

        // 3. Logika Percabangan Hak Akses & Alur Pengguna
        if (profile.role === "admin") {
            // Jika ADMIN -> Bebas masuk ke Dashboard
            Swal.fire({
                icon: "success",
                title: "Selamat Datang, Admin!",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                router.push("/dashboard");
            });
        } else {
            // Jika MAHASISWA:
            if (!profile.is_approved) {
                // Belum di-approve admin
                router.push("/pending");
            } else if (!profile.nama) {
                // Sudah di-approve tapi profil belum lengkap -> Onboarding
                Swal.fire({
                    icon: "info",
                    title: "Lengkapi Profil",
                    text: "Silakan lengkapi informasi PKL Anda terlebih dahulu.",
                    confirmButtonColor: "#0f172a",
                }).then(() => {
                    router.push("/dashboard/profil");
                });
            } else {
                // Semua sudah oke
                router.push("/dashboard");
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-sm shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            Login PKL
                        </CardTitle>
                        <CardDescription className="text-center">
                            Masukkan email dan password Anda untuk masuk ke sistem
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Memeriksa..." : "Masuk"}
                            </Button>
                            <div className="text-sm text-center text-slate-500">
                                Belum punya akun?{" "}
                                <Link href="/register" className="text-blue-600 hover:underline">
                                    Daftar di sini
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </main>
            <Footer />
        </div>
    );
}