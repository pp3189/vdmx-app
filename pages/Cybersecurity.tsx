import React, { useEffect, useRef, useState } from 'react';
import { services } from './cybersecurity-services';
import './cybersecurity.css';

const title = 'Ciberseguridad empresarial | VDMX Risk Intelligence';
const description = 'Ciberseguridad para empresas. VDMX ofrece SOC, respuesta a incidentes, pentesting, servicios administrados, gestión de riesgos y consultoría.';
const whatsappNumber = '522221111154';

const navigation = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#enfoque', label: 'Nuestro enfoque' },
  { href: '#contacto', label: 'Contacto' },
];

const approach = [
  ['Entendemos tu exposición', 'Identificamos activos críticos, controles existentes y los escenarios que más pueden afectar tu operación.'],
  ['Acordamos qué atender primero', 'Definimos el alcance, las prioridades y los entregables de acuerdo con tus riesgos y obligaciones.'],
  ['Medimos el avance', 'Documentamos hallazgos, damos seguimiento a las correcciones y verificamos cómo cambia tu exposición.'],
];

function whatsappUrl(service?: string) {
  const message = service
    ? `Hola, VDMX. Me interesa conocer el alcance de ${service} para mi empresa.`
    : 'Hola, VDMX. Me interesa hablar sobre ciberseguridad para mi empresa.';
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function Icon({ name }: { name: string }) {
  return <span className="cyber-icon" aria-hidden="true">{name}</span>;
}

function Brand() {
  return (
    <a className="cyber-brand" href="#inicio" aria-label="VDMX Risk Intelligence, inicio">
      <img src="/transunion-query/vdmx-logo.png" width="1015" height="311" alt="" />
    </a>
  );
}

export function Cybersecurity() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    const target = document.getElementById(window.location.hash.slice(1));
    target?.scrollIntoView();
  }, []);

  return (
    <div className="cyber" id="inicio">
      <a className="cyber-skip" href="#contenido">Saltar al contenido</a>
      <header className="cyber-header">
        <div className="cyber-container cyber-header-inner" onKeyDown={event => {
          if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false);
            menuButton.current?.focus();
          }
        }}>
          <Brand />
          <button
            className="cyber-menu-toggle"
            type="button"
            ref={menuButton}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="cyber-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <nav id="cyber-menu" className="cyber-nav" aria-label="Navegación principal" data-open={menuOpen}>
            {navigation.map(({ href, label }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a className="cyber-nav-cta" href="/#/">Portal de verificación <Icon name="arrow_outward" /></a>
          </nav>
        </div>
      </header>

      <main id="contenido" tabIndex={-1}>
        <section className="cyber-hero" aria-labelledby="cyber-title">
          <img className="cyber-hero-photo" src="/ciberseguridad/centro-de-datos.webp" alt="" fetchPriority="high" />
          <div className="cyber-container cyber-hero-inner">
            <div className="cyber-hero-content">
              <h1 id="cyber-title">Ciberseguridad <span>para tu empresa</span></h1>
              <p>Encuentra tus puntos débiles, detecta amenazas a tiempo y responde con un plan que proteja la operación de tu empresa.</p>
              <div className="cyber-actions">
                <a className="cyber-button cyber-primary" href="#servicios">Explorar servicios <Icon name="arrow_downward" /></a>
                <a className="cyber-button cyber-outline" href="#contacto">Hablar con VDMX <Icon name="arrow_forward" /></a>
              </div>
            </div>
          </div>
        </section>

        <section className="cyber-services" id="servicios" aria-labelledby="cyber-services-title" tabIndex={-1}>
          <div className="cyber-container">
            <div className="cyber-section-intro">
              <h2 id="cyber-services-title">Servicios de ciberseguridad</h2>
              <p>Desde una prueba de penetración hasta la operación de tus controles, definimos el alcance según lo que tu empresa necesita proteger.</p>
            </div>
            <div className="cyber-service-grid">
              {services.map(service => (
                <article className="cyber-service" key={service.id} id={service.id}>
                  <div className="cyber-service-top">
                    <div className="cyber-service-icon"><Icon name={service.icon} /></div>
                    <span>{service.label}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.capabilities.map(capability => <li key={capability}>{capability}</li>)}
                  </ul>
                  <a
                    href={whatsappUrl(service.title.toLocaleLowerCase('es-MX'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Consultar servicio de ${service.title.toLocaleLowerCase('es-MX')} por WhatsApp`}
                  >
                    Consultar servicio <Icon name="arrow_outward" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cyber-approach" id="enfoque" aria-labelledby="cyber-approach-title" tabIndex={-1}>
          <div className="cyber-container cyber-approach-layout">
            <div>
              <h2 id="cyber-approach-title">Del diagnóstico al seguimiento</h2>
              <p>Trabajamos con tu equipo para convertir los hallazgos técnicos en decisiones de seguridad que puedas ejecutar y verificar.</p>
            </div>
            <ol className="cyber-steps">
              {approach.map(([heading, detail], index) => (
                <li key={heading}>
                  <span className="cyber-step-number" aria-hidden="true">0{index + 1}</span>
                  <div><h3>{heading}</h3><p>{detail}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cyber-contact" id="contacto" aria-labelledby="cyber-contact-title" tabIndex={-1}>
          <div className="cyber-container">
            <div className="cyber-contact-panel">
              <div>
                <h2 id="cyber-contact-title">Hablemos de tu seguridad</h2>
                <p>Cuéntanos qué necesitas proteger o qué problema estás atendiendo. Podemos empezar por identificar la prioridad.</p>
              </div>
              <div className="cyber-contact-actions">
                <label htmlFor="cyber-contact-service">¿Sobre qué servicio quieres conversar?</label>
                <select id="cyber-contact-service" value={selectedService} onChange={event => setSelectedService(event.target.value)}>
                  <option value="">Busco orientación general</option>
                  {services.map(service => <option key={service.id} value={service.title}>{service.title}</option>)}
                </select>
                <a className="cyber-button cyber-primary" href={whatsappUrl(selectedService.toLocaleLowerCase('es-MX'))} target="_blank" rel="noopener noreferrer">
                  Escribir por WhatsApp <Icon name="arrow_outward" />
                </a>
                <span className="cyber-contact-number">+52 222 111 1154</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cyber-footer">
        <div className="cyber-container">
          <div className="cyber-footer-main">
            <div>
              <Brand />
              <p>Ciberseguridad y gestión de riesgos digitales.</p>
            </div>
            <nav aria-label="Navegación del pie de página">
              {navigation.map(({ href, label }) => <a key={href} href={href}>{label}</a>)}
              <a href="/#/">Portal de verificación</a>
            </nav>
          </div>
          <div className="cyber-footer-legal">
            <span>© {new Date().getFullYear()} VDMX Risk Intelligence</span>
            <a href="/#/privacy">Aviso de privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
