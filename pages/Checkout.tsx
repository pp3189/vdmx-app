import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PACKAGES, PACKAGE_REQUIREMENTS } from '../constants';
import { API_BASE_URL } from '../config';

import { Toast, ToastType } from '../components/Toast';

export const Checkout: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const selectedPackage = PACKAGES.find(p => p.id === packageId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  if (!selectedPackage) {
    return <div>Paquete no válido</div>;
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          price: selectedPackage.price,
          name: selectedPackage.name
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ message: 'No se pudo iniciar la sesión de pago. Intenta de nuevo.', type: 'error' });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Error de conexión. Verifica tu internet y vuelve a intentar.', type: 'error' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-darkbg">
      <div className="max-w-3xl mx-auto px-4">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-8 hover:text-primary">
          <span className="material-symbols-outlined">arrow_back</span> Volver
        </button>

        <div className="grid md:grid-cols-1 gap-8 max-w-lg mx-auto">
          {/* Order Summary */}
          <div className="bg-white dark:bg-cardbg rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Resumen de Compra</h2>

            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{selectedPackage.name}</h4>
                <p className="text-sm text-slate-500">{selectedPackage.type === 'AUTOMOTIVE' ? 'Automotriz' : 'Arrendamiento'}</p>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">${selectedPackage.price}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {selectedPackage.features.slice(0, 5).map((f, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-lg text-green-500">check_circle</span> {f}
                </li>
              ))}
            </ul>

            {/* Required Documents Warning Section */}
            <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
              <h3 className="text-orange-700 dark:text-orange-400 font-bold mb-3 flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-lg">folder_open</span>
                Requisitos para este análisis:
              </h3>

              {PACKAGE_REQUIREMENTS[selectedPackage.id]?.documents.length > 0 ? (
                <ul className="space-y-2">
                  {PACKAGE_REQUIREMENTS[selectedPackage.id].documents.map(doc => (
                    <li key={doc.id} className="flex items-start gap-2 text-xs text-orange-900 dark:text-orange-200">
                      <span className="material-symbols-outlined text-sm mt-0.5">description</span>
                      <span>
                        <span className="font-semibold">{doc.name}</span>
                        {doc.required && <span className="text-[10px] ml-1 opacity-75">(Obligatorio)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-orange-800 dark:text-orange-300">
                  Este análisis se realiza con información pública y bases de datos. No requerirás subir documentos adicionales.
                </p>
              )}

              {PACKAGE_REQUIREMENTS[selectedPackage.id]?.skipUpload && (
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-2 font-medium">✨ Análisis digital sin subida de documentos.</p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full h-14 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Redirigiendo a Stripe...
                </>
              ) : (
                `Pagar con Tarjeta Segura`
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Pagos procesados y protegidos por Stripe SSL
            </p>
          </div>
        </div>
      </div>

      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </div >
  );
};