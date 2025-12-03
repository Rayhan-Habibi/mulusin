import Sidebar from "../components/sidebar"; // Sesuaikan path

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar akan tetap statis di kiri */}
      <Sidebar />

      {/* Konten utama di kanan */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}