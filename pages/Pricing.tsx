import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PACKAGES } from '../constants';
import { ServiceType } from '../types';

export const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ServiceType>('AUTOMOTIVE');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'leasing') setActiveTab('LEASING');
    else setActiveTab('AUTOMOTIVE');
  }, [location]);

  const filteredPackages = PACKAGES.filter(p => p.type === activeTab);

  const handleSelectPackage = (id: string) => {
    navigate(`/checkout/${id}`);
  };

  return (
    <div className="py-16 min-h-screen bg-white dark:bg-darkbg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Planes de Análisis de Riesgo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Seleccione el nivel de profundidad requerido. No entregamos datos crudos, entregamos inteligencia procesada y accionable.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('AUTOMOTIVE')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'AUTOMOTIVE'
                  ? 'bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Riesgo Automotriz
            </button>
            <button
              onClick={() => setActiveTab('LEASING')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'LEASING'
                  ? 'bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Riesgo Arrendamiento
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative flex flex-col p-8 rounded-3xl border ${
                pkg.recommended 
                  ? 'border-primary dark:border-primary bg-slate-50 dark:bg-slate-800/50 shadow-2xl shadow-primary/10' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-cardbg'
              }`}
            >
              {pkg.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider uppercase">
                  Más Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 h-10">{pkg.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">${pkg.price}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">MXN</span>
              </div>

              <button
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full py-4 rounded-xl font-bold mb-8 transition-all ${
                  pkg.recommended
                    ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Seleccionar Plan
              </button>

              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Incluye:</p>
                <ul className="space-y-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 p-8 rounded-2xl bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-slate-700 text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl">lock_clock</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tiempo de Entrega & Privacidad</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              La mayoría de los reportes se entregan en menos de 24 horas hábiles. Para análisis Premium, el tiempo es de 48-72 horas debido a validaciones manuales profundas. Sus datos están encriptados y protegidos bajo estrictos protocolos de confidencialidad.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
