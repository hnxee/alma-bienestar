import { NextRequest, NextResponse } from "next/server";
import { createBooking, validateBookingPayload } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  try {
    const payload = validateBookingPayload(await request.json());

    if (!payload) {
      return NextResponse.json(
        { error: "Revisa el servicio, el nombre, el teléfono, la fecha y la hora." },
        { status: 400 },
      );
    }

    const integrationKey = request.headers.get("n8n-key");
    const expectedKey = process.env.N8N_INTEGRATION_KEY;
    const source = expectedKey && integrationKey === expectedKey ? "whatsapp" : "web";
    const result = await createBooking(payload, source);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error al crear la reserva", error);
    return NextResponse.json(
      { error: "No se pudo registrar la reserva. Inténtalo nuevamente." },
      { status: 500 },
    );
  }
}
