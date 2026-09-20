import { NextResponse } from "next/server";
import { getServices } from "@/lib/services";

export async function GET() {
  const { services, error } = await getServices();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ services });
}
