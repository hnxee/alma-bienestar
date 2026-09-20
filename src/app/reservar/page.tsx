import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { getServices } from "@/lib/services";

export const dynamic = "force-dynamic";

type BookingPageProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const [{ service }, { services, error }] = await Promise.all([
    searchParams,
    getServices(),
  ]);

  return (
    <main className="booking-page">
      <header className="site-header shell">
        <Link className="brand" href="/" aria-label="Alma, inicio">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>alma</span>
        </Link>
        <Link className="text-link" href="/">← Volver al inicio</Link>
      </header>

      <section className="booking-shell shell">
        <div className="booking-intro">
          <p className="eyebrow">Reserva tu cita</p>
          <h1>Tu próximo momento de calma empieza aquí.</h1>
          <p>
            Completa tus datos y nos pondremos en contacto contigo para confirmar la disponibilidad.
          </p>
          <ul className="booking-benefits">
            <li><span>✓</span> Solicitud rápida y segura</li>
            <li><span>✓</span> Confirmación personal</li>
            <li><span>✓</span> Sin pagos por adelantado</li>
          </ul>
        </div>

        <div className="form-card">
          {error ? (
            <div className="notice notice-error" role="alert">
              <strong>No pudimos cargar los servicios.</strong>
              <span>{error}</span>
            </div>
          ) : (
            <BookingForm services={services} initialServiceId={service} />
          )}
        </div>
      </section>
    </main>
  );
}
