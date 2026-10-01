const API_URL = 'https://script.google.com/macros/s/AKfycbwNX-W0y8r4pl8Qa1eH4w0_Nl-TaQfbKtqGFnScMHgRWdAD4gqJDcpMg125_8QHFlrf/exec';
const DRAFT_KEY = 'esporaCoyhaiqueVisitDraftV2';
const QUEUE_KEY = 'esporaCoyhaiquePendingV2';
const NEW_LOCAL_COUNTER_KEY = 'esporaCoyhaiqueNewLocalCounterV1';
const COLLECTOR_KEY = 'esporaCoyhaiqueCollectorV1';
const NEW_LOCAL_CODE_PATTERN = /^LM\d+N([A-Z]{2,3}|\d+)$/i;
const PRICE_UNITS = ['kg', '0,5 kg', 'Unidad', 'Otros'];

const PRODUCTS = [
  ['Lechuga costina', 'Comparables con ODEPA'], ['Papa de guarda', 'Comparables con ODEPA'], ['Tomate larga vida', 'Comparables con ODEPA'],
  ['Zanahoria', 'Comparables con ODEPA'], ['Cebolla blanca', 'Comparables con ODEPA'], ['Manzana Fuji', 'Comparables con ODEPA'],
  ['Arroz blanco grado 1', 'Básicos de referencia'], ['Lenteja 6 mm', 'Básicos de referencia'], ['Leche entera pasteurizada de vaca', 'Básicos de referencia'], ['Pan marraqueta', 'Básicos de referencia'],
  ['Huevo blanco', 'Proteicos relevantes para Aysén'], ['Queso Gouda', 'Proteicos relevantes para Aysén'], ['Merluza austral congelada', 'Proteicos relevantes para Aysén'],
  ['Merluza austral fresca', 'Proteicos relevantes para Aysén'], ['Cordero (costillar o pulpa)', 'Proteicos relevantes para Aysén'],
  ['Calafate (temporada)', 'Emblemáticos regionales'], ['Lechuga local (hidropónica o de productor local)', 'Emblemáticos regionales'], ['Miel regional', 'Emblemáticos regionales'],
].map(([name, category]) => ({ name, category, units: PRICE_UNITS }));

const ORIGIN_CATEGORIES = [
  ['Productos hortícolas', ['Verduras y hortalizas frescas']],
  ['Frutas', ['Frutas frescas', 'Frutos rojos']],
  ['Productos pecuarios', ['Carne bovina', 'Carne ovina', 'Huevos']],
  ['Productos pesqueros', ['Pescados frescos', 'Mariscos frescos', 'Productos congelados del mar']],
  ['Productos procesados', ['Quesos', 'Conservas', 'Mermeladas', 'Miel', 'Otros productos procesados de origen regional']],
];
const AYSEN_COMMUNES = ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Río Ibáñez', 'Chile Chico', 'Cochrane', "O'Higgins", 'Tortel'];
const ORIGIN_SOURCES = ['Etiqueta o envase', 'Cartel', 'Información del responsable del establecimiento', 'Información del productor o feriante', 'Otra'];
const RESPONSIBLE_FIELDS = { classification: '#classificationResponsible', availability: '#availabilityResponsible', origins: '#originsResponsible', prices: '#pricesResponsible' };

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
const $ = (selector, root = document) => root.querySelector(selector);
let currentView = 'visitView';
let autoSuggestedUv = '';
let unitVecinalWasManuallySet = false;

function getDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (_) { return null; } }
function setDraft(draft) { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); updateMenu(); }
function getQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (_) { return []; } }
function setQueue(queue) { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); }
function newId() { return 'VIS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }
const NAME_PARTICLES = ['de', 'del', 'la', 'las', 'los', 'y', 'da', 'do', 'dos', 'van', 'von'];
function normalizeInitials_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
}
function initialsFromName_(name) {
  const words = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[^A-Za-z]+/).filter((word) => word && !NAME_PARTICLES.includes(word.toLowerCase()));
  if (!words.length) return '';
  if (words.length === 1) return normalizeInitials_(words[0].slice(0, 2));
  return normalizeInitials_(words.slice(0, 3).map((word) => word[0]).join(''));
}
function getCollectorProfile() { try { return JSON.parse(localStorage.getItem(COLLECTOR_KEY) || 'null'); } catch (_) { return null; } }
function rememberCollector() {
  localStorage.setItem(COLLECTOR_KEY, JSON.stringify({ name: $('#collector').value.trim(), initials: currentInitials() }));
}
function currentInitials() { return initialsFromName_($('#collector').value); }
function updateCollectorHint() {
  const initials = currentInitials();
  $('#collectorCodeHint').textContent = initials.length >= 2
    ? `Iniciales para locales nuevos: ${initials} (se obtienen del nombre).`
    : 'Escriba nombre y apellidos. Sus iniciales se agregan solas al código de los locales nuevos.';
}
function newLocalCode(initials) {
  const stored = Number(localStorage.getItem(NEW_LOCAL_COUNTER_KEY) || '0');
  const highest = SAMPLE_LOCALS.reduce((max, local) => {
    const match = String(local.code).match(/^LM(\d+)/i);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  const next = Math.max(highest + 1, stored + 1);
  localStorage.setItem(NEW_LOCAL_COUNTER_KEY, String(next));
  return 'LM' + String(next).padStart(2, '0') + 'N' + normalizeInitials_(initials);
}
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
function localUv_(local) { return typeof getUvForCoordinates === 'function' ? getUvForCoordinates(local.latitude, local.longitude) : null; }
function populateUvOptions(unitValue = '') {
  const options = UV_POLYGONS.map((unit) => new Option(unit.value, unit.value));
  options.push(new Option('Otra / borde de comuna (verificar manualmente)', 'Otra / borde'));
  if (unitValue && !options.some((option) => option.value === unitValue)) {
    const legacyMatch = unitValue.match(/^UV\s*(\d+)$/i);
    const migrated = legacyMatch && UV_POLYGONS.find((unit) => unit.code === String(Number(legacyMatch[1])));
    if (migrated) unitValue = migrated.value;
    else options.push(new Option(`${unitValue} (guardada anteriormente)`, unitValue));
  }
  const unitSelect = $('#visitUnit');
  unitSelect.replaceChildren(new Option('Seleccione una unidad vecinal…', ''), ...options);
  unitSelect.value = unitValue;
  const filter = $('#uvFilter');
  filter.replaceChildren(new Option('Mostrar todos los locales', ''), ...UV_POLYGONS.map((unit) => new Option(unit.value, unit.value)));
  return unitValue;
}
function populateLocalCodeOptions() {
  const select = $('#localCode');
  const previous = select.value;
  const filterUv = $('#uvFilter').value;
  const options = SAMPLE_LOCALS
    .filter((local) => !filterUv || localUv_(local) === filterUv)
    .map((local) => new Option(`${local.code} — ${local.name} — ${local.address}`, local.code));
  select.replaceChildren(new Option('Seleccione un local…', ''), ...options);
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
}
function updateTerritoryReference() {
  const isNew = $('#isNewLocal').checked;
  const local = isNew ? null : getLocal();
  const address = isNew ? $('#newLocalAddress').value.trim() : local?.address;
  const latitude = $('#latitude').value.trim();
  const longitude = $('#longitude').value.trim();
  const selectedUv = $('#visitUnit').value;
  const hasCoordinates = Boolean(latitude && longitude);
  const detectedUv = hasCoordinates ? getUvForCoordinates(latitude, longitude) : '';
  const addressText = address ? `Dirección «${address}»` : 'La dirección del local';

  if (!hasCoordinates) {
    $('#uvSuggestion').textContent = `${addressText}. UV pendiente: capture el GPS para sugerirla o selecciónela manualmente.`;
    return;
  }

  const gpsText = `GPS (${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)})`;
  if (detectedUv && selectedUv && detectedUv !== selectedUv) {
    $('#uvSuggestion').textContent = `${addressText} · ${gpsText} cae en ${detectedUv}, pero seleccionó ${selectedUv}. Revise el punto o la UV, especialmente cerca de un límite.`;
    return;
  }
  if (selectedUv) {
    const source = detectedUv
      ? `El GPS y la dirección corresponden a ${selectedUv}.`
      : `UV seleccionada: ${selectedUv}; no se pudo verificar el punto dentro de los polígonos.`;
    $('#uvSuggestion').textContent = `${addressText} · ${gpsText}. ${source}`;
    return;
  }
  $('#uvSuggestion').textContent = `${addressText} · ${gpsText}. No se asignó una UV; selecciónela manualmente.`;
}
function updateLocal({ restore = false } = {}) {
  const isNew = $('#isNewLocal').checked;
  const local = getLocal();
  const code = $('#localCode');
  $('#sampleLocalFields').hidden = isNew;
  $('#newLocalFields').hidden = !isNew;
  $('#uvFilterDetails').hidden = isNew;
  $('#localCode').required = !isNew;
  ['newLocalName', 'newLocalAddress', 'newLocalType'].forEach((id) => { $('#' + id).required = isNew; });
  if (isNew) {
    const initials = currentInitials();
    const codeField = $('#newLocalCode');
    if (initials.length < 2) {
      codeField.value = '';
      codeField.placeholder = 'Ingrese primero el nombre de la persona recolectora';
    } else if (!NEW_LOCAL_CODE_PATTERN.test(codeField.value)) {
      codeField.value = newLocalCode(initials);
    }
    updateTerritoryReference();
    return;
  }
  if (!local) {
    code.setCustomValidity(code.value ? 'Ingrese un código válido de la muestra.' : '');
    if (!restore) {
      $('#latitude').value = '';
      $('#longitude').value = '';
      if (autoSuggestedUv && $('#visitUnit').value === autoSuggestedUv) $('#visitUnit').value = '';
      autoSuggestedUv = '';
      unitVecinalWasManuallySet = false;
    }
    updateTerritoryReference();
    return;
  }
  code.setCustomValidity('');
  if (!restore) {
    $('#latitude').value = local.latitude || '';
    $('#longitude').value = local.longitude || '';
    autoSuggestedUv = localUv_(local) || '';
    unitVecinalWasManuallySet = false;
    $('#visitUnit').value = autoSuggestedUv;
  }
  updateTerritoryReference();
}
function localFormIsValid() {
  if ($('#isNewLocal').checked) {
    return Boolean($('#newLocalName').value.trim() && $('#newLocalAddress').value.trim()
      && $('#newLocalType').value && NEW_LOCAL_CODE_PATTERN.test($('#newLocalCode').value));
  }
  return Boolean(getLocal());
}
function visitFromForm(existing) {
  const isNew = $('#isNewLocal').checked;
  return { id: existing?.id || newId(), observationDate: $('#observationDate').value, collector: $('#collector').value, collectorInitials: currentInitials(), localCode: isNew ? $('#newLocalCode').value : $('#localCode').value, unitVecinal: $('#visitUnit').value, latitude: $('#latitude').value, longitude: $('#longitude').value, isNewLocal: isNew, localName: isNew ? $('#newLocalName').value.trim() : '', localAddress: isNew ? $('#newLocalAddress').value.trim() : '', localType: isNew ? $('#newLocalType').value : '', instruments: existing?.instruments || {} };
}
function fillVisit(visit) {
  const sampleLocal = SAMPLE_LOCALS.find((local) => local.code === visit.localCode);
  const latitude = visit.latitude || sampleLocal?.latitude;
  const longitude = visit.longitude || sampleLocal?.longitude;
  const inferredUv = latitude && longitude ? getUvForCoordinates(latitude, longitude) : '';
  const savedUv = populateUvOptions(visit.unitVecinal || inferredUv);
  Object.entries({ observationDate: visit.observationDate, collector: visit.collector, latitude, longitude, visitUnit: savedUv }).forEach(([id, value]) => { $('#' + id).value = value || ''; });
  updateCollectorHint();
  $('#isNewLocal').checked = Boolean(visit.isNewLocal);
  populateLocalCodeOptions();
  if (visit.isNewLocal) { $('#newLocalCode').value = visit.localCode || ''; $('#newLocalName').value = visit.localName || ''; $('#newLocalAddress').value = visit.localAddress || ''; $('#newLocalType').value = ['Almacén', 'Minimarket'].includes(visit.localType) ? 'Almacén o minimarket' : visit.localType || ''; } else { $('#localCode').value = visit.localCode || ''; }
  autoSuggestedUv = savedUv === inferredUv ? inferredUv || '' : '';
  unitVecinalWasManuallySet = Boolean(savedUv && savedUv !== inferredUv);
  updateLocal({ restore: true });
  updateTerritoryReference();
}
function suggestUvFromCoordinates() {
  if (!$('#latitude').value || !$('#longitude').value) { updateTerritoryReference(); return; }
  const uv = getUvForCoordinates($('#latitude').value, $('#longitude').value);
  if (!unitVecinalWasManuallySet || !$('#visitUnit').value || $('#visitUnit').value === autoSuggestedUv) {
    $('#visitUnit').value = uv || '';
    autoSuggestedUv = uv || '';
  }
  updateTerritoryReference();
}
function updateMenu() {
  const draft = getDraft(); if (!draft) return;
  const local = SAMPLE_LOCALS.find((item) => item.code === draft.localCode);
  $('#visitSummary').textContent = `${draft.id} · ${local?.name || draft.localName || draft.localCode} · ${draft.unitVecinal || 'Sin UV'} · ${draft.observationDate} · Identificó: ${draft.collector}`;
  ['classification', 'availability', 'prices', 'origins'].forEach((name) => { $('#' + name + 'Status').textContent = draft.instruments[name]?.saved ? ' ✓ guardado' : draft.instruments[name]?.data ? ' · borrador' : ' · pendiente'; });
  const unsaved = unsavedInstrumentNames_(draft);
  const queuedCount = getQueue().filter((item) => item.visit?.id === draft.id).length;
  const status = $('#visitSaveStatus');
  status.textContent = unsaved.length
    ? `Pendiente de guardar en Sheets: ${unsaved.join(', ')}.${queuedCount ? ` ${queuedCount} envío(s) en cola de sincronización.` : ''} Descargue un respaldo offline antes de cerrar.`
    : queuedCount
      ? `${queuedCount} envío(s) pendiente(s) de sincronización. Mantenga la conexión hasta confirmar el guardado en Sheets.`
      : 'Los instrumentos con registros están guardados en Sheets.';
}
function unsavedInstrumentNames_(draft) {
  const labels = { classification: 'Clasificación', availability: 'Disponibilidad y variedad', origins: 'Origen', prices: 'Precios' };
  return Object.entries(labels)
    .filter(([name]) => draft.instruments[name]?.data && !draft.instruments[name]?.saved)
    .map(([, label]) => label);
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
  const groups = [...new Set(PRODUCTS.map((product) => product.category))];
  productSelect.replaceChildren(...groups.map((group) => {
    const optgroup = document.createElement('optgroup'); optgroup.label = group;
    optgroup.append(...PRODUCTS.filter((product) => product.category === group).map((product) => new Option(product.name, product.name)));
    return optgroup;
  }));
  productSelect.value = entry?.product || PRODUCTS[0].name;
  const update = () => { const product = PRODUCTS.find((value) => value.name === productSelect.value); $('.price-category', card).value = product.category; };
  productSelect.addEventListener('change', update); $('.remove-product', card).addEventListener('click', () => card.remove());
  $('#priceProducts').append(card);
  const prices = entry?.prices || [];
  addPriceRow(card, prices[0] || {}, 'min'); addPriceRow(card, prices[1] || {}, 'max'); update();
}
function addPriceRow(card, data = {}, kind) {
  const row = $('#priceObservationTemplate').content.firstElementChild.cloneNode(true);
  row.dataset.kind = kind;
  setOptions($('.unit', row), PRICE_UNITS); $('.unit', row).value = PRICE_UNITS.includes(data.unit) ? data.unit : PRICE_UNITS[0];
  $('.brand', row).value = data.brand || ''; $('.price-value', row).value = data.value || ''; $('.promotion', row).value = data.promotion || 'No'; $('.notes', row).value = data.notes || '';
  $('.price-range-label strong', row).textContent = kind === 'min' ? 'mínimo observado' : 'máximo observado (si hay más de una opción)';
  if (kind === 'min') { $('.brand-field', row).classList.add('required'); $('.price-field', row).classList.add('required'); $('.unit-field', row).classList.add('required'); $('.brand', row).required = true; $('.price-value', row).required = true; }
  const syncNotes = () => {
    const filled = kind === 'min' || $('.price-value', row).value !== '';
    $('.notes', row).required = $('.unit', row).value === 'Otros' && filled;
    if (kind !== 'min') $('.brand', row).required = filled;
  };
  $('.unit', row).addEventListener('change', syncNotes); $('.price-value', row).addEventListener('input', syncNotes); syncNotes();
  $('.price-observations', card).append(row);
}
function priceData() {
  return [...document.querySelectorAll('.product-card')].map((card) => ({
    product: $('.price-product', card).value,
    prices: [...card.querySelectorAll('.price-observation')]
      .filter((row) => row.dataset.kind === 'min' || $('.price-value', row).value !== '')
      .map((row) => ({ type: row.dataset.kind === 'min' ? 'Mínimo' : 'Máximo', brand: $('.brand', row).value.trim(), value: $('.price-value', row).value, unit: $('.unit', row).value, promotion: $('.promotion', row).value, notes: $('.notes', row).value.trim() })),
  }));
}
function renderPrices(data) { $('#priceProducts').replaceChildren(); (data || []).forEach(addPriceProduct); }
function priceEntries_(data) {
  const entries = data && !Array.isArray(data) ? data.products || [] : data || [];
  return entries.filter((entry) => PRODUCTS.some((product) => product.name === entry.product));
}
function renderPriceReview(data) {
  const entries = priceEntries_(data);
  $('#priceReviewItems').replaceChildren();
  $('#pricesNotes').value = data && !Array.isArray(data) ? data.notes || '' : '';
  if (!entries.length) {
    $('#priceReviewItems').innerHTML = '<p class="empty-state">Aún no hay alimentos agregados. Pulse “Agregar producto” para comenzar.</p>';
    return;
  }
  entries.forEach((entry) => {
    const item = document.createElement('article');
    item.className = 'price-review-item';
    const priceText = (price) => price ? `$${escapeHtml_(price.value)} / ${escapeHtml_(price.unit)}${price.brand ? ' (' + escapeHtml_(price.brand) + ')' : ''}` : '—';
    item.innerHTML = `<strong>${escapeHtml_(entry.product)}</strong><span>Mínimo: ${priceText(entry.prices[0])} · Máximo: ${priceText(entry.prices[1])}</span>`;
    $('#priceReviewItems').append(item);
  });
}
function openPriceEditor() {
  $('#priceProducts').replaceChildren();
  addPriceProduct();
  showView('priceEditorView');
}
function savePriceDraftFromEditor() {
  const draft = getDraft();
  const newEntries = priceData();
  if (!newEntries.length) throw new Error('Agregue al menos un alimento.');
  const existingEntries = priceEntries_(draft.instruments.prices?.data);
  const entries = existingEntries.concat(newEntries);
  draft.instruments.prices = { data: entries, saved: false };
  setDraft(draft);
  renderPriceReview(draft.instruments.prices.data);
  showView('pricesReviewView');
}
function selectedProteins_() {
  return [...document.querySelectorAll('input[name="proteinCategory"]:checked')]
    .filter((input) => input.value === 'pescados_mariscos' || $('#rubroMeat').checked)
    .map((input) => input.value);
}
function classificationData() {
  const produce = $('#rubroProduce').checked;
  return {
    unitVecinal: getDraft()?.unitVecinal || '', estadoLocal: 'abierto',
    superficie: $('#classificationSurface').value,
    sistemaAtencion: $('#classificationService').value,
    rubroFrutasHortalizas: produce ? 'si' : 'no',
    rubroCarneFresca: $('#rubroMeat').checked ? 'si' : 'no',
    variedadesFrutasVerduras: produce ? $('#classificationProduceVarieties').value : '0',
    categoriasProteicas: selectedProteins_(),
    lacteosHabituales: $('#rubroDairy').checked ? 'si' : 'no',
    huevosHabituales: $('#rubroEggs').checked ? 'si' : 'no',
    personasAtendiendo: $('#classificationPeople').value,
    clasificacionOverride: $('#classificationOverride').value,
    justificacionOverride: $('#classificationJustification').value, observaciones: $('#classificationNotes').value,
    interiorAuthorized: $('#classificationInteriorPermission').checked,
    images: collectClassificationImages_(),
  };
}
function collectClassificationImages_() {
  const groups = { frontis: '#classificationFront', interior: '#classificationInterior', frutasVerduras: '#classificationProduceImages', carnes: '#classificationMeatImages', pescadosMariscos: '#classificationFishImages', congelados: '#classificationFrozenImages' };
  return Object.fromEntries(Object.entries(groups).map(([key, selector]) => [key, [...$(selector).files].map((file) => file)]));
}
async function prepareClassificationImages_(data) {
  if (data.images.interior.length && !data.interiorAuthorized) {
    throw new Error('Confirme la autorización para fotografiar el interior.');
  }
  const images = {};
  for (const [group, files] of Object.entries(data.images || {})) {
    images[group] = [];
    for (const file of files) images[group].push(await compressImage_(file));
  }
  return { ...data, images };
}
function compressImage_(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No fue posible leer una imagen.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));
      image.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, mimeType: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.72).split(',')[1] });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function renderClassification(data = {}) {
  const draft = getDraft();
  const local = SAMPLE_LOCALS.find((item) => item.code === draft?.localCode);
  $('#classificationLinkedLocal').textContent = local
    ? `${local.code} · ${local.name} · ${local.address}`
    : draft?.isNewLocal ? `${draft.localCode} · ${draft.localName} · ${draft.localAddress} (local nuevo)` : 'Sin local identificado.';
  $('#classificationLinkedUnit').textContent = draft?.unitVecinal || 'Sin unidad vecinal registrada.';
  const proteins = data.categoriasProteicas || [];
  const fields = {
    classificationSurface: ['muy_pequeno', 'pequeno', 'mediano', 'grande'].includes(data.superficie) ? data.superficie : '',
    classificationService: data.sistemaAtencion === 'acceso_libre' ? 'autoservicio' : data.sistemaAtencion,
    classificationPeople: data.personasAtendiendo,
    classificationProduceVarieties: data.variedadesFrutasVerduras,
    classificationOverride: data.clasificacionOverride,
    classificationJustification: data.justificacionOverride,
    classificationNotes: data.observaciones,
  };
  Object.entries(fields).forEach(([id, value]) => { if ($('#' + id)) $('#' + id).value = value || ''; });
  $('#rubroProduce').checked = data.rubroFrutasHortalizas ? data.rubroFrutasHortalizas === 'si' : Number(data.variedadesFrutasVerduras) > 0;
  $('#rubroMeat').checked = data.rubroCarneFresca ? data.rubroCarneFresca === 'si' : proteins.some((value) => value !== 'pescados_mariscos');
  $('#rubroDairy').checked = data.lacteosHabituales === 'si';
  $('#rubroEggs').checked = data.huevosHabituales === 'si';
  document.querySelectorAll('input[name="proteinCategory"]').forEach((input) => { input.checked = proteins.includes(input.value); });
  $('#classificationImageStatus').textContent = data.imageUrls ? 'Imágenes guardadas en Drive.' : '';
  $('#classificationInteriorPermission').checked = Boolean(data.interiorAuthorized);
  updateClassificationVisibility();
}
const PROTEIN_CATEGORIES = ['vacuno', 'cerdo', 'pollo', 'cordero', 'pescados_mariscos'];
const SELF_SERVICE_MODES = ['autoservicio', 'mixto'];
function classifyLocal_(sistemaAtencion, produceVarieties, proteinCategories, dairyRegular, eggsRegular) {
  const varieties = Number(produceVarieties);
  const proteins = Array.isArray(proteinCategories) ? [...new Set(proteinCategories)] : [];
  const fulfilledCriteria = [
    Number.isInteger(varieties) && varieties >= 10,
    proteins.filter((category) => PROTEIN_CATEGORIES.includes(category)).length >= 2,
    dairyRegular === 'si' && eggsRegular === 'si',
  ].filter(Boolean).length;
  return {
    classification: SELF_SERVICE_MODES.includes(sistemaAtencion) && fulfilledCriteria >= 2 ? 'minimarket' : 'almacen_barrio',
    fulfilledCriteria,
  };
}
function updateClassificationVisibility() {
  const produce = $('#rubroProduce').checked;
  $('#produceVarietiesField').hidden = !produce;
  $('#classificationProduceVarieties').required = produce;
  $('#meatTypesField').hidden = !$('#rubroMeat').checked;
  const manual = Boolean($('#classificationOverride').value);
  $('#classificationJustificationField').hidden = !manual; $('#classificationJustification').required = manual;
  const servicio = $('#classificationService').value;
  const variedades = produce ? $('#classificationProduceVarieties').value : '0';
  if (!servicio || variedades === '') {
    $('#classificationResult').textContent = produce
      ? 'Indique el sistema de atención y el número de variedades de frutas y hortalizas para calcular.'
      : 'Indique el sistema de atención para calcular.';
    return;
  }
  const result = classifyLocal_(servicio, variedades, selectedProteins_(), $('#rubroDairy').checked ? 'si' : 'no', $('#rubroEggs').checked ? 'si' : 'no');
  $('#classificationResult').textContent = !SELF_SERVICE_MODES.includes(servicio)
    ? 'Clasificación automática: ALMACÉN DE BARRIO — se requiere autoservicio o atención mixta. Criterios de surtido cumplidos: ' + result.fulfilledCriteria + ' de 3.'
    : 'Clasificación automática: ' + (result.classification === 'minimarket' ? 'MINIMARKET' : 'ALMACÉN DE BARRIO')
      + ' — criterios cumplidos: ' + result.fulfilledCriteria + ' de 3; se requieren al menos 2.';
}

function addOriginItem(data = {}) {
  const row = $('#originItemTemplate').content.firstElementChild.cloneNode(true);
  const category = $('.origin-category', row);
  category.replaceChildren(new Option('Seleccione', ''), ...ORIGIN_CATEGORIES.map(([group, values]) => {
    const optgroup = document.createElement('optgroup'); optgroup.label = group;
    optgroup.append(...values.map((value) => new Option(value, value)));
    return optgroup;
  }));
  setOptions($('.origin-commune', row), AYSEN_COMMUNES, 'Seleccione');
  setOptions($('.origin-source', row), ORIGIN_SOURCES, 'Seleccione');
  category.value = data.category || ''; $('.origin-variety', row).value = data.variety || ''; $('.origin-commune', row).value = data.commune || '';
  $('.origin-sector', row).value = data.sector || ''; $('.origin-brand', row).value = data.brand || ''; $('.origin-source', row).value = data.source || ''; $('.origin-notes', row).value = data.notes || '';
  const syncNotes = () => { $('.origin-notes', row).required = $('.origin-source', row).value === 'Otra'; };
  $('.origin-source', row).addEventListener('change', syncNotes); syncNotes();
  $('.remove-origin', row).addEventListener('click', () => { row.remove(); updateOriginsNone(); });
  $('#originItems').append(row);
  updateOriginsNone();
}
function updateOriginsNone() {
  const none = $('#originsNone').checked;
  $('#originItems').hidden = none; $('#addOriginItem').hidden = none;
  document.querySelectorAll('#originItems input, #originItems select, #originItems textarea').forEach((field) => { field.disabled = none; });
}
function originData() {
  const none = $('#originsNone').checked;
  return {
    noneObserved: none,
    items: none ? [] : [...document.querySelectorAll('.origin-item')].map((row) => ({
      category: $('.origin-category', row).value, variety: $('.origin-variety', row).value.trim(), commune: $('.origin-commune', row).value,
      sector: $('.origin-sector', row).value.trim(), brand: $('.origin-brand', row).value.trim(), source: $('.origin-source', row).value, notes: $('.origin-notes', row).value.trim(),
    })),
  };
}
function renderOrigins(data) {
  $('#originItems').replaceChildren();
  const items = data && !Array.isArray(data) ? (data.items || []).filter((item) => item.category) : [];
  $('#originsNone').checked = Boolean(data && data.noneObserved);
  (items.length ? items : [{}]).forEach(addOriginItem);
  updateOriginsNone();
}
function fillResponsible(instrument) {
  const draft = getDraft();
  const field = $(RESPONSIBLE_FIELDS[instrument]);
  field.value = draft?.instruments[instrument]?.responsible || getCollectorProfile()?.name || draft?.collector || '';
}
function responsibleFor(instrument) {
  const value = $(RESPONSIBLE_FIELDS[instrument]).value.trim();
  if (!value) throw new Error('Indique la persona responsable de esta pauta.');
  return value;
}

async function saveInstrument(instrument, data, submitButton) {
  const responsible = responsibleFor(instrument);
  const draft = getDraft(); const payload = { visit: draft, instrument, data, responsible };
  if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.textContent; submitButton.textContent = 'Guardando…'; }
  try {
    if (!navigator.onLine) { const queue = getQueue(); queue.push(payload); setQueue(queue); draft.instruments[instrument] = { data, responsible, saved: false }; setDraft(draft); showMessage('Sin conexión: la pauta quedó en borrador y pendiente de sincronización.', 'success'); if (instrument !== 'prices') showView('menuView'); return; }
    const result = await api(payload); draft.instruments[instrument] = { data, responsible, saved: true, savedAt: new Date().toISOString() }; setDraft(draft); showMessage(`${result.savedRows} registro(s) guardado(s) para ${INSTRUMENT_LABELS[instrument]}.`, 'success'); if (instrument !== 'prices') showView('menuView');
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = submitButton.dataset.originalText; }
  }
}
const INSTRUMENT_LABELS = { classification: 'clasificación', availability: 'disponibilidad y variedad', origins: 'origen', prices: 'precios' };
async function syncQueue() { if (!navigator.onLine) return; const queue = getQueue(); while (queue.length) { await api(queue[0]); queue.shift(); setQueue(queue); } }

function openInstrument(instrument) {
  const data = getDraft().instruments[instrument]?.data;
  fillResponsible(instrument);
  if (instrument === 'availability') { renderAvailability(data); showView('availabilityView'); }
  if (instrument === 'prices') { showView('pricesView'); }
  if (instrument === 'origins') { renderOrigins(data); showView('originsView'); }
  if (instrument === 'classification') { renderClassification(data); showView('classificationView'); }
}
function useCurrentLocation() { if (!navigator.geolocation) return showMessage('Este navegador no admite geolocalización.', 'error'); navigator.geolocation.getCurrentPosition((pos) => { $('#latitude').value = pos.coords.latitude.toFixed(6); $('#longitude').value = pos.coords.longitude.toFixed(6); suggestUvFromCoordinates(); showMessage('Ubicación actual cargada. Verifíquela antes de continuar.', 'success'); }, () => showMessage('No fue posible obtener la ubicación.', 'error'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); }

function initialize() {
  populateUvOptions(); populateLocalCodeOptions(); updateConnection();
  const draft = getDraft(); $('#observationDate').value = new Date().toISOString().slice(0, 10);
  const profile = getCollectorProfile();
  if (profile) { $('#collector').value = profile.name || ''; }
  updateCollectorHint();
  if (draft) { fillVisit(draft); showView('menuView'); updateMenu(); }
  $('#localCode').addEventListener('change', updateLocal);
  $('#collector').addEventListener('input', () => {
    rememberCollector();
    updateCollectorHint();
  });
  $('#collector').addEventListener('change', () => {
    const codeField = $('#newLocalCode');
    const suffix = (codeField.value.match(/N([A-Z]{2,3})$/i) || [])[1];
    if ($('#isNewLocal').checked && suffix && suffix.toUpperCase() !== currentInitials()) codeField.value = '';
    updateLocal();
  });
  $('#regenerateCodeButton').addEventListener('click', () => {
    const initials = currentInitials();
    if (initials.length < 2) return showMessage('Ingrese primero el nombre de la persona recolectora.', 'error');
    $('#newLocalCode').value = newLocalCode(initials);
    showMessage('Código nuevo asignado: ' + $('#newLocalCode').value, 'success');
  });
  $('#isNewLocal').addEventListener('change', () => {
    if ($('#isNewLocal').checked) {
      $('#latitude').value = '';
      $('#longitude').value = '';
      $('#visitUnit').value = '';
      autoSuggestedUv = '';
      unitVecinalWasManuallySet = false;
    }
    updateLocal();
  });
  $('#uvFilter').addEventListener('change', () => { populateLocalCodeOptions(); updateLocal(); });
  $('#visitUnit').addEventListener('change', () => {
    unitVecinalWasManuallySet = Boolean($('#visitUnit').value && $('#visitUnit').value !== autoSuggestedUv);
    updateTerritoryReference();
  });
  ['latitude', 'longitude'].forEach((id) => $('#' + id).addEventListener('change', suggestUvFromCoordinates));
  ['newLocalName', 'newLocalType'].forEach((id) => $('#' + id).addEventListener('input', updateLocal));
  $('#newLocalAddress').addEventListener('change', updateTerritoryReference);
  $('#locationButton').addEventListener('click', useCurrentLocation);
  $('#visitForm').addEventListener('submit', (event) => { event.preventDefault(); const current = getDraft(); const visit = visitFromForm(current); if (currentInitials().length < 2) { showMessage('Escriba el nombre de la persona recolectora (nombre y apellido).', 'error'); return; } if (!localFormIsValid()) { showMessage('Complete los datos del local seleccionado o del local nuevo.', 'error'); return; } rememberCollector(); setDraft(visit); showView('menuView'); });
  document.querySelectorAll('.instrument').forEach((button) => button.addEventListener('click', () => openInstrument(button.dataset.instrument)));
  document.querySelectorAll('.return-menu').forEach((button) => button.addEventListener('click', () => { showView('menuView'); updateMenu(); }));
  $('#editVisitButton').addEventListener('click', () => showView('visitView'));
  $('#backupJsonButton').addEventListener('click', () => downloadBackup('json'));
  $('#backupHtmlButton').addEventListener('click', () => downloadBackup('html'));
  $('#closeVisitButton').addEventListener('click', () => {
    const draft = getDraft();
    if (!draft) return;
    const unsaved = unsavedInstrumentNames_(draft);
    const queuedCount = getQueue().filter((item) => item.visit?.id === draft.id).length;
    const warning = unsaved.length
      ? `Aún no están guardados en Sheets: ${unsaved.join(', ')}.${queuedCount ? ` Hay ${queuedCount} envío(s) en cola.` : ''} Si cierra ahora, se borrará el borrador local. Descargue un respaldo para conservar esos datos. ¿Cerrar de todas formas?`
      : queuedCount
        ? `Hay ${queuedCount} envío(s) pendientes de sincronización. Cerrar borrará el borrador local, pero los envíos seguirán en cola. ¿Cerrar la visita?`
        : 'Los instrumentos guardados en Sheets se conservarán. ¿Cerrar la visita y borrar el borrador de este dispositivo?';
    if (!confirm(warning)) return;
    localStorage.removeItem(DRAFT_KEY);
    $('#visitForm').reset();
    $('#observationDate').value = new Date().toISOString().slice(0, 10);
    showView('visitView');
  });
  $('#availabilityForm').addEventListener('submit', (event) => { event.preventDefault(); saveInstrument('availability', availabilityData(), event.submitter).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#originsForm').addEventListener('submit', (event) => { event.preventDefault(); saveInstrument('origins', originData(), event.submitter).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#openPricesReviewButton').addEventListener('click', () => { renderPriceReview(getDraft().instruments.prices?.data); showView('pricesReviewView'); });
  $('#startPriceProductButton').addEventListener('click', openPriceEditor);
  $('#addPriceProduct').addEventListener('click', openPriceEditor);
  $('#priceEditorForm').addEventListener('submit', (event) => { event.preventDefault(); try { savePriceDraftFromEditor(); } catch (error) { showMessage(errorText_(error), 'error'); } });
  $('#cancelPriceEditor').addEventListener('click', () => { renderPriceReview(getDraft().instruments.prices?.data); showView('pricesReviewView'); });
  $('#saveReviewedPrices').addEventListener('click', () => { const draft = getDraft(); const data = draft.instruments.prices?.data; if (!priceEntries_(data).length) return showMessage('Agregue al menos un alimento antes de guardar.', 'error'); saveInstrument('prices', { products: priceEntries_(data), notes: $('#pricesNotes').value }, $('#saveReviewedPrices')).catch((error) => showMessage(errorText_(error), 'error')); });
  $('#addOriginItem').addEventListener('click', () => addOriginItem());
  $('#classificationOverride').addEventListener('change', updateClassificationVisibility);
  ['classificationService', 'rubroProduce', 'rubroMeat', 'rubroDairy', 'rubroEggs']
    .forEach((id) => $('#' + id).addEventListener('change', updateClassificationVisibility));
  $('#originsNone').addEventListener('change', updateOriginsNone);
  $('#classificationProduceVarieties').addEventListener('input', updateClassificationVisibility);
  document.querySelectorAll('input[name="proteinCategory"]').forEach((input) => {
    input.addEventListener('change', updateClassificationVisibility);
  });
  $('#classificationForm').addEventListener('submit', async (event) => { event.preventDefault(); try { const data = await prepareClassificationImages_(classificationData()); await saveInstrument('classification', data, event.submitter); } catch (error) { showMessage(errorText_(error), 'error'); } });
  window.addEventListener('online', () => { updateConnection(); syncQueue().catch((error) => showMessage(errorText_(error), 'error')); }); window.addEventListener('offline', updateConnection);
  syncQueue().catch(() => {});
}
function errorText_(error) { return (error && error.message) ? error.message : 'Ocurrió un error inesperado. Intente nuevamente.'; }
window.addEventListener('unhandledrejection', (event) => { showMessage(errorText_(event.reason), 'error'); });
initialize();
