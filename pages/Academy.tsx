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
  lessons: AcademyLesson[];
  exercise: AcademyExercise;
  quiz: AcademyQuestion[];
  prerequisites: string[];
  practice: string[];
  project: AcademyProject;
  videos: AcademyVideo[];
};

type AcademyLesson = {
  id: string;
  title: string;
  objective: string;
  content: string;
  example?: string;
};

type AcademyExercise = {
  prompt: string;
  placeholder: string;
  hint: string;
  solution: string;
  acceptedKeywords: string[];
  minimumMatches: number;
};

type AcademyQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type AcademyProject = {
  title: string;
  brief: string;
  deliverables: string[];
  rubric: string[];
  acceptedKeywords: string[];
  minimumMatches: number;
};

type AcademyVideo = {
  title: string;
  channel: string;
  videoId: string;
  why: string;
};

type AcademyState = {
  weeklyHours: number;
  completed: Record<string, number[]>;
  diagnostic: Record<string, number>;
  activeModuleId: string;
  lessonProgress: Record<string, string[]>;
  exerciseResponses: Record<string, string>;
  exerciseResults: Record<string, boolean>;
  quizAnswers: Record<string, Record<string, number>>;
  quizScores: Record<string, number>;
  projectNotes: Record<string, string>;
  projectResults: Record<string, boolean>;
};

const STORAGE_KEY = 'vdmx-academy-state-v2';
const CODE_KEY = 'vdmx-academy-sync-code-v1';

const baseModules: Omit<AcademyModule, 'lessons' | 'exercise' | 'quiz' | 'prerequisites' | 'practice' | 'project' | 'videos'>[] = [
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

const learningContent: Record<string, Omit<AcademyModule, 'id' | 'title' | 'area' | 'level' | 'hours' | 'summary' | 'outcomes' | 'challenge' | 'prerequisites' | 'practice' | 'project' | 'videos'>> = {
  python: {
    lessons: [
      { id: 'python-1', title: 'Pensar en datos y decisiones', objective: 'Distinguir datos, reglas y conclusiones.', content: 'Un programa de riesgo no empieza con una pantalla: empieza con una pregunta verificable. Una variable representa un dato; una condición representa una regla; el resultado debe conservar la explicación de por qué se activó.', example: 'debt_to_ebitda = 5.4\nif debt_to_ebitda > 4:\n    flags.append("HIGH_LEVERAGE")' },
      { id: 'python-2', title: 'Funciones y estructuras', objective: 'Separar transformaciones para poder probarlas.', content: 'Las funciones reducen errores porque cada una recibe entradas claras y devuelve una salida. Usa listas para colecciones ordenadas, diccionarios para atributos y sets cuando quieras eliminar duplicados.', example: 'def leverage_flag(debt, ebitda):\n    return debt / ebitda > 4' },
      { id: 'python-3', title: 'Archivos, errores y evidencia', objective: 'Procesar expedientes sin perder trazabilidad.', content: 'Al leer JSON debes validar que existan los campos esperados y capturar errores de archivo o formato. Un pipeline confiable no oculta datos faltantes: los convierte en una señal explícita.', example: 'try:\n    record = json.loads(raw)\nexcept json.JSONDecodeError:\n    flags.append("INVALID_JSON")' }
    ],
    exercise: { prompt: 'Escribe una regla Python que marque HIGH_LEVERAGE cuando deuda/EBITDA sea mayor a 4 y que evite dividir entre cero.', placeholder: 'Escribe tu regla o pseudocódigo...', hint: 'Incluye una comprobación para ebitda == 0 y después calcula deuda / ebitda.', solution: 'Una respuesta válida comprueba primero ebitda != 0, calcula debt_to_ebitda = debt / ebitda y agrega HIGH_LEVERAGE cuando el resultado sea mayor que 4.', acceptedKeywords: ['ebitda', 'debt', '4', 'high_leverage'], minimumMatches: 4 },
    quiz: [
      { question: '¿Qué representa mejor una función?', options: ['Una pantalla de la aplicación', 'Una transformación reutilizable con entradas y salida', 'Una base de datos completa'], answer: 1, explanation: 'Una función encapsula una operación para reutilizarla y probarla.' },
      { question: '¿Qué debe ocurrir ante un JSON inválido?', options: ['Ignorarlo silenciosamente', 'Registrar una señal de calidad y manejar el error', 'Convertirlo automáticamente en riesgo alto'], answer: 1, explanation: 'Un error de formato es evidencia de calidad, no una conclusión de riesgo.' },
      { question: '¿Por qué separar reglas en funciones?', options: ['Para hacer el código más difícil de leer', 'Para poder probar y explicar cada regla', 'Para evitar usar datos'], answer: 1, explanation: 'La separación permite verificar cada regla y rastrear su resultado.' }
    ]
  },
  sql: {
    lessons: [
      { id: 'sql-1', title: 'Preguntar a una tabla', objective: 'Convertir una pregunta de riesgo en SQL.', content: 'Empieza por definir la unidad de análisis: empresa, persona, transacción o relación. Después selecciona solo los campos necesarios y filtra con WHERE; una consulta reproducible debe poder explicarse en lenguaje natural.', example: 'SELECT company_id, annual_sales\nFROM companies\nWHERE country = \'MX\';' },
      { id: 'sql-2', title: 'Cruces y concentración', objective: 'Relacionar entidades sin duplicar resultados.', content: 'JOIN conecta tablas mediante una clave. GROUP BY resume observaciones y HAVING filtra grupos después de agregar. Antes de interpretar una concentración, cuenta entidades distintas y revisa la calidad de la clave.', example: 'SELECT address, COUNT(DISTINCT company_id) AS companies\nFROM company_addresses\nGROUP BY address\nHAVING COUNT(DISTINCT company_id) > 10;' },
      { id: 'sql-3', title: 'Calidad y trazabilidad', objective: 'Detectar duplicados, nulos y relaciones ambiguas.', content: 'Un resultado SQL no es automáticamente una conclusión. Revisa nulos, duplicados, fechas y cardinalidad de los JOIN. Guarda la consulta y sus filtros para que otro analista pueda reproducirla.', example: 'SELECT company_id, COUNT(*)\nFROM company_addresses\nGROUP BY company_id\nHAVING COUNT(*) > 1;' }
    ],
    exercise: { prompt: 'Escribe una consulta que encuentre domicilios compartidos por más de 5 empresas distintas.', placeholder: 'Escribe tu consulta SQL...', hint: 'Usa COUNT(DISTINCT company_id), GROUP BY address y HAVING.', solution: 'SELECT address, COUNT(DISTINCT company_id) AS companies FROM company_addresses GROUP BY address HAVING COUNT(DISTINCT company_id) > 5;', acceptedKeywords: ['select', 'count', 'distinct', 'company_id', 'group by', 'address', 'having'], minimumMatches: 6 },
    quiz: [
      { question: '¿Qué filtra HAVING?', options: ['Filas antes de agrupar', 'Grupos después de una agregación', 'Columnas de una tabla'], answer: 1, explanation: 'HAVING se aplica sobre grupos creados con GROUP BY.' },
      { question: '¿Por qué usar COUNT(DISTINCT company_id)?', options: ['Para contar empresas únicas', 'Para ordenar fechas', 'Para borrar duplicados físicamente'], answer: 0, explanation: 'Evita contar varias filas de la misma empresa como empresas diferentes.' },
      { question: '¿Qué debe revisarse después de un JOIN?', options: ['La cardinalidad y posibles duplicados', 'Solo el color de la tabla', 'Nada, el JOIN siempre es correcto'], answer: 0, explanation: 'Un JOIN puede multiplicar filas y cambiar la interpretación.' }
    ]
  },
  systems: {
    lessons: [
      { id: 'systems-1', title: 'Procesos y permisos', objective: 'Ubicar quién ejecuta una tarea y con qué permisos.', content: 'Un sistema operativo administra procesos, archivos, usuarios y permisos. En análisis de seguridad, pregunta qué proceso abrió un archivo, con qué usuario y cuándo ocurrió.', example: 'ps aux\nls -l /var/log/app.log\nwhoami' },
      { id: 'systems-2', title: 'De DNS a HTTP', objective: 'Seguir el recorrido de una solicitud.', content: 'Una petición suele resolver un nombre mediante DNS, abrir una conexión TCP, negociar TLS y enviar HTTP. Cada salto puede producir registros útiles para investigar disponibilidad, autenticidad e integridad.', example: 'DNS -> TCP -> TLS -> HTTP -> aplicación -> base de datos' },
      { id: 'systems-3', title: 'Logs como evidencia', objective: 'Distinguir un evento de una hipótesis.', content: 'Un log registra lo que un sistema observó, no necesariamente la intención de una persona. Conserva timestamp, actor, origen, acción y resultado; después correlaciona varios eventos.', example: '{"user":"analyst-7","action":"export","result":"denied","ip":"203.0.113.4"}' }
    ],
    exercise: { prompt: 'Describe la cadena técnica que seguirías para investigar un login anómalo.', placeholder: 'Escribe los pasos...', hint: 'Incluye DNS/red, autenticación, proceso o servicio y logs con tiempo y origen.', solution: 'Una respuesta válida conecta origen/IP, DNS o red, solicitud HTTP/TLS, servicio de autenticación, usuario, resultado y logs correlacionados.', acceptedKeywords: ['ip', 'autentic', 'log', 'servicio', 'tiempo'], minimumMatches: 4 },
    quiz: [
      { question: '¿Qué aporta un timestamp?', options: ['Permite ordenar y correlacionar eventos', 'Garantiza que el evento sea malicioso', 'Cambia los permisos'], answer: 0, explanation: 'El tiempo permite construir una secuencia, pero no prueba por sí solo la intención.' },
      { question: '¿Cuál es el orden más razonable?', options: ['HTTP antes de DNS', 'DNS, TCP, TLS, HTTP', 'Base de datos antes de red'], answer: 1, explanation: 'Es el recorrido simplificado de una petición web.' },
      { question: '¿Un log aislado es una conclusión?', options: ['Sí, siempre', 'No, es una observación que requiere contexto', 'Solo si es reciente'], answer: 1, explanation: 'La investigación necesita correlación y contexto.' }
    ]
  },
  statistics: {
    lessons: [
      { id: 'statistics-1', title: 'Distribuciones y percentiles', objective: 'Describir qué es normal y qué es raro.', content: 'La media resume, pero puede distorsionarse con valores extremos. La mediana y los percentiles ayudan a entender la forma de los datos y a comparar una observación con su población.', example: 'p95 = valor que deja al 95% de las observaciones por debajo' },
      { id: 'statistics-2', title: 'Correlación no es causalidad', objective: 'Evitar conclusiones exageradas.', content: 'Dos variables pueden moverse juntas por una tercera causa, por selección de muestra o por azar. En riesgo, una correlación es una pista para investigar, no una explicación completa.', example: 'señal frecuente -> investigar asociación -> validar fuera de muestra' },
      { id: 'statistics-3', title: 'Bayes y falsos positivos', objective: 'Actualizar una creencia con evidencia.', content: 'La probabilidad de fraude dado un indicador depende también de la frecuencia base. Incluso una señal útil puede producir muchos falsos positivos si el evento que buscas es poco frecuente.', example: 'P(fraude|señal) depende de P(señal|fraude) y de la tasa base' }
    ],
    exercise: { prompt: 'Explica por qué una señal que aparece en el 80% de fraudes no implica que una empresa con esa señal tenga 80% de probabilidad de fraude.', placeholder: 'Escribe tu explicación...', hint: 'Habla de tasa base, falsos positivos y P(fraude | señal).', solution: 'La probabilidad posterior depende de cuántas empresas no fraudulentas también muestran la señal y de la prevalencia de fraude en la población.', acceptedKeywords: ['tasa base', 'falso', 'probabilidad', 'señal'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué medida es menos sensible a valores extremos?', options: ['Mediana', 'Media', 'Suma'], answer: 0, explanation: 'La mediana depende del orden y suele resistir mejor outliers.' },
      { question: '¿Qué significa correlación?', options: ['Asociación estadística', 'Prueba de causalidad', 'Prueba legal'], answer: 0, explanation: 'Correlación describe asociación, no explica necesariamente la causa.' },
      { question: '¿Qué es un falso positivo?', options: ['No detectar un fraude real', 'Marcar como riesgo un caso que no lo era', 'Un dato faltante'], answer: 1, explanation: 'Es una alerta que no corresponde al evento objetivo.' }
    ]
  },
  underwriting: {
    lessons: [
      { id: 'underwriting-1', title: 'Leer los estados financieros', objective: 'Separar rentabilidad, liquidez y solvencia.', content: 'El balance muestra posición; el estado de resultados muestra desempeño; el flujo de efectivo muestra capacidad de convertir actividad en caja. Una empresa puede ser rentable y aun así no poder pagar hoy.', example: 'Balance = qué tiene y debe | Resultados = qué ganó | Flujo = qué cobró y pagó' },
      { id: 'underwriting-2', title: 'Razones con contexto', objective: 'Interpretar ratios según industria y periodo.', content: 'Deuda/EBITDA, cobertura de intereses, margen y capital de trabajo son señales. No existe un umbral universal: compara con pares, tendencia histórica y condiciones del contrato.', example: 'Expected Loss = PD * LGD * EAD' },
      { id: 'underwriting-3', title: 'Decisión y condiciones', objective: 'Convertir análisis en una decisión defendible.', content: 'Una decisión puede ser aprobar, rechazar o aprobar con condiciones: límite, plazo, garantía, anticipo o monitoreo. Documenta qué evidencia sostiene cada condición y qué información falta.', example: 'decisión -> exposición -> condiciones -> monitoreo -> revisión' }
    ],
    exercise: { prompt: 'Una empresa tiene ventas crecientes, cuentas por cobrar +80% y un cliente que representa 80% de sus ventas. Escribe tres preguntas antes de aprobar crédito.', placeholder: 'Escribe tus preguntas...', hint: 'Pregunta por caja, calidad de cartera, contrato y concentración.', solution: 'Preguntas válidas incluyen antigüedad de cuentas por cobrar, cobros posteriores, duración del contrato del cliente, dependencia de una sola contraparte y necesidades de capital de trabajo.', acceptedKeywords: ['cobrar', 'contrato', 'concentr', 'caja'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué documento ayuda más a analizar liquidez inmediata?', options: ['Flujo de efectivo y balance', 'Solo el logotipo', 'Una encuesta de satisfacción'], answer: 0, explanation: 'La liquidez depende de caja, obligaciones y flujos.' },
      { question: '¿Un ratio tiene significado sin contexto?', options: ['Sí, siempre', 'No, debe compararse con industria y tendencia', 'Solo si es un número entero'], answer: 1, explanation: 'Los umbrales cambian por sector, tamaño y momento.' },
      { question: '¿Qué es una aprobación condicionada?', options: ['Aprobar sin revisión', 'Aprobar con límites o controles definidos', 'Rechazar automáticamente'], answer: 1, explanation: 'Permite ajustar la exposición al nivel de incertidumbre.' }
    ]
  },
  fraud: {
    lessons: [
      { id: 'fraud-1', title: 'Señales frente a conclusiones', objective: 'Formular red flags sin acusar.', content: 'Una red flag es una observación que justifica investigar. La documentación debe separar dato, interpretación y conclusión; el lenguaje importa porque una alerta no es una sentencia.', example: 'dato -> señal -> hipótesis -> investigación -> conclusión sustentada' },
      { id: 'fraud-2', title: 'Anomalías y umbrales', objective: 'Elegir reglas medibles.', content: 'Un outlier puede ser error, caso excepcional o fraude. Define población, ventana de tiempo, umbral y acción posterior. Mide cuántas alertas son útiles y cuántas generan ruido.', example: 'velocity_24h > percentil_99 -> revisar, no condenar' },
      { id: 'fraud-3', title: 'Falsos positivos y revisión', objective: 'Mejorar una regla sin esconder incertidumbre.', content: 'Revisa alertas con una muestra etiquetada. Ajusta umbrales, segmenta por tipo de cliente y conserva ejemplos de errores. Una regla responsable también declara sus límites.', example: 'precision = alertas_correctas / alertas_totales' }
    ],
    exercise: { prompt: 'Diseña una red flag para detectar velocidad inusual de transacciones e indica qué debería ocurrir después.', placeholder: 'Escribe regla y acción...', hint: 'Define ventana, comparación con población y una revisión humana.', solution: 'Una respuesta válida define una ventana, un umbral basado en histórico o percentil y una acción de investigación con evidencia adicional.', acceptedKeywords: ['ventana', 'umbral', 'históric', 'revisión'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué es una red flag?', options: ['Una conclusión definitiva', 'Una señal que justifica investigar', 'Un dato que siempre se elimina'], answer: 1, explanation: 'Una señal debe activar una investigación, no sustituirla.' },
      { question: '¿Qué mide precision?', options: ['Qué proporción de alertas fueron correctas', 'Cuántos datos faltan', 'La velocidad del servidor'], answer: 0, explanation: 'Precision mide la utilidad de las alertas generadas.' },
      { question: '¿Qué mejora una regla?', options: ['Ocultar alertas incómodas', 'Medir errores y segmentar la población', 'Eliminar toda revisión humana'], answer: 1, explanation: 'La evaluación y segmentación reducen ruido sin eliminar controles.' }
    ]
  },
  graph: {
    lessons: [
      { id: 'graph-1', title: 'Nodos y relaciones', objective: 'Modelar entidades y vínculos.', content: 'Una empresa, persona, domicilio o teléfono puede ser un nodo. Una relación debe tener tipo, dirección cuando aplique, fecha y fuente. El grafo ayuda a encontrar conexiones que una tabla aislada oculta.', example: 'PERSONA -[REPRESENTA]-> EMPRESA -[USA]-> DOMICILIO' },
      { id: 'graph-2', title: 'Componentes y centralidad', objective: 'Detectar estructuras que merecen atención.', content: 'Connected components muestran grupos separados; centralidad identifica nodos muy conectados. Ninguna métrica prueba fraude: solo prioriza dónde mirar y qué relación explicar.', example: 'centralidad alta -> priorización -> validar identidad y temporalidad' },
      { id: 'graph-3', title: 'Resolución de entidades', objective: 'Evitar unir personas distintas por coincidencias débiles.', content: 'La resolución de entidades combina nombre, RFC, domicilio, teléfono y fechas. Usa niveles de confianza y conserva los atributos que explican el enlace.', example: 'match fuerte = RFC exacto | match débil = nombre parecido' }
    ],
    exercise: { prompt: 'Explica cómo investigarías tres empresas que comparten domicilio y representante.', placeholder: 'Describe tu enfoque...', hint: 'Incluye fuente, temporalidad, identidad y la distinción entre señal y conclusión.', solution: 'Valida la identidad de cada entidad, fecha y fuente del domicilio y representante, busca relaciones adicionales y documenta la hipótesis sin afirmar fraude automáticamente.', acceptedKeywords: ['identidad', 'fecha', 'fuente', 'hipótesis'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué es un nodo?', options: ['Una entidad del grafo', 'Un filtro CSS', 'Una contraseña'], answer: 0, explanation: 'Los nodos representan entidades como empresas o personas.' },
      { question: '¿Qué indica centralidad alta?', options: ['Conexión estructural relevante', 'Culpabilidad', 'Que el dato sea falso'], answer: 0, explanation: 'La centralidad ayuda a priorizar, pero necesita contexto.' },
      { question: '¿Qué debe conservar un enlace de entidades?', options: ['Solo el nombre final', 'Atributos, fuente y nivel de confianza', 'Nada, solo el score'], answer: 1, explanation: 'La trazabilidad permite revisar y corregir el enlace.' }
    ]
  },
  security: {
    lessons: [
      { id: 'security-1', title: 'Activos y amenazas', objective: 'Construir un threat model inicial.', content: 'Empieza por activos: expedientes, scores, credenciales y reportes. Después identifica actores, objetivos, superficies de ataque y controles. La pregunta no es solo “qué vulnerabilidad existe”, sino qué impacto tendría.', example: 'activo: risk_score | atacante: usuario interno | impacto: decisión manipulada' },
      { id: 'security-2', title: 'Identidad y autorización', objective: 'Distinguir autenticación de autorización.', content: 'Autenticación responde quién eres; autorización responde qué puedes hacer sobre qué objeto. Un usuario autenticado no debe poder consultar cualquier expediente. Aplica least privilege y verifica el objeto en cada operación.', example: 'authenticated != authorized\ncanRead(user, case) -> owner || analystAssigned' },
      { id: 'security-3', title: 'Integridad y secretos', objective: 'Proteger datos y credenciales.', content: 'Los secretos deben vivir en variables de entorno o un gestor de secretos, nunca en el frontend. Para integridad usa controles de acceso, logs de auditoría y validación de cambios; el hashing no reemplaza la autorización.', example: 'secret -> server env | change -> actor + time + reason' }
    ],
    exercise: { prompt: 'Identifica tres controles para impedir que un usuario modifique el score de un expediente ajeno.', placeholder: 'Escribe tus controles...', hint: 'Piensa en autorización por objeto, auditoría e integridad del cambio.', solution: 'Controles válidos: autorización por expediente en backend, roles de mínimo privilegio, registro inmutable de cambios, revisión o doble aprobación y validación de entrada.', acceptedKeywords: ['autoriz', 'objeto', 'auditor', 'privilegio'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué verifica autorización por objeto?', options: ['Que el usuario tenga sesión', 'Que tenga derecho sobre ese expediente concreto', 'Que conozca la URL'], answer: 1, explanation: 'La autorización debe comprobar el recurso específico.' },
      { question: '¿Dónde debe estar un secreto de Stripe?', options: ['En el bundle del navegador', 'En una variable del servidor', 'En el nombre del botón'], answer: 1, explanation: 'El secreto no debe exponerse al cliente.' },
      { question: '¿Qué aporta un audit log?', options: ['Trazabilidad de quién cambió qué y cuándo', 'Cifrado automático', 'Elimina la necesidad de roles'], answer: 0, explanation: 'La auditoría permite investigar cambios y responsabilidades.' }
    ]
  },
  'security-analytics': {
    lessons: [
      { id: 'security-analytics-1', title: 'Telemetría y eventos', objective: 'Definir qué observar en un sistema.', content: 'Recolecta autenticaciones, cambios de permisos, exportaciones, errores y accesos a datos sensibles. Un evento útil tiene actor, acción, objeto, origen, timestamp y resultado.', example: 'actor + action + object + source + time + result' },
      { id: 'security-analytics-2', title: 'Baselines de comportamiento', objective: 'Comparar actividad con una línea base.', content: 'Una línea base describe lo normal por usuario, servicio, horario y volumen. Los cambios deben ponderarse por contexto: un administrador y un cliente no tienen el mismo patrón.', example: 'deviation = current_activity - expected_activity' },
      { id: 'security-analytics-3', title: 'Triage de alertas', objective: 'Priorizar sin saturar al analista.', content: 'Triage clasifica severidad, confianza e impacto. Correlaciona eventos, conserva evidencia y define una acción: cerrar con razón, investigar o escalar.', example: 'priority = impact * confidence * asset_criticality' }
    ],
    exercise: { prompt: 'Propón una alerta para detectar una exportación masiva fuera del horario habitual.', placeholder: 'Escribe evento, comparación y acción...', hint: 'Incluye usuario, volumen, horario, activo y triage.', solution: 'Una respuesta válida correlaciona exportación, volumen anómalo, horario fuera de baseline, sensibilidad del activo y una revisión priorizada.', acceptedKeywords: ['export', 'volumen', 'horario', 'baseline', 'revisión'], minimumMatches: 4 },
    quiz: [
      { question: '¿Qué hace una baseline?', options: ['Describe comportamiento esperado', 'Borra eventos', 'Autoriza a todos'], answer: 0, explanation: 'La baseline sirve de comparación contextual.' },
      { question: '¿Qué es triage?', options: ['Priorizar y decidir el siguiente paso', 'Cifrar una contraseña', 'Crear una interfaz'], answer: 0, explanation: 'El triage evita tratar todas las alertas igual.' },
      { question: '¿Qué campo ayuda a investigar un evento?', options: ['Solo color', 'Actor, acción, objeto, tiempo y resultado', 'Solo tamaño de pantalla'], answer: 1, explanation: 'Esos campos permiten reconstruir lo ocurrido.' }
    ]
  },
  osint: {
    lessons: [
      { id: 'osint-1', title: 'Calidad de fuente', objective: 'Clasificar confiabilidad y alcance.', content: 'Una fuente puede ser primaria o secundaria, pública o restringida, actual o histórica. Evalúa quién la produjo, cuándo, con qué interés y si puede corroborarse.', example: 'fuente -> origen + fecha + propósito + limitaciones' },
      { id: 'osint-2', title: 'Corroborar identidad', objective: 'Evitar confundir homónimos.', content: 'Combina atributos independientes: razón social, RFC, domicilio, representante, fechas y documentos. Una coincidencia de nombre no basta para afirmar que dos registros pertenecen a la misma persona.', example: 'identidad = nombre + atributo fuerte + contexto temporal' },
      { id: 'osint-3', title: 'Cadena de evidencia', objective: 'Documentar cómo llegaste a una afirmación.', content: 'Guarda URL o referencia, fecha de consulta, fragmento relevante, captura o documento original y la interpretación separada. Dato no es evidencia; evidencia no es conclusión.', example: 'claim -> source -> observation -> assessment -> confidence' }
    ],
    exercise: { prompt: 'Escribe qué registrarías para que otro analista pueda reproducir una búsqueda OSINT.', placeholder: 'Lista los elementos...', hint: 'Incluye fuente, fecha, consulta, observación y nivel de confianza.', solution: 'Registra fuente, URL o referencia, fecha, términos o consulta, dato observado, contexto, limitaciones y nivel de confianza.', acceptedKeywords: ['fuente', 'fecha', 'consulta', 'observación', 'confianza'], minimumMatches: 4 },
    quiz: [
      { question: '¿Qué es una fuente primaria?', options: ['El origen directo del registro o declaración', 'Un resumen sin referencia', 'Una opinión anónima'], answer: 0, explanation: 'La fuente primaria está más cerca del hecho documentado.' },
      { question: '¿Qué evita los homónimos?', options: ['Usar solo el nombre', 'Cruzar atributos y contexto', 'Ignorar fechas'], answer: 1, explanation: 'La resolución de identidad requiere más de un atributo.' },
      { question: '¿Qué diferencia dato y conclusión?', options: ['La conclusión interpreta evidencia', 'Son idénticos', 'El dato siempre es falso'], answer: 0, explanation: 'Separarlos evita presentar inferencias como hechos.' }
    ]
  },
  'machine-learning': {
    lessons: [
      { id: 'machine-learning-1', title: 'De variables a modelo', objective: 'Entender qué aprende un modelo.', content: 'Una feature representa información disponible al momento de decidir. La etiqueta define el evento objetivo. Separa entrenamiento y evaluación para no medir el modelo con respuestas que ya vio.', example: 'features -> modelo -> probability_of_default -> decision' },
      { id: 'machine-learning-2', title: 'Métricas y umbrales', objective: 'Elegir métricas según el costo del error.', content: 'Precision, recall, AUC y calibración responden preguntas distintas. Cambiar el umbral cambia falsos positivos y falsos negativos; el umbral debe relacionarse con el costo de cada error.', example: 'recall = true_positives / actual_positives' },
      { id: 'machine-learning-3', title: 'Explicación y límites', objective: 'Usar un modelo sin convertirlo en autoridad.', content: 'Un score es una estimación, no una verdad. Documenta población, fecha, variables, desempeño, sesgos y condiciones fuera de distribución. La decisión debe conservar revisión y explicación.', example: 'score + top_signals + confidence + analyst_review' }
    ],
    exercise: { prompt: 'Explica cuándo preferirías recall alto frente a precision alta en un sistema de detección de fraude.', placeholder: 'Escribe tu comparación...', hint: 'Relaciona cada métrica con el costo de no detectar o investigar de más.', solution: 'Recall alto es valioso cuando perder un fraude es muy costoso; precision alta es valiosa cuando cada investigación consume mucho tiempo o genera daño por falsas alarmas.', acceptedKeywords: ['recall', 'precision', 'falso', 'costo'], minimumMatches: 3 },
    quiz: [
      { question: '¿Qué es data leakage?', options: ['Usar información que no estaría disponible al decidir', 'Un archivo demasiado grande', 'Un gráfico vacío'], answer: 0, explanation: 'El leakage hace que la evaluación sea artificialmente optimista.' },
      { question: '¿Qué cambia al mover el umbral?', options: ['El balance de falsos positivos y negativos', 'La identidad de la empresa', 'La fuente original'], answer: 0, explanation: 'El umbral convierte una probabilidad en una decisión.' },
      { question: '¿Un modelo sustituye al analista?', options: ['Siempre', 'No, aporta evidencia y priorización', 'Solo con datos históricos'], answer: 1, explanation: 'La automatización debe tener límites y supervisión.' }
    ]
  },
  engine: {
    lessons: [
      { id: 'engine-1', title: 'Diseñar el pipeline', objective: 'Ordenar adquisición, normalización y análisis.', content: 'Un motor de inteligencia debe separar adquisición, validación, normalización, resolución de entidades, señales y decisión. Cada etapa necesita entradas, salidas y errores observables.', example: 'sources -> validate -> normalize -> resolve -> signals -> assessment' },
      { id: 'engine-2', title: 'Explicar una evaluación', objective: 'Convertir señales en un expediente revisable.', content: 'Cada score debe mostrar señales, fuentes, fechas, confianza y datos faltantes. El analista debe poder cuestionar una relación o recalcular una regla sin perder el historial.', example: 'score = signals + evidence + uncertainty + analyst_notes' },
      { id: 'engine-3', title: 'Operar y auditar', objective: 'Diseñar seguimiento después de la decisión.', content: 'Un sistema real necesita versionar reglas, registrar cambios, monitorear deriva y revisar resultados. La evaluación no termina cuando se entrega un reporte: la contraparte cambia y la evidencia se actualiza.', example: 'decision -> monitor -> new_evidence -> reassess -> audit' }
    ],
    exercise: { prompt: 'Dibuja en texto el flujo mínimo de VDMX desde una empresa hasta una decisión explicada.', placeholder: 'Escribe las etapas en orden...', hint: 'Incluye adquisición, validación, entidades, señales, score y revisión.', solution: 'Empresa -> adquisición -> validación -> normalización -> resolución de entidades -> señales -> score/assessment -> explicación del analista -> seguimiento.', acceptedKeywords: ['adquisición', 'validación', 'entidades', 'señales', 'score', 'analista'], minimumMatches: 5 },
    quiz: [
      { question: '¿Por qué separar etapas del pipeline?', options: ['Para observar errores y cambiar una etapa sin romper todo', 'Para ocultar datos', 'Para eliminar fuentes'], answer: 0, explanation: 'La separación mejora trazabilidad, pruebas y mantenimiento.' },
      { question: '¿Qué debe acompañar a un score?', options: ['Solo un color', 'Señales, fuentes, fechas e incertidumbre', 'Una promesa de certeza'], answer: 1, explanation: 'La explicación permite revisar y defender la decisión.' },
      { question: '¿Qué es monitoreo?', options: ['Revisar cómo cambian datos, reglas y resultados', 'Un diseño de logo', 'Borrar versiones'], answer: 0, explanation: 'El sistema debe seguir siendo válido después de operar.' }
    ]
  }
};

const moduleDetails: Record<string, Pick<AcademyModule, 'prerequisites' | 'practice' | 'project' | 'videos'>> = {
  python: {
    prerequisites: ['Ninguno; instala Python 3.11+ y aprende a usar la terminal.', 'Escribe y ejecuta pequeños scripts antes de avanzar.'],
    practice: ['Resolver 10 problemas de transformación de datos.', 'Leer JSON imperfecto y producir un reporte de calidad.', 'Construir un clasificador de señales con pruebas unitarias.'],
    project: {
      title: 'Pipeline de señales en Python',
      brief: 'Construye un script que reciba expedientes JSON, valide campos, calcule tres razones y entregue señales con evidencia y nivel de confianza.',
      deliverables: ['Código ejecutable y README.', 'Archivo de ejemplo con al menos 10 empresas.', 'Reporte que explique cada señal y sus limitaciones.'],
      rubric: ['Valida entradas y errores.', 'Separa funciones y pruebas.', 'Cada señal es explicable y reproducible.'],
      acceptedKeywords: ['valid', 'json', 'func', 'prueba', 'señal'],
      minimumMatches: 4
    },
    videos: [{ title: 'Curso completo de Python para principiantes', channel: 'freeCodeCamp.org', videoId: 'rfscVS0vtbw', why: 'Refuerza sintaxis, funciones, archivos y estructuras antes de automatizar análisis.' }]
  },
  sql: {
    prerequisites: ['Módulo Python recomendado.', 'Comprende filas, columnas, claves y relaciones.'],
    practice: ['Escribir consultas desde preguntas de negocio.', 'Comparar JOIN, subconsultas y CTE.', 'Auditar duplicados y cardinalidad.'],
    project: {
      title: 'Mapa de relaciones empresariales en SQL',
      brief: 'Diseña un esquema pequeño y crea consultas que detecten domicilios, representantes y cuentas compartidas, diferenciando coincidencia de señal.',
      deliverables: ['Esquema SQL con datos de prueba.', 'Cinco consultas comentadas.', 'Nota de calidad sobre duplicados, nulos y fechas.'],
      rubric: ['Claves y relaciones coherentes.', 'Consultas reproducibles.', 'Interpretación prudente de resultados.'],
      acceptedKeywords: ['join', 'group', 'distinct', 'calidad', 'consulta'],
      minimumMatches: 4
    },
    videos: [{ title: 'Curso completo de SQL y bases de datos', channel: 'freeCodeCamp.org', videoId: 'HXV3zeQKqGY', why: 'Acompaña la práctica de SELECT, JOIN, agregaciones, diseño y consultas analíticas.' }]
  },
  systems: {
    prerequisites: ['Manejo básico de terminal.', 'Conceptos elementales de hardware y sistema operativo.'],
    practice: ['Levantar una aplicación local y observar sus puertos.', 'Leer logs y construir una línea de tiempo.', 'Explicar DNS, TCP, TLS y HTTP con una captura controlada.'],
    project: {
      title: 'Investigación de una petición sospechosa',
      brief: 'Documenta el recorrido de una petición desde el origen hasta el servicio y señala qué evidencia conservarías para investigar un incidente.',
      deliverables: ['Diagrama de flujo.', 'Línea de tiempo de eventos.', 'Matriz de evidencia, propietario y retención.'],
      rubric: ['Orden técnico correcto.', 'Distingue observación e hipótesis.', 'Incluye origen, tiempo, actor y resultado.'],
      acceptedKeywords: ['dns', 'tcp', 'tls', 'http', 'log'],
      minimumMatches: 4
    },
    videos: []
  },
  statistics: {
    prerequisites: ['Álgebra básica.', 'Capacidad para leer tablas y porcentajes.'],
    practice: ['Calcular percentiles y tasas base.', 'Simular falsos positivos.', 'Explicar una correlación sin confundirla con causalidad.'],
    project: {
      title: 'Experimento de señales y tasa base',
      brief: 'Simula una población con fraude poco frecuente, mide una señal y demuestra cómo cambian los falsos positivos al variar la tasa base.',
      deliverables: ['Tabla o notebook reproducible.', 'Gráfica de resultados.', 'Conclusiones escritas para una persona no técnica.'],
      rubric: ['Define población y evento.', 'Calcula métricas correctamente.', 'Explica incertidumbre y límites.'],
      acceptedKeywords: ['tasa base', 'falso', 'probabilidad', 'muestra', 'incertidumbre'],
      minimumMatches: 4
    },
    videos: [{ title: 'Teorema de Bayes: geometría del cambio de creencias', channel: '3Blue1Brown', videoId: 'HZGCoVF3YvM', why: 'Visualiza Bayes para entender por qué una señal no equivale a una conclusión.' }]
  },
  underwriting: {
    prerequisites: ['Módulos Python, SQL y estadística.', 'Lectura básica de estados financieros.'],
    practice: ['Construir un análisis vertical y horizontal.', 'Comparar razones con pares y tendencia.', 'Redactar una decisión con condiciones y exposición.'],
    project: {
      title: 'Memo de riesgo de contraparte',
      brief: 'Evalúa una empresa B2B ficticia y recomienda aprobar, rechazar o aprobar con condiciones, defendiendo cada conclusión.',
      deliverables: ['Memo ejecutivo de dos páginas.', 'Cálculo de razones y supuestos.', 'Límites, garantías y plan de monitoreo.'],
      rubric: ['Separa liquidez, rentabilidad y solvencia.', 'Expone supuestos.', 'La decisión es proporcional y explicable.'],
      acceptedKeywords: ['flujo', 'deuda', 'liquidez', 'exposición', 'condición'],
      minimumMatches: 4
    },
    videos: []
  },
  fraud: {
    prerequisites: ['Estadística y SQL recomendados.', 'Distingue alerta, investigación y veredicto.'],
    practice: ['Crear reglas con razón de falsos positivos.', 'Detectar velocidad y concentración.', 'Escribir hipótesis alternativas para cada red flag.'],
    project: {
      title: 'Sistema de detección explicable',
      brief: 'Diseña un conjunto de señales de fraude para transacciones o empresas, con prioridad, evidencia, umbral y procedimiento de revisión.',
      deliverables: ['Catálogo de señales.', 'Matriz de precisión esperada y costo.', 'Playbook de investigación para tres alertas.'],
      rubric: ['No presenta señales como acusaciones.', 'Incluye controles contra sesgo.', 'Prioriza por impacto y evidencia.'],
      acceptedKeywords: ['señal', 'falso', 'umbral', 'evidencia', 'investigación'],
      minimumMatches: 4
    },
    videos: []
  },
  graph: {
    prerequisites: ['SQL y modelado de datos.', 'Comprende entidades, atributos y relaciones.'],
    practice: ['Modelar un grafo de empresas y personas.', 'Encontrar componentes y puentes.', 'Resolver entidades con evidencia múltiple.'],
    project: {
      title: 'Red empresarial y resolución de entidades',
      brief: 'Construye un grafo pequeño de empresas, socios, domicilios y proveedores; identifica comunidades y explica qué relaciones merecen revisión.',
      deliverables: ['Modelo de nodos y aristas.', 'Tres consultas o recorridos.', 'Informe de hipótesis y evidencia faltante.'],
      rubric: ['Distingue relación de identidad.', 'Evita inferir culpa por pertenencia.', 'Explica centralidad y contexto.'],
      acceptedKeywords: ['nodo', 'relación', 'entidad', 'comunidad', 'evidencia'],
      minimumMatches: 4
    },
    videos: []
  },
  security: {
    prerequisites: ['Linux, redes y sistemas.', 'Programación básica para leer código.'],
    practice: ['Hacer threat modeling de una aplicación.', 'Revisar autenticación y autorización.', 'Diseñar controles de mínimo privilegio y recuperación.'],
    project: {
      title: 'Threat model de VDMX Intelligence',
      brief: 'Modela activos, actores, fronteras de confianza, amenazas y controles para un motor de riesgo con datos empresariales.',
      deliverables: ['Diagrama de arquitectura.', 'Registro de amenazas priorizadas.', 'Plan de controles y evidencia de verificación.'],
      rubric: ['Identifica activos críticos.', 'Relaciona amenaza, control y evidencia.', 'Incluye abuso interno y falla operacional.'],
      acceptedKeywords: ['activo', 'amenaza', 'control', 'identidad', 'evidencia'],
      minimumMatches: 4
    },
    videos: [{ title: 'OWASP Top 10 2025 explicado', channel: 'Aikido Security', videoId: 'Jzr0Jdnq_EI', why: 'Sirve como repaso visual de fallas de acceso, configuración, inyección, autenticación y logging.' }]
  },
  'security-analytics': {
    prerequisites: ['Sistemas, redes y fundamentos de ciberseguridad.', 'Estadística descriptiva.'],
    practice: ['Normalizar eventos de autenticación.', 'Construir un baseline por usuario y servicio.', 'Priorizar alertas con contexto y severidad.'],
    project: {
      title: 'Triage de una campaña de accesos anómalos',
      brief: 'Analiza eventos de login, crea un baseline, correlaciona señales y redacta un informe de triage sin atribuir más de lo que prueban los datos.',
      deliverables: ['Esquema de eventos.', 'Reglas de detección y excepciones.', 'Informe con línea de tiempo y próximos pasos.'],
      rubric: ['Correlaciona tiempo, origen y actor.', 'Controla falsos positivos.', 'Distingue contención de atribución.'],
      acceptedKeywords: ['baseline', 'login', 'correlación', 'alerta', 'triage'],
      minimumMatches: 4
    },
    videos: [{ title: 'OWASP Top 10 2025 explicado', channel: 'Aikido Security', videoId: 'Jzr0Jdnq_EI', why: 'Conecta controles de aplicación con los eventos que después deben observarse en seguridad.' }]
  },
  osint: {
    prerequisites: ['SQL y fundamentos de seguridad.', 'Escritura clara y criterio para fuentes.'],
    practice: ['Evaluar confiabilidad y temporalidad.', 'Corroborar una identidad con fuentes independientes.', 'Registrar provenance y cadena de evidencia.'],
    project: {
      title: 'Expediente OSINT defendible',
      brief: 'Investiga una entidad ficticia usando fuentes públicas, registra cada afirmación, conserva contexto y separa hechos, inferencias y dudas.',
      deliverables: ['Matriz de fuentes.', 'Cronología de hallazgos.', 'Informe con citas, confianza y preguntas abiertas.'],
      rubric: ['Cada afirmación tiene origen.', 'Incluye fecha y contexto.', 'No expone datos personales innecesarios.'],
      acceptedKeywords: ['fuente', 'fecha', 'corrobor', 'evidencia', 'confianza'],
      minimumMatches: 4
    },
    videos: []
  },
  'machine-learning': {
    prerequisites: ['Python, SQL y estadística.', 'Álgebra básica y lectura de métricas.'],
    practice: ['Crear un dataset sin leakage.', 'Comparar reglas y modelos.', 'Calibrar probabilidades y revisar umbrales.'],
    project: {
      title: 'Score de riesgo con supervisión humana',
      brief: 'Construye un modelo o baseline de reglas, evalúalo fuera de muestra, analiza errores y define cuándo debe intervenir un analista.',
      deliverables: ['Notebook o script reproducible.', 'Tabla de métricas y calibración.', 'Documento de límites, sesgos y monitoreo.'],
      rubric: ['Evita leakage.', 'Reporta precision, recall y calibración.', 'Conecta umbral con costo y revisión humana.'],
      acceptedKeywords: ['modelo', 'recall', 'precision', 'calibración', 'leakage'],
      minimumMatches: 4
    },
    videos: [{ title: 'Regresión logística', channel: 'StatQuest with Josh Starmer', videoId: 'yIYKR4sgzI8', why: 'Explica visualmente un modelo interpretable para clasificación y scoring.' }]
  },
  engine: {
    prerequisites: ['Completar módulos anteriores o demostrar sus competencias.', 'Capacidad para documentar decisiones técnicas.'],
    practice: ['Diseñar contratos de datos.', 'Versionar señales y reglas.', 'Construir una evaluación reproducible con auditoría.'],
    project: {
      title: 'Capstone: VDMX Intelligence Engine',
      brief: 'Integra datos, resolución de entidades, señales, score, explicación, revisión humana y monitoreo en un caso B2B completo.',
      deliverables: ['Arquitectura y modelo de datos.', 'Pipeline ejecutable o prototipo.', 'Expediente de una contraparte.', 'Informe ejecutivo y plan de auditoría.'],
      rubric: ['Trazabilidad de extremo a extremo.', 'Decisiones explicables y revisables.', 'Seguridad, calidad y operación incluidas.'],
      acceptedKeywords: ['pipeline', 'entidad', 'señal', 'score', 'explicación', 'auditoría'],
      minimumMatches: 5
    },
    videos: []
  }
};

const supplementalLessons: Record<string, AcademyLesson[]> = {
  python: [
    { id: 'python-4', title: 'Diseño de pipelines', objective: 'Encadenar pasos sin perder trazabilidad.', content: 'Un pipeline debe poder reanudarse, repetirse y explicar qué ocurrió en cada etapa. Conserva entradas, salidas, versión de la regla y errores; evita una función gigante que mezcle lectura, cálculo y decisión.', example: 'raw -> validated -> normalized -> features -> signals' },
    { id: 'python-5', title: 'Pruebas y calidad', objective: 'Probar reglas antes de confiar en sus resultados.', content: 'Prueba casos normales, límites, datos faltantes y entradas maliciosas. Una regla de riesgo debe fallar de forma visible y tener ejemplos que otra persona pueda revisar.', example: 'assert leverage_flag(500, 100) is True\nassert leverage_flag(0, 0) is False' },
    { id: 'python-6', title: 'Automatización responsable', objective: 'Automatizar tareas repetibles con controles.', content: 'Automatizar no significa decidir sin supervisión. Define permisos, logs, límites de volumen, reintentos y una salida para revisión humana cuando la evidencia sea insuficiente.', example: 'if confidence < 0.7:\n    route_to_review(case)' }
  ],
  sql: [
    { id: 'sql-4', title: 'CTE y consultas legibles', objective: 'Construir consultas por etapas.', content: 'Una CTE permite nombrar pasos intermedios: entidades limpias, relaciones válidas y señales agregadas. Esto facilita revisar el razonamiento y cambiar una etapa sin esconder la lógica.', example: 'WITH clean AS (...), signals AS (...)\nSELECT * FROM signals;' },
    { id: 'sql-5', title: 'Índices y rendimiento', objective: 'Entender por qué una consulta escala o se vuelve lenta.', content: 'El rendimiento depende de filtros, cardinalidad, índices y volumen. Usa EXPLAIN, mide antes y después, y no optimices eliminando validaciones que protegen la interpretación.', example: 'EXPLAIN ANALYZE\nSELECT ...;' },
    { id: 'sql-6', title: 'Datos temporales', objective: 'Analizar cambios sin mezclar periodos.', content: 'Fechas de constitución, actualización, transacción y consulta no significan lo mismo. Usa ventanas temporales y evita usar información posterior a la decisión, porque produce leakage analítico.', example: 'WHERE observed_at <= decision_at' }
  ],
  systems: [
    { id: 'systems-4', title: 'Procesos y superficies de ataque', objective: 'Relacionar servicios con activos y permisos.', content: 'Un servicio expuesto es una superficie, no una vulnerabilidad automática. Identifica qué escucha, quién lo ejecuta, qué datos toca y qué controles limitan su impacto.', example: 'service -> identity -> permissions -> data' },
    { id: 'systems-5', title: 'HTTP y APIs', objective: 'Interpretar solicitudes y respuestas como evidencia.', content: 'Método, ruta, headers, autenticación, código de respuesta y latencia permiten reconstruir comportamiento. No guardes secretos en logs; redacta tokens y datos personales.', example: 'request: actor + route + method\nresponse: status + latency + result' },
    { id: 'systems-6', title: 'Resiliencia y recuperación', objective: 'Diseñar para fallas sin perder evidencia.', content: 'Backups, timeouts, colas, idempotencia y recuperación forman parte de la seguridad. Prueba restauraciones; un backup que nunca se restaura es una suposición, no un control.', example: 'failure -> detect -> contain -> recover -> learn' }
  ],
  statistics: [
    { id: 'statistics-4', title: 'Muestreo y sesgo', objective: 'Reconocer cuándo los datos no representan la población.', content: 'Una muestra puede estar sesgada por selección, supervivencia o disponibilidad. Antes de calcular un score pregunta quién quedó fuera, cuándo se observó y qué comportamiento induce el proceso.', example: 'population != observed_sample' },
    { id: 'statistics-5', title: 'Intervalos y estabilidad', objective: 'Comunicar incertidumbre de una estimación.', content: 'Una tasa calculada con pocos casos puede cambiar mucho. Los intervalos y la comparación por periodos evitan tratar un número puntual como una constante universal.', example: 'estimate + uncertainty_range' },
    { id: 'statistics-6', title: 'Experimentos de reglas', objective: 'Comparar una señal sin autoengañarse.', content: 'Define una métrica, un periodo, una población de comparación y un criterio de éxito antes de mirar resultados. Separa exploración de confirmación y documenta cambios.', example: 'hypothesis -> measure -> compare -> document' }
  ],
  underwriting: [
    { id: 'underwriting-4', title: 'Capital de trabajo', objective: 'Entender cuándo la operación consume caja.', content: 'Ventas crecientes no garantizan liquidez. Revisa cuentas por cobrar, inventarios, proveedores y ciclo de conversión de efectivo, siempre comparando fechas y calidad de los saldos.', example: 'cash_conversion = receivables + inventory - payables' },
    { id: 'underwriting-5', title: 'Escenarios y sensibilidad', objective: 'Evaluar qué ocurre cuando cambia un supuesto.', content: 'Construye escenarios base, adverso y severo. Una decisión sólida muestra qué variable rompe la capacidad de pago y qué mitigación reduce la exposición.', example: 'base -> adverse -> severe -> mitigation' },
    { id: 'underwriting-6', title: 'Monitoreo de contraparte', objective: 'Convertir una aprobación en una relación vigilada.', content: 'Define indicadores, frecuencia, gatillos y responsable. El monitoreo debe actualizar la decisión cuando aparecen hechos nuevos, no ser un reporte decorativo.', example: 'indicator -> threshold -> action -> owner' }
  ],
  fraud: [
    { id: 'fraud-4', title: 'Velocidad y comportamiento', objective: 'Detectar cambios de ritmo y secuencia.', content: 'La velocidad compara cantidad, tiempo y contexto: muchas altas desde un origen, cambios de cuenta seguidos o movimientos fuera del patrón. Ajusta por estacionalidad y actividad legítima.', example: 'velocity = events / time_window' },
    { id: 'fraud-5', title: 'Diseño contra evasión', objective: 'Anticipar cómo una regla puede ser burlada.', content: 'Si un actor conoce un umbral puede fragmentar montos, rotar identidades o esperar ventanas. Usa señales complementarias, límites adaptativos y revisión de casos cercanos al corte.', example: 'rule -> behavior_change -> new_signal' },
    { id: 'fraud-6', title: 'Investigación y cierre', objective: 'Cerrar alertas con un resultado auditable.', content: 'Una alerta debe terminar como descartada, pendiente, confirmada por evidencia o escalada. Registra qué se revisó, qué no se pudo comprobar y qué aprendizaje vuelve al sistema.', example: 'alert -> triage -> evidence -> disposition -> feedback' }
  ],
  graph: [
    { id: 'graph-4', title: 'Centralidad con contexto', objective: 'Interpretar importancia sin confundirla con culpabilidad.', content: 'Un nodo central puede ser un proveedor legítimo, un intermediario operativo o un concentrador de riesgo. La métrica dirige preguntas; la evidencia y el contexto sostienen conclusiones.', example: 'centrality -> hypothesis -> corroboration' },
    { id: 'graph-5', title: 'Comunidades y temporalidad', objective: 'Detectar grupos que cambian con el tiempo.', content: 'Una comunidad es una estructura matemática, no una acusación. Compara snapshots, altas, bajas y relaciones activas para encontrar cambios que merezcan investigación.', example: 'graph_t0 -> graph_t1 -> changed_edges' },
    { id: 'graph-6', title: 'Grafo explicable', objective: 'Mostrar por qué una relación llegó al expediente.', content: 'Guarda origen, fecha, tipo de relación y confianza de cada arista. Una visualización bonita sin provenance puede inducir una certeza que los datos no tienen.', example: 'edge = {source, target, type, date, provenance}' }
  ],
  security: [
    { id: 'security-4', title: 'Gestión de secretos', objective: 'Reducir el impacto de credenciales expuestas.', content: 'Separa secretos del código, usa rotación, mínimo privilegio y detección de exposición. La seguridad de una credencial incluye cómo se crea, almacena, usa, revoca y audita.', example: 'secret -> vault -> short_lived_access -> revoke' },
    { id: 'security-5', title: 'Integridad y cadena de suministro', objective: 'Confiar en dependencias y despliegues con evidencia.', content: 'Versiona dependencias, revisa cambios, limita permisos de CI/CD y conserva artefactos. Un paquete confiable hoy puede cambiar mañana; verifica procedencia y comportamiento.', example: 'source -> build -> artifact -> deploy -> verify' },
    { id: 'security-6', title: 'Respuesta a incidentes', objective: 'Actuar rápido sin destruir evidencia.', content: 'Preparación, detección, contención, erradicación, recuperación y lecciones aprendidas forman un ciclo. Define quién decide, qué se preserva y qué comunicación es necesaria.', example: 'prepare -> detect -> contain -> recover -> learn' }
  ],
  'security-analytics': [
    { id: 'security-analytics-4', title: 'Normalización de eventos', objective: 'Comparar eventos de fuentes distintas.', content: 'Un login de un proveedor de identidad y uno de una aplicación pueden tener nombres diferentes. Normaliza actor, origen, tiempo, acción, resultado y dispositivo antes de correlacionar.', example: 'source_event -> common_event_schema' },
    { id: 'security-analytics-5', title: 'Detección basada en hipótesis', objective: 'Escribir reglas que puedan ser refutadas.', content: 'Una buena detección describe comportamiento, contexto y evidencia esperada. Añade excepciones justificadas, ventana temporal y una prueba con datos normales.', example: 'hypothesis + context + evidence + test' },
    { id: 'security-analytics-6', title: 'Métricas del SOC', objective: 'Medir utilidad, no solo cantidad de alertas.', content: 'Volumen de alertas no equivale a seguridad. Observa tiempo de detección, tiempo de respuesta, tasa de falsos positivos, cobertura y calidad del cierre.', example: 'quality = signal + response + learning' }
  ],
  osint: [
    { id: 'osint-4', title: 'Búsqueda reproducible', objective: 'Documentar cómo encontraste un dato.', content: 'Registra consulta, fecha, URL, captura o archivo, idioma y contexto. La reproducibilidad permite que otra persona verifique el hallazgo sin depender de tu memoria.', example: 'query + timestamp + source + capture' },
    { id: 'osint-5', title: 'Corroboración y conflicto', objective: 'Resolver fuentes que no coinciden.', content: 'Cuando dos fuentes difieren, compara cercanía al hecho, fecha, independencia, evidencia primaria y posibles incentivos. No escojas la fuente que confirma tu hipótesis solo por conveniencia.', example: 'claim -> source_a/source_b -> evaluate -> qualify' },
    { id: 'osint-6', title: 'Ética y minimización', objective: 'Investigar sin ampliar daño innecesario.', content: 'Recolecta solo lo necesario, evita exponer datos personales y separa interés legítimo de curiosidad. Una investigación defendible también explica qué decidió no recopilar.', example: 'purpose -> minimum_data -> protect -> retain' }
  ],
  'machine-learning': [
    { id: 'machine-learning-4', title: 'Diseño de dataset', objective: 'Alinear variables, etiquetas y momento de decisión.', content: 'Cada fila debe representar una unidad clara y cada feature debe existir antes de decidir. Documenta definición, origen, faltantes, transformaciones y población.', example: 'unit + label_time + feature_time + provenance' },
    { id: 'machine-learning-5', title: 'Validación y drift', objective: 'Saber cuándo un modelo deja de representar la realidad.', content: 'Evalúa por tiempo, segmento y distribución. Drift en entradas o resultados puede degradar el score aunque el código no haya cambiado.', example: 'train -> validate -> monitor_distribution -> retrain_review' },
    { id: 'machine-learning-6', title: 'Gobernanza del modelo', objective: 'Mantener control humano y trazabilidad.', content: 'Versiona datos, código, parámetros, métricas y decisiones. Define responsable, frecuencia de revisión, límites de uso y proceso para retirar un modelo.', example: 'model_card + approval + monitoring + retirement' }
  ],
  engine: [
    { id: 'engine-4', title: 'Contratos de datos', objective: 'Definir qué significa que una entrada sea válida.', content: 'Un contrato especifica campos, tipos, rangos, fechas, provenance y comportamiento ante ausencia. Sin contrato, cada etapa interpreta el dato a su manera.', example: 'schema + constraints + owner + version' },
    { id: 'engine-5', title: 'Versionado de decisiones', objective: 'Reproducir qué habría decidido el sistema en el pasado.', content: 'Guarda versión de reglas, features, fuentes y modelo junto con cada evaluación. La reproducibilidad es necesaria para auditar, explicar y corregir.', example: 'assessment = data_version + rule_version + model_version' },
    { id: 'engine-6', title: 'Operación del motor', objective: 'Cerrar el ciclo entre evidencia y aprendizaje.', content: 'Mide cobertura, calidad, latencia, revisiones y resultados posteriores. Las correcciones de analistas deben convertirse en aprendizaje controlado, no en cambios invisibles.', example: 'observe -> review -> improve -> approve -> release' }
  ]
};

const modules: AcademyModule[] = baseModules.map((item) => ({
  ...item,
  ...learningContent[item.id],
  lessons: [...learningContent[item.id].lessons, ...supplementalLessons[item.id]],
  ...moduleDetails[item.id]
}));

const diagnosticItems = [
  ['programming', 'Programación'],
  ['data', 'Datos y SQL'],
  ['risk', 'Análisis de riesgo'],
  ['statistics', 'Estadística'],
  ['cyber', 'Ciberseguridad']
] as const;

const learningPhases = [
  { number: '01', title: 'Fundamentos técnicos', modules: 'Python · SQL · Sistemas', outcome: 'Leer, transformar y validar datos con criterio técnico.' },
  { number: '02', title: 'Riesgo y evidencia', modules: 'Estadística · Underwriting · Fraude', outcome: 'Convertir señales en decisiones explicables.' },
  { number: '03', title: 'Investigación y defensa', modules: 'Graph · Seguridad · OSINT', outcome: 'Investigar relaciones, amenazas y fuentes sin saltos lógicos.' },
  { number: '04', title: 'Modelado e integración', modules: 'Security Analytics · ML · Engine', outcome: 'Construir un motor de inteligencia auditable.' }
];

const defaultState: AcademyState = {
  weeklyHours: 25,
  completed: {},
  diagnostic: { programming: 1, data: 1, risk: 1, statistics: 1, cyber: 1 },
  activeModuleId: modules[0].id,
  lessonProgress: {},
  exerciseResponses: {},
  exerciseResults: {},
  quizAnswers: {},
  quizScores: {},
  projectNotes: {},
  projectResults: {}
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
    activeModuleId: modules.some((item) => item.id === candidate.activeModuleId) ? candidate.activeModuleId as string : defaultState.activeModuleId,
    lessonProgress: candidate.lessonProgress && typeof candidate.lessonProgress === 'object' ? candidate.lessonProgress : {},
    exerciseResponses: candidate.exerciseResponses && typeof candidate.exerciseResponses === 'object' ? candidate.exerciseResponses : {},
    exerciseResults: candidate.exerciseResults && typeof candidate.exerciseResults === 'object' ? candidate.exerciseResults : {},
    quizAnswers: candidate.quizAnswers && typeof candidate.quizAnswers === 'object' ? candidate.quizAnswers : {},
    quizScores: candidate.quizScores && typeof candidate.quizScores === 'object' ? candidate.quizScores : {},
    projectNotes: candidate.projectNotes && typeof candidate.projectNotes === 'object' ? candidate.projectNotes : {},
    projectResults: candidate.projectResults && typeof candidate.projectResults === 'object' ? candidate.projectResults : {}
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
  const [learningTab, setLearningTab] = useState<'lessons' | 'exercise' | 'test' | 'project'>('lessons');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [exerciseDraft, setExerciseDraft] = useState('');
  const [quizDraft, setQuizDraft] = useState<Record<string, number>>({});
  const [projectDraft, setProjectDraft] = useState('');
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
  const completedLessons = state.lessonProgress[activeModule.id] || [];
  const activeLessonIndex = Math.min(lessonIndex, activeModule.lessons.length - 1);
  const activeLesson = activeModule.lessons[activeLessonIndex];
  const activeExerciseResponse = state.exerciseResponses[activeModule.id] || '';
  const activeExercisePassed = Boolean(state.exerciseResults[activeModule.id]);
  const activeQuizScore = state.quizScores[activeModule.id];
  const activeProjectPassed = Boolean(state.projectResults[activeModule.id]);
  const totalMilestones = modules.reduce((sum, item) => sum + item.outcomes.length, 0);
  const completedTotal = modules.reduce((sum, item) => sum + (state.completed[item.id]?.length || 0), 0);
  const totalLessons = modules.reduce((sum, item) => sum + item.lessons.length, 0);
  const completedLessonTotal = modules.reduce((sum, item) => sum + (state.lessonProgress[item.id]?.length || 0), 0);
  const passedExerciseTotal = modules.filter((item) => state.exerciseResults[item.id]).length;
  const passedQuizTotal = modules.filter((item) => (state.quizScores[item.id] || 0) >= 70).length;
  const passedProjectTotal = modules.filter((item) => state.projectResults[item.id]).length;
  const progressItems = totalMilestones + totalLessons + modules.length * 3;
  const completedLearningItems = completedTotal + completedLessonTotal + passedExerciseTotal + passedQuizTotal + passedProjectTotal;
  const progress = Math.round((completedLearningItems / progressItems) * 100);
  const completedHours = Math.round(modules.reduce((sum, item) => sum + item.hours * ((state.completed[item.id]?.length || 0) / item.outcomes.length), 0));
  const months = Math.max(1, Math.round((1200 / (state.weeklyHours * 4.33)) * 10) / 10);

  useEffect(() => {
    setLessonIndex(0);
    setLearningTab('lessons');
    setExerciseDraft(state.exerciseResponses[activeModule.id] || '');
    setQuizDraft(state.quizAnswers[activeModule.id] || {});
    setProjectDraft(state.projectNotes[activeModule.id] || '');
  }, [activeModule.id]);

  const updateCompletion = (moduleId: string, index: number) => {
    setState((previous) => {
      const current = new Set<number>(previous.completed[moduleId] || []);
      if (current.has(index)) current.delete(index); else current.add(index);
      return { ...previous, completed: { ...previous.completed, [moduleId]: Array.from(current).sort((a, b) => a - b) } };
    });
  };

  const selectModule = (moduleId: string) => {
    setState((previous) => ({ ...previous, activeModuleId: moduleId }));
    setLessonIndex(0);
    setLearningTab('lessons');
    setExerciseDraft(state.exerciseResponses[moduleId] || '');
    setQuizDraft(state.quizAnswers[moduleId] || {});
    setProjectDraft(state.projectNotes[moduleId] || '');
  };

  const markLessonComplete = () => {
    setState((previous) => ({
      ...previous,
      lessonProgress: {
        ...previous.lessonProgress,
        [activeModule.id]: Array.from(new Set([...(previous.lessonProgress[activeModule.id] || []), activeLesson.id]))
      }
    }));
  };

  const reviewExercise = () => {
    const response = exerciseDraft.trim().toLowerCase();
    const matches = activeModule.exercise.acceptedKeywords.filter((keyword) => response.includes(keyword.toLowerCase())).length;
    const passed = response.length >= 12 && matches >= activeModule.exercise.minimumMatches;
    setState((previous) => ({
      ...previous,
      exerciseResponses: { ...previous.exerciseResponses, [activeModule.id]: exerciseDraft },
      exerciseResults: { ...previous.exerciseResults, [activeModule.id]: passed }
    }));
    setNotice(passed ? 'Ejercicio aprobado. Revisa también la solución.' : 'Aún falta evidencia en tu respuesta. Usa la pista y vuelve a intentarlo.');
  };

  const gradeQuiz = () => {
    const correct = activeModule.quiz.reduce((sum, question, index) => sum + (quizDraft[String(index)] === question.answer ? 1 : 0), 0);
    const score = Math.round((correct / activeModule.quiz.length) * 100);
    setState((previous) => ({
      ...previous,
      quizAnswers: { ...previous.quizAnswers, [activeModule.id]: quizDraft },
      quizScores: { ...previous.quizScores, [activeModule.id]: score }
    }));
    setNotice(`Test calificado: ${score}%.`);
  };

  const submitProject = () => {
    const response = projectDraft.trim().toLowerCase();
    const matches = activeModule.project.acceptedKeywords.filter((keyword) => response.includes(keyword.toLowerCase())).length;
    const passed = response.length >= 80 && matches >= activeModule.project.minimumMatches;
    setState((previous) => ({
      ...previous,
      projectNotes: { ...previous.projectNotes, [activeModule.id]: projectDraft },
      projectResults: { ...previous.projectResults, [activeModule.id]: passed }
    }));
    setNotice(passed ? 'Proyecto entregado. Usa la rúbrica para hacer una revisión crítica.' : 'El proyecto necesita más evidencia. Completa el brief y cubre la rúbrica antes de entregarlo.');
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
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Ruta de dominio</p><h2 className="mt-2 text-2xl font-bold">De programar a defender decisiones</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">Cada fase combina teoría, práctica, evaluación y un proyecto. El objetivo final no es memorizar herramientas: es poder explicar una decisión de riesgo con datos, código, contexto y límites.</p></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{learningPhases.map((phase) => <article key={phase.number} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><span className="text-2xl font-black text-primary/60">{phase.number}</span><h3 className="mt-3 font-bold">{phase.title}</h3><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{phase.modules}</p><p className="mt-3 text-sm leading-6 text-slate-400">{phase.outcome}</p></article>)}</div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Plan de estudios</h2><p className="mt-1 text-sm text-slate-400">Selecciona un módulo para ver sus objetivos y marcar avances.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Buscar módulos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary" /><select aria-label="Filtrar por área" value={area} onChange={(event) => setArea(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option>Todas</option><option>Datos</option><option>Riesgo</option><option>Ciberseguridad</option></select><select aria-label="Filtrar por nivel" value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option>Todos</option><option>Fundamentos</option><option>Intermedio</option><option>Avanzado</option></select></div></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredModules.map((item) => { const done = state.completed[item.id]?.length || 0; const lessonsDone = state.lessonProgress[item.id]?.length || 0; const quizScore = state.quizScores[item.id]; const itemProgress = Math.round(((lessonsDone + done + (state.exerciseResults[item.id] ? 1 : 0) + (quizScore !== undefined && quizScore >= 70 ? 1 : 0)) / (item.lessons.length + item.outcomes.length + 2)) * 100); return <button key={item.id} type="button" onClick={() => selectModule(item.id)} className={`text-left rounded-xl border p-4 transition-colors ${state.activeModuleId === item.id ? 'border-primary bg-primary/10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}><div className="flex items-start justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-primary">{item.area}</span><span className="text-xs text-slate-500">{item.hours} h</span></div><h3 className="mt-3 font-bold">{item.title}</h3><p className="mt-2 min-h-10 text-sm text-slate-400">{item.summary}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-primary" style={{ width: `${itemProgress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{lessonsDone}/{item.lessons.length} lecciones · {done}/{item.outcomes.length} objetivos{quizScore !== undefined ? ` · Test ${quizScore}%` : ''}</p></button>; })}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{activeModule.area} · {activeModule.level}</p><h2 className="mt-2 text-2xl font-bold">{activeModule.title}</h2><p className="mt-2 text-slate-400">{activeModule.summary}</p></div>
              <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">{completedLessons.length}/{activeModule.lessons.length} lecciones</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 border-b border-slate-800 md:grid-cols-4">
              {[
                ['lessons', 'Lecciones'],
                ['exercise', 'Ejercicio'],
                ['test', 'Test'],
                ['project', 'Proyecto y videos']
              ].map(([tab, label]) => <button key={tab} type="button" onClick={() => setLearningTab(tab as 'lessons' | 'exercise' | 'test' | 'project')} className={learningTab === tab ? 'border-b-2 border-primary px-3 py-3 text-sm font-semibold text-white' : 'border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-slate-500 hover:text-slate-300'}>{label}</button>)}
            </div>

            {learningTab === 'lessons' && <div className="mt-5 space-y-5">
              <div className="grid gap-2 md:grid-cols-3">
                {activeModule.lessons.map((lesson, index) => <button key={lesson.id} type="button" onClick={() => setLessonIndex(index)} className={activeLessonIndex === index ? 'rounded-lg border border-primary bg-primary/10 p-3 text-left' : 'rounded-lg border border-slate-800 bg-slate-950 p-3 text-left hover:border-slate-600'}>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Lección {index + 1}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-200">{lesson.title}</span>
                  <span className="mt-2 block text-xs text-slate-500">{completedLessons.includes(lesson.id) ? 'Completada' : 'Pendiente'}</span>
                </button>)}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Lección {activeLessonIndex + 1}</p>
                <h3 className="mt-2 text-xl font-bold">{activeLesson.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-300">Objetivo: {activeLesson.objective}</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">{activeLesson.content}</p>
                {activeLesson.example && <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-xs leading-6 text-blue-200"><code>{activeLesson.example}</code></pre>}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={markLessonComplete} className={completedLessons.includes(activeLesson.id) ? 'rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300' : 'rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600'}>{completedLessons.includes(activeLesson.id) ? 'Lección completada' : 'Marcar lección completada'}</button>
                  <div className="flex gap-2">
                    <button type="button" disabled={activeLessonIndex === 0} onClick={() => setLessonIndex((index) => Math.max(0, index - 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-40">Anterior</button>
                    <button type="button" disabled={activeLessonIndex === activeModule.lessons.length - 1} onClick={() => setLessonIndex((index) => Math.min(activeModule.lessons.length - 1, index + 1))} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:opacity-40">Siguiente</button>
                  </div>
                </div>
              </div>
            </div>}

            {learningTab === 'exercise' && <div className="mt-5 space-y-4">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Ejercicio práctico</p><h3 className="mt-2 text-lg font-bold">{activeModule.exercise.prompt}</h3></div>
              <textarea value={exerciseDraft} onChange={(event) => setExerciseDraft(event.target.value)} placeholder={activeModule.exercise.placeholder} rows={7} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100 outline-none focus:border-primary" />
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200"><strong>Pista:</strong> {activeModule.exercise.hint}</div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={reviewExercise} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600">Revisar ejercicio</button>
                {activeExercisePassed && <span className="text-sm font-semibold text-emerald-300">Aprobado y guardado</span>}
              </div>
              <details className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-300">Ver solución orientativa</summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">{activeModule.exercise.solution}</p>
              </details>
            </div>}

            {learningTab === 'test' && <div className="mt-5 space-y-5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Evaluación del módulo</p><h3 className="mt-2 text-lg font-bold">Responde las preguntas y califica tu comprensión.</h3></div>
              {activeModule.quiz.map((question, index) => <fieldset key={question.question} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-200">{index + 1}. {question.question}</legend>
                <div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <label key={option} className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm text-slate-300 hover:bg-slate-900"><input type="radio" name={'quiz-' + activeModule.id + '-' + index} checked={quizDraft[String(index)] === optionIndex} onChange={() => setQuizDraft((previous) => ({ ...previous, [String(index)]: optionIndex }))} className="mt-1 accent-primary" />{option}</label>)}</div>
                {activeQuizScore !== undefined && <p className="mt-3 text-xs text-slate-500">{question.explanation}</p>}
              </fieldset>)}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={gradeQuiz} disabled={Object.keys(quizDraft).length < activeModule.quiz.length} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40">Calificar test</button>
                {activeQuizScore !== undefined && <span className={activeQuizScore >= 70 ? 'text-sm font-semibold text-emerald-300' : 'text-sm font-semibold text-amber-300'}>Resultado: {activeQuizScore}%</span>}
              </div>
            </div>}

            {learningTab === 'project' && <div className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Antes de empezar</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">{activeModule.prerequisites.map((item) => <li key={item} className="flex gap-2"><span className="text-primary">→</span>{item}</li>)}</ul>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Práctica sugerida</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">{activeModule.practice.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-400">+</span>{item}</li>)}</ul>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Proyecto aplicado</p>
                <h3 className="mt-2 text-xl font-bold">{activeModule.project.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{activeModule.project.brief}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Entregables</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">{activeModule.project.deliverables.map((item) => <li key={item} className="flex gap-2"><span className="text-primary">•</span>{item}</li>)}</ul>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Rúbrica de dominio</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">{activeModule.project.rubric.map((item) => <li key={item} className="flex gap-2"><span className="text-emerald-400">✓</span>{item}</li>)}</ul>
                </div>
              </div>
              <textarea value={projectDraft} onChange={(event) => setProjectDraft(event.target.value)} placeholder="Documenta tu solución, decisiones, evidencia y limitaciones..." rows={9} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100 outline-none focus:border-primary" />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={submitProject} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600">Entregar proyecto</button>
                {activeProjectPassed && <span className="text-sm font-semibold text-emerald-300">Proyecto entregado y guardado</span>}
              </div>
              {activeModule.videos.length > 0 && <div className="border-t border-slate-800 pt-5">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Apoyo visual</p><h3 className="mt-2 text-lg font-bold">Videos seleccionados para este módulo</h3></div><span className="text-xs text-slate-500">Se abren en modo privacidad mejorada</span></div>
                <div className="mt-4 grid gap-4">{activeModule.videos.map((video) => <article key={video.videoId} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                  <div className="aspect-video bg-black"><iframe className="h-full w-full" src={'https://www.youtube-nocookie.com/embed/' + video.videoId} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
                  <div className="p-4"><p className="text-sm font-semibold text-slate-200">{video.title}</p><p className="mt-1 text-xs text-slate-500">{video.channel}</p><p className="mt-3 text-sm leading-6 text-slate-400">{video.why}</p></div>
                </article>)}</div>
              </div>}
              {activeModule.videos.length === 0 && <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">Este módulo prioriza práctica y fuentes de trabajo. Cuando exista un video realmente útil y estable para el tema, se añadirá aquí; mientras tanto no sustituimos la evidencia por contenido superficial.</div>}
            </div>}

            <div className="mt-7 border-t border-slate-800 pt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Objetivos del módulo</p>
              <div className="mt-3 space-y-3">{activeModule.outcomes.map((outcome, index) => <label key={outcome} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"><input type="checkbox" checked={completedMilestones.includes(index)} onChange={() => updateCompletion(activeModule.id, index)} className="mt-1 h-4 w-4 accent-primary" /><span className={completedMilestones.includes(index) ? 'text-slate-500 line-through' : 'text-slate-200'}>{outcome}</span></label>)}</div>
              <div className="mt-5 border-l-2 border-primary pl-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reto</p><p className="mt-1 text-sm text-slate-300">{activeModule.challenge}</p></div>
            </div>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-xl font-bold">Diagnóstico inicial</h2><p className="mt-1 text-sm text-slate-400">Actualiza tu nivel cuando quieras; queda incluido en la sincronización.</p><div className="mt-5 space-y-5">{diagnosticItems.map(([id, label]) => <div key={id}><div className="flex justify-between text-sm"><span>{label}</span><strong className="text-primary">{state.diagnostic[id]}/5</strong></div><input aria-label={label} type="range" min="1" max="5" value={state.diagnostic[id]} onChange={(event) => setState((previous) => ({ ...previous, diagnostic: { ...previous.diagnostic, [id]: Number(event.target.value) } }))} className="mt-2 w-full accent-primary" /></div>)}</div><div className="mt-6 rounded-lg bg-slate-950 p-4"><p className="text-sm text-slate-400">Promedio actual</p><strong className="text-3xl">{(Object.values(state.diagnostic).reduce<number>((sum, value) => sum + Number(value), 0) / diagnosticItems.length).toFixed(1)}<span className="text-base text-slate-500"> / 5</span></strong></div></article>
        </section>
      </div>
    </main>
  );
};
