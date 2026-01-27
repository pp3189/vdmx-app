import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-cardbg rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Aviso de Privacidad Integral</h1>
          <p className="text-lg text-primary font-bold mb-8">VDMX Risk Intelligence</p>

          <div className="space-y-8 text-slate-600 dark:text-slate-300">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Identidad y domicilio del responsable</h2>
              <p>
                VDMX Risk Intelligence, representado por José Armando Ramírez Macías, persona física, con domicilio fiscal en calle 24 Sur número 3705, colonia El Mirador, código postal 72530, Puebla, Puebla, es responsable del tratamiento de los datos personales y documentación que se recaban a través de este sitio web, formularios, plataformas digitales o cualquier otro medio relacionado con la prestación de sus servicios.
              </p>
              <p className="mt-2">
                El presente Aviso de Privacidad se emite en cumplimiento de lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento y demás disposiciones aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Datos personales y documentación que se recaban</h2>
              <p className="mb-2">
                Para la prestación de servicios de análisis, verificación y evaluación de riesgo, VDMX Risk Intelligence podrá recabar, de manera directa o indirecta, los siguientes datos y documentos, según el servicio contratado:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de identificación y contacto del titular</li>
                <li>Información relacionada con vehículos (VIN, placas, marca, modelo, año, número de serie, etc.)</li>
                <li>Documentos relacionados con vehículos, tales como: Facturas automotrices, Tenencias, Tarjeta de circulación, Comprobantes de pago, adeudos o historial vehicular.</li>
                <li>Documentos de identificación proporcionados por terceros involucrados en la operación, tales como identificación oficial del vendedor (INE u otros documentos equivalentes).</li>
                <li>Archivos digitales, imágenes o copias electrónicas de la documentación proporcionada.</li>
                <li>Información técnica necesaria para la generación de reportes de análisis y verificación.</li>
              </ul>
              <p className="mt-2">
                El titular manifiesta contar con la autorización necesaria de terceros para proporcionar su documentación con fines de análisis y verificación.
              </p>
              <p className="mt-2">
                VDMX Risk Intelligence no solicita datos personales sensibles, salvo aquellos que, de manera excepcional, sean estrictamente necesarios para la correcta prestación del servicio y sean proporcionados voluntariamente por el titular.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Finalidades del tratamiento de los datos</h2>
              
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Finalidades primarias (necesarias)</h3>
              <p>Los datos personales y documentación recabados serán utilizados para las siguientes finalidades primarias, indispensables para la prestación del servicio:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Prestar servicios de análisis, verificación y evaluación de riesgo</li>
                <li>Realizar consultas en bases de datos públicas y privadas</li>
                <li>Validar documentación de manera automática o manual</li>
                <li>Generar reportes informativos y resultados de análisis</li>
                <li>Contactar al titular para efectos relacionados con el servicio contratado</li>
                <li>Dar cumplimiento a obligaciones legales y contractuales</li>
              </ul>

              <h3 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">Finalidades secundarias (adicionales)</h3>
              <p>De manera adicional y solo cuando el titular no manifieste oposición, los datos podrán ser utilizados para:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Mejora de procesos internos y calidad del servicio</li>
                <li>Análisis estadístico</li>
                <li>Desarrollo, entrenamiento y mejora de modelos, algoritmos y sistemas de detección de irregularidades, incluyendo el reconocimiento de patrones, formatos, firmas, sellos u otros elementos técnicos en documentos, siempre de forma anonimizada, disociada o despersonalizada, sin fines de identificación individual.</li>
              </ul>
              <p className="mt-2">El titular podrá oponerse en cualquier momento al tratamiento de sus datos para estas finalidades secundarias.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Transferencia y comunicación de datos a terceros</h2>
              <p>
                Para la correcta prestación de los servicios ofrecidos, VDMX Risk Intelligence podrá compartir o comunicar información estrictamente necesaria con proveedores de información, plataformas tecnológicas, bases de datos públicas o privadas, agencias, despachos o terceros especializados, con la única finalidad de realizar consultas, validaciones y análisis de riesgo, incluyendo la validación manual o técnica de documentos cuando sea necesario.
              </p>
              <p className="mt-2">
                Dichos terceros únicamente tendrán acceso a la información indispensable para ejecutar las consultas correspondientes y estarán obligados a mantener la confidencialidad y seguridad de los datos, conforme a la legislación aplicable.
              </p>
              <p className="mt-2">
                VDMX Risk Intelligence no comercializa, vende ni transfiere datos personales para fines distintos a los descritos en el presente Aviso de Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Conservación y almacenamiento de la información</h2>
              <p>
                VDMX Risk Intelligence conservará los datos personales y documentación proporcionada únicamente durante el tiempo necesario para cumplir con las finalidades descritas en el presente Aviso de Privacidad, incluyendo la prestación del servicio, la generación de reportes, la atención de aclaraciones, la mejora de sistemas y el cumplimiento de obligaciones legales.
              </p>
              <p className="mt-2">
                Una vez cumplidas dichas finalidades, los datos podrán ser bloqueados, anonimizados o eliminados, conforme a los plazos legales aplicables y a las políticas internas de conservación de información.
              </p>
              <p className="mt-2">
                El almacenamiento de la información se realiza mediante medidas de seguridad administrativas, técnicas y físicas razonables, orientadas a proteger los datos contra daño, pérdida, alteración, destrucción o uso no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Responsabilidad sobre la información proporcionada</h2>
              <p>
                El titular declara que los datos y documentación proporcionados son veraces, completos y actualizados.
              </p>
              <p className="mt-2">
                VDMX Risk Intelligence no se hace responsable por errores, omisiones o inexactitudes derivadas de información incorrecta, incompleta o falsa proporcionada por el titular, las cuales podrán afectar la calidad, alcance o conclusividad del análisis realizado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)</h2>
              <p>El titular de los datos personales tiene derecho a:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Acceder a sus datos personales</li>
                <li>Rectificarlos cuando sean inexactos o incompletos</li>
                <li>Cancelarlos cuando considere que no se requieren para alguna de las finalidades señaladas</li>
                <li>Oponerse al tratamiento de los mismos</li>
              </ul>
              <p className="mt-2">
                Para ejercer los derechos ARCO, el titular deberá enviar una solicitud mediante los medios de contacto que se indiquen en el sitio web de VDMX Risk Intelligence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">8. Uso de cookies y tecnologías similares</h2>
              <p>
                El sitio web podrá utilizar cookies u otras tecnologías similares para mejorar la experiencia del usuario. El titular puede configurar su navegador para rechazarlas o eliminarlas, sin que ello afecte el acceso a los servicios principales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">9. Cambios al Aviso de Privacidad</h2>
              <p>
                VDMX Risk Intelligence se reserva el derecho de modificar o actualizar el presente Aviso de Privacidad en cualquier momento para adaptarlo a cambios legislativos, políticas internas o nuevos requerimientos del servicio.
              </p>
              <p className="mt-2">
                Las modificaciones estarán disponibles en el sitio web correspondiente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">10. Aceptación del Aviso de Privacidad</h2>
              <p>
                El uso del sitio web, el envío de información, la carga de documentación y/o la contratación de cualquiera de los servicios ofrecidos por VDMX Risk Intelligence implica la aceptación expresa del presente Aviso de Privacidad.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
