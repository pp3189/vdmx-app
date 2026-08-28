import crypto from 'node:crypto';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const MP_API = 'https://api.mercadopago.com';
const price = Number(process.env.QUERY_PRICE_MXN || 500);
const currency = 'MXN';
const paymentsMode = process.env.PAYMENTS_MODE || 'mercadopago';
// Use the canonical host so Mercado Pago does not receive a 307 redirect.
const publicUrl = (process.env.PUBLIC_URL || 'https://www.vdmx.mx').replace(/\/$/, '');

function clean(value, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `VDMX-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function requireSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase no esta configurado en Vercel.');
}

async function supabaseRequest(resource, options = {}) {
  requireSupabase();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.hint || payload?.error || 'Supabase rechazo la solicitud.');
  return payload;
}

function orderFilter(value) {
  return encodeURIComponent(value);
}

async function getOrder(number) {
  const rows = await supabaseRequest(`query_orders?select=*&order_number=eq.${orderFilter(number)}&limit=1`);
  return rows[0] || null;
}

async function createOrder(number) {
  const rows = await supabaseRequest('query_orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ order_number: number, amount: price, currency })
  });
  return rows[0] || null;
}

async function updateOrder(number, data) {
  const rows = await supabaseRequest(`query_orders?order_number=eq.${orderFilter(number)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data)
  });
  return rows[0] || null;
}

function publicOrder(order) {
  return {
    orderNumber: order.order_number,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    paid: ['PAID', 'DATA_RECEIVED'].includes(order.status),
    dataReceived: Boolean(order.vehicle_data),
    telegramSent: Boolean(order.telegram_sent_at),
    createdAt: order.created_at
  };
}

function validateVehicle(body = {}) {
  const data = {
    serialNumber: clean(body.serialNumber, 80),
    plate: clean(body.plate, 30),
    plateState: clean(body.plateState, 60),
    color: clean(body.color, 40),
    mileage: clean(body.mileage, 20),
    version: clean(body.version, 80),
    year: clean(body.year, 4),
    make: clean(body.make, 50),
    vehicleType: clean(body.vehicleType, 80),
    whatsapp: clean(body.whatsapp, 40),
    whatsappConfirmation: clean(body.whatsappConfirmation, 40)
  };
  const required = ['serialNumber', 'plate', 'plateState', 'color', 'mileage', 'version', 'year', 'make', 'vehicleType', 'whatsapp', 'whatsappConfirmation'];
  const missing = required.filter((field) => !data[field]);
  if (missing.length) return { error: `Faltan campos: ${missing.join(', ')}.` };
  if (data.whatsapp !== data.whatsappConfirmation) return { error: 'Los dos números de WhatsApp no coinciden.' };
  if (!/^\d{4}$/.test(data.year)) return { error: 'El año debe tener cuatro dígitos.' };
  if (!/^\d+(\.\d+)?$/.test(data.mileage)) return { error: 'El kilometraje debe ser numérico.' };
  if (body.consent !== true) return { error: 'Debes aceptar el consentimiento para continuar.' };
  delete data.whatsappConfirmation;
  return { data };
}

async function mercadoPagoRequest(path, options = {}) {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('Falta MP_ACCESS_TOKEN.');
  const response = await fetch(`${MP_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const causes = Array.isArray(payload.cause)
      ? payload.cause.map((cause) => cause.description || cause.code).filter(Boolean).join('; ')
      : '';
    const detail = payload.message || payload.error || causes || `Mercado Pago devolvió ${response.status}.`;
    console.error('Mercado Pago API error', { status: response.status, detail, cause: payload.cause });
    throw new Error(`Mercado Pago ${response.status}: ${detail}`);
  }
  return payload;
}

async function createPreference(number) {
  return mercadoPagoRequest('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: 'transunion-query', title: 'Consulta TransUnion', quantity: 1, currency_id: 'MXN', unit_price: price }],
      external_reference: number,
      notification_url: `${publicUrl}/api/transunion/webhook`,
      back_urls: {
        success: `${publicUrl}/transunion-query?payment=success&order=${encodeURIComponent(number)}`,
        pending: `${publicUrl}/transunion-query?payment=pending&order=${encodeURIComponent(number)}`,
        failure: `${publicUrl}/transunion-query?payment=failure&order=${encodeURIComponent(number)}`
      },
      auto_return: 'approved'
    })
  });
}

function verifyWebhookSignature({ signature, requestId, dataId }) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return paymentsMode === 'demo';
  if (!signature || !requestId || !dataId) return false;
  const values = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
  if (!values.ts || !values.v1) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${values.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(values.v1, 'hex');
  const calculated = Buffer.from(expected, 'hex');
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
}

function vehicleMessage(number, data) {
  return [
    'VDMX | NUEVA CONSULTA PAGADA',
    `Orden: ${number}`,
    '',
    'DATOS DEL VEHICULO',
    `Numero de serie: ${data.serialNumber}`,
    `Placa: ${data.plate}`,
    `Estado de la placa: ${data.plateState}`,
    `Color: ${data.color}`,
    `Kilometraje actual: ${data.mileage}`,
    `Version: ${data.version}`,
    `Ano: ${data.year}`,
    `Marca: ${data.make}`,
    `Tipo / modelo: ${data.vehicleType}`,
    '',
    'ENTREGA DEL REPORTE',
    `WhatsApp: ${data.whatsapp}`,
    '',
    'Consentimiento de tratamiento aceptado en el formulario.'
  ].join('\n');
}

async function sendTelegram(number, data) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) throw new Error('Telegram no esta configurado.');
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: vehicleMessage(number, data), disable_web_page_preview: true })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.description || 'Telegram rechazo el mensaje.');
}

function pathParts(req) {
  const url = new URL(req.url, 'https://vercel.local');
  const routeFromRewrite = url.searchParams.get('route');
  const suffix = routeFromRewrite
    ? `/${routeFromRewrite}`
    : (url.pathname.split('/api/transunion')[1] || '');
  return { parts: suffix.split('/').filter(Boolean).map(decodeURIComponent), url };
}

export default async function handler(req, res) {
  const { parts, url } = pathParts(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    if (req.method === 'GET' && parts[0] === 'config') {
      return res.status(200).json({ product: 'Consulta TransUnion', price, currency, paymentsMode });
    }

    if (req.method === 'POST' && parts.length === 1 && parts[0] === 'orders') {
      const number = orderNumber();
      await createOrder(number);
      if (paymentsMode === 'demo') return res.status(201).json({ orderNumber: number, amount: price, currency, demo: true });
      const preference = await createPreference(number);
      await updateOrder(number, { mp_preference_id: preference.id });
      return res.status(201).json({ orderNumber: number, amount: price, currency, checkoutUrl: preference.init_point });
    }

    const number = clean(parts[1], 40);
    if (parts[0] === 'orders' && parts.length === 2 && req.method === 'GET') {
      const order = await getOrder(number);
      return order ? res.status(200).json(publicOrder(order)) : res.status(404).json({ error: 'Orden no encontrada.' });
    }

    if (parts[0] === 'orders' && parts[2] === 'demo-approve' && req.method === 'POST') {
      if (paymentsMode !== 'demo') return res.status(404).end();
      const order = await getOrder(number);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });
      await updateOrder(number, { status: order.vehicle_data ? 'DATA_RECEIVED' : 'PAID', mp_payment_id: `demo-${Date.now()}`, paid_at: new Date().toISOString() });
      return res.status(200).json({ orderNumber: number, status: 'PAID' });
    }

    if (parts[0] === 'orders' && parts[2] === 'vehicle' && req.method === 'POST') {
      const order = await getOrder(number);
      if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });
      if (!['PAID', 'DATA_RECEIVED'].includes(order.status)) return res.status(402).json({ error: 'La orden aún no tiene un pago aprobado.' });
      const validated = validateVehicle(body);
      if (validated.error) return res.status(400).json({ error: validated.error });
      if (order.telegram_sent_at) return res.status(200).json({ orderNumber: number, status: order.status, sent: true });
      const saved = await updateOrder(number, { vehicle_data: validated.data, whatsapp: validated.data.whatsapp, status: 'DATA_RECEIVED', data_received_at: new Date().toISOString() });
      try {
        await sendTelegram(number, validated.data);
        await updateOrder(number, { telegram_sent_at: new Date().toISOString(), telegram_error: null });
        return res.status(200).json({ orderNumber: number, status: 'DATA_RECEIVED', sent: true });
      } catch (error) {
        await updateOrder(number, { telegram_error: error instanceof Error ? error.message : 'No se pudo enviar Telegram.' });
        return res.status(502).json({ error: 'Los datos se guardaron, pero no se pudo avisar al bot. Reintenta enviar el formulario.' });
      }
    }

    if (req.method === 'POST' && parts[0] === 'webhook') {
      const eventType = body?.type || url.searchParams.get('type');
      // Mercado Pago's connectivity simulator can send an empty ping. Acknowledge it
      // without weakening signature validation for real payment events.
      if (!eventType || eventType !== 'payment') return res.status(200).end();
      // Simulated events use a placeholder payment ID and must not touch real orders.
      if (body?.live_mode === false) return res.status(200).end();
      const dataId = clean(url.searchParams.get('data.id') || body?.data?.id, 100);
      if (!verifyWebhookSignature({ signature: req.headers['x-signature'], requestId: req.headers['x-request-id'], dataId })) return res.status(401).json({ error: 'Firma de webhook inválida.' });
      if (!dataId) return res.status(400).json({ error: 'Falta data.id.' });
      const payment = await mercadoPagoRequest(`/v1/payments/${encodeURIComponent(dataId)}`);
      const numberFromPayment = clean(payment.external_reference, 40);
      const order = await getOrder(numberFromPayment);
      if (order && payment.status === 'approved' && Number(payment.transaction_amount) === Number(order.amount) && (!payment.currency_id || payment.currency_id === order.currency)) {
        await updateOrder(numberFromPayment, { status: order.vehicle_data ? 'DATA_RECEIVED' : 'PAID', mp_payment_id: dataId, paid_at: order.paid_at || new Date().toISOString() });
      }
      return res.status(200).end();
    }

    return res.status(404).json({ error: 'Endpoint no encontrado.' });
  } catch (error) {
    console.error('TransUnion endpoint:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: error instanceof Error ? error.message : 'No se pudo completar la solicitud.' });
  }
}
