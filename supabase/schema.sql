create extension if not exists pgcrypto;

create table if not exists public.servicios (
  id text primary key,
  name text not null,
  description text not null,
  type text not null check (type in ('group', 'individual')),
  duration_minutes integer not null check (duration_minutes > 0),
  block_duration_minutes integer not null check (block_duration_minutes >= duration_minutes),
  capacity integer not null check (capacity > 0),
  resource_id text not null,
  price numeric(10, 2) not null check (price >= 0),
  currency char(3) not null default 'EUR',
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.disponibilidad (
  id bigint generated always as identity primary key,
  resource_id text not null,
  resource_name text not null,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  capacity integer not null check (capacity > 0),
  active boolean not null default true,
  unique (resource_id, day_of_week, start_time, end_time)
);

create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.servicios(id),
  resource_id text not null,
  customer_name text not null,
  phone text not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  source text not null default 'web'
    check (source in ('web', 'whatsapp', 'manual')),
  created_at timestamptz not null default now()
);

create index if not exists reservas_service_id_idx on public.reservas(service_id);
create index if not exists reservas_resource_date_idx
  on public.reservas(resource_id, appointment_date, start_time);

alter table public.servicios enable row level security;
alter table public.disponibilidad enable row level security;
alter table public.reservas enable row level security;

revoke all on table public.servicios from anon, authenticated;
revoke all on table public.disponibilidad from anon, authenticated;
revoke all on table public.reservas from anon, authenticated;
grant select on table public.servicios to anon, authenticated;
grant select on table public.disponibilidad to anon, authenticated;

drop policy if exists "Public can read active services" on public.servicios;
create policy "Public can read active services"
on public.servicios for select to anon, authenticated
using (active = true);

drop policy if exists "Public can read active availability" on public.disponibilidad;
create policy "Public can read active availability"
on public.disponibilidad for select to anon, authenticated
using (active = true);

insert into public.servicios
  (id, name, description, type, duration_minutes, block_duration_minutes, capacity, resource_id, price, currency, active, position)
values
  ('S01', 'Pilates Suelo', 'Clase grupal para trabajar fuerza, movilidad y postura.', 'group', 60, 60, 6, 'SALA_CLASES', 60, 'EUR', true, 1),
  ('S03', 'Yin Yoga', 'Práctica suave y pausada para liberar tensión y recuperar equilibrio.', 'group', 60, 60, 6, 'SALA_CLASES', 50, 'EUR', true, 2),
  ('S10', 'Masaje Shiatsu', 'Sesión individual de presión y estiramientos para aliviar tensión.', 'individual', 60, 75, 1, 'CAMILLA_1', 55, 'EUR', true, 3)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  duration_minutes = excluded.duration_minutes,
  block_duration_minutes = excluded.block_duration_minutes,
  capacity = excluded.capacity,
  resource_id = excluded.resource_id,
  price = excluded.price,
  currency = excluded.currency,
  active = excluded.active,
  position = excluded.position;

insert into public.disponibilidad
  (resource_id, resource_name, day_of_week, start_time, end_time, capacity)
values
  ('SALA_CLASES', 'Sala de clases', 2, '09:00', '10:00', 6),
  ('SALA_CLASES', 'Sala de clases', 2, '10:00', '11:00', 6),
  ('SALA_CLASES', 'Sala de clases', 4, '09:00', '10:00', 6),
  ('SALA_CLASES', 'Sala de clases', 4, '10:00', '11:00', 6),
  ('CAMILLA_1', 'Camilla masajes', 2, '10:00', '20:15', 1),
  ('CAMILLA_1', 'Camilla masajes', 4, '10:00', '20:15', 1),
  ('CAMILLA_1', 'Camilla masajes', 5, '10:00', '20:15', 1)
on conflict (resource_id, day_of_week, start_time, end_time) do update set
  resource_name = excluded.resource_name,
  capacity = excluded.capacity,
  active = true;
