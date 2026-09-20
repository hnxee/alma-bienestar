import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId")?.trim();
  const date = request.nextUrl.searchParams.get("date")?.trim();

  if (!serviceId || !date || !isoDatePattern.test(date)) {
    return NextResponse.json(
      { error: "Indica un servicio y una fecha válidos." },
      { status: 400 },
    );
  }

  try {
    const result = await getAvailableSlots(serviceId, date);

    if (!result.service) {
      return NextResponse.json({ error: "El servicio no está disponible." }, { status: 404 });
    }

    return NextResponse.json({ slots: result.slots });
  } catch (error) {
    console.error("Error al consultar disponibilidad", error);
    return NextResponse.json(
      { error: "No se pudo consultar la disponibilidad." },
      { status: 500 },
    );
  }
}
