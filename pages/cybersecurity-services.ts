export const services = [
  {
    id: 'soc',
    title: 'Detección y respuesta a incidentes',
    label: 'SOC / MDR',
    icon: 'crisis_alert',
    description: 'Detectamos señales de ataque y coordinamos la respuesta para contener el impacto en tu operación.',
    capabilities: [
      'Centro de Operaciones de Seguridad (SOC) y detección y respuesta administradas (MDR)',
      'Clasificación de alertas y automatización con SIEM y SOAR',
      'Contención, análisis forense digital y ejercicios Purple Team',
    ],
  },
  {
    id: 'seguridad-ofensiva',
    title: 'Seguridad ofensiva',
    label: 'Pentest / Red Team',
    icon: 'gpp_maybe',
    description: 'Ponemos a prueba tus controles en un alcance autorizado para encontrar fallas que puedan explotarse.',
    capabilities: [
      'Pentest de aplicaciones, API, infraestructura y redes inalámbricas',
      'Red Team, ingeniería social y simulación de adversarios',
      'Análisis de vulnerabilidades y código, y validación de correcciones',
    ],
  },
  {
    id: 'secops',
    title: 'Operaciones de seguridad',
    label: 'SecOps',
    icon: 'manage_search',
    description: 'Afinamos la visibilidad de tu entorno para investigar amenazas y responder con el contexto necesario.',
    capabilities: [
      'Monitoreo, detección y coordinación de respuesta con CSIRT',
      'Inteligencia de amenazas y búsqueda proactiva (threat hunting)',
      'Patrullaje digital, protección de marca y gestión de SIEM',
    ],
  },
  {
    id: 'mssp',
    title: 'Servicios administrados',
    label: 'MSSP',
    icon: 'settings_suggest',
    description: 'Operamos y ajustamos las herramientas de seguridad que sostienen el trabajo diario de tu equipo.',
    capabilities: [
      'Implementación, integración y soporte de plataformas',
      'Administración de controles de identidad, endpoints, redes y nube',
      'Especialistas asignados, seguimiento operativo y reportes',
    ],
  },
  {
    id: 'riesgo-digital',
    title: 'Gestión de riesgos digitales',
    label: 'CROC',
    icon: 'encrypted',
    description: 'Identificamos exposiciones dentro y fuera de tu organización y ordenamos su atención por impacto.',
    capabilities: [
      'Monitoreo de superficie de ataque, suplantaciones y filtraciones',
      'Seguimiento de riesgos operativos, regulatorios y de terceros',
      'Riesgo humano y medidas para reducir la exposición',
    ],
  },
  {
    id: 'consultoria',
    title: 'Consultoría y cumplimiento',
    label: 'GRC',
    icon: 'verified_user',
    description: 'Aterrizamos los requisitos de seguridad en controles, responsables y planes que tu equipo pueda ejecutar.',
    capabilities: [
      'Diagnóstico y preparación para auditorías con ISO 27001, NIST CSF y PCI DSS',
      'Gobierno de identidades y de IA, privacidad y arquitectura de nube',
      'Acompañamiento a CISO, continuidad, recuperación y simulacros de crisis',
    ],
  },
] as const;
