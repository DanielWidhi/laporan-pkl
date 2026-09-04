import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, ShieldCheck, MapPin, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar Simple */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6 lg:px-12">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>SiPekal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button>Daftar</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center px-4 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sistem Informasi Praktik Kerja Lapangan
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Catat Laporan Harian PKL Lebih <span className="text-blue-600">Praktis & Cepat</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Platform presensi berbasis lokasi GPS, rekap aktivitas magang harian, dan lembar laporan otomatis yang terhubung langsung secara real-time ke dosen pembimbing.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                Mulai Catat Kegiatan <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 bg-white">
                Masuk ke Akun
              </Button>
            </Link>
          </div>

          {/* Keunggulan Singkat */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t pt-10">
            <div className="p-4 rounded-lg bg-white border shadow-sm">
              <MapPin className="w-6 h-6 text-rose-500 mb-2" />
              <h3 className="font-semibold text-sm">Validasi Lokasi GPS</h3>
              <p className="text-xs text-slate-500 mt-1">Presensi tepat di lokasi magang secara akurat.</p>
            </div>
            <div className="p-4 rounded-lg bg-white border shadow-sm">
              <Clock className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-sm">Absen Jam Kerja</h3>
              <p className="text-xs text-slate-500 mt-1">Pencatatan jam masuk & jam pulang otomatis.</p>
            </div>
            <div className="p-4 rounded-lg bg-white border shadow-sm">
              <FileText className="w-6 h-6 text-emerald-500 mb-2" />
              <h3 className="font-semibold text-sm">Siap Cetak PDF</h3>
              <p className="text-xs text-slate-500 mt-1">Format A4 resmi yang terhubung langsung ke Dosen.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-slate-500 bg-white">
        © {new Date().getFullYear()} SiPekal. Dibangun untuk kemudahan mahasiswa magang.
      </footer>
    </div>
  );
}