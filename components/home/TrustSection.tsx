import React from 'react';

interface TrustItemProps {
    icon: string;
    title: string;
    description: string;
    colorClass?: string;
}

const TrustItem: React.FC<TrustItemProps> = ({ icon, title, description, colorClass = "text-primary" }) => (
    <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center mb-6 ${colorClass}`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
);

export const TrustSection: React.FC<{ iconColor?: string }> = ({ iconColor }) => {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-12">Metodología VDMX</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <TrustItem
                        icon="fingerprint"
                        title="Identidad Verificada"
                        description="Validamos biométricos e identificaciones contra RENAPO y listas oficiales."
                        colorClass={iconColor}
                    />
                    <TrustItem
                        icon="psychology"
                        title="Análisis Humano + IA"
                        description="La IA procesa datos, nuestros expertos validan el contexto y las sutilezas."
                        colorClass={iconColor}
                    />
                    <TrustItem
                        icon="verified_user"
                        title="Reporte Certificado"
                        description="Entregables inalterables con hash criptográfico y validez legal."
                        colorClass={iconColor}
                    />
                </div>
            </div>
        </section>
    );
};
