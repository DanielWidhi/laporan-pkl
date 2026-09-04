"use client";

import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/footer";

export default function PendingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg text-center">
                    <CardHeader className="space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Clock className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Menunggu Persetujuan
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm">
                            Pendaftaran Anda berhasil! Namun, akun Anda saat ini sedang menunggu verifikasi dan persetujuan dari Admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-slate-50 border p-4 text-xs text-slate-500 text-left space-y-1">
                            <p className="font-semibold text-slate-700">Apa yang harus dilakukan?</p>
                            <p>1. Hubungi admin atau penanggung jawab PKL Anda.</p>
                            <p>2. Minta admin untuk mengaktifkan akun Anda di sistem.</p>
                            <p>3. Silakan coba login kembali setelah disetujui.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Halaman Login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}