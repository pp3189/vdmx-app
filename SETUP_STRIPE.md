# Configuración de Stripe

Para que el sistema de pagos funcione correctamente, necesitas configurar tus claves de API de Stripe (Modo Test).

1.  Abre el archivo `.env` en la raíz del proyecto.
2.  Reemplaza los valores por defecto con tus claves del Dashboard de Stripe (Developers > API keys):

```env
STRIPE_SECRET_KEY=sk_test_...  <-- Tu Clave Secreta
STRIPE_WEBHOOK_SECRET=whsec_... <-- Tu Secreto de Webhook (Ver abajo)
```

## Probando Webhooks Localmente (Stripe CLI)

Como estamos en localhost, Stripe no puede enviar el webhook directamente a tu máquina a menos que uses el **Stripe CLI** para redirigirlo.

1.  Instala Stripe CLI.
2.  Ejecuta en tu terminal:
    ```bash
    stripe login
    stripe listen --forward-to localhost:3001/webhook
    ```
3.  Copia el `whsec_...` que te muestra el comando y pégalo en tu archivo `.env` como `STRIPE_WEBHOOK_SECRET`.

## Ejecución

El proyecto ahora requiere dos procesos corriendo:

1.  **Backend (Puerto 3001):**
    ```bash
    npm run server
    ```
2.  **Frontend (Puerto 3000):**
    ```bash
    npm run dev
    ```

El frontend está configurado para redirigir las llamadas de `/api` al backend automáticamente.
