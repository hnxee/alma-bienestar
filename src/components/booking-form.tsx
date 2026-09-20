"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AvailableSlot, Service } from "@/types/domain";
import { formatPrice } from "@/lib/format";

type BookingFormProps = {
  services: Service[];
  initialServiceId?: string;
};

type FormStatus =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "error"; message: string }
  | { type: "success"; reference: string };

export function BookingForm({ services, initialServiceId }: BookingFormProps) {
  const validInitialService = services.some((item) => item.id === initialServiceId)
    ? initialServiceId
    : services[0]?.id ?? "";
  const [serviceId, setServiceId] = useState(validInitialService);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  const selectedService = useMemo(
    () => services.find((item) => item.id === serviceId),
    [serviceId, services],
  );

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!serviceId || !date) return;

    const controller = new AbortController();

    fetch(`/api/disponibilidad?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "No se pudo consultar la disponibilidad.");
        return result.slots as AvailableSlot[];
      })
      .then(setSlots)
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setSlotsError(error.message);
          setSlots([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });

    return () => controller.abort();
  }, [date, serviceId]);

  function handleServiceChange(nextServiceId: string) {
    setServiceId(nextServiceId);
    setDate("");
    setTime("");
    setSlots([]);
    setSlotsError("");
    setLoadingSlots(false);
  }

  function handleDateChange(nextDate: string) {
    setDate(nextDate);
    setTime("");
    setSlots([]);
    setSlotsError("");
    setLoadingSlots(Boolean(nextDate && serviceId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "submitting" });

    const form = new FormData(event.currentTarget);
    const payload = {
      serviceId: form.get("serviceId"),
      name: form.get("name"),
      phone: form.get("phone"),
      date: form.get("date"),
      time: form.get("time"),
    };

    try {
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "No se pudo registrar la reserva.");
      }

      setStatus({ type: "success", reference: result.bookingId });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      });
    }
  }

  if (status.type === "success") {
    return (
      <div className="success-state" role="status">
        <span className="success-icon" aria-hidden="true">✓</span>
        <p className="eyebrow">Solicitud recibida</p>
        <h2>¡Gracias por reservar!</h2>
        <p>
          Hemos registrado tu solicitud. El centro se pondrá en contacto contigo para confirmar la cita.
        </p>
        <div className="reference">Referencia: <strong>{status.reference.slice(0, 8).toUpperCase()}</strong></div>
        <Link className="button" href="/">Volver al inicio</Link>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="notice" role="status">
        <strong>No hay servicios disponibles.</strong>
        <span>Activa al menos un servicio en Supabase antes de recibir reservas.</span>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span>Paso 1 de 1</span>
        <h2>Cuéntanos qué necesitas</h2>
      </div>

      <label>
        Servicio
        <select name="serviceId" value={serviceId} onChange={(event) => handleServiceChange(event.target.value)} required>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.name}</option>
          ))}
        </select>
      </label>

      {selectedService ? (
        <div className="selected-service">
          <span>{selectedService.duration_minutes} minutos</span>
          <strong>{formatPrice(selectedService.price, selectedService.currency)}</strong>
        </div>
      ) : null}

      <div className="form-row">
        <label>
          Nombre completo
          <input name="name" type="text" autoComplete="name" minLength={2} maxLength={100} placeholder="Ej. Sebastian Cossio" required />
        </label>
        <label>
          Teléfono
          <input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={24} placeholder="Ej. +51 920867605" required />
        </label>
      </div>

      <div className="form-row">
        <label>
          Fecha deseada
          <input
            name="date"
            type="date"
            min={today}
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            required
          />
        </label>
        <label>
          Horario disponible
          <select
            name="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            disabled={!date || loadingSlots || slots.length === 0}
            required
          >
            <option value="">
              {!date
                ? "Primero elige una fecha"
                : loadingSlots
                  ? "Consultando…"
                  : slots.length === 0
                    ? "No hay horarios"
                    : "Selecciona una hora"}
            </option>
            {slots.map((slot) => (
              <option key={slot.start} value={slot.start}>
                {slot.start} – {slot.end}{slot.remaining > 1 ? ` · ${slot.remaining} plazas` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {slotsError ? <p className="form-error" role="alert">{slotsError}</p> : null}
      {date && !loadingSlots && !slotsError && slots.length === 0 ? (
        <p className="availability-note">No hay atención para ese servicio en la fecha seleccionada.</p>
      ) : null}

      {status.type === "error" ? <p className="form-error" role="alert">{status.message}</p> : null}

      <button className="button button-full" type="submit" disabled={status.type === "submitting"}>
        {status.type === "submitting" ? "Guardando…" : "Solicitar reserva"}
      </button>
      <p className="privacy-note">Al enviar este formulario aceptas que usemos tus datos para gestionar la cita.</p>
    </form>
  );
}
