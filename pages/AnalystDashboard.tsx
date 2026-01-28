import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SupportTicket, TicketStatus } from '../types';

import { API_BASE_URL } from '../config';

// --- MOCK DATA ---
const MOCK_CASE = {
  id: 'CASE-8821',
  serviceType: 'AUTOMOTIVE',
  package: 'auto-2', // Revisión Documental
  status: 'IN_ANALYSIS',
  clientData: {
    vin: '3T1K61AK5MU982101',
    placas: 'XAW-99-23',
    marca: 'Toyota',
    modelo: 'Camry',
    anio: '2021',
    tipo_factura: 'Factura de Origen',
    propietario_actual: 'Juan Pérez'
  },
  documents: [
    { id: 'factura', name: 'Factura Original.pdf', size: '2.4 MB', date: '2024-05-20 10:30' },
    { id: 'tarjeta', name: 'Tarjeta Circulación.jpg', size: '1.1 MB', date: '2024-05-20 10:31' }
  ]
};

const MOCK_TICKETS: SupportTicket[] = [
  {
    ticket_id: 'TCK-001',
    case_id: 'CASE-8821',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    message: 'No puedo subir la factura original, me da error de formato.',
    status: 'OPEN',
    created_at: '2024-05-21 09:15'
  },
  {
    ticket_id: 'TCK-002',
    case_id: 'CASE-8821',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    message: '¿Cuándo estará listo mi reporte? Lo necesito urgente.',
    status: 'CLOSED',
    created_at: '2024-05-20 14:30'
  },
  {
    ticket_id: 'TCK-003',
    case_id: 'CASE-9912',
    name: 'Maria Diaz',
    email: 'maria.d@test.com',
    message: 'Error al realizar el pago con tarjeta AMEX.',
    status: 'IN_PROGRESS',
    created_at: '2024-05-22 10:00'
  }
];

// --- CALCULATOR CONFIGURATION ---
const SCORING_CONFIG = {
  AUTOMOTIVE: {
    factors: [
      { id: 'credit', name: 'Estatus Crediticio (TransUnion)', weight: 0.20 },
      { id: 'pawn', name: 'Empeños / Gravámenes', weight: 0.20 },
      { id: 'theft', name: 'Historial de Robo / Choques', weight: 0.15 },
      { id: 'docs', name: 'Integridad Documental', weight: 0.20 },
      { id: 'vin', name: 'Coherencia VIN / Datos', weight: 0.15 },
      { id: 'seller', name: 'Perfil del Vendedor', weight: 0.10 }
    ]
  },
  LEASING: {
    factors: [
      { id: 'identity', name: 'Verificación de Identidad', weight: 0.20 },
      { id: 'docs', name: 'Integridad Documental', weight: 0.20 },
      { id: 'solvency', name: 'Solvencia / Ingresos', weight: 0.25 },
      { id: 'bureau', name: 'Buró de Crédito', weight: 0.20 },
      { id: 'digital', name: 'Riesgo Digital (Tel/Email)', weight: 0.10 },
      { id: 'coherence', name: 'Coherencia General', weight: 0.05 }
    ]
  }
};

type Tab = 'LIST' | 'DATA' | 'DOCS' | 'ANALYSIS' | 'SCORE' | 'REPORT' | 'SUPPORT';

export const AnalystDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ user: '', pass: '' });
  const [activeTab, setActiveTab] = useState<Tab>('LIST');
  const [selectedCase, setSelectedCase] = useState<typeof MOCK_CASE | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);

  // Score State
  const [scores, setScores] = useState<Record<string, number>>({});

  // Cases State (moved before handleLogin to fix scope)
  const [realCases, setRealCases] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState<string>('');

  // Login Handler - Now validates against backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // For MVP: Use the admin token stored securely on backend
    // The frontend sends credentials, backend validates them
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cases`, {
        headers: {
          'Authorization': `Bearer ${credentials.pass}` // Use password as token
        }
      });

      if (response.ok) {
        setIsLoggedIn(true);
        const data = await response.json();
        setRealCases(data);
      } else {
        alert('Credenciales inválidas. Configure ADMIN_SECRET_TOKEN en el servidor.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error de conexión al servidor.');
    }
  };

  const fetchCases = async () => {
    try {
      const token = credentials.pass || adminToken;
      const response = await fetch(`${API_BASE_URL}/api/admin/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRealCases(data);
      }
    } catch (e) {
      console.error('Error fetching cases', e);
    }
  }
} catch (e) {
  console.error('Error fetching cases', e);
}
  };

const handleUpdateStatus = async (newStatus: string) => {
  if (!selectedCase) return;
  try {
    const token = credentials.pass || adminToken;
    const response = await fetch(`${API_BASE_URL}/api/case/${selectedCase.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (response.ok) {
      // Update local state
      const updatedCase = { ...selectedCase, status: newStatus };
      setSelectedCase(updatedCase);

      // Update list state
      setRealCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status: newStatus } : c));
      alert('Estatus actualizado correctamente');
    } else {
      alert('Error actualizando estatus');
    }
  } catch (e) {
    console.error('Update error', e);
    alert('Error de red');
  }
};

const handleDeleteCase = async () => {
  if (!selectedCase) return;
  if (!window.confirm(`¿ESTÁS SEGURO? \n\nSe eliminará permanentemente el caso ${selectedCase.id} y todos sus datos.\nEsta acción no se puede deshacer.`)) {
    return;
  }

  try {
    const token = credentials.pass || adminToken;
    const response = await fetch(`${API_BASE_URL}/api/case/${selectedCase.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      alert('Caso eliminado exitosamente');
      // Remove from list
      setRealCases(prev => prev.filter(c => c.id !== selectedCase.id));
      // Close detail view
      setSelectedCase(null);
    } else {
      alert('Error eliminando el caso. Verifica permisos.');
    }
  } catch (e) {
    console.error('Delete error', e);
    alert('Error de red al eliminar');
  }
};

// Score Calculation
const calculateFinalScore = () => {
  if (!selectedCase) return 0;
  const config = selectedCase.serviceType === 'AUTOMOTIVE' ? SCORING_CONFIG.AUTOMOTIVE : SCORING_CONFIG.LEASING;
  let total = 0;
  config.factors.forEach(f => {
    const val = scores[f.id] || 0;
    total += val * f.weight;
  });
  // Normalize to 0-1000
  return Math.round(total * 10);
};

const finalScore = calculateFinalScore();

const getRiskLabel = (s: number) => {
  if (s >= 700) return { label: 'APROBADO', class: 'bg-green-500' };
  if (s >= 350) return { label: 'RIESGO', class: 'bg-yellow-500' };
  return { label: 'RIESGO ALTO', class: 'bg-red-500' };
};

const handleTicketStatusChange = (ticketId: string, newStatus: TicketStatus) => {
  setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, status: newStatus } : t));
};

if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Back to Home Logo */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-4 group z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300 backdrop-blur-sm shadow-xl">
          <span className="material-symbols-outlined text-3xl">shield_person</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-[0.2em] leading-none">VDMX</span>
          <span className="text-[0.65rem] font-medium text-slate-400 tracking-[0.3em] uppercase mt-1.5 group-hover:text-white transition-colors">Risk Intelligence</span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl mt-16 md:mt-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-4xl">shield_person</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Analyst Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Acceso Seguro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              value={credentials.user}
              onChange={e => setCredentials({ ...credentials, user: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              value={credentials.pass}
              onChange={e => setCredentials({ ...credentials, pass: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full py-3 bg-primary hover:bg-blue-600 rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-900/20">
            Iniciar Sesión
          </button>
          <p className="text-center text-xs text-slate-600 mt-4">
            Ingrese el token de admin configurado en ADMIN_SECRET_TOKEN del servidor.
          </p>
        </form>
      </div>
    </div>
  );
}

const riskLabel = getRiskLabel(finalScore);

return (
  <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
    {/* Header */}
    <header className="bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Internal Header Logo */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
          <div className="flex flex-col">
            <span className="font-bold text-white leading-none tracking-widest text-sm">VDMX</span>
            <span className="text-[0.5rem] font-bold text-slate-500 uppercase tracking-widest">Analyst Hub</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-white">Operador Senior</p>
          <p className="text-xs text-slate-500">ID: OP-4421</p>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>

    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar Tabs (Only if a case is selected) */}
      {selectedCase ? (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-white font-bold text-lg">{selectedCase.id}</h2>
            <span className="text-xs font-mono text-slate-500">{selectedCase.serviceType}</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'LIST', icon: 'arrow_back', label: 'Volver a Lista' },
              { id: 'DATA', icon: 'description', label: 'Datos del Caso' },
              { id: 'DOCS', icon: 'folder_open', label: 'Documentos' },
              { id: 'ANALYSIS', icon: 'fact_check', label: 'Análisis' },
              { id: 'SCORE', icon: 'calculate', label: 'Calculadora' },
              { id: 'REPORT', icon: 'picture_as_pdf', label: 'Reporte' },
              { id: 'SUPPORT', icon: 'support_agent', label: 'Soporte' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'LIST') setSelectedCase(null);
                  else setActiveTab(item.id as Tab);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id && item.id !== 'LIST'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-2 font-bold uppercase">Estado del Caso</div>
              <select
                value={selectedCase.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full bg-slate-900 text-white text-xs border border-slate-700 rounded px-2 py-2 outline-none focus:border-primary cursor-pointer"
              >
                <option value="PAYMENT_PENDING">PENDIENTE PAGO</option>
                <option value="PAID">PAGADO (Nueva)</option>
                <option value="IN_ANALYSIS">EN ANÁLISIS</option>
                <option value="WAITING_INFO">ESPERANDO INFO</option>
                <option value="COMPLETED">COMPLETADO</option>
                <option value="ARCHIVED">ARCHIVADO</option>
              </select>
            </div>

            <button
              onClick={handleDeleteCase}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              ELIMINAR CASO
            </button>
          </div>
        </aside>
      ) : null}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-8">

        {/* VIEW: CASE LIST */}
        {!selectedCase && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Casos Asignados</h2>
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Folio</th>
                    <th className="px-6 py-4">Servicio</th>
                    <th className="px-6 py-4">Paquete</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {/* REAL DATA RENDERING */}
                  {realCases.length > 0 ? (
                    realCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-white">{c.id}</td>
                        <td className="px-6 py-4 text-xs font-bold text-blue-400">{c.serviceType || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{c.packageId || 'Paquete Desconocido'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded border font-bold ${c.status === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            c.status === 'IN_ANALYSIS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              c.status === 'COMPLETED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedCase({ ...MOCK_CASE, ...c, clientData: c.formData || {}, documents: c.documents || [] }); setActiveTab('DATA'); }}
                            className="text-primary hover:text-white text-sm font-bold"
                          >
                            Abrir Caso
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-900/50 transition-colors">
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No hay casos reales aún (o cargando...)
                        <br />
                        <span className="text-xs">Mostrando Demo Abajo:</span>
                      </td>
                    </tr>
                  )}
                  {/* DEMO ROW */}
                  <tr className="hover:bg-slate-900/50 transition-colors opacity-50">
                    <td className="px-6 py-4 font-mono text-white">CASE-8821 (DEMO)</td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-400">AUTOMOTRIZ</td>
                    <td className="px-6 py-4 text-sm">Revisión Documental</td>
                    <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">IN_ANALYSIS</span></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedCase(MOCK_CASE); setActiveTab('DATA'); }}
                        className="text-primary hover:text-white text-sm font-bold"
                      >
                        Abrir Caso
                      </button>
                    </td>
                  </tr>
                  {/* More rows would go here */}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: DATA (Read Only) */}
        {selectedCase && activeTab === 'DATA' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Datos Capturados por Cliente</h2>

            {/* Lógica para soportar MOCK (clientData) y REAL (formData) */}
            {(() => {
              const displayData = selectedCase.formData || selectedCase.clientData || {};

              // Datos del Solicitante (NUEVOS)
              const requesterInfo = {
                nombre: displayData['solicitante_nombre'] || displayData['Nombre del Solicitante (Cliente)'] || 'No especificado',
                telefono: displayData['solicitante_telefono'] || displayData['Teléfono de Contacto'] || 'No especificado',
                email: displayData['solicitante_email'] || displayData['Correo Electrónico'] || 'No especificado'
              };

              // Datos del Investigado/Vendedor (EXISTENTES) - Mapeo Robust
              const targetInfo = {
                nombre: displayData['vendedor_nombre'] || displayData['propietario_actual'] || displayData['nombre'] || displayData['Nombre del Vendedor'] || displayData['Nombre Completo'] || 'No especificado',
                telefono: displayData['vendedor_telefono'] || displayData['telefono'] || displayData['Teléfono del Vendedor'] || 'No especificado',
                email: displayData['vendedor_email'] || displayData['email'] || displayData['Correo del Vendedor'] || 'No especificado'
              };

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 🔵 Tarjeta A: Solicitante (Cliente) */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-900/10">
                      <h3 className="text-blue-400 font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b border-blue-500/20 pb-2">
                        <span className="material-symbols-outlined">assignment_ind</span> Datos del Solicitante (Cliente)
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Nombre</label>
                          <div className="text-white font-medium text-lg">{requesterInfo.nombre}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Teléfono</label>
                            <div className="text-white font-medium flex items-center gap-2">
                              {requesterInfo.telefono}
                              {requesterInfo.telefono !== 'No especificado' && (
                                <a href={`tel:${requesterInfo.telefono}`} className="text-blue-400 hover:text-white bg-blue-500/10 p-1 rounded transition-colors"><span className="material-symbols-outlined text-sm">call</span></a>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Email</label>
                            <div className="text-white font-medium break-all text-sm">{requesterInfo.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🟠 Tarjeta B: Investigado (Vendedor/Arrendatario) */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-yellow-500/30 shadow-lg shadow-yellow-900/10">
                      <h3 className="text-yellow-500 font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b border-yellow-500/20 pb-2">
                        <span className="material-symbols-outlined">person_search</span> Datos del Investigado / Vendedor
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Nombre / Propietario</label>
                          <div className="text-white font-medium text-lg">{targetInfo.nombre}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Teléfono</label>
                            <div className="text-white font-medium flex items-center gap-2">
                              {targetInfo.telefono}
                              {targetInfo.telefono !== 'No especificado' && (
                                <a href={`tel:${targetInfo.telefono}`} className="text-yellow-400 hover:text-white bg-yellow-500/10 p-1 rounded transition-colors"><span className="material-symbols-outlined text-sm">call</span></a>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Email</label>
                            <div className="text-white font-medium break-all text-sm">{targetInfo.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resto de datos */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-8">
                    <div className="grid grid-cols-2 gap-8">
                      {Object.entries(displayData).map(([key, value]) => {
                        if (['solicitante_nombre', 'solicitante_telefono', 'solicitante_email', 'vendedor_nombre', 'vendedor_telefono', 'vendedor_email'].includes(key)) return null;
                        return (
                          <div key={key}>
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">{key.replace(/_/g, ' ')}</label>
                            <div className="text-white text-lg border-b border-slate-800 pb-2">{String(value)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-8 bg-yellow-900/20 border border-yellow-900/50 p-4 rounded text-yellow-500 text-sm">
                      <span className="font-bold mr-2">⚠️ MODO SOLO LECTURA:</span>
                      Como analista, no puede editar estos datos para mantener la integridad forense del caso.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: DOCS */}
        {selectedCase && activeTab === 'DOCS' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Expediente Digital</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCase.documents.map(doc => (
                <div key={doc.id} className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-primary/50 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-red-500">
                      <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{doc.size}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.name}</a>
                    ) : doc.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Cargado: {doc.date}</p>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-2 bg-primary hover:bg-blue-600 text-sm font-medium rounded-lg text-white transition-colors"
                    >
                      Visualizar
                    </a>
                  ) : (
                    <button disabled className="w-full py-2 bg-slate-900 text-sm font-medium rounded-lg text-slate-500 cursor-not-allowed">
                      No Disponible
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: ANALYSIS */}
        {selectedCase && activeTab === 'ANALYSIS' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Checklist de Validación</h2>
            <div className="space-y-4">
              {['Validación TransUnion', 'Integridad Factura', 'Validación SAT', 'Cadena de Propiedad'].map((check, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-medium text-white">{check}</span>
                  <div className="flex items-center gap-2">
                    <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-3 py-1 outline-none focus:border-primary">
                      <option>PENDIENTE</option>
                      <option>OK</option>
                      <option>INCONSISTENTE</option>
                      <option>NO APLICA</option>
                    </select>
                    <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
                      <span className="material-symbols-outlined">edit_note</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SCORE (CALCULATOR) */}
        {selectedCase && activeTab === 'SCORE' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Calculadora de Riesgo</h2>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{finalScore} <span className="text-base font-normal text-slate-500">/ 1000</span></div>
                <div className={`text-xs font-bold px-2 py-0.5 rounded text-white ${riskLabel.class}`}>{riskLabel.label}</div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-8 space-y-8">
              {(selectedCase.serviceType === 'AUTOMOTIVE' ? SCORING_CONFIG.AUTOMOTIVE : SCORING_CONFIG.LEASING).factors.map(factor => (
                <div key={factor.id}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">
                      {factor.name} <span className="text-slate-500 text-xs">({factor.weight * 100}%)</span>
                    </label>
                    <span className="font-mono font-bold text-primary">{scores[factor.id] || 0}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    value={scores[factor.id] || 0}
                    onChange={(e) => setScores({ ...scores, [factor.id]: parseInt(e.target.value) })}
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>Riesgo Crítico (0)</span>
                    <span>Sin Riesgo (100)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: REPORT */}
        {selectedCase && activeTab === 'REPORT' && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Generar Reporte Final</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              El sistema generará el PDF con los hallazgos validados y el score calculado de <strong>{finalScore}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold">Estado Crediticio</div>
                <div className="text-white">Aprobado</div>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800">
                <div className="text-xs text-slate-500 uppercase font-bold">Documentación</div>
                <div className="text-white">Validada</div>
              </div>
            </div>

            <button className="px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 mx-auto">
              <span className="material-symbols-outlined">print</span>
              Generar y Firmar Reporte PDF
            </button>
          </div>
        )}

        {/* VIEW: SUPPORT TICKETS */}
        {selectedCase && activeTab === 'SUPPORT' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Tickets de Soporte</h2>
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Ticket</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Mensaje</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tickets.filter(t => t.case_id === selectedCase.id).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay tickets asociados a este caso.</td>
                    </tr>
                  ) : (
                    tickets.filter(t => t.case_id === selectedCase.id).map(ticket => (
                      <tr key={ticket.ticket_id} className="hover:bg-slate-900/50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-white text-sm">{ticket.ticket_id}</div>
                          <div className="text-xs text-slate-500">{ticket.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{ticket.created_at}</td>
                        <td className="px-6 py-4 text-sm text-slate-300 max-w-xs">{ticket.message}</td>
                        <td className="px-6 py-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleTicketStatusChange(ticket.ticket_id, e.target.value as TicketStatus)}
                            className={`text-xs font-bold px-2 py-1 rounded border outline-none bg-transparent cursor-pointer ${ticket.status === 'OPEN' ? 'text-green-500 border-green-500/30' :
                              ticket.status === 'IN_PROGRESS' ? 'text-blue-500 border-blue-500/30' :
                                'text-slate-500 border-slate-500/30'
                              }`}
                          >
                            <option value="OPEN" className="bg-slate-900 text-green-500">OPEN</option>
                            <option value="IN_PROGRESS" className="bg-slate-900 text-blue-500">IN PROGRESS</option>
                            <option value="CLOSED" className="bg-slate-900 text-slate-500">CLOSED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  </div>
);
};