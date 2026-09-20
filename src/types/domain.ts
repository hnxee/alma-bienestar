export type Service = {
  id: string;
  name: string;
  description: string;
  type: "group" | "individual";
  price: number;
  currency: string;
  duration_minutes: number;
  block_duration_minutes: number;
  capacity: number;
  resource_id: string;
};

export type BookingPayload = {
  serviceId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
};

export type BookingSource = "web" | "whatsapp" | "manual";

export type AvailableSlot = {
  start: string;
  end: string;
  remaining: number;
};
