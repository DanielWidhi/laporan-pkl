export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight mb-4">Beranda</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Nanti di sini kita taruh Card berisi total laporan, status PKL, dll */}
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Status PKL</h3>
                    <p className="text-sm text-muted-foreground mt-2">Sedang Berjalan</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <h3 className="font-semibold leading-none tracking-tight">Total Laporan</h3>
                    <p className="text-sm text-muted-foreground mt-2">0 Laporan</p>
                </div>
            </div>
        </div>
    );
}