import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { services, error } = await getServices();

  return (
    <main>
      <header className="site-header shell">
        <Link className="brand" href="/" aria-label="Alma, inicio">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>alma</span>
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#como-funciona">Cómo funciona</a>
          <Link className="button button-small" href="/reservar">Reservar</Link>
        </nav>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">Movimiento · calma · cuidado</p>
          <h1>Tu momento para volver a ti.</h1>
          <p className="hero-text">
            Un espacio cercano para moverte, respirar y cuidarte con acompañamiento profesional.
          </p>
          <div className="hero-actions">
            <a className="button" href="#servicios">Explorar servicios</a>
            <Link className="text-link" href="/reservar">
              Reservar una cita <span aria-hidden="true">→</span>
            </Link>
          </div>
          <dl className="hero-facts">
            <div><dt>4.9/5</dt><dd>Valoración</dd></div>
            <div><dt>+500</dt><dd>Sesiones</dd></div>
            <div><dt>L–S</dt><dd>Atención</dd></div>
          </dl>
        </div>

        <div className="hero-visual" aria-label="Ilustración de una sesión de bienestar">
          <Image
            src="/wellness-hero.svg"
            alt="Persona practicando yoga en un espacio sereno"
            width={720}
            height={780}
            priority
          />
          <div className="floating-card">
            <span className="floating-icon" aria-hidden="true">✓</span>
            <span><strong>Reserva sencilla</strong><small>Elige tu servicio y fecha</small></span>
          </div>
        </div>
      </section>

      <section className="services-section" id="servicios">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Nuestros servicios</p>
              <h2>Bienestar pensado para ti</h2>
            </div>
            <p>Encuentra la experiencia que mejor acompaña tu momento.</p>
          </div>

          {error ? (
            <div className="notice" role="status">
              <strong>La base de datos aún no está conectada.</strong>
              <span>{error} Revisa las variables de entorno y ejecuta el esquema de Supabase.</span>
            </div>
          ) : null}

          {!error && services.length === 0 ? (
            <div className="notice" role="status">
              <strong>Todavía no hay servicios activos.</strong>
              <span>Añade al menos un servicio en Supabase para mostrarlo aquí.</span>
            </div>
          ) : null}

          <div className="service-grid">
            {services.map((service, index) => (
              <article className={`service-card service-card-${(index % 3) + 1}`} key={service.id}>
                <div className="service-number" aria-hidden="true">0{index + 1}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span>{service.duration_minutes} min</span>
                  <strong>{formatPrice(service.price, service.currency)}</strong>
                </div>
                <Link className="card-link" href={`/reservar?service=${service.id}`}>
                  Reservar <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="steps shell" id="como-funciona">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Así de fácil</p>
            <h2>Tu cita en tres pasos</h2>
          </div>
        </div>
        <div className="steps-grid">
          <article><span>1</span><h3>Elige</h3><p>Selecciona el servicio que necesitas.</p></article>
          <article><span>2</span><h3>Completa</h3><p>Indica tus datos y la fecha deseada.</p></article>
          <article><span>3</span><h3>Confirma</h3><p>Recibe la confirmación de tu solicitud.</p></article>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-card">
          <div>
            <p className="eyebrow">Empieza hoy</p>
            <h2>Regálate un momento de bienestar.</h2>
          </div>
          <Link className="button button-light" href="/reservar">Quiero reservar</Link>
        </div>
      </section>

      <footer className="site-footer shell">
        <div className="brand"><span className="brand-mark">A</span><span>alma</span></div>
        <p>Centro de bienestar · Atención con cita previa</p>
      </footer>
    </main>
  );
}
