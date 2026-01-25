export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white">Vue d'ensemble</h1>
                <div className="text-sm font-medium text-gray-400 bg-white/5 py-2 px-4 rounded-lg border border-white/5">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Sales Card */}
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">💰</span>
                    </div>
                    <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Chiffre d'Affaire (Jour)</h3>
                    <div className="text-3xl font-black text-white mt-1">2,850 DH</div>
                    <div className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                        ↑ 12% vs Hier
                    </div>
                </div>

                {/* Kitchen Orders */}
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🍔</span>
                    </div>
                    <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Commandes Cuisine</h3>
                    <div className="text-3xl font-black text-white mt-1">45</div>
                    <div className="text-orange-400 text-xs font-bold mt-2">
                        5 En cours de préparation
                    </div>
                </div>

                {/* Lavage Jobs */}
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🚗</span>
                    </div>
                    <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Lavage Auto</h3>
                    <div className="text-3xl font-black text-white mt-1">12</div>
                    <div className="text-blue-400 text-xs font-bold mt-2">
                        2 En attente
                    </div>
                </div>

                {/* Mecanique */}
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🔧</span>
                    </div>
                    <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Atelier Méca</h3>
                    <div className="text-3xl font-black text-white mt-1">3</div>
                    <div className="text-gray-400 text-xs font-bold mt-2">
                        Complet jusqu'à 14h
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                                    {i === 1 ? '🍔' : i === 2 ? '🚗' : '🏊'}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">Nouvelle Commande #{100 + i}</div>
                                    <div className="text-gray-500 text-xs">Il y a {i * 5} min • Mohamed Ali</div>
                                </div>
                                <div className="ml-auto font-mono text-cyan-400 text-sm font-bold">
                                    +{(i * 50)} DH
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white">
                    <h3 className="text-xl font-bold mb-2">Message Broadcast</h3>
                    <p className="text-blue-100 text-sm mb-6">Envoyer une notification à tous les utilisateurs (Promo, Event...).</p>
                    <button className="w-full bg-white text-blue-900 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
                        Créer un Message
                    </button>
                </div>
            </div>

        </div>
    );
}
