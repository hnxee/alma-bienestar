import { getAvailableSlots } from "@/lib/availability";
import { getAdminSupabase } from "@/lib/supabase";
import type { BookingPayload, BookingSource } from "@/types/domain";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const phonePattern = /^[+\d][\d\s().-]{6,23}$/;
const timePattern = /^\d{2}:\d{2}$/;

export type BookingResult =
  | { success: true; bookingId: string; status: "pending"; source: BookingSource }
  | { success: false; error: string; statusCode: number };

export function validateBookingPayload(value: unknown): BookingPayload | null {
  if (!value || typeof value !== "object") return null;

  const body = value as Record<string, unknown>;
  const serviceId = typeof body.serviceId === "string" ? body.serviceId.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";

  if (!serviceId || name.length < 2 || name.length > 100) return null;
  if (!phonePattern.test(phone) || !isoDatePattern.test(date) || !timePattern.test(time)) return null;

  return { serviceId, name, phone, date, time };
}

export async function createBooking(
  payload: BookingPayload,
  source: BookingSource,
): Promise<BookingResult> {
  const today = new Date().toISOString().slice(0, 10);

  if (payload.date < today) {
    return {
      success: false,
      error: "La fecha de la reserva no puede estar en el pasado.",
      statusCode: 400,
    };
  }

  const availability = await getAvailableSlots(payload.serviceId, payload.date);
  if (!availability.service) {
    return {
      success: false,
      error: "El servicio seleccionado no está disponible.",
      statusCode: 404,
    };
  }

  const selectedSlot = availability.slots.find((slot) => slot.start === payload.time);
  if (!selectedSlot) {
    return {
      success: false,
      error: "Ese horario ya no está disponible. Selecciona otro.",
      statusCode: 409,
    };
  }

  const supabase = getAdminSupabase();
  const { data: booking, error: bookingError } = await supabase
    .from("reservas")
    .insert({
      service_id: payload.serviceId,
      resource_id: availability.service.resource_id,
      customer_name: payload.name,
      phone: payload.phone,
      appointment_date: payload.date,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      status: "pending",
      source,
    })
    .select("id")
    .single();

  if (bookingError) throw bookingError;

  return {
    success: true,
    bookingId: booking.id,
    status: "pending",
    source,
  };
}
