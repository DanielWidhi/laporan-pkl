"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        async function checkAuthAndRole() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (!profile) {
                router.replace("/login");
                return;
            }

            // 1. Cek approval untuk role mahasiswa
            if (profile.role !== "admin" && !profile.is_approved) {
                router.replace("/pending");
                return;
            }

            // 2. Cek onboarding kelengkapan profil
            if (
                profile.role !== "admin" &&
                profile.is_approved &&
                !profile.nama &&
                pathname !== "/dashboard/profil"
            ) {
                router.replace("/dashboard/profil");
                return;
            }

            // 3. Batasi akses halaman admin
            if (profile.role !== "admin" && pathname.startsWith("/dashboard/admin")) {
                router.replace("/dashboard");
                return;
            }

            setUserRole(profile.role);
            setUserName(profile.nama);
            setIsLoading(false);
        }

        checkAuthAndRole();
    }, [router, pathname, supabase]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    <p className="text-sm text-slate-500 font-medium">Memeriksa hak akses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
            {/* Grid: Sidebar + Konten utama */}
            <div className="grid flex-1 w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar role={userRole} />
                <div className="flex flex-col min-w-0">
                    {/* Kirim role dan userName ke Header */}
                    <Header role={userRole} userName={userName} />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-white min-w-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* Footer full-width, tanpa link Login & Daftar */}
            <Footer variant="dashboard" />
        </div>
    );
}