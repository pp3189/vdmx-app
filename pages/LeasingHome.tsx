import React from 'react';
import { Link } from 'react-router-dom';
import { FeatureCard } from '../components/home/FeatureCard';
import { TrustSection } from '../components/home/TrustSection';
import { SEO } from '../components/SEO';

export const LeasingHome: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <SEO
                title="Riesgo Arrendamiento"
                description="Evaluación de riesgo para inquilinos. Detectamos ingresos simulados, estados de cuenta falsos e identidad suplantada."
            />
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-white dark:from-darkbg dark:to-cardbg -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                    {/* Vertical Tabs */}
                    <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-12 shadow-inner">
                        <Link to="/" className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                            Riesgo Automotriz
                        </Link>
                        <div className="px-6 py-2 rounded-lg bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 text-sm font-bold shadow-sm">
                            Riesgo Arrendamiento
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="material-symbols-outlined text-sm">real_estate_agent</span>
                        Protección Inmobiliaria
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
                        Evita fraudes antes de<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">firmar un contrato de arrendamiento.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                        Evaluamos ingresos reales, documentos financieros e identidad del arrendatario para reducir riesgos legales y económicos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/services?type=leasing" className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-all shadow-xl shadow-purple-500/20">
                            Ver Paquetes de Arrendamiento
                        </Link>
                        <Link to="/dashboard" className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all">
                            Tengo un Folio
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección: Fraudes Comunes en Arrendamiento */}
            <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Riesgos ocultos en inquilinos</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="receipt_long"
                            colorClass="purple"
                            title="Ingresos simulados"
                            description="Recibos de nómina editados o alterados digitalmente para aparentar solvencia."
                        />
                        <FeatureCard
                            icon="account_balance"
                            colorClass="red"
                            title="Estados de cuenta falsos"
                            description="Documentos bancarios apócrifos imposibles de verificar a simple vista."
                        />
                        <FeatureCard
                            icon="person_off"
                            colorClass="orange"
                            title="Identidad suplantada"
                            description="Uso de identificaciones robadas o alteradas para firmar contratos."
                        />
                    </div>
                </div>
            </section>

            {/* Sección: Qué revisamos (Arrendamiento) */}
            <section className="py-24 bg-white dark:bg-darkbg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Qué revisamos antes de que rentes tu propiedad</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Análisis forense de la capacidad financiera y honorabilidad del inquilino.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {/* Bloque 1: Identidad */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-purple-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">badge</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Identidad del Arrendatario</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Validación biométrica facial
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Consulta en listas negras (OFAC/SAT)
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Verificación de INE/Pasaporte Vigente
                                </li>
                            </ul>
                        </div>

                        {/* Bloque 2: Solvencia */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-purple-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ingresos Reales</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Detección de edición en documentos
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Análisis de metadatos en PDFs bancarios
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Cálculo de capacidad de pago real
                                </li>
                            </ul>
                        </div>

                        {/* Bloque 3: Historial */}
                        <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-purple-500/30 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-purple-600 mb-6">
                                <span className="material-symbols-outlined text-3xl">gavel</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Historial de Riesgo</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Juicios de arrendamiento previos
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Antecedentes penales federales
                                </li>
                                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    Comportamiento en Buró Legal
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Banner Score Arrendamiento */}
                    <div className="relative rounded-3xl bg-slate-900 overflow-hidden px-8 py-16 md:px-16 text-center shadow-2xl">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="relative z-10">
                            <span className="inline-block py-1 px-3 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-500/20">
                                Tecnología VDMX
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Score de Riesgo Inquilino</h2>
                            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
                                Score generado con evidencia documental, financiera y conductual. Integramos IA para validar la autenticidad de cada documento presentado.
                            </p>

                            {/* Visualización Gráfica Simple del Score */}
                            <div className="flex justify-center items-end gap-2 h-24 mb-8 opacity-90 max-w-sm mx-auto">
                                <div className="w-8 bg-red-500 h-[30%] rounded-t-sm"></div>
                                <div className="w-8 bg-orange-500 h-[60%] rounded-t-sm"></div>
                                <div className="w-8 bg-yellow-400 h-[40%] rounded-t-sm"></div>
                                <div className="w-8 bg-green-500 h-full rounded-t-sm shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
                            </div>

                            <Link to="/services?type=leasing" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                                Ver Paquetes de Renta
                            </Link>
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No firmes sin evaluar el riesgo</h3>
                        <p className="text-slate-500 dark:text-slate-400">Protege tu patrimonio con inteligencia certificada.</p>
                    </div>

                </div>
            </section>

            {/* Reutilizamos Trust Section si se desea, o se puede omitir para variar. El usuario pidió misma estructura. La repetiré por consistencia. */}
            <TrustSection iconColor="text-purple-600" />
        </div>
    );
};
