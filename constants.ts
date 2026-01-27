import { ServicePackage, PackageRequirement } from './types';

export const PACKAGES: ServicePackage[] = [
  // Automotive Packages
  {
    id: 'auto-1',
    type: 'AUTOMOTIVE',
    name: 'Historial Automotriz',
    price: 499,
    description: 'Reporte informativo de estatus general del vehículo.',
    features: [
      'Consulta de historial especializado',
      'Validación de créditos activos',
      'Identificación de empeños',
      'Reporte de robo y choques',
      'Kilometraje reportado'
    ]
  },
  {
    id: 'auto-2',
    type: 'AUTOMOTIVE',
    name: 'Revisión Documental',
    price: 1299,
    description: 'Validación técnica de documentos y coherencia legal.',
    features: [
      'Todo lo de Historial Automotriz',
      'Validación de factura original',
      'Verificación de tarjeta de circulación',
      'Validación de cadena de propiedad',
      'Score de riesgo automotriz (0-1000)'
    ],
    recommended: true
  },
  {
    id: 'auto-3',
    type: 'AUTOMOTIVE',
    name: 'Análisis Integral',
    price: 1999,
    description: 'Máxima seguridad con validación de vendedor y precios.',
    features: [
      'Todo lo de Revisión Documental',
      'Consulta a bases de subastas',
      'Verificación de número de motor',
      'Validación de identidad del vendedor',
      'Estimación de precio óptimo de compra'
    ]
  },
  // Leasing Packages
  {
    id: 'lease-1',
    type: 'LEASING',
    name: 'Análisis de Arrendatario',
    price: 899,
    description: 'Validación profesional del inquilino.',
    features: [
      'Validación de identidad (INE/Pasaporte)',
      'Consulta RENAPO, INE, RNP, IMSS',
      'Análisis forense de documentos digitales',
      'Consulta de Buró de Crédito (autogestionado)',
      'Verificación de referencias'
    ]
  },
  {
    id: 'lease-2',
    type: 'LEASING',
    name: 'Arrendatario + Aval',
    price: 1799,
    description: 'Protección estándar para contratos con aval.',
    features: [
      'Todo lo del Paquete Básico',
      'Análisis completo del arrendatario',
      'Análisis completo del aval',
      'Reporte consolidado',
      'Recomendación técnica conjunta'
    ],
    recommended: true
  },
  {
    id: 'lease-3',
    type: 'LEASING',
    name: 'Suite Premium',
    price: 2999,
    description: 'Cobertura total: Inquilino, Aval y Coobligado.',
    features: [
      'Análisis completo del arrendatario',
      'Análisis completo del aval',
      'Análisis completo del coobligado',
      'Evaluación comparativa de perfiles',
      'Entrega prioritaria (72h)'
    ]
  },

];

// Configuration of fields and documents per package
export const PACKAGE_REQUIREMENTS: Record<string, PackageRequirement> = {
  // --- AUTOMOTIVE ---
  'auto-1': { // A1 - Historial Automotriz (SIN DOCUMENTOS)
    id: 'auto-1',
    fields: [
      { name: 'vin', label: 'Número de Serie (VIN)', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'placas', label: 'Placas', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'marca', label: 'Marca', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'anio', label: 'Año', type: 'number', required: true, section: 'Datos del Vehículo' }
    ],
    documents: [], // Empty for A1
    skipUpload: true // Skip upload step
  },
  'auto-2': { // A2 - Revisión Documental
    id: 'auto-2',
    fields: [
      { name: 'vin', label: 'Número de Serie (VIN)', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'placas', label: 'Placas', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'marca', label: 'Marca', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'anio', label: 'Año', type: 'number', required: true, section: 'Datos del Vehículo' },
      { name: 'tipo_factura', label: 'Tipo de Factura', type: 'select', required: true, options: ['Factura de Origen', 'Refactura', 'Factura de Aseguradora'], section: 'Documentación' },
      { name: 'propietario_actual', label: 'Nombre del Propietario Actual', type: 'text', required: true, section: 'Documentación' }
    ],
    documents: [
      { id: 'factura_front', name: 'Factura Original / Refactura (Frente)', required: true, section: 'Documentos Vehiculares' },
      { id: 'factura_back', name: 'Factura Original / Refactura (Reverso)', required: true, section: 'Documentos Vehiculares' },
      { id: 'tarjeta_front', name: 'Tarjeta de Circulación (Frente)', required: true, section: 'Documentos Vehiculares' },
      { id: 'tarjeta_back', name: 'Tarjeta de Circulación (Reverso)', required: true, section: 'Documentos Vehiculares' }
    ]
  },
  'auto-3': { // A3 - Análisis Integral
    id: 'auto-3',
    fields: [
      { name: 'vin', label: 'Número de Serie (VIN)', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'placas', label: 'Placas', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'marca', label: 'Marca', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'anio', label: 'Año', type: 'number', required: true, section: 'Datos del Vehículo' },
      { name: 'version', label: 'Versión (ej. XLE, Sport)', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'color', label: 'Color', type: 'text', required: true, section: 'Datos del Vehículo' },
      { name: 'kilometraje', label: 'Kilometraje Actual', type: 'number', required: true, section: 'Datos del Vehículo' },
      { name: 'tipo_factura', label: 'Tipo de Factura', type: 'select', required: true, options: ['Factura de Origen', 'Refactura', 'Factura de Aseguradora'], section: 'Documentación' },
      { name: 'propietario_actual', label: 'Nombre del Propietario Actual', type: 'text', required: true, section: 'Documentación' },
      { name: 'vendedor_nombre', label: 'Nombre del Vendedor', type: 'text', required: true, section: 'Datos del Vendedor' },
      { name: 'vendedor_telefono', label: 'Teléfono del Vendedor', type: 'tel', required: true, section: 'Datos del Vendedor' },
      { name: 'vendedor_email', label: 'Correo del Vendedor', type: 'email', required: true, section: 'Datos del Vendedor' },
      { name: 'precio', label: 'Precio Solicitado', type: 'number', required: true, section: 'Transacción' }
    ],
    documents: [
      // Factura Principal
      { id: 'factura_front', name: 'Factura Original / Refactura (Frente)', required: true, section: 'Factura Principal' },
      { id: 'factura_back', name: 'Factura Original / Refactura (Reverso/Endosos)', required: true, section: 'Factura Principal' },

      // Facturas Adicionales (Opcionales)
      { id: 'factura_2_front', name: 'Factura Adicional 1 (Frente)', required: false, section: 'Facturas Adicionales' },
      { id: 'factura_2_back', name: 'Factura Adicional 1 (Reverso)', required: false, section: 'Facturas Adicionales' },
      { id: 'factura_3_front', name: 'Factura Adicional 2 (Frente)', required: false, section: 'Facturas Adicionales' },
      { id: 'factura_3_back', name: 'Factura Adicional 2 (Reverso)', required: false, section: 'Facturas Adicionales' },

      // Tarjeta Circulación
      { id: 'tarjeta_front', name: 'Tarjeta de Circulación (Frente)', required: true, section: 'Documentos Vehiculares' },
      { id: 'tarjeta_back', name: 'Tarjeta de Circulación (Reverso)', required: true, section: 'Documentos Vehiculares' },

      // ID Vendedor
      { id: 'id_vendedor_front', name: 'INE/ID Vendedor (Frente)', required: true, section: 'Identidad Vendedor' },
      { id: 'id_vendedor_back', name: 'INE/ID Vendedor (Reverso)', required: true, section: 'Identidad Vendedor' }
    ]
  },
  // --- LEASING ---
  'lease-1': { // R1 - Básico
    id: 'lease-1',
    fields: [
      { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'curp', label: 'CURP', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'rfc', label: 'RFC', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'telefono', label: 'Teléfono', type: 'tel', required: true, section: 'Datos de Contacto' },
      { name: 'email', label: 'Correo Electrónico', type: 'email', required: true, section: 'Datos de Contacto' },
      { name: 'domicilio', label: 'Domicilio Actual', type: 'text', required: true, section: 'Datos de Contacto' },
      { name: 'ocupacion', label: 'Ocupación', type: 'text', required: true, section: 'Datos Laborales' },
      { name: 'empresa', label: 'Empresa', type: 'text', required: true, section: 'Datos Laborales' },
      { name: 'monto_renta', label: 'Monto de Renta', type: 'number', required: true, section: 'Arrendamiento' }
    ],
    documents: [
      documents: [
        { id: 'id_oficial_front', name: 'Identificación Oficial (Arrendatario - Frente)', required: true, section: 'Arrendatario' },
        { id: 'id_oficial_back', name: 'Identificación Oficial (Arrendatario - Reverso)', required: true, section: 'Arrendatario' },
        { id: 'comp_domicilio', name: 'Comprobante de Domicilio (Arrendatario)', required: true, section: 'Arrendatario' },
        // Strict 3 months bank statements logic
        { id: 'edos_cuenta_m1', name: 'Estado de Cuenta (Mes 1)', required: true, section: 'Solvencia Arrendatario' },
        { id: 'edos_cuenta_m2', name: 'Estado de Cuenta (Mes 2)', required: true, section: 'Solvencia Arrendatario' },
        { id: 'edos_cuenta_m3', name: 'Estado de Cuenta (Mes 3)', required: true, section: 'Solvencia Arrendatario' },
        // Payroll optional
        { id: 'recibos_nomina', name: 'Recibos de Nómina (Solo si es asalariado)', required: false, section: 'Solvencia Arrendatario' },
        { id: 'buro', name: 'Reporte de Buró de Crédito', required: true, section: 'Historial Crediticio' }
      ]
  },
  'lease-2': { // R2 - Estándar (Arrendatario + Aval)
    id: 'lease-2',
    fields: [
      // Tenant (Strict match of R1)
      { name: 'nombre', label: 'Nombre Completo (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'curp', label: 'CURP (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'rfc', label: 'RFC (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'telefono', label: 'Teléfono (Arrendatario)', type: 'tel', required: true, section: 'Datos del Arrendatario' },
      { name: 'email', label: 'Correo Electrónico (Arrendatario)', type: 'email', required: true, section: 'Datos del Arrendatario' },
      { name: 'domicilio', label: 'Domicilio Actual (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'ocupacion', label: 'Ocupación (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'empresa', label: 'Empresa (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'monto_renta', label: 'Monto de Renta', type: 'number', required: true, section: 'Arrendamiento' },
      // Aval
      { name: 'aval_nombre', label: 'Nombre Completo (Aval)', type: 'text', required: true, section: 'Datos del Aval' },
      { name: 'aval_curp', label: 'CURP (Aval)', type: 'text', required: true, section: 'Datos del Aval' },
      { name: 'aval_telefono', label: 'Teléfono (Aval)', type: 'tel', required: true, section: 'Datos del Aval' },
      { name: 'aval_email', label: 'Correo Electrónico (Aval)', type: 'email', required: true, section: 'Datos del Aval' },
      { name: 'aval_domicilio', label: 'Domicilio (Aval)', type: 'text', required: true, section: 'Datos del Aval' }
    ],
    documents: [
      // Tenant Docs (Strict match of R1)
      { id: 'id_oficial_front', name: 'Identificación Oficial (Arrendatario - Frente)', required: true, section: 'Arrendatario' },
      { id: 'id_oficial_back', name: 'Identificación Oficial (Arrendatario - Reverso)', required: true, section: 'Arrendatario' },
      { id: 'comp_domicilio', name: 'Comprobante de Domicilio (Arrendatario)', required: true, section: 'Arrendatario' },
      // Strict 3 months bank statements logic for Tenant
      { id: 'edos_cuenta_m1', name: 'Estado de Cuenta (Mes 1 - Arrendatario)', required: true, section: 'Arrendatario' },
      { id: 'edos_cuenta_m2', name: 'Estado de Cuenta (Mes 2 - Arrendatario)', required: true, section: 'Arrendatario' },
      { id: 'edos_cuenta_m3', name: 'Estado de Cuenta (Mes 3 - Arrendatario)', required: true, section: 'Arrendatario' },
      // Payroll optional
      { id: 'recibos_nomina', name: 'Recibos de Nómina (Arrendatario - Opcional)', required: false, section: 'Arrendatario' },
      { id: 'buro', name: 'Reporte de Buró de Crédito', required: true, section: 'Arrendatario' },

      // Aval Docs (No Bureau)
      { id: 'aval_id_front', name: 'Identificación Oficial (Aval - Frente)', required: true, section: 'Aval' },
      { id: 'aval_id_back', name: 'Identificación Oficial (Aval - Reverso)', required: true, section: 'Aval' },
      { id: 'aval_domicilio', name: 'Comprobante de Domicilio (Aval)', required: true, section: 'Aval' },
      { id: 'aval_edos', name: 'Estados de Cuenta (Aval - 3 meses)', required: true, section: 'Aval' }
    ]
  },
  'lease-3': { // R3 - Premium (Arrendatario + Aval + Coobligado)
    id: 'lease-3',
    fields: [
      // Tenant (Strict match of R1/R2)
      { name: 'nombre', label: 'Nombre Completo (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'curp', label: 'CURP (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'rfc', label: 'RFC (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'telefono', label: 'Teléfono (Arrendatario)', type: 'tel', required: true, section: 'Datos del Arrendatario' },
      { name: 'email', label: 'Correo Electrónico (Arrendatario)', type: 'email', required: true, section: 'Datos del Arrendatario' },
      { name: 'domicilio', label: 'Domicilio Actual (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'ocupacion', label: 'Ocupación (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'empresa', label: 'Empresa (Arrendatario)', type: 'text', required: true, section: 'Datos del Arrendatario' },
      { name: 'monto_renta', label: 'Monto de Renta', type: 'number', required: true, section: 'Arrendamiento' },
      // Aval (Strict match of R2)
      { name: 'aval_nombre', label: 'Nombre Completo (Aval)', type: 'text', required: true, section: 'Datos del Aval' },
      { name: 'aval_curp', label: 'CURP (Aval)', type: 'text', required: true, section: 'Datos del Aval' },
      { name: 'aval_telefono', label: 'Teléfono (Aval)', type: 'tel', required: true, section: 'Datos del Aval' },
      { name: 'aval_email', label: 'Correo Electrónico (Aval)', type: 'email', required: true, section: 'Datos del Aval' },
      { name: 'aval_domicilio', label: 'Domicilio (Aval)', type: 'text', required: true, section: 'Datos del Aval' },
      // Coobligado (New Superseded Profile)
      { name: 'co_nombre', label: 'Nombre Completo (Coobligado)', type: 'text', required: true, section: 'Datos del Coobligado' },
      { name: 'co_curp', label: 'CURP (Coobligado)', type: 'text', required: true, section: 'Datos del Coobligado' },
      { name: 'co_telefono', label: 'Teléfono (Coobligado)', type: 'tel', required: true, section: 'Datos del Coobligado' },
      { name: 'co_email', label: 'Correo Electrónico (Coobligado)', type: 'email', required: true, section: 'Datos del Coobligado' },
      { name: 'co_domicilio', label: 'Domicilio (Coobligado)', type: 'text', required: true, section: 'Datos del Coobligado' }
    ],
    documents: [
      // Tenant Docs (Strict match of R1)
      { id: 'id_oficial_front', name: 'Identificación Oficial (Arrendatario - Frente)', required: true, section: 'Arrendatario' },
      { id: 'id_oficial_back', name: 'Identificación Oficial (Arrendatario - Reverso)', required: true, section: 'Arrendatario' },
      { id: 'comp_domicilio', name: 'Comprobante de Domicilio (Arrendatario)', required: true, section: 'Arrendatario' },
      // Strict 3 months bank statements logic for Tenant
      { id: 'edos_cuenta_m1', name: 'Estado de Cuenta (Mes 1 - Arrendatario)', required: true, section: 'Arrendatario' },
      { id: 'edos_cuenta_m2', name: 'Estado de Cuenta (Mes 2 - Arrendatario)', required: true, section: 'Arrendatario' },
      { id: 'edos_cuenta_m3', name: 'Estado de Cuenta (Mes 3 - Arrendatario)', required: true, section: 'Arrendatario' },
      // Payroll optional
      { id: 'recibos_nomina', name: 'Recibos de Nómina (Arrendatario - Opcional)', required: false, section: 'Arrendatario' },
      { id: 'buro', name: 'Reporte de Buró de Crédito', required: true, section: 'Arrendatario' },

      // Aval Docs (Strict match of R2)
      { id: 'aval_id_front', name: 'Identificación Oficial (Aval - Frente)', required: true, section: 'Aval' },
      { id: 'aval_id_back', name: 'Identificación Oficial (Aval - Reverso)', required: true, section: 'Aval' },
      { id: 'aval_domicilio', name: 'Comprobante de Domicilio (Aval)', required: true, section: 'Aval' },
      { id: 'aval_edos', name: 'Estados de Cuenta (Aval - 3 meses)', required: true, section: 'Aval' },

      // Coobligado Docs
      { id: 'co_id_front', name: 'Identificación Oficial (Coobligado - Frente)', required: true, section: 'Coobligado' },
      { id: 'co_id_back', name: 'Identificación Oficial (Coobligado - Reverso)', required: true, section: 'Coobligado' },
      { id: 'co_domicilio', name: 'Comprobante de Domicilio (Coobligado)', required: true, section: 'Coobligado' },
      { id: 'co_edos', name: 'Estados de Cuenta (Coobligado - 3 meses)', required: true, section: 'Coobligado' }
    ]
  },
  'test-pkg': {
    id: 'test-pkg',
    fields: [
      { name: 'prueba_campo', label: 'Campo de Prueba', type: 'text', required: false, section: 'Prueba' }
    ],
    documents: [
      { id: 'doc_prueba', name: 'Documento de Prueba (PDF/Imagen)', required: true, section: 'Prueba' }
    ],
    skipUpload: false
  }
};