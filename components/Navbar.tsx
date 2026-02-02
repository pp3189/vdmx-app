import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-darkbg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-widest text-slate-900 dark:text-white">VDMX</span>
              <span className="text-[0.6rem] font-semibold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">Risk Intelligence</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Inicio</Link>

            {/* Soluciones Dropdown */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${location.pathname === '/' || location.pathname === '/arrendamiento' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}>
                Soluciones <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-cardbg rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                <Link to="/" className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium border-b border-slate-50 dark:border-slate-800">
                  Riesgo Automotriz
                </Link>
                <Link to="/arrendamiento" className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                  Riesgo Arrendamiento
                </Link>
              </div>
            </div>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard')}`}>Mis Casos</Link>
            <Link to="/analyst" className={`text-sm font-medium transition-colors ${isActive('/analyst')}`}>Analyst Hub</Link>
            <Link to="/services" className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              Solicitar Reporte
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-500 dark:text-slate-300">
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-cardbg border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Inicio</Link>
            <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Servicios</Link>
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Mis Casos</Link>
            <Link to="/analyst" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Analyst Hub</Link>
          </div>
        </div>
      )}
    </nav>
  );
};