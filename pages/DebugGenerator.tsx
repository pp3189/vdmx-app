import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export const DebugGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const createTestCase = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/debug/create-case`, {
                method: 'POST'
            });
            const data = await response.json();

            // Redirect to dashboard with the new case
            navigate(`/dashboard?newCase=${data.id}`);
        } catch (e) {
            alert('Error creating test case');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-700">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-yellow-500">
                    <span className="material-symbols-outlined text-3xl">bug_report</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Generador de Pruebas</h1>
                <p className="text-slate-400 mb-8">
                    Crea un caso "PAGADO" instantáneamente para probar el formulario y la subida de documentos.
                </p>

                <button
                    onClick={createTestCase}
                    disabled={loading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">sync</span>
                    ) : (
                        <span className="material-symbols-outlined">bolt</span>
                    )}
                    {loading ? 'Generando...' : 'Crear Caso de Prueba'}
                </button>

                <p className="mt-4 text-xs text-slate-500 font-mono">
                    Bypass Payment Gateway enabled
                </p>
            </div>
        </div>
    );
};
