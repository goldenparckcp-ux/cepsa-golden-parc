"use client";

import React, { useState } from 'react';
import { Car, Clock, CheckCircle2, Droplets, AlertCircle } from 'lucide-react';

const MOCK_JOBS = [
    { id: 'WASH-101', car: 'Golf 7 (Noir)', plate: '12345-A-1', type: 'Lavage Complet', time: '10:30', status: 'processing' },
    { id: 'WASH-102', car: 'Clio 4 (Blanche)', plate: '9988-B-6', type: 'Lavage Rapide', time: '11:00', status: 'waiting' },
    { id: 'WASH-103', car: 'Range Rover', plate: '1122-H-1', type: 'Premium', time: '11:30', status: 'waiting' },
];

export default function LavageAdmin() {
    const [jobs, setJobs] = useState(MOCK_JOBS);

    const completeJob = (id: string) => {
        setJobs(jobs.filter(j => j.id !== id));
    };

    const startJob = (id: string) => {
        setJobs(jobs.map(j => j.id === id ? { ...j, status: 'processing' } : j));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Droplets className="text-blue-500 w-8 h-8" /> File d'Attente Lavage
                </h1>
                <div className="text-sm font-bold text-blue-200 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                    {jobs.length} Véhicules en attente
                </div>
            </div>

            <div className="space-y-4">
                {jobs.map((job, index) => (
                    <div
                        key={job.id}
                        className={`bg-[#1E293B] border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${job.status === 'processing'
                                ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden'
                                : 'border-white/10 opacity-80 hover:opacity-100'
                            }`}
                    >
                        {/* Progress Bar for Processing */}
                        {job.status === 'processing' && (
                            <div className="absolute top-0 left-0 h-1 bg-blue-500 w-full animate-pulse" />
                        )}

                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${job.status === 'processing' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <div className="text-xl font-black text-white flex items-center gap-2">
                                    {job.car}
                                    <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5">{job.plate}</span>
                                </div>
                                <div className="text-blue-400 font-bold text-sm mt-1">{job.type}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2 text-white font-bold text-lg">
                                    <Clock className="w-5 h-5 text-gray-400" /> {job.time}
                                </div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {job.status === 'processing' ? 'En Cours...' : 'En Attente'}
                                </div>
                            </div>

                            {job.status === 'processing' ? (
                                <button
                                    onClick={() => completeJob(job.id)}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all ml-auto md:ml-0"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Terminé
                                </button>
                            ) : (
                                <button
                                    onClick={() => startJob(job.id)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 ml-auto md:ml-0"
                                >
                                    Commencer
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {jobs.length === 0 && (
                    <div className="py-20 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-2xl">
                        <Car className="w-12 h-12 opacity-20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Piste Libre</h3>
                        <p>Aucun véhicule n'est en attente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
