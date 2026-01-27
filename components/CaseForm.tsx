import React, { useState } from 'react';
import { PACKAGE_REQUIREMENTS } from '../constants';

interface CaseFormProps {
  packageId: string;
  caseId: string;
  onSubmit: (data: Record<string, any>) => void;
}

export const CaseForm: React.FC<CaseFormProps> = ({ packageId, caseId, onSubmit }) => {
  const requirements = PACKAGE_REQUIREMENTS[packageId];
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load draft on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(`case_draft_${caseId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData && Object.keys(parsed.formData).length > 0) {
          setFormData(parsed.formData);
        }
      } catch (e) {
        console.error('Error restoring draft:', e);
      }
    }
  }, [caseId]);

  // Auto-save on change
  React.useEffect(() => {
    if (Object.keys(formData).length === 0) return;

    const key = `case_draft_${caseId}`;
    try {
      const existing = localStorage.getItem(key);
      const prevData = existing ? JSON.parse(existing) : {};

      localStorage.setItem(key, JSON.stringify({
        ...prevData,
        formData,
        lastUpdated: Date.now()
      }));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  }, [formData, caseId]);

  if (!requirements) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Error: Configuración de paquete no encontrada.</div>;
  }

  // Group fields by section
  const sections: Record<string, typeof requirements.fields> = {};
  requirements.fields.forEach(field => {
    const sec = field.section || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(field);
  });

  // Calculate Progress
  const totalRequired = requirements.fields.filter(f => f.required).length;
  const filledRequired = requirements.fields.filter(f => f.required && formData[f.name]).length;
  const progressPercent = totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 100;

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requirements.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'Este campo es obligatorio';
        isValid = false;
      }
    });

    if (isValid) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
      // Scroll to top error
      const firstError = document.querySelector('.error-msg');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white dark:bg-cardbg rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment</span>
              Información del Caso
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Complete los campos obligatorios (*) para continuar.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
            <p className="text-xs text-slate-500">Completado</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-right text-slate-400">
          {filledRequired} de {totalRequired} campos requeridos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.entries(sections).map(([sectionName, fields]) => (
          <div key={sectionName} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-l-4 border-primary pl-3">
              {sectionName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map(field => (
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all ${errors[field.name] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                          }`}
                      >
                        <option value="">Seleccione una opción</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-500 pointer-events-none">expand_more</span>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all ${errors[field.name] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all ${errors[field.name] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    />
                  )}

                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1 error-msg">
                      <span className="material-symbols-outlined text-sm">error</span> {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            {/* Logic: If it skips upload or docs are empty, say "Send to Analysis", else "Continue" */}
            {(requirements.skipUpload || requirements.documents.length === 0)
              ? 'Enviar a Análisis'
              : 'Continuar a Carga de Documentos'
            }
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
};