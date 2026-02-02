import React from 'react';
import { Link } from 'react-router-dom';
import { FeatureCard } from '../components/home/FeatureCard';
import { TrustSection } from '../components/home/TrustSection';
import { SEO } from '../components/SEO';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Riesgo Automotriz"
        description="Evita fraudes automotrices. Detectamos siniestros ocultos, kilometraje alterado y adeudos en vehículos usados."
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-darkbg dark:to-cardbg -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Vertical Tabs */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-12 shadow-inner">
            <div className="px-6 py-2 rounded-lg bg-white dark:bg-slate-700 text-primary dark:text-blue-400 text-sm font-bold shadow-sm">
              Riesgo Automotriz
            </div>
            <Link to="/arrendamiento" className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Riesgo Arrendamiento
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">verified</span>
            Inteligencia de Riesgo Certificada
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
            Evita fraudes automotrices<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">antes de comprar o vender un vehículo.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Detectamos siniestros ocultos, kilometraje alterado y créditos o empeños activos en vehículos usados en México.
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

      {/* Sección: Fraudes Comunes (NUEVO) */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Los fraudes automotrices más comunes en México</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="car_crash"
              colorClass="red"
              title="Siniestros ocultos"
              description="Daños estructurales no declarados que afectan la seguridad y valor del auto."
            />
            <FeatureCard
              icon="speed"
              colorClass="orange"
              title="Kilometraje alterado"
              description="Odómetros manipulados para aparentar menor desgaste y aumentar el precio."
            />
            <FeatureCard
              icon="account_balance_wallet"
              colorClass="purple"
              title="Créditos o empeños activos"
              description="Vehículos con adeudos vigentes que impiden el cambio de propietario legal."
            />
          </div>
        </div>
      </section>

      {/* Sección: Qué revisamos (Automotriz) - REEMPLAZANDO Services Grid anterior */}
      <section className="py-24 bg-white dark:bg-darkbg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Qué revisamos antes de que compres un vehículo</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Nuestro análisis forense abarca más de 50 puntos de control para garantizar tu seguridad legal y financiera.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Bloque 1: Siniestros */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">minor_crash</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Siniestros</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Historial de aseguradoras
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Daños estructurales
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Pérdidas totales ocultas
                </li>
              </ul>
            </div>

            {/* Bloque 2: Kilometraje */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">history</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kilometraje</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Coherencia histórica de registros
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Señales de alteración física
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Desgaste vs. Odómetro
                </li>
              </ul>
            </div>

            {/* Bloque 3: Créditos */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">request_quote</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Créditos / Empeños</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Créditos automotrices activos
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Garantías vigentes en REPUVE
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Adeudos de tenencia y multas
                </li>
              </ul>
            </div>
          </div>

          {/* Banner Score Automotriz */}
          <div className="relative rounded-3xl bg-slate-900 overflow-hidden px-8 py-16 md:px-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                Tecnología VDMX
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Score de Riesgo Automotriz</h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
                El score se genera con evidencia técnica, no opiniones. Un algoritmo que pondera 50+ variables para decirte si es seguro comprar.
              </p>

              {/* Visualización Gráfica Simple del Score */}
              <div className="flex justify-center items-end gap-2 h-24 mb-8 opacity-90 max-w-sm mx-auto">
                <div className="w-8 bg-red-500 h-[30%] rounded-t-sm"></div>
                <div className="w-8 bg-orange-500 h-[50%] rounded-t-sm"></div>
                <div className="w-8 bg-yellow-400 h-[70%] rounded-t-sm"></div>
                <div className="w-8 bg-green-500 h-full rounded-t-sm shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
              </div>

              <Link to="/services" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                Ver Ejemplo de Reporte
              </Link>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h3 className="text-2xl font-serif italic text-slate-500 dark:text-slate-400">
              “Un vehículo puede verse bien por fuera, pero su historial es lo que define el riesgo.”
            </h3>
          </div>

        </div>
      </section>

      {/* Trust Section */}
      <TrustSection iconColor="text-primary" />
    </div>
  );
};
