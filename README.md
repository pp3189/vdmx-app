<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11VawrtR_V-BaGwUigOi_NSeCEE_Z4IS0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## VDMX Academy

La ruta discreta de estudio es `/#/vdmx-academy`. El primer acceso pide un código de sincronización de al menos 8 caracteres. Usa el mismo código en tu celular, computadora y tablet para recuperar el avance.

El progreso se guarda en el backend. En producción, configura `DATABASE_URL` para que el servidor use PostgreSQL; la tabla `academy_progress` se crea automáticamente. En Vercel, configura `VITE_API_URL` con la URL pública del backend Express, por ejemplo `https://vdmx-app-production.up.railway.app`.

El código de sincronización funciona como una llave privada: no se guarda en el servidor, pero cualquier persona que lo conozca podría acceder a ese progreso.

## Consulta TransUnion

La consulta individual se despliega dentro del mismo proyecto de Vercel en `https://vdmx.mx/transunion-query`. Su API serverless usa las rutas `/api/transunion/*` y guarda las órdenes en Supabase.

Variables privadas requeridas en Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `PUBLIC_URL=https://vdmx.mx`, `PAYMENTS_MODE=mercadopago` y `QUERY_PRICE_MXN=500.00`.

Webhook de Mercado Pago:

```text
https://vdmx.mx/api/transunion/webhook
```
