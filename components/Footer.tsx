import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-cardbg border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">shield_person</span>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">VDMX Risk Intelligence</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              Análisis técnico de riesgo para operaciones patrimoniales y contractuales. 
              Combatimos el fraude con inteligencia estructurada y verificación humana.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/services?type=auto" className="hover:text-primary transition-colors">Riesgo Automotriz</Link></li>
              <li><Link to="/services?type=leasing" className="hover:text-primary transition-colors">Riesgo Arrendamiento</Link></li>
              <li><span className="opacity-50 cursor-not-allowed">Validación de Identidad</span></li>
              <li><span className="opacity-50 cursor-not-allowed">Consultoría Corporativa</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">location_on</span>
                Ciudad de México, CDMX
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">mail</span>
                contacto@vdmx.com
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">call</span>
                +52 (55) 1234 5678
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2024 VDMX Risk Intelligence. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/privacy" className="hover:text-white">Aviso de Privacidad</Link>
            <Link to="/terms" className="hover:text-white">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};