import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CaseStatus } from '../types';
import { PACKAGE_REQUIREMENTS, PACKAGES } from '../constants';
import { CaseForm } from '../components/CaseForm';
import { Toast, ToastType } from '../components/Toast';

// --- MOCK BACKEND VALIDATION ---
// This function simulates server-side checks. 
// In production, this logic lives in the API to prevent client-side tampering.
const validatePackageRules = (pkgId: string, step: 'FORM' | 'DOCS', data: any, files: any) => {
  const reqs = PACKAGE_REQUIREMENTS[pkgId];
  if (!reqs) return { valid: false, message: 'Paquete inválido' };

  if (step === 'FORM') {
    // 1. Check strict required fields
    const missing = reqs.fields.filter(f => f.required && !data[f.name]);
    if (missing.length > 0) return { valid: false, message: `Faltan campos obligatorios: ${missing.map(m => m.label).join(', ')}` };
  }

  if (step === 'DOCS') {
    // 2. Critical: auto-1 MUST NOT have documents
    // The backend must reject uploads if the package does not support them.
    if (reqs.skipUpload && Object.keys(files).length > 0) {
      return { valid: false, message: 'Error de integridad: Este paquete no admite carga de documentos.' };
    }

    if (!reqs.skipUpload) {
      // 3. Critical: auto-3 MUST have Seller ID
      if (pkgId === 'auto-3' && !files['id_vendedor']) {
        return { valid: false, message: 'Bloqueo de seguridad: Falta Identificación del Vendedor (Requerido para Auto-3).' };
      }

      // 4. Critical: Lease-3 MUST have full docs for Co-obligado
      if (pkgId === 'lease-3' && (!files['co_id'] || !files['co_domicilio'])) {
        return { valid: false, message: 'Bloqueo de seguridad: Faltan documentos del Coobligado.' };
      }

      // 5. Standard required check for all documents defined in the package
      // This handles explicit "required: false" (optional documents)
      const missingDocs = reqs.documents.filter(d => d.required && !files[d.id]);
      if (missingDocs.length > 0) {
        return { valid: false, message: `Faltan documentos obligatorios: ${missingDocs.map(d => d.name).join(', ')}` };
      }
    }
  }

  return { valid: true };
};

export const ClientDashboard: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const newCaseId = params.get('newCase');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logic to determine initial status. 
  const [activeCase, setActiveCase] = useState<{
    id: string;
    status: CaseStatus;
    packageId: string;
    updated: string;
    createdAt: string;
  } | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  // Support Modal State
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: 'Alex Morgan', // Pre-fill for demo
    email: 'alex.morgan@example.com', // Pre-fill for demo
    message: ''
  });
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchCaseStatus = async () => {
      if (!newCaseId) {
        setError('No se ha especificado un número de caso.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/case/${newCaseId}`);
        if (!response.ok) {
          setError('Caso no encontrado.');
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        // Allow PAYMENT_PENDING to pass through for UI handling
        const initialStatus = data.status === 'PAID' ? 'FORM_PENDING' : data.status;

        let finalStatus = initialStatus;

        // Restore from LocalStorage ONLY if payment is cleared
        if (data.status !== 'PAYMENT_PENDING') {
          const savedDraft = localStorage.getItem(`case_draft_${data.id}`);
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft);
              if (draft.status) {
                console.log('Restoring draft status:', draft.status);
                finalStatus = draft.status;
              }
              if (draft.formData) {
                setFormData(draft.formData);
              }
            } catch (e) {
              console.error('Error restoring draft:', e);
            }
          }
        }

        setActiveCase({
          id: data.id,
          status: finalStatus,
          packageId: data.packageId,
          updated: new Date(data.lastUpdated).toLocaleDateString(),
          createdAt: data.lastUpdated // Using lastUpdated as proxy for creation in mock, in real app use created_at
        });
        setIsLoading(false);

      } catch (err) {
        console.error(err);
        setError('Error de conexión al verificar el estado del caso.');
        setIsLoading(false);
      }
    };

    fetchCaseStatus();
  }, [newCaseId]);

  // Polling for Payment Confirmation
  useEffect(() => {
    if (activeCase?.status === 'PAYMENT_PENDING') {
      let attempts = 0;
      const maxAttempts = 8; // Approx 16 seconds (2s interval)

      const interval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(interval);
          // Do NOT auto-fail, just stop polling and let user retry manually if needed
          return;
        }

        try {
          // Poll the backend
          const response = await fetch(`/api/case/${activeCase.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'PAID') {
              setActiveCase(prev => prev ? ({
                ...prev,
                status: 'FORM_PENDING',
                // Force refresh fields from BE if needed
              }) : null);
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [activeCase?.status, activeCase?.id]);

  const handleManualPaymentCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/case/${activeCase?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'PAID') {
          setActiveCase(prev => prev ? ({ ...prev, status: 'FORM_PENDING' }) : null);
        } else {
          setToast({ message: 'El pago aún no se ha confirmado. Intenta en unos segundos.', type: 'info' });
        }
      }
    } catch (error) {
      setToast({ message: 'Error de conexión.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Persist Status Changes & Cleanup on Complete
  useEffect(() => {
    if (!activeCase) return;

    const TERMINAL_STATUSES: CaseStatus[] = ['REPORT_READY', 'DELIVERED', 'CLOSED'];
    const key = `case_draft_${activeCase.id}`;

    if (TERMINAL_STATUSES.includes(activeCase.status)) {
      localStorage.removeItem(key);
    } else {
      try {
        const existing = localStorage.getItem(key);
        const prevData = existing ? JSON.parse(existing) : {};
        localStorage.setItem(key, JSON.stringify({
          ...prevData,
          status: activeCase.status,
          lastUpdated: Date.now()
        }));
      } catch (e) {
        console.error('Error persisting status:', e);
      }
    }
  }, [activeCase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">sync</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verificando estatus del caso...</h2>
        </div>
      </div>
    );
  }

  if (error || !activeCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <div className="text-center p-8 max-w-md bg-white dark:bg-cardbg rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Acceso Denegado</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'No se pudo cargar la información del caso.'}</p>
          <a href="/" className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold">Volver al Inicio</a>
        </div>
      </div>
    );
  }

  if (activeCase.status === 'PAYMENT_PENDING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-darkbg text-center p-4">
        <div className="bg-white dark:bg-cardbg p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800 animate-fade-in relative overflow-hidden">
          {/* Progress bar for polling visual */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-primary animate-progress-indeterminate"></div>
          </div>

          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary relative">
            <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-primary animate-spin"></div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Confirmando tu pago...</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Estamos validando la transacción con el banco. Esto puede tomar unos momentos.
          </p>

          <div className="text-xs text-slate-400">
            No cierres esta ventana.
          </div>

          <button
            onClick={handleManualPaymentCheck}
            className="mt-6 text-sm text-primary font-bold hover:underline"
          >
            ¿Tarda demasiado? Verificar estado manualmente
          </button>
        </div>
      </div>
    );
  }

  const requirements = PACKAGE_REQUIREMENTS[activeCase.packageId];
  const pkgDetails = PACKAGES.find(p => p.id === activeCase.packageId);


  const handleFormSubmit = (data: Record<string, any>) => {
    if (!activeCase) return;
    // --- SERVER SIDE VALIDATION SIMULATION ---
    // --- SERVER SIDE VALIDATION SIMULATION ---
    const validation = validatePackageRules(activeCase.packageId, 'FORM', data, null);
    if (!validation.valid) {
      setToast({ message: `Revisa el formulario: ${validation.message}`, type: 'error' });
      return;
    }
    // -----------------------------------------
    // -----------------------------------------

    setFormData(data);

    if (requirements?.skipUpload || requirements?.documents.length === 0) {
      setActiveCase(prev => (prev ? { ...prev, status: 'READY_FOR_ANALYSIS' } : null));
      setTimeout(() => setActiveCase(prev => (prev ? { ...prev, status: 'IN_ANALYSIS' } : null)), 2000);
    } else {
      setActiveCase(prev => (prev ? { ...prev, status: 'DOCUMENTS_PENDING' } : null));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (reqId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 1. Validate Size (Max 5MB)
      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setToast({ message: `El archivo excede el límite de ${MAX_SIZE_MB}MB.`, type: 'error' });
        e.target.value = ''; // Reset input
        return;
      }

      setUploadedFiles(prev => ({
        ...prev,
        [reqId]: file
      }));
    }
  };

  const handleCopyId = () => {
    if (activeCase?.id) {
      navigator.clipboard.writeText(`${window.location.origin}/#/dashboard?newCase=${activeCase.id}`);
      setToast({ message: 'Enlace del caso copiado al portapapeles', type: 'success' });
    }
  };

  const handleClearDraft = () => {
    if (window.confirm('¿Estás seguro? Esto borrará tus datos guardados en este dispositivo.')) {
      localStorage.removeItem(`case_draft_${activeCase?.id}`);
      // Ideally redirect or reload
      window.location.reload();
    }
  };

  const handleFinishUpload = () => {
    if (!activeCase) return;
    // --- SERVER SIDE VALIDATION SIMULATION ---
    // --- SERVER SIDE VALIDATION SIMULATION ---
    const validation = validatePackageRules(activeCase.packageId, 'DOCS', formData, uploadedFiles);
    if (!validation.valid) {
      setToast({ message: `Validación fallida: ${validation.message}`, type: 'error' });
      return; // Block progress
    }
    // -----------------------------------------

    setActiveCase(prev => (prev ? { ...prev, status: 'READY_FOR_ANALYSIS' } : null));
    setTimeout(() => setActiveCase(prev => (prev ? { ...prev, status: 'IN_ANALYSIS' } : null)), 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.message.trim()) {
      setToast({ message: 'Por favor, describe tu problema antes de enviar.', type: 'error' });
      return;
    }

    setIsSupportSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSupportSubmitting(false);
      setIsSupportOpen(false);
      setSupportForm(prev => ({ ...prev, message: '' }));
      setToast({
        message: 'Solicitud enviada. Te contactaremos pronto.',
        type: 'success'
      });
    }, 1500);
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'FORM_PENDING': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'DOCUMENTS_PENDING': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'IN_ANALYSIS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20 animate-pulse';
      case 'READY_FOR_ANALYSIS': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'REPORT_READY': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-500';
    }
  };

  const getStatusText = (status: CaseStatus) => {
    switch (status) {
      case 'FORM_PENDING': return 'Completar Información';
      case 'DOCUMENTS_PENDING': return 'Subir Documentos';
      case 'READY_FOR_ANALYSIS': return 'Listo para Análisis';
      case 'IN_ANALYSIS': return 'En Análisis';
      case 'REPORT_READY': return 'Reporte Listo';
      default: return status;
    }
  };

  const showDocsStep = !requirements?.skipUpload;

  const steps = [
    { label: 'Pago', status: 'PAID' },
    { label: 'Formulario', status: 'FORM_PENDING' },
    ...(showDocsStep ? [{ label: 'Documentos', status: 'DOCUMENTS_PENDING' }] : []),
    { label: 'Análisis', status: 'IN_ANALYSIS' },
    { label: 'Entrega', status: 'REPORT_READY' }
  ];

  const getCurrentStepIndex = (status: CaseStatus) => {
    if (status === 'FORM_PENDING') return 1;
    if (status === 'DOCUMENTS_PENDING') return 2;
    if (status === 'READY_FOR_ANALYSIS' || status === 'IN_ANALYSIS') return showDocsStep ? 3 : 2;
    if (status === 'REPORT_READY') return showDocsStep ? 4 : 3;
    return 0;
  };

  const getEstimatedDelivery = (startDateStr: string) => {
    const start = new Date(startDateStr);
    // Add 24 hours
    const eta = new Date(start.getTime() + (24 * 60 * 60 * 1000));

    // Simple business day logic: if Sunday, add 1 day
    if (eta.getDay() === 0) {
      eta.setDate(eta.getDate() + 1);
    }

    // Format: "Mañana a las 14:00" or date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', hour: 'numeric', minute: '2-digit' };
    return eta.toLocaleDateString('es-MX', options);
  };

  const currentStep = getCurrentStepIndex(activeCase.status);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Caso</h1>
            <p className="text-slate-500 text-sm mt-1">{pkgDetails?.name || 'Paquete Seleccionado'}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-cardbg rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="text-sm">
              <p className="font-bold text-slate-900 dark:text-white">Alex Morgan</p>
              <p className="text-xs text-slate-500">Cliente</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status & Progress Card */}
            <div className="bg-white dark:bg-cardbg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {activeCase.id}
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(activeCase.status)}`}>
                      {getStatusText(activeCase.status)}
                    </span>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Última actualización</p>
                  <p className="text-sm font-medium dark:text-slate-200">{activeCase.updated}</p>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative pt-4 pb-8 px-2">
                <div className="flex justify-between items-center mb-2">
                  {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center relative z-10 w-20">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${index <= currentStep ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                        {index < currentStep ? <span className="material-symbols-outlined text-sm">check</span> : index + 1}
                      </div>
                      <span className={`text-[10px] mt-2 font-medium ${index <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                  {/* Track Line */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                    <div
                      className="h-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Form */}
            {activeCase.status === 'FORM_PENDING' && (
              <CaseForm
                packageId={activeCase.packageId}
                caseId={activeCase.id}
                onSubmit={handleFormSubmit}
              />
            )}

            {/* Step 2: Upload (Only if not skipped) */}
            {activeCase.status === 'DOCUMENTS_PENDING' && showDocsStep && requirements && (
              <div className="bg-white dark:bg-cardbg rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    Carga de Documentos
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Suba los archivos solicitados para validar la información.
                  </p>
                </div>

                <div className="space-y-4">
                  {requirements.documents.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {doc.name}
                          {doc.required
                            ? <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Requerido</span>
                            : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Opcional</span>
                          }
                        </h4>
                        <p className="text-xs text-slate-500">{doc.section}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {uploadedFiles[doc.id] ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {uploadedFiles[doc.id].name.substring(0, 15)}...
                            <button
                              onClick={() => {
                                const newFiles = { ...uploadedFiles };
                                delete newFiles[doc.id];
                                setUploadedFiles(newFiles);
                              }}
                              className="ml-2 hover:text-red-500"
                            >
                              <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                          </div>
                        ) : (
                          <label className={`cursor-pointer px-4 py-2 border rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${doc.required
                            ? "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600"
                            : "bg-transparent border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-primary hover:border-primary"
                            }`}>
                            <span className="material-symbols-outlined">cloud_upload</span>
                            Subir Archivo
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(doc.id, e)} accept=".pdf,.jpg,.png,.jpeg" />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleFinishUpload}
                    className="px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    Confirmar y Enviar a Análisis
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Processing / Analysis */}
            {(activeCase.status === 'IN_ANALYSIS' || activeCase.status === 'READY_FOR_ANALYSIS') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analizando Información</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                  {requirements?.skipUpload
                    ? "Hemos recibido los datos del vehículo. Estamos consultando bases de datos especializadas."
                    : "Hemos recibido su expediente completo. Nuestro equipo de analistas y el sistema de IA están procesando los datos."}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-blue-500">timer</span>
                  Entrega estimada: <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {getEstimatedDelivery(activeCase.createdAt || new Date().toISOString())}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-cardbg rounded-2xl p-6 border border-slate-200 dark:border-slate-700 sticky top-24">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">info</span> Resumen
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paquete</span>
                  <span className="font-medium text-slate-900 dark:text-white text-right">{pkgDetails?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Folio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 dark:text-white">{activeCase.id}</span>
                    <button onClick={handleCopyId} className="text-blue-500 hover:text-blue-700" title="Copiar enlace">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha</span>
                  <span className="text-slate-900 dark:text-white">{activeCase.updated}</span>
                </div>
              </div>

              <hr className="my-6 border-slate-100 dark:border-slate-700" />

              {/* Draft Cleanup (Privacy) */}
              <div className="mb-6">
                <button onClick={handleClearDraft} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  Borrar datos de este dispositivo
                </button>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white mb-2">¿Necesita ayuda?</h3>
              <p className="text-xs text-slate-500 mb-4">Si tiene problemas con el formulario o la carga de documentos, contacte a soporte.</p>
              <button
                onClick={() => setIsSupportOpen(true)}
                className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">support_agent</span>
                Contactar Soporte
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SUPPORT MODAL */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">support_agent</span>
                Soporte Técnico
              </h3>
              <button
                onClick={() => setIsSupportOpen(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg flex gap-3">
                <span className="material-symbols-outlined text-xl">info</span>
                <p>Este canal es exclusivamente para dudas relacionadas con tu análisis activo ({activeCase.id}).</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Folio (Validado)</label>
                <input
                  type="text"
                  value={activeCase.id}
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={supportForm.name}
                  onChange={e => setSupportForm({ ...supportForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={supportForm.email}
                  onChange={e => setSupportForm({ ...supportForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción del problema</label>
                <textarea
                  required
                  rows={4}
                  value={supportForm.message}
                  onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                  placeholder="Describa su problema o solicitud..."
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSupportSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSupportSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};