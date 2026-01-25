import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, Droplets, Wrench, Waves } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0F172A] flex">
            {/* Sidebar Desktop (Hidden on Mobile usually, but let's make it simple responsive) */}
            <aside className="w-64 bg-[#1E293B] border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-black text-white">GP Admin</h1>
                    <p className="text-xs text-gray-400">Golden Park Manager</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-blue-500" /> Dashboard
                    </Link>
                    <div className="text-xs font-bold text-gray-500 uppercase px-3 pt-4 pb-2">Modules</div>
                    <Link href="/admin/kitchen" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <UtensilsCrossed className="w-5 h-5 text-amber-500" /> Cuisine
                    </Link>
                    <Link href="/admin/lavage" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Droplets className="w-5 h-5 text-blue-400" /> Lavage
                    </Link>
                    <Link href="/admin/mecanique" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Wrench className="w-5 h-5 text-orange-500" /> Mécanique
                    </Link>
                    <Link href="/admin/pool" className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Waves className="w-5 h-5 text-cyan-400" /> Piscine
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Mobile Header */}
                <div className="md:hidden bg-[#1E293B] border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-50">
                    <h1 className="text-lg font-black text-white">GP Admin</h1>
                    {/* Mobile Menu Trigger could go here */}
                </div>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
