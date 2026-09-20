import { NextRequest, NextResponse } from "next/server";
import { createBooking, validateBookingPayload } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  const expectedKey = process.env.N8N_INTEGRATION_KEY;
  const integrationKey = request.headers.get("n8n-key");

  if (!expectedKey) {
    return NextResponse.json(
      { error: "La integración con n8n no está configurada." },
      { status: 503 },
    );
  }

  if (integrationKey !== expectedKey) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const payload = validateBookingPayload({
      serviceId: body.servicio,
      date: body.fecha,
      time: body.hora,
      name: body.nombre,
      phone: body.telefono,
    });

    if (!payload) {
      return NextResponse.json(
        {
          error: "Envía servicio, fecha, hora, nombre y teléfono con valores válidos.",
        },
        { status: 400 },
      );
    }

    const result = await createBooking(payload, "whatsapp");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(
      {
        success: true,
        reservaId: result.bookingId,
        estado: result.status,
        origen: result.source,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear la reserva desde n8n", error);
    return NextResponse.json(
      { error: "No se pudo registrar la reserva." },
      { status: 500 },
    );
  }
}
