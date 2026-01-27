import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-cardbg rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Términos de Uso y Condiciones</h1>
          <p className="text-lg text-primary font-bold mb-8">VDMX Risk Intelligence</p>

          <div className="space-y-8 text-slate-600 dark:text-slate-300">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Identidad del prestador del servicio</h2>
              <p>
                Los presentes Términos de Uso y Condiciones regulan el acceso y utilización del sitio web y los servicios ofrecidos por VDMX Risk Intelligence, representado por José Armando Ramírez Macías, persona física, con domicilio fiscal en calle 24 Sur número 3705, colonia El Mirador, código postal 72530, Puebla, Puebla.
              </p>
              <p className="mt-2">
                El acceso al sitio web y la contratación de los servicios implica la aceptación expresa de los presentes Términos de Uso y Condiciones.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Naturaleza del servicio</h2>
              <p>
                VDMX Risk Intelligence ofrece servicios de análisis, verificación y evaluación de riesgo, principalmente relacionados con información vehicular y documentación asociada, con base en:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Información proporcionada por el usuario</li>
                <li>Consultas en fuentes públicas y privadas</li>
                <li>Análisis técnico y documental</li>
              </ul>
              <p className="mt-2">
                Los reportes emitidos tienen carácter informativo y no constituyen asesoría legal, financiera, fiscal ni técnica definitiva.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Alcance y limitaciones del servicio</h2>
              <p>El usuario reconoce y acepta que:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>La disponibilidad, alcance y profundidad de la información dependen de fuentes externas.</li>
                <li>La ausencia de información no implica inexistencia de riesgos.</li>
                <li>VDMX Risk Intelligence no garantiza resultados específicos, sino la realización de un análisis conforme a la información disponible al momento de la consulta.</li>
                <li>El servicio se considera prestado una vez iniciado el proceso de análisis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Información proporcionada por el usuario</h2>
              <p>El usuario declara y garantiza que:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>La información y documentación proporcionada es veraz, completa y actualizada.</li>
                <li>Cuenta con la autorización necesaria de terceros para proporcionar documentación relacionada con vehículos o personas involucradas (por ejemplo, identificación del vendedor).</li>
              </ul>
              <p className="mt-2">
                VDMX Risk Intelligence no se hace responsable por errores, omisiones o inexactitudes derivadas de información incorrecta, incompleta o falsa proporcionada por el usuario, ni por las consecuencias derivadas de ello.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Uso y validación de documentación</h2>
              <p>El usuario acepta que:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>La documentación proporcionada (facturas, tenencias, tarjetas de circulación, identificaciones, entre otros) podrá ser analizada de forma automática o manual.</li>
                <li>En caso necesario, dicha documentación podrá ser compartida con terceros especializados (agencias, proveedores o plataformas) únicamente para fines de validación y análisis, conforme al Aviso de Privacidad.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Pagos y contraprestación</h2>
              <p>
                Los servicios ofrecidos por VDMX Risk Intelligence están sujetos al pago de una contraprestación, la cual será informada previamente al usuario.
              </p>
              <p className="mt-2 font-semibold">Una vez iniciado el análisis:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>No aplican reembolsos, salvo error atribuible directamente a VDMX Risk Intelligence.</li>
                <li>La imposibilidad de realizar un análisis completo derivada de información incorrecta, incompleta o falsa proporcionada por el usuario no será causa de reembolso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Uso de los reportes</h2>
              <p>Los reportes generados:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Son para uso informativo del usuario que contrata el servicio.</li>
                <li>No podrán ser revendidos, reproducidos ni utilizados con fines ilícitos o fraudulentos.</li>
              </ul>
              <p className="mt-2">
                VDMX Risk Intelligence no se hace responsable por el uso que el usuario haga de los reportes emitidos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Limitación de responsabilidad</h2>
              <p>VDMX Risk Intelligence no será responsable por:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Daños directos o indirectos derivados del uso del sitio web o de los reportes emitidos.</li>
                <li>Decisiones tomadas por el usuario con base en la información proporcionada.</li>
                <li>Fallas, interrupciones o indisponibilidad de fuentes externas consultadas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Propiedad intelectual</h2>
              <p>
                Todos los contenidos del sitio web, incluyendo textos, gráficos, logotipos, diseños y reportes, son propiedad de VDMX Risk Intelligence o se utilizan bajo licencia, y están protegidos por la legislación aplicable en materia de propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Modificaciones a los Términos</h2>
              <p>
                VDMX Risk Intelligence se reserva el derecho de modificar o actualizar los presentes Términos de Uso y Condiciones en cualquier momento.
              </p>
              <p className="mt-2">
                Las modificaciones estarán disponibles en el sitio web correspondiente y serán aplicables a partir de su publicación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">11. Legislación aplicable y jurisdicción</h2>
              <p>
                Los presentes Términos de Uso y Condiciones se rigen por las leyes aplicables en los Estados Unidos Mexicanos.
              </p>
              <p className="mt-2">
                Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de Puebla, Puebla, renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">12. Aceptación de los Términos</h2>
              <p>
                El uso del sitio web, el envío de información, la carga de documentación y/o la contratación de cualquier servicio implica la aceptación expresa de los presentes Términos de Uso y Condiciones.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
