import type { Service } from "@/types/domain";
import { getPublicSupabase } from "@/lib/supabase";

type ServiceResult = {
  services: Service[];
  error: string | null;
};

export async function getServices(): Promise<ServiceResult> {
  try {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("servicios")
      .select("id, name, description, type, price, currency, duration_minutes, block_duration_minutes, capacity, resource_id")
      .eq("active", true)
      .order("position", { ascending: true });

    if (error) {
      return { services: [], error: error.message };
    }

    const services = (data ?? []).map((service) => ({
      ...service,
      price: Number(service.price),
    })) as Service[];

    return { services, error: null };
  } catch (error) {
    return {
      services: [],
      error: error instanceof Error ? error.message : "No se pudieron cargar los servicios.",
    };
  }
}
