const API_URL = 'https://script.google.com/macros/s/AKfycbwNX-W0y8r4pl8Qa1eH4w0_Nl-TaQfbKtqGFnScMHgRWdAD4gqJDcpMg125_8QHFlrf/exec';
const DRAFT_KEY = 'esporaCoyhaiqueVisitDraftV2';
const QUEUE_KEY = 'esporaCoyhaiquePendingV2';
const CONSERVATION_OPTIONS = ['Fresco', 'Congelado', 'Al vacío', 'Embutido', 'Pillow bag', 'Granel (papel)'];

const PRODUCTS = [
  ['Arroz (grado 2)', 'Cereales y derivados', ['kg', '400 gr/500gr', 'Unidad']], ['Pastas (Fideos, Tallarines 5/77)', 'Cereales y derivados', ['400 gr/500gr', 'kg', 'Unidad']],
  ['Carne molida (Vacuno)', 'Carnes', ['kg']], ['Pollo', 'Carnes', ['kg']], ['Salchicha', 'Carnes', ['kg']],
  ['Choritos', 'Pescados y mariscos', ['kg']], ['Merluza Austral', 'Pescados y mariscos', ['kg']],
  ['Limón', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Manzana', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Palta', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Plátano', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Cebolla', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Lechuga', 'Verduras y Tubérculos', ['Unidad', 'kg', 'malla (10 kg)', 'atado']], ['Papa', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Tomate', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']], ['Zanahoria', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Lenteja', 'Legumbres', ['kg', '400 gr/500gr', 'Unidad']], ['Poroto', 'Legumbres', ['kg', '400 gr/500gr', 'Unidad']],
  ['Maní Tostado sin Sal', 'Frutos secos', ['250g', '500g', 'kg']], ['Huevo', 'Lácteos y Huevos', ['Bandeja (12)', 'Bandeja (20)', 'Bandeja (30)', 'Unidad']],
  ['Leche', 'Lácteos y Huevos', ['Litro', '500 ml']], ['Queso Laminado (Gauda, Roda, Mantecoso)', 'Lácteos y Huevos', ['kg']], ['Yogur con sello', 'Lácteos y Huevos', ['Unidad']],
  ['Azúcar', 'Azúcares y dulces', ['kg', '400 gr/500gr', 'Unidad']], ['Aceite', 'Aceites y grasas', ['900 ml', 'Litro', '500 ml']], ['Mantequilla', 'Aceites y grasas', ['250gr']], ['Margarina', 'Aceites y grasas', ['250gr']], ['Salsa de tomate', 'Otros', ['Doypack (200gr)']],
].map(([name, category, units]) => ({ name, category, units }));

const AVAILABILITY = [
  ['Disponibilidad', 'Frutas', 'Fruta sin azúcar añadida o con edulcorante no calórico.'], ['Disponibilidad', 'Frutas', 'Jugos 100% de fruta sin azúcar añadida o con edulcorante no calórico.'], ['Disponibilidad', 'Frutas', 'Frutas secas sin azúcar ni sal agregada.'], ['Disponibilidad', 'Frutas', 'Frutos secos sin azúcar ni sal agregada.'],
  ['Disponibilidad', 'Verduras', 'Verduras frescas, enlatadas, tetra pack o congeladas.'],
  ['Disponibilidad', 'Lácteos', 'Leche baja en grasa.'], ['Disponibilidad', 'Lácteos', 'Leche saborizada sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Lácteos', 'Leche cultivada sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Lácteos', 'Yogurt sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Lácteos', 'Queso fresco, chacra o quesillo.'], ['Disponibilidad', 'Lácteos', 'Queso amarillo sin sellos Alto En.'],
  ['Disponibilidad', 'Legumbres', 'Porotos, lentejas, garbanzos, arvejas u otras.'],
  ['Disponibilidad', 'Carnes y huevo', 'Carnes bajas en grasa frescas o congeladas.'], ['Disponibilidad', 'Carnes y huevo', 'Pescados y/o mariscos frescos o congelados.'], ['Disponibilidad', 'Carnes y huevo', 'Pescados listos para consumo bajos en sodio y en agua.'], ['Disponibilidad', 'Carnes y huevo', 'Huevo fresco o cocido.'],
  ['Disponibilidad', 'Granos', 'Cereales para desayuno sin azúcar agregada o sin sellos Alto En.'], ['Disponibilidad', 'Granos', 'Cereales: quínoa, amaranto, arroz integral, trigo mote, avena u otros.'], ['Disponibilidad', 'Granos', 'Pan integral.'],
  ['Disponibilidad', 'Bebestibles', 'Agua envasada natural y/o con gas.'], ['Disponibilidad', 'Bebestibles', 'Agua saborizada sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Bebestibles', 'Jugos 100% de fruta sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Bebestibles', 'Néctar sin azúcar añadida o sin sellos Alto En.'], ['Disponibilidad', 'Bebestibles', 'Bebidas sin azúcar añadida o sin sellos Alto En.'],
  ['Disponibilidad', 'Otros', 'Aceite vegetal.'], ['Disponibilidad', 'Otros', 'Helados sin azúcar agregada o sin sellos Alto En.'], ['Disponibilidad', 'Otros', 'Té, café e infusiones sin azúcar agregada o con edulcorante no calórico.'],
  ['Disponibilidad', 'Preparaciones saludables', 'Sopas o ensaladas de verduras sin salsas ni frituras.'], ['Disponibilidad', 'Preparaciones saludables', 'Sándwich listo para consumo con pan integral y opciones saludables.'], ['Disponibilidad', 'Preparaciones saludables', 'Tortillas integrales listas para consumo con opciones saludables.'], ['Disponibilidad', 'Preparaciones saludables', 'Plato de fondo saludable.'], ['Disponibilidad', 'Preparaciones saludables', 'Postre saludable con frutas o lácteos.'], ['Disponibilidad', 'Preparaciones saludables', 'Té, café e infusiones sin azúcar agregada o con edulcorante no calórico.'],
  ['Disponibilidad', 'No saludables', 'Snacks salados con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Snacks dulces con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Embutidos y cecinas envasados con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Salsas y aderezos con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Salsas dulces con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Helados con más de un sello Alto En.'], ['Disponibilidad', 'No saludables', 'Masas dulces horneadas o fritas con azúcares refinados.'], ['Disponibilidad', 'No saludables', 'Masas saladas fritas u horneadas.'], ['Disponibilidad', 'No saludables', 'Comida rápida.'], ['Disponibilidad', 'No saludables', 'Gaseosas, jugos y néctares procesados con azúcar añadida y sello Alto En.'], ['Disponibilidad', 'No saludables', 'Bebidas deportivas o energéticas.'], ['Disponibilidad', 'No saludables', 'Snacks dulces/salados no saludables vendidos a granel.'],
  ['Variedad', 'Variedad', 'Frutas: 3 o más.'], ['Variedad', 'Variedad', 'Verduras: 3 o más.'], ['Variedad', 'Variedad', 'Leche o yogurt: 3 o más opciones bajas en grasa y sin azúcar o sin sellos Alto En.'], ['Variedad', 'Variedad', 'Quesos o quesillos: 2 o más bajos en grasa y sin sellos Alto En.'], ['Variedad', 'Variedad', 'Legumbres: 2 o más opciones.'], ['Variedad', 'Variedad', 'Carnes bajas en grasas: 2 o más tipos.'], ['Variedad', 'Variedad', 'Cereales para desayuno: 3 o más sin azúcar o sin sellos Alto En.'], ['Variedad', 'Variedad', 'Aguas: 3 o más opciones.'], ['Variedad', 'Variedad', 'Más de una preparación en porción pequeña para niños.'],
].map(([section, category, label]) => ({ section, category, label }));
const ORIGIN_PRODUCTS = ['Carne vacuna', 'Cordero', 'Pollo/aves', 'Pescado', 'Lácteos', 'Huevos', 'Otro (especificar)'];
const $ = (selector, root = document) => root.querySelector(selector);
let currentView = 'visitView';

function getDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (_) { return null; } }
function setDraft(draft) { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); updateMenu(); }
function getQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (_) { return []; } }
function setQueue(queue) { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); }
function newId() { return 'VIS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function setOptions(select, values, blank) { select.replaceChildren(...(blank ? [new Option(blank, '')] : []), ...values.map((value) => new Option(value, value))); }
function showMessage(text, type) { const el = $('#message'); el.textContent = text; el.className = type; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function showView(id) { document.querySelectorAll('.view').forEach((view) => { view.hidden = view.id !== id; }); currentView = id; window.scrollTo(0, 0); }
function downloadBackup(format) {
  const draft = getDraft();
  if (!draft) return showMessage('No hay una visita activa para respaldar.', 'error');
  const backup = { exportedAt: new Date().toISOString(), application: 'ESPORA Coyhaique', visit: draft, pending: getQueue().filter((item) => item.visit?.id === draft.id) };
  const filename = 'espora-' + (draft.id || 'respaldo') + '-' + new Date().toISOString().slice(0, 10);
  const content = format === 'html'
    ? '<!doctype html><html lang="es"><meta charset="utf-8"><title>Respaldo ESPORA ' + escapeHtml_(draft.id) + '</title><body><h1>Respaldo ESPORA Coyhaique</h1><p>Exportado: ' + escapeHtml_(backup.exportedAt) + '</p><pre>' + escapeHtml_(JSON.stringify(backup, null, 2)) + '</pre></body></html>'
    : JSON.stringify(backup, null, 2);
  const blob = new Blob([content], { type: format === 'html' ? 'text/html;charset=utf-8' : 'application/json;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename + '.' + format; link.click(); URL.revokeObjectURL(link.href);
  showMessage('Respaldo descargado correctamente.', 'success');
}
function escapeHtml_(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }

async function api(payload) {
  let response;
  try {
    response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'saveInstrument', payload }), redirect: 'follow' });
  } catch (networkError) {
    throw new Error('No fue posible conectar con el servicio. Verifique su conexión e intente nuevamente.');
  }
  if (!response.ok) throw new Error('El servicio respondió con un error (' + response.status + ').');
  let result;
  try {
    result = await response.json();
  } catch (parseError) {
    throw new Error('El servicio respondió en un formato inesperado. Puede que la implementación de Apps Script deba actualizarse.');
  }
  if (!result || !result.ok) throw new Error((result && result.error) || 'El servidor rechazó el registro.');
  return result.data;
}

function getLocal() { return SAMPLE_LOCALS.find((local) => local.code === $('#localCode').value.trim().toUpperCase()); }
function updateLocal() {
  const local = getLocal();
  const code = $('#localCode');
  const recat = $('#recategorizationField'); const retail = $('#retailSaleField');
  if (!local) {
    code.setCustomValidity('Ingrese un código válido de la muestra.'); ['establishment', 'address', 'localType', 'localSubtype'].forEach((id) => { $('#' + id).value = ''; }); recat.hidden = true; retail.hidden = true; return;
  }
  code.value = local.code; code.setCustomValidity('');
  $('#establishment').value = local.name; $('#address').value = local.address; $('#localType').value = local.criterion; $('#localSubtype').value = local.criterion2 || 'Sin subtipo';
  recat.hidden = !['Almacén', 'Minimarket'].includes(local.criterion); $('#recategorization').required = !recat.hidden;
  retail.hidden = local.criterion !== 'Importador Frutas y Verduras'; $('#retailSale').required = !retail.hidden;
}
function visitFromForm(existing) {
  return { id: existing?.id || newId(), observationDate: $('#observationDate').value, collector: $('#collector').value, localCode: $('#localCode').value, latitude: $('#latitude').value, longitude: $('#longitude').value, recategorization: $('#recategorization').value, retailSale: $('#retailSale').value, instruments: existing?.instruments || {} };
}
function fillVisit(visit) { Object.entries({ observationDate: visit.observationDate, collector: visit.collector, localCode: visit.localCode, latitude: visit.latitude, longitude: visit.longitude, recategorization: visit.recategorization, retailSale: visit.retailSale }).forEach(([id, value]) => { $('#' + id).value = value || ''; }); updateLocal(); }
function updateMenu() {
  const draft = getDraft(); if (!draft) return;
  const local = SAMPLE_LOCALS.find((item) => item.code === draft.localCode);
  $('#visitSummary').textContent = `${draft.id} · ${local?.name || draft.localCode} · ${draft.observationDate} · ${draft.collector}`;
  ['availability', 'prices', 'origins'].forEach((name) => { $('#' + name + 'Status').textContent = draft.instruments[name]?.saved ? ' ✓ guardado' : draft.instruments[name]?.data ? ' · borrador' : ' · pendiente'; });
}
function updateConnection() { const online = navigator.onLine; $('#connection').textContent = online ? 'Con conexión. Los instrumentos se guardan en la base de datos.' : 'Sin conexión. Los instrumentos se conservarán en este dispositivo hasta sincronizarlos.'; $('#connection').className = online ? 'online' : 'offline'; }

function renderAvailability(data) {
  const root = $('#availabilityItems'); root.replaceChildren();
  const groups = new Map();
  AVAILABILITY.forEach((item) => { const key = item.section + ' — ' + item.category; groups.set(key, [...(groups.get(key) || []), item]); });
  groups.forEach((items, title) => {
    const fieldset = $('#availabilityTemplate').content.firstElementChild.cloneNode(true); $('legend', fieldset).textContent = title;
    items.forEach((item) => { const row = document.createElement('div'); row.className = 'choice-row'; const value = data?.find((entry) => entry.section === item.section && entry.category === item.category && entry.label === item.label)?.value || ''; const radioName = cssId(item.section + '-' + item.category + '-' + item.label); row.innerHTML = `<span>${item.label}</span><label><input type="radio" name="${radioName}" value="Sí" ${value === 'Sí' ? 'checked' : ''} required> Sí</label><label><input type="radio" name="${radioName}" value="No" ${value === 'No' ? 'checked' : ''}> No</label>`; row.dataset.item = JSON.stringify(item); $('.availability-rows', fieldset).append(row); });
    root.append(fieldset);
  });
}
function cssId(text) { return 'item-' + text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\W/g, '-'); }
function availabilityData() { return [...document.querySelectorAll('.choice-row')].map((row) => ({ ...JSON.parse(row.dataset.item), value: $('input:checked', row)?.value || '' })); }

function addPriceProduct(entry) {
  const card = $('#priceProductTemplate').content.firstElementChild.cloneNode(true); const productSelect = $('.price-product', card);
  setOptions(productSelect, PRODUCTS.map((product) => product.name)); productSelect.value = entry?.product || PRODUCTS[0].name;
  const update = () => { const product = PRODUCTS.find((value) => value.name === productSelect.value); $('.price-category', card).value = product.category; card.querySelectorAll('.price-observation').forEach((row) => updatePriceRow(row, product)); };
  productSelect.addEventListener('change', update); $('.add-price', card).addEventListener('click', () => addPriceRow(card)); $('.remove-product', card).addEventListener('click', () => card.remove());
  $('#priceProducts').append(card); (entry?.prices || [{}, {}]).forEach((price) => addPriceRow(card, price)); update();
}
function addPriceRow(card, data = {}) {
  const row = $('#priceObservationTemplate').content.firstElementChild.cloneNode(true); const product = PRODUCTS.find((item) => item.name === $('.price-product', card).value);
  $('.brand', row).value = data.brand || ''; $('.price-value', row).value = data.value || ''; $('.promotion', row).value = data.promotion || 'No'; $('.notes', row).value = data.notes || ''; $('.origin', row).value = data.origin || 'Externo'; updatePriceRow(row, product, data); $('.price-observations', card).append(row);
}
function updatePriceRow(row, product, data = {}) {
  setOptions($('.unit', row), product.units); $('.unit', row).value = data.unit && product.units.includes(data.unit) ? data.unit : product.units[0];
  const isMeat = product.category === 'Carnes'; $('.conservation-field', row).hidden = !isMeat; $('.conservation', row).required = isMeat; $('.conservation', row).value = data.conservation || '';
}
function priceData() { return [...document.querySelectorAll('.product-card')].map((card) => ({ product: $('.price-product', card).value, prices: [...card.querySelectorAll('.price-observation')].map((row) => ({ brand: $('.brand', row).value, value: $('.price-value', row).value, unit: $('.unit', row).value, conservation: $('.conservation', row).value, origin: $('.origin', row).value, promotion: $('.promotion', row).value, notes: $('.notes', row).value })) })); }
function renderPrices(data) { $('#priceProducts').replaceChildren(); (data?.length ? data : [{}]).forEach(addPriceProduct); }

function addOriginItem(data = {}) {
  const row = $('#originItemTemplate').content.firstElementChild.cloneNode(true); setOptions($('.origin-product', row), ORIGIN_PRODUCTS, 'Seleccione'); $('.origin-product', row).value = data.product || ''; $('.origin-value', row).value = data.origin || 'Local'; $('.origin-detail', row).value = data.detail || ''; $('.origin-notes', row).value = data.notes || ''; $('.remove-origin', row).addEventListener('click', () => row.remove()); $('#originItems').append(row);
}
function originData() { return [...document.querySelectorAll('.origin-item')].map((row) => ({ product: $('.origin-product', row).value, origin: $('.origin-value', row).value, detail: $('.origin-detail', row).value, notes: $('.origin-notes', row).value })); }
function renderOrigins(data) { $('#originItems').replaceChildren(); (data?.length ? data : [{}]).forEach(addOriginItem); }

async function saveInstrument(instrument, data, submitButton) {
  const draft = getDraft(); const payload = { visit: draft, instrument, data };
  if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.textContent; submitButton.textContent = 'Guardando…'; }
  try {
    if (!navigator.onLine) { const queue = getQueue(); queue.push(payload); setQueue(queue); draft.instruments[instrument] = { data, saved: false }; setDraft(draft); showMessage('Sin conexión: el instrumento quedó en borrador y pendiente de sincronización.', 'success'); showView('menuView'); return; }
    const result = await api(payload); draft.instruments[instrument] = { data, saved: true, savedAt: new Date().toISOString() }; setDraft(draft); showMessage(`${result.savedRows} registro(s) guardado(s) para ${instrument}.`, 'success'); showView('menuView');
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = submitButton.dataset.originalText; }
  }
}
async function syncQueue() { if (!navigator.onLine) return; const queue = getQueue(); while (queue.length) { await api(queue[0]); queue.shift(); setQueue(queue); } }

function openInstrument(instrument) {
  const data = getDraft().instruments[instrument]?.data;
  if (instrument === 'availability') { renderAvailability(data); showView('availabilityView'); }
  if (instrument === 'prices') { renderPrices(data); showView('pricesView'); }
  if (instrument === 'origins') { renderOrigins(data); showView('originsView'); }
}
function useCurrentLocation() { if (!navigator.geolocation) return showMessage('Este navegador no admite geolocalización.', 'error'); navigator.geolocation.getCurrentPosition((pos) => { $('#latitude').value = pos.coords.latitude.toFixed(6); $('#longitude').value = pos.coords.longitude.toFixed(6); showMessage('Ubicación actual cargada. Verifíquela antes de continuar.', 'success'); }, () => showMessage('No fue posible obtener la ubicación.', 'error'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); }

function initialize() {
  setOptions($('#localCodes'), SAMPLE_LOCALS.map((local) => local.code)); updateConnection();
  const draft = getDraft(); $('#observationDate').value = new Date().toISOString().slice(0, 10); if (draft) { fillVisit(draft); showView('menuView'); updateMenu(); }
  $('#localCode').addEventListener('input', updateLocal); $('#localCode').addEventListener('change', updateLocal); $('#locationButton').addEventListener('click', useCurrentLocation);
  $('#visitForm').addEventListener('submit', (event) => { event.preventDefault(); const current = getDraft(); const visit = visitFromForm(current); if (!getLocal()) return; setDraft(visit); showView('menuView'); });
  document.querySelectorAll('.instrument').forEach((button) => button.addEventListener('click', () => openInstrument(button.dataset.instrument)));
  document.querySelectorAll('.return-menu').forEach((button) => button.addEventListener('click', () => { showView('menuView'); updateMenu(); }));
  $('#editVisitButton').addEventListener('click', () => showView('visitView')); $('#backupJsonButton').addEventListener('click', () => downloadBackup('json')); $('#backupHtmlButton').addEventListener('click', () => downloadBackup('html')); $('#closeVisitButton').addEventListener('click', () => { if (confirm('¿Eliminar el borrador local de esta visita? Los instrumentos ya guardados permanecerán en la base de datos.')) { localStorage.removeItem(DRAFT_KEY); $('#visitForm').reset(); $('#observationDate').value = new Date().toISOString().slice(0, 10); showView('visitView'); } });
  $('#availabilityForm').addEventListener('submit', (event) => { event.preventDefault(); saveInstrument('availability', availabilityData(), event.submitter).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#pricesForm').addEventListener('submit', (event) => { event.preventDefault(); saveInstrument('prices', priceData(), event.submitter).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#originsForm').addEventListener('submit', (event) => { event.preventDefault(); saveInstrument('origins', originData(), event.submitter).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#addPriceProduct').addEventListener('click', () => addPriceProduct()); $('#addOriginItem').addEventListener('click', () => addOriginItem());
  window.addEventListener('online', () => { updateConnection(); syncQueue().catch((error) => showMessage(errorText_(error), 'error')); }); window.addEventListener('offline', updateConnection);
  syncQueue().catch(() => {});
}
function errorText_(error) { return (error && error.message) ? error.message : 'Ocurrió un error inesperado. Intente nuevamente.'; }
window.addEventListener('unhandledrejection', (event) => { showMessage(errorText_(event.reason), 'error'); });
initialize();
