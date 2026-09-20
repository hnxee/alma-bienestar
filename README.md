# Alma - Centro de bienestar

Pude avanzar hasta la Fase 3 que es conectar el "bot", los endpoints fueron creados dentro de la carpeta de la app que figura como `/api/reservar/`, este es el que estará conectado directamente con n8n, `/api/reservas/`, este esta conectado con la app.

Para la Fase 2 creando la app utilice next.js, typescript y vercel para desplegarlo. Como no estoy tan familiarizado con ambos opté por utilizar ia para que me cree la web ya que era la manera mas rápida de avanzar, le envie un prompt para que me diseñara la web como la necesitaba y sinceramente me gustó mucho el diseño que me brindó. Luego de ello utilicé supabase como base de datos, descargué los docs que me enviaron por correo de disponibilidad, servicios y citas ejemplos para utilizarlos en la base de datos, en este caso como pedian 2 o 3 servicios utilicé 1 de cada 1, pilates suelo, masaje shiatsu y yin yoga. 

Bueno la web es simple, es tipo una landing con inicio, como funciona y servicios:
En servicios se encuentra los 3 servicios con una breve descripcion y precio, al darle click se abre un formulario que al completar y darle a reservar se confirma tu reservación y se guarda en la base de datos.

## ¿COMO FUNCIONA?
La web esta conectada con supabase mediante una api `/api/reservas/`, cuando una persona entra a la web, elije un servicio y luego un horario, en ese momento se llama por la api a supabase con un get el cual comprueba la disponibilidad, en caso haya le mostrará los horarios diposnibles, luego al darle reservar se llama otra vez por la api a supabase pero con un post para que se guarde la reserva. 
El mismo flujo pasa en n8n, el único detalle es que la api es diferente, en este caso usa `/api/reservar/`. Y así es como usan la misma base de datos sin problemas.

**url:** https://alma-centro-bienestar.vercel.app


## Como desplegarlo?

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un proyecto gratuito en Supabase.

3. Abre el SQL Editor de Supabase y ejecuta `supabase/schema.sql`. (esto para extraer todo el esquema del sql)

4. Copia `.env.example` como `.env.local` y completa las claves del proyecto.

5. Inicia la aplicación:

   ```bash
   npm run dev
   ```

6. Abre `http://localhost:3000`.

## Vercel

La app esta desplegada en `alma-centro-bienestar`.
Para publicar cambios desde esta copia vinculada, ejecuta `npm run deploy`.
La sesión de Vercel se guarda localmente en `.vercel-config`.