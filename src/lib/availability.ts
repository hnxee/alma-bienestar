import { getAdminSupabase } from "@/lib/supabase";
import type { AvailableSlot, Service } from "@/types/domain";

type BookingWindow = {
  service_id: string;
  start_time: string;
  end_time: string;
};

type AvailabilityRule = {
  start_time: string;
  end_time: string;
  capacity: number;
};

function toMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const rest = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${rest}`;
}

function overlaps(start: number, end: number, booking: BookingWindow) {
  const bookingStart = toMinutes(booking.start_time);
  const bookingEnd = toMinutes(booking.end_time);
  return start < bookingEnd && end > bookingStart;
}

export async function getAvailableSlots(serviceId: string, date: string) {
  const supabase = getAdminSupabase();
  const { data: serviceData, error: serviceError } = await supabase
    .from("servicios")
    .select("id, name, description, type, price, currency, duration_minutes, block_duration_minutes, capacity, resource_id")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();

  if (serviceError) throw serviceError;
  if (!serviceData) return { service: null, slots: [] as AvailableSlot[] };

  const service = { ...serviceData, price: Number(serviceData.price) } as Service;
  const parsedDate = new Date(`${date}T12:00:00Z`);
  const jsDay = parsedDate.getUTCDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;

  const [{ data: rules, error: rulesError }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabase
      .from("disponibilidad")
      .select("start_time, end_time, capacity")
      .eq("resource_id", service.resource_id)
      .eq("day_of_week", isoDay)
      .eq("active", true)
      .order("start_time"),
    supabase
      .from("reservas")
      .select("service_id, start_time, end_time")
      .eq("resource_id", service.resource_id)
      .eq("appointment_date", date)
      .neq("status", "cancelled"),
  ]);

  if (rulesError) throw rulesError;
  if (bookingsError) throw bookingsError;

  const existing = (bookings ?? []) as BookingWindow[];
  const slots: AvailableSlot[] = [];

  for (const rule of (rules ?? []) as AvailabilityRule[]) {
    const windowStart = toMinutes(rule.start_time);
    const windowEnd = toMinutes(rule.end_time);
    const step = service.block_duration_minutes;

    for (let start = windowStart; start + step <= windowEnd; start += step) {
      const end = start + step;
      const conflicts = existing.filter((booking) => overlaps(start, end, booking));
      const hasDifferentGroup =
        service.type === "group" &&
        conflicts.some((booking) => booking.service_id !== service.id);
      const capacity = service.type === "group" ? Math.min(service.capacity, rule.capacity) : 1;
      const remaining = hasDifferentGroup ? 0 : capacity - conflicts.length;

      if (remaining > 0) {
        slots.push({ start: toTime(start), end: toTime(end), remaining });
      }
    }
  }

  return { service, slots };
}
