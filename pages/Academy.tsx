import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';

type AcademyModule = {
  id: string;
  title: string;
  area: 'Datos' | 'Riesgo' | 'Ciberseguridad';
  level: 'Fundamentos' | 'Intermedio' | 'Avanzado';
  hours: number;
  summary: string;
  outcomes: string[];
  challenge: string;
};

type AcademyState = {
  weeklyHours: number;
  completed: Record<string, number[]>;
  diagnostic: Record<string, number>;
  activeModuleId: string;
};

const STORAGE_KEY = 'vdmx-academy-state-v2';
const CODE_KEY = 'vdmx-academy-sync-code-v1';

const modules: AcademyModule[] = [
  {
    id: 'python', title: 'Python para análisis', area: 'Datos', level: 'Fundamentos', hours: 100,
    summary: 'Expresar lógica, transformar datos y automatizar investigaciones.',
    outcomes: ['Tipos, condiciones, ciclos y funciones', 'Archivos, JSON, excepciones y debugging', 'Scripts para clasificar señales de riesgo'],
    challenge: 'Procesar expedientes de empresas y generar flags sin confundir una señal con una conclusión.'
  },
  {
    id: 'sql', title: 'SQL y modelado analítico', area: 'Datos', level: 'Fundamentos', hours: 90,
    summary: 'Consultar y cruzar grandes conjuntos de datos empresariales con precisión.',
    outcomes: ['SELECT, JOIN, agregaciones y CTE', 'Relaciones, integridad e índices', 'Consultas reproducibles para investigación'],
    challenge: 'Detectar domicilios compartidos por múltiples empresas y separar coincidencias normales de señales investigables.'
  },
  {
    id: 'systems', title: 'Linux, redes y sistemas', area: 'Ciberseguridad', level: 'Fundamentos', hours: 80,
    summary: 'Entender qué ocurre debajo de una aplicación y una red.',
    outcomes: ['Procesos, permisos, usuarios y servicios', 'TCP/IP, DNS, HTTP, TLS y SSH', 'Logs y trazabilidad de solicitudes'],
    challenge: 'Seguir una petición desde DNS hasta la base de datos e identificar puntos de riesgo.'
  },
  {
    id: 'statistics', title: 'Probabilidad y estadística', area: 'Datos', level: 'Intermedio', hours: 120,
    summary: 'Razonar sobre incertidumbre sin caer en intuiciones engañosas.',
    outcomes: ['Distribuciones, percentiles y varianza', 'Correlación, regresión e intervalos', 'Bayes, hipótesis y falsos positivos'],
    challenge: 'Explicar por qué una señal frecuente entre fraudes no implica que todos quienes la muestran sean fraudulentos.'
  },
  {
    id: 'underwriting', title: 'Riesgo empresarial y underwriting', area: 'Riesgo', level: 'Intermedio', hours: 150,
    summary: 'Decidir si una contraparte es aceptable y bajo qué condiciones.',
    outcomes: ['Estados financieros y razones clave', 'Capacidad de pago, concentración y sector', 'Decisiones explicables de contraparte'],
    challenge: 'Evaluar una empresa rentable pero concentrada en un solo cliente y defender límites de exposición.'
  },
  {
    id: 'fraud', title: 'Fraude y anomalías', area: 'Riesgo', level: 'Intermedio', hours: 120,
    summary: 'Detectar comportamientos que merecen investigación sin convertir reglas en acusaciones.',
    outcomes: ['Red flags y feature engineering', 'Outliers, velocidad y comportamiento', 'Medición de señales y falsos positivos'],
    challenge: 'Crear señales explicables que produzcan hipótesis y no veredictos automáticos.'
  },
  {
    id: 'graph', title: 'Graph Analytics', area: 'Riesgo', level: 'Intermedio', hours: 80,
    summary: 'Analizar redes de empresas, socios, domicilios y representantes.',
    outcomes: ['Nodos, relaciones y componentes', 'Centralidad y comunidades', 'Resolución de entidades'],
    challenge: 'Encontrar grupos empresariales ocultos sin asumir que pertenecer al mismo cluster implica fraude.'
  },
  {
    id: 'security', title: 'Fundamentos de ciberseguridad', area: 'Ciberseguridad', level: 'Intermedio', hours: 110,
    summary: 'Comprender activos, atacantes, vectores y controles.',
    outcomes: ['Threat modeling e IAM', 'Criptografía aplicada y autenticación', 'OWASP conceptual y hardening'],
    challenge: 'Modelar un ataque que modifique un score de riesgo sin dejar evidencia.'
  },
  {
    id: 'security-analytics', title: 'Security Analytics', area: 'Ciberseguridad', level: 'Avanzado', hours: 100,
    summary: 'Usar datos y estadística para detectar actividad anómala en sistemas.',
    outcomes: ['Logs, telemetría y baselines', 'Correlación e indicadores de compromiso', 'Triage y priorización de alertas'],
    challenge: 'Analizar eventos de login y controlar la tasa de falsos positivos.'
  },
  {
    id: 'osint', title: 'OSINT e investigación digital', area: 'Riesgo', level: 'Intermedio', hours: 80,
    summary: 'Recolectar, corroborar y documentar información con trazabilidad.',
    outcomes: ['Calidad de fuente y temporalidad', 'Resolución de identidad', 'Provenance y cadena de evidencia'],
    challenge: 'Construir un expediente donde cada afirmación importante tenga fuente y contexto.'
  },
  {
    id: 'machine-learning', title: 'Modelos de scoring', area: 'Datos', level: 'Avanzado', hours: 120,
    summary: 'Construir modelos de riesgo medibles, calibrados y explicables.',
    outcomes: ['Regresión logística y árboles', 'Precision, recall, AUC y calibración', 'PD, LGD, EAD y pérdida esperada'],
    challenge: 'Comparar un modelo con reglas simples y justificar cuándo no conviene automatizar una decisión.'
  },
  {
    id: 'engine', title: 'VDMX Intelligence Engine', area: 'Riesgo', level: 'Avanzado', hours: 180,
    summary: 'Integrar adquisición, normalización, señales y decisión en un motor de riesgo.',
    outcomes: ['Pipeline de datos y resolución de entidades', 'Risk signals y explicación analítica', 'Evaluación, auditoría y seguimiento'],
    challenge: 'Diseñar un expediente B2B completo que un analista pueda revisar, cuestionar y defender.'
  }
];

const diagnosticItems = [
  ['programming', 'Programación'],
  ['data', 'Datos y SQL'],
  ['risk', 'Análisis de riesgo'],
  ['statistics', 'Estadística'],
  ['cyber', 'Ciberseguridad']
] as const;

const defaultState: AcademyState = {
  weeklyHours: 25,
  completed: {},
  diagnostic: { programming: 1, data: 1, risk: 1, statistics: 1, cyber: 1 },
  activeModuleId: modules[0].id
};

function normalizeState(value: unknown): AcademyState {
  const candidate = (value && typeof value === 'object' ? value : {}) as Partial<AcademyState>;
  const completed = candidate.completed && typeof candidate.completed === 'object' ? candidate.completed : {};
  const diagnostic = candidate.diagnostic && typeof candidate.diagnostic === 'object' ? candidate.diagnostic : {};

  return {
    weeklyHours: Math.min(40, Math.max(10, Number(candidate.weeklyHours) || defaultState.weeklyHours)),
    completed: Object.fromEntries(Object.entries(completed).map(([id, values]) => [
      id,
      Array.isArray(values) ? values.filter((item): item is number => Number.isInteger(item) && item >= 0) : []
    ])),
    diagnostic: Object.fromEntries(diagnosticItems.map(([id]) => [id, Math.min(5, Math.max(1, Number(diagnostic[id]) || 1))])),
    activeModuleId: modules.some((item) => item.id === candidate.activeModuleId) ? candidate.activeModuleId as string : defaultState.activeModuleId
  };
}

export const Academy: React.FC = () => {
  const [state, setState] = useState<AcademyState>(defaultState);
  const [codeInput, setCodeInput] = useState(() => localStorage.getItem(CODE_KEY) || '');
  const [syncCode, setSyncCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('Todas');
  const [level, setLevel] = useState('Todos');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  const persistLocal = (nextState: AcademyState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  const sync = async (code: string, nextState?: AcademyState) => {
    const response = await fetch(`${API_BASE_URL}/api/academy/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextState ? { syncCode: code, state: nextState } : { syncCode: code })
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (response.status === 404) {
        throw new Error('La sincronización todavía se está desplegando en el servidor.');
      }
      throw new Error('El servidor de sincronización no devolvió una respuesta válida.');
    }
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'No se pudo sincronizar.');
    return payload as { state: AcademyState | null; updatedAt: string | null };
  };

  const connect = async () => {
    const code = codeInput.trim();
    if (code.length < 8) {
      setNotice('Elige un código de al menos 8 caracteres y guárdalo para usarlo en tus otros dispositivos.');
      return;
    }

    setLoading(true);
    setNotice('');
    try {
      const payload = await sync(code);
      const nextState = payload.state ? normalizeState(payload.state) : normalizeState(localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY) as string) : defaultState);
      setState(nextState);
      persistLocal(nextState);
      localStorage.setItem(CODE_KEY, code);
      setSyncCode(code);
      setConnected(true);
      loadedRef.current = true;
      setNotice(payload.state ? 'Progreso cargado desde la nube.' : 'Perfil creado. Tu progreso ya puede sincronizarse entre dispositivos.');
    } catch (error) {
      setNotice(error instanceof Error ? `${error.message} Revisa la conexión del servidor.` : 'No se pudo conectar con la nube.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem(CODE_KEY);
    if (savedCode && savedCode.length >= 8) {
      setCodeInput(savedCode);
      void (async () => {
        setLoading(true);
        try {
          const payload = await sync(savedCode);
          if (payload.state) {
            const nextState = normalizeState(payload.state);
            setState(nextState);
            persistLocal(nextState);
          }
          setSyncCode(savedCode);
          setConnected(true);
          loadedRef.current = true;
          setNotice(payload.state ? 'Progreso sincronizado.' : 'Perfil listo para comenzar.');
        } catch {
          const local = localStorage.getItem(STORAGE_KEY);
          if (local) setState(normalizeState(JSON.parse(local)));
          setNotice('Sin conexión con la nube. Trabajarás en modo local hasta recuperar la conexión.');
          setSyncCode(savedCode);
          setConnected(true);
          loadedRef.current = true;
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (!connected || !loadedRef.current || !syncCode) return;
    persistLocal(state);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await sync(syncCode, state);
        setNotice('Guardado en la nube.');
      } catch {
        setNotice('Guardado local. La nube se actualizará cuando vuelva la conexión.');
      }
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, connected, syncCode]);

  const filteredModules = useMemo(() => modules.filter((item) => {
    const matchesArea = area === 'Todas' || item.area === area;
    const matchesLevel = level === 'Todos' || item.level === level;
    const text = `${item.title} ${item.summary} ${item.challenge}`.toLowerCase();
    return matchesArea && matchesLevel && text.includes(query.toLowerCase());
  }), [area, level, query]);

  const activeModule = modules.find((item) => item.id === state.activeModuleId) || modules[0];
  const completedMilestones = state.completed[activeModule.id] || [];
  const totalMilestones = modules.reduce((sum, item) => sum + item.outcomes.length, 0);
  const completedTotal = modules.reduce((sum, item) => sum + (state.completed[item.id]?.length || 0), 0);
  const progress = Math.round((completedTotal / totalMilestones) * 100);
  const completedHours = Math.round(modules.reduce((sum, item) => sum + item.hours * ((state.completed[item.id]?.length || 0) / item.outcomes.length), 0));
  const months = Math.max(1, Math.round((1200 / (state.weeklyHours * 4.33)) * 10) / 10);

  const updateCompletion = (moduleId: string, index: number) => {
    setState((previous) => {
      const current = new Set<number>(previous.completed[moduleId] || []);
      if (current.has(index)) current.delete(index); else current.add(index);
      return { ...previous, completed: { ...previous.completed, [moduleId]: Array.from(current).sort((a, b) => a - b) } };
    });
  };

  const signOut = () => {
    setConnected(false);
    setSyncCode('');
    setNotice('');
    loadedRef.current = false;
  };

  if (!connected) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">school</span>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">VDMX</p>
              <h1 className="text-2xl font-bold">Academy</h1>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Continúa tu formación</h2>
          <p className="text-slate-400 leading-relaxed mb-6">Usa el mismo código en tu celular, PC y tablet. El código vincula tu avance sin crear una cuenta de correo.</p>
          <label className="block text-sm font-semibold text-slate-300" htmlFor="sync-code">Código de sincronización</label>
          <input id="sync-code" type="password" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void connect(); }} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary" placeholder="Ejemplo: vdmx-estudio-2026" autoComplete="off" />
          <button type="button" onClick={() => void connect()} disabled={loading} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-50">{loading ? 'Conectando...' : 'Abrir Academy'}</button>
          {notice && <p className="mt-4 text-sm text-amber-300" role="status">{notice}</p>}
          <p className="mt-6 text-xs text-slate-500">La dirección es discreta, pero el código debe mantenerse privado porque funciona como llave de sincronización.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">school</span>
            <div><p className="text-xs uppercase tracking-[0.25em] text-slate-500">VDMX Academy</p><h1 className="text-xl font-bold">Risk Intelligence + Ciberseguridad</h1></div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-emerald-400 md:inline-flex md:items-center md:gap-1"><span className="material-symbols-outlined text-base">cloud_done</span>{notice || 'Sincronizado'}</span>
            <button type="button" onClick={signOut} className="rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-300 hover:bg-slate-800">Cambiar código</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Progreso', `${progress}%`, 'progress'],
            ['Horas completadas', `${completedHours} h`, 'schedule'],
            ['Módulos', `${modules.filter((item) => (state.completed[item.id]?.length || 0) === item.outcomes.length).length}/${modules.length}`, 'library_books'],
            ['Ritmo estimado', `${months} meses`, 'event']
          ].map(([label, value, icon]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><span className="material-symbols-outlined text-primary">{icon}</span><p className="mt-3 text-sm text-slate-400">{label}</p><strong className="text-2xl">{value}</strong></div>)}
        </section>

        <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_280px]">
          <div><h2 className="font-bold">Carga semanal</h2><p className="mt-1 text-sm text-slate-400">Ajusta el tiempo disponible para estimar la duración del programa.</p><input aria-label="Horas por semana" type="range" min="10" max="40" value={state.weeklyHours} onChange={(event) => setState((previous) => ({ ...previous, weeklyHours: Number(event.target.value) }))} className="mt-5 w-full accent-primary" /><div className="mt-2 flex justify-between text-sm text-slate-400"><span>10 h</span><strong className="text-white">{state.weeklyHours} h/semana</strong><span>40 h</span></div></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-sm text-slate-400">Programa de 1,200 horas</p><strong className="mt-2 block text-3xl">≈ {months}</strong><p className="text-sm text-slate-500">meses estimados</p></div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Plan de estudios</h2><p className="mt-1 text-sm text-slate-400">Selecciona un módulo para ver sus objetivos y marcar avances.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Buscar módulos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary" /><select aria-label="Filtrar por área" value={area} onChange={(event) => setArea(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option>Todas</option><option>Datos</option><option>Riesgo</option><option>Ciberseguridad</option></select><select aria-label="Filtrar por nivel" value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option>Todos</option><option>Fundamentos</option><option>Intermedio</option><option>Avanzado</option></select></div></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredModules.map((item) => { const done = state.completed[item.id]?.length || 0; const itemProgress = Math.round((done / item.outcomes.length) * 100); return <button key={item.id} type="button" onClick={() => setState((previous) => ({ ...previous, activeModuleId: item.id }))} className={`text-left rounded-xl border p-4 transition-colors ${state.activeModuleId === item.id ? 'border-primary bg-primary/10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}><div className="flex items-start justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-primary">{item.area}</span><span className="text-xs text-slate-500">{item.hours} h</span></div><h3 className="mt-3 font-bold">{item.title}</h3><p className="mt-2 min-h-10 text-sm text-slate-400">{item.summary}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-primary" style={{ width: `${itemProgress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{done}/{item.outcomes.length} objetivos</p></button>; })}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{activeModule.area} · {activeModule.level}</p><h2 className="mt-2 text-2xl font-bold">{activeModule.title}</h2><p className="mt-2 text-slate-400">{activeModule.summary}</p></div><span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">{completedMilestones.length}/{activeModule.outcomes.length}</span></div><div className="mt-6 space-y-3">{activeModule.outcomes.map((outcome, index) => <label key={outcome} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"><input type="checkbox" checked={completedMilestones.includes(index)} onChange={() => updateCompletion(activeModule.id, index)} className="mt-1 h-4 w-4 accent-primary" /><span className={completedMilestones.includes(index) ? 'text-slate-500 line-through' : 'text-slate-200'}>{outcome}</span></label>)}</div><div className="mt-5 border-l-2 border-primary pl-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reto</p><p className="mt-1 text-sm text-slate-300">{activeModule.challenge}</p></div></article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">Diagnóstico inicial</h2><p className="mt-1 text-sm text-slate-400">Actualiza tu nivel cuando quieras; queda incluido en la sincronización.</p><div className="mt-5 space-y-5">{diagnosticItems.map(([id, label]) => <div key={id}><div className="flex justify-between text-sm"><span>{label}</span><strong className="text-primary">{state.diagnostic[id]}/5</strong></div><input aria-label={label} type="range" min="1" max="5" value={state.diagnostic[id]} onChange={(event) => setState((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, [id]: Number(event.target.value) } }))} className="mt-2 w-full accent-primary" /></div>)}</div><div className="mt-6 rounded-lg bg-slate-950 p-4"><p className="text-sm text-slate-400">Promedio actual</p><strong className="text-3xl">{(Object.values(state.diagnostic).reduce<number>((sum, value) => sum + Number(value), 0) / diagnosticItems.length).toFixed(1)}<span className="text-base text-slate-500"> / 5</span></strong></div></article>
        </section>
      </div>
    </main>
  );
};
