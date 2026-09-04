"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
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

export default function VerifiedPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Main content */}
            <main className="flex flex-1 items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg text-center">
                    <CardHeader className="space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            Email Berhasil Diverifikasi!
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm">
                            Terima kasih telah mengonfirmasi alamat email Anda. Akun Anda telah aktif di sistem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-slate-50 border p-4 text-xs text-slate-500 text-left space-y-1.5">
                            <p className="font-semibold text-slate-700">Langkah Berikutnya:</p>
                            <p>1. Silakan login menggunakan email dan password Anda.</p>
                            <p>2. Jika akun belum disetujui oleh Admin, silakan tunggu verifikasi admin.</p>
                            <p>3. Setelah disetujui, Anda dapat melengkapi profil dan mulai mencatat laporan.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                Masuk ke Akun Sekarang
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}