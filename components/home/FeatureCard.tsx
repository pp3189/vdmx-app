import React from 'react';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    colorClass: string; // e.g., "red", "purple", "orange"
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, colorClass }) => {
    // Map simple color names to Tailwind classes for icon background and text
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-100 dark:bg-red-900/20 text-red-600';
            case 'purple': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600';
            case 'orange': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600';
            case 'blue': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600';
            case 'green': return 'bg-green-100 dark:bg-green-900/20 text-green-600';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600';
        }
    };

    return (
        <div className="bg-white dark:bg-cardbg p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getColorClasses(colorClass)}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </div>
    );
};
