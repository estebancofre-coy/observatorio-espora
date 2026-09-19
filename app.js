const API_URL = 'https://script.google.com/macros/s/AKfycbz7m86O41X093i9j9ysDrPb4Jng1Xwe6JrcJvz5ydO7F85O1QhqMR0q1YH6-UWK9FG7SA/exec';
const QUEUE_KEY = 'preciosCoyhaiquePendingBatches';
const PRODUCTS = [
  ['Arroz (grado 2)', 'Cereales y derivados', ['N/A'], ['kg', '400 gr/500gr', 'Unidad']],
  ['Pastas (Fideos, Tallarines 5/77)', 'Cereales y derivados', ['N/A'], ['400 gr/500gr', 'kg', 'Unidad']],
  ['Carne molida (Vacuno)', 'Carnes', ['Fresco', 'Congelado', 'Vacío', 'Embutido'], ['kg']],
  ['Pollo', 'Carnes', ['Fresco', 'Congelado', 'Vacío', 'Embutido'], ['kg']],
  ['Salchicha', 'Carnes', ['Embutido', 'Fresco', 'Congelado', 'Vacío'], ['kg']],
  ['Choritos', 'Pescados y mariscos', ['Congelado'], ['kg']],
  ['Merluza Austral', 'Pescados y mariscos', ['Congelado'], ['kg']],
  ['Limón', 'Frutas', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Manzana', 'Frutas', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Palta', 'Frutas', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Plátano', 'Frutas', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Cebolla', 'Verduras y Tubérculos', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Lechuga', 'Verduras y Tubérculos', ['N/A'], ['Unidad', 'kg', 'malla (10 kg)', 'atado']],
  ['Papa', 'Verduras y Tubérculos', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Tomate', 'Verduras y Tubérculos', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Zanahoria', 'Verduras y Tubérculos', ['N/A'], ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Lenteja', 'Legumbres', ['N/A'], ['kg', '400 gr/500gr', 'Unidad']],
  ['Poroto', 'Legumbres', ['N/A'], ['kg', '400 gr/500gr', 'Unidad']],
  ['Maní Tostado sin Sal', 'Frutos secos', ['N/A'], ['250g', '500g', 'kg']],
  ['Huevo', 'Lácteos y Huevos', ['N/A'], ['Bandeja (12)', 'Bandeja (20)', 'Bandeja (30)', 'Unidad']],
  ['Leche', 'Lácteos y Huevos', ['N/A'], ['Litro', '500 ml']],
  ['Queso Laminado (Gauda, Roda, Mantecoso)', 'Lácteos y Huevos', ['N/A'], ['kg']],
  ['Yogur con sello', 'Lácteos y Huevos', ['N/A'], ['Unidad']],
  ['Azúcar', 'Azúcares y dulces', ['N/A'], ['kg', '400 gr/500gr', 'Unidad']],
  ['Aceite', 'Aceites y grasas', ['N/A'], ['900 ml', 'Litro', '500 ml']],
  ['Mantequilla', 'Aceites y grasas', ['N/A'], ['250gr']],
  ['Margarina', 'Aceites y grasas', ['N/A'], ['250gr']],
  ['Salsa de tomate', 'Otros', ['N/A'], ['Doypack (200gr)']],
].map(([name, category, conservation, units]) => ({ name, category, conservation, units, origins: ['Local', 'Externo'] }));

const $ = (selector, root = document) => root.querySelector(selector);

function getSelectedLocal() {
  return SAMPLE_LOCALS.find(
    (local) => local.code === $('#internalCode').value.trim().toUpperCase()
  );
}

function updateLocalDetails() {
  const codeInput = $('#internalCode');
  const local = getSelectedLocal();
  const recategorizationField = $('#recategorizationField');
  const retailSaleField = $('#retailSaleField');
  const recategorization = $('#recategorization');
  const retailSale = $('#retailSale');

  if (!local) {
    codeInput.setCustomValidity('Ingrese un código válido de la muestra sugerida.');
    ['establishment', 'address', 'localType', 'localSubtype'].forEach((id) => { $('#' + id).value = ''; });
    recategorizationField.hidden = true;
    retailSaleField.hidden = true;
    recategorization.required = false;
    retailSale.required = false;
    return;
  }

  codeInput.value = local.code;
  codeInput.setCustomValidity('');
  $('#establishment').value = local.name;
  $('#address').value = local.address;
  $('#localType').value = local.criterion;
  $('#localSubtype').value = local.criterion2 || 'Sin subtipo';

  const needsRecategorization = ['Almacén', 'Minimarket'].includes(local.criterion);
  recategorizationField.hidden = !needsRecategorization;
  recategorization.required = needsRecategorization;
  if (!needsRecategorization) recategorization.value = '';

  const needsRetailSale = local.criterion === 'Importador Frutas y Verduras';
  retailSaleField.hidden = !needsRetailSale;
  retailSale.required = needsRetailSale;
  if (!needsRetailSale) retailSale.value = '';
}

async function api(action, body) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...body }),
    redirect: 'follow',
  });
  if (!response.ok) throw new Error('No fue posible conectar con el servicio de registro.');
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || 'La operación fue rechazada.');
  return result.data;
}

function setOptions(select, values) {
  select.replaceChildren(...values.map((value) => new Option(value, value)));
}

function updateItem(item) {
  const product = PRODUCTS.find((entry) => entry.name === $('.product', item).value);
  $('.category', item).value = product.category;
  setOptions($('.conservation', item), product.conservation);
  setOptions($('.unit', item), product.units);
  setOptions($('.origin', item), product.origins);
}

function addItem() {
  const item = $('#item-template').content.firstElementChild.cloneNode(true);
  setOptions($('.product', item), PRODUCTS.map((product) => product.name));
  updateItem(item);
  $('.product', item).addEventListener('change', () => updateItem(item));
  $('.remove', item).addEventListener('click', () => {
    if (document.querySelectorAll('.item').length === 1) return showMessage('Debe registrar al menos un producto.', 'error');
    item.remove();
  });
  $('#items').append(item);
}

function showMessage(text, type) {
  const message = $('#message');
  message.textContent = text;
  message.className = type;
}

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch (_) { return []; }
}

function setQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  $('#pendingCount').textContent = queue.length;
}

function updateConnection() {
  const online = navigator.onLine;
  $('#connection').textContent = online
    ? 'Con conexión. Los registros se guardarán en la base de datos.'
    : 'Sin conexión. Los nuevos lotes se guardarán en este dispositivo hasta sincronizarlos.';
  $('#connection').className = online ? 'online' : 'offline';
}

function collectPayload() {
  return {
    observationDate: $('#observationDate').value, collector: $('#collector').value,
    internalCode: $('#internalCode').value, establishment: $('#establishment').value,
    address: $('#address').value, latitude: $('#latitude').value, longitude: $('#longitude').value,
    recategorization: $('#recategorization').value,
    retailSale: $('#retailSale').value,
    items: [...document.querySelectorAll('.item')].map((item) => ({
      product: $('.product', item).value, category: $('.category', item).value,
      price: $('.price', item).value, conservation: $('.conservation', item).value,
      unit: $('.unit', item).value, origin: $('.origin', item).value,
      brand: $('.brand', item).value, promotion: $('.promotion', item).value, notes: $('.notes', item).value,
    })),
  };
}

function clearItems() {
  document.querySelectorAll('.item').forEach((item) => item.remove());
  addItem();
}

function queuePayload(payload) {
  const queue = getQueue();
  queue.push({ payload, queuedAt: new Date().toISOString() });
  setQueue(queue);
  clearItems();
  showMessage('Sin conexión: el lote se guardó en este dispositivo. Sincronícelo al recuperar internet.', 'success');
}

function warningText(analysis) {
  const warnings = [];
  if (analysis.duplicates.length) warnings.push('Posibles duplicados:\n' + analysis.duplicates.map((item) => '• ' + item.product + ' (registro ' + item.index + ')').join('\n'));
  if (analysis.outliers.length) warnings.push('Precios atípicos (desviación ≥30%):\n' + analysis.outliers.map((item) => '• ' + item.product + ': $' + item.observedPrice + ' vs. referencia $' + item.referencePrice + ' (' + item.deviationPercent + '%, ' + item.referenceScope + ')').join('\n'));
  return warnings.join('\n\n');
}

async function analyzeAndSave(payload) {
  const analysis = await api('analyze', { payload });
  const warnings = warningText(analysis);
  if (warnings && !window.confirm(warnings + '\n\n¿Desea guardar de todas formas?')) return;
  const result = await api('save', {
    payload,
    confirmations: { allowDuplicates: analysis.duplicates.length > 0, allowOutliers: analysis.outliers.length > 0 },
  });
  clearItems();
  showMessage(result.savedRows + ' producto(s) guardado(s). Lote: ' + result.batchId, 'success');
}

async function syncPending() {
  if (!navigator.onLine) return showMessage('No hay conexión para sincronizar los lotes pendientes.', 'error');
  const queue = getQueue();
  if (!queue.length) return showMessage('No hay lotes pendientes por sincronizar.', 'success');
  try {
    await analyzeAndSave(queue[0].payload);
    setQueue(queue.slice(1));
    if (getQueue().length) await syncPending();
  } catch (error) {
    showMessage(error.message || 'No fue posible sincronizar el lote pendiente.', 'error');
  }
}

function useCurrentLocation() {
  if (!navigator.geolocation) return showMessage('Este navegador no admite geolocalización. Copie las coordenadas manualmente.', 'error');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      $('#latitude').value = position.coords.latitude.toFixed(6);
      $('#longitude').value = position.coords.longitude.toFixed(6);
      showMessage('Ubicación actual cargada. Verifíquela antes de guardar.', 'success');
    },
    () => showMessage('No fue posible obtener la ubicación. Copie las coordenadas manualmente.', 'error'),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function initialize() {
  $('#observationDate').value = new Date().toISOString().slice(0, 10);
  setOptions($('#localCodes'), SAMPLE_LOCALS.map((local) => local.code));
  setQueue(getQueue()); updateConnection(); addItem();
  $('#internalCode').addEventListener('input', updateLocalDetails);
  $('#internalCode').addEventListener('change', updateLocalDetails);
  $('#addItemButton').addEventListener('click', addItem);
  $('#locationButton').addEventListener('click', useCurrentLocation);
  $('#syncButton').addEventListener('click', syncPending);
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  $('#observation-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = collectPayload();
    if (!navigator.onLine) return queuePayload(payload);
    const button = $('#saveButton');
    button.disabled = true; button.textContent = 'Analizando…';
    try { await analyzeAndSave(payload); }
    catch (error) { showMessage(error.message || 'No fue posible guardar los registros.', 'error'); }
    finally { button.disabled = false; button.textContent = 'Analizar y guardar productos'; }
  });
}

initialize();
