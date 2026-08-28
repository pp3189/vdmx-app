const API = '/api/transunion';
const state = { orderNumber: null, polling: null };
const buyButton = document.querySelector('#buy-button');
const notice = document.querySelector('#notice');
const dataSection = document.querySelector('#data-section');
const form = document.querySelector('#vehicle-form');
const formNotice = document.querySelector('#form-notice');

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No se pudo completar la solicitud.');
  return payload;
}

function showMessage(element, message, type = '') {
  element.textContent = message;
  element.className = `notice ${type}`;
}

async function loadConfig() {
  const config = await api('/config');
  document.querySelector('#product-name').textContent = config.product;
  document.querySelector('#price').textContent = `$${Number(config.price).toFixed(2)}`;
  document.querySelector('#currency').textContent = config.currency;
  if (config.paymentsMode === 'demo') document.querySelector('#buy-button').firstChild.textContent = 'Crear orden de prueba ';
}

async function createOrder() {
  buyButton.disabled = true;
  showMessage(notice, 'Creando tu orden...');
  try {
    const order = await api('/orders', { method: 'POST', body: '{}' });
    state.orderNumber = order.orderNumber;
    if (order.demo) {
      await api(`/orders/${encodeURIComponent(order.orderNumber)}/demo-approve`, { method: 'POST', body: '{}' });
      showMessage(notice, 'Pago de prueba confirmado. Ya puedes capturar los datos.', 'success');
      showDataForm(order.orderNumber);
      return;
    }
    window.location.href = order.checkoutUrl;
  } catch (error) {
    showMessage(notice, error.message, 'error');
    buyButton.disabled = false;
  }
}

function lockSubmittedForm() {
  [...form.elements].forEach((element) => { element.disabled = true; });
  const submit = form.querySelector('button[type="submit"]');
  submit.textContent = 'Solicitud ya enviada';
  submit.classList.add('is-complete');
  showMessage(formNotice, 'Esta orden ya fue enviada. No se puede enviar otra solicitud con este número.', 'success');
}

function showDataForm(orderNumber, order = null) {
  document.querySelector('#order-number').textContent = orderNumber;
  dataSection.classList.remove('hidden');
  dataSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  buyButton.disabled = true;
  buyButton.textContent = 'Orden creada';
  if (order?.telegramSent) lockSubmittedForm();
}

async function pollOrder(orderNumber) {
  try {
    const order = await api(`/orders/${encodeURIComponent(orderNumber)}`);
    if (order.paid) {
      clearInterval(state.polling);
      showMessage(notice, 'Pago confirmado. Completa los datos del vehículo.', 'success');
      showDataForm(orderNumber, order);
    }
  } catch {
    // El webhook puede tardar unos segundos después del regreso de Mercado Pago.
  }
}

async function handleReturn() {
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get('order');
  if (!orderNumber) return;
  state.orderNumber = orderNumber;
  showMessage(notice, params.get('payment') === 'failure' ? 'El pago no fue aprobado.' : 'Estamos confirmando tu pago...');
  await pollOrder(orderNumber);
  if (!dataSection.classList.contains('hidden')) return;
  state.polling = setInterval(() => pollOrder(orderNumber), 2500);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.orderNumber) return;
  const data = Object.fromEntries(new FormData(form).entries());
  data.consent = form.elements.consent.checked;
  const submit = form.querySelector('button');
  let submitted = false;
  submit.disabled = true;
  showMessage(formNotice, 'Enviando datos...');
  try {
    const result = await api(`/orders/${encodeURIComponent(state.orderNumber)}/vehicle`, { method: 'POST', body: JSON.stringify(data) });
    if (result.alreadySent) {
      lockSubmittedForm();
      submitted = true;
      return;
    }
    showMessage(formNotice, 'Datos recibidos. La solicitud fue enviada para preparar tu reporte.', 'success');
    lockSubmittedForm();
    submitted = true;
  } catch (error) {
    showMessage(formNotice, error.message, 'error');
  } finally {
    if (!submitted) submit.disabled = false;
  }
});

buyButton.addEventListener('click', createOrder);
loadConfig().catch((error) => showMessage(notice, error.message, 'error'));
handleReturn();
