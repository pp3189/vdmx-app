import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-darkbg dark:to-cardbg -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">verified</span>
            Inteligencia de Riesgo Certificada
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Decisiones Seguras.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sin Riesgos Ocultos.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Análisis técnico profundo para compraventa automotriz y arrendamiento inmobiliario. 
            Detectamos fraude documental, suplantación y gravámenes ocultos antes de que firmes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg transition-all shadow-xl shadow-blue-500/20">
              Ver Paquetes de Riesgo
            </Link>
            <Link to="/dashboard" className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all">
              Tengo un Folio
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white dark:bg-darkbg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Nuestras Especialidades</h2>
            <p className="text-slate-500 dark:text-slate-400">Análisis manual asistido por IA para máxima precisión.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Auto Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-cardbg border border-slate-200 dark:border-slate-700 p-8 hover:border-primary/50 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[150px]">directions_car</span>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-3xl">directions_car</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Riesgo Automotriz</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  Evite comprar autos robados, remarcados o con adeudos ocultos. Validamos identidad del vendedor, facturas y estado físico-legal.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Validación de Factura Original
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Detección de Reportes de Robo
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Historial de Empeños
                  </li>
                </ul>
                <Link to="/services?type=auto" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Explorar Paquetes <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Leasing Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-cardbg border border-slate-200 dark:border-slate-700 p-8 hover:border-primary/50 transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[150px]">real_estate_agent</span>
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                  <span className="material-symbols-outlined text-3xl">real_estate_agent</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Riesgo Arrendamiento</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  Proteja su inmueble. Evaluamos solvencia, identidad y antecedentes legales de inquilinos y avales con precisión forense.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Investigación de Buró de Crédito
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Validación de Identidad (INE/Pasaporte)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    Antecedentes Legales
                  </li>
                </ul>
                <Link to="/services?type=leasing" className="inline-flex items-center gap-2 text-purple-500 font-bold hover:gap-3 transition-all">
                  Explorar Paquetes <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-12">Metodología VDMX</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl">fingerprint</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Identidad Verificada</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Validamos biométricos y documentos oficiales contra bases gubernamentales.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl">psychology</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Análisis Humano + IA</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">La IA procesa datos, nuestros expertos validan el contexto y las sutilezas.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Reporte Certificado</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Entregables inalterables con hash criptográfico y validez legal.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
