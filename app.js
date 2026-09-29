const API_URL = 'https://script.google.com/macros/s/AKfycbwNX-W0y8r4pl8Qa1eH4w0_Nl-TaQfbKtqGFnScMHgRWdAD4gqJDcpMg125_8QHFlrf/exec';
const DRAFT_KEY = 'esporaCoyhaiqueVisitDraftV2';
const QUEUE_KEY = 'esporaCoyhaiquePendingV2';
const NEW_LOCAL_COUNTER_KEY = 'esporaCoyhaiqueNewLocalCounterV1';
const COLLECTOR_KEY = 'esporaCoyhaiqueCollectorV1';
const NEW_LOCAL_CODE_PATTERN = /^LM\d+N([A-Z]{2,3}|\d+)$/i;
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
    $('#establishment').value = $('#newLocalName').value;
    $('#address').value = $('#newLocalAddress').value;
    return;
  }
  if (!local) {
    code.setCustomValidity(code.value ? 'Ingrese un código válido de la muestra.' : '');
    ['establishment', 'address'].forEach((id) => { $('#' + id).value = ''; });
    if (!restore) {
      $('#latitude').value = '';
      $('#longitude').value = '';
      if (autoSuggestedUv && $('#visitUnit').value === autoSuggestedUv) $('#visitUnit').value = '';
      autoSuggestedUv = '';
      unitVecinalWasManuallySet = false;
      $('#uvSuggestion').textContent = '';
    }
    return;
  }
  code.setCustomValidity('');
  $('#establishment').value = local.name; $('#address').value = local.address;
  if (!restore) {
    $('#latitude').value = local.latitude || '';
    $('#longitude').value = local.longitude || '';
    autoSuggestedUv = localUv_(local) || '';
    unitVecinalWasManuallySet = false;
    $('#visitUnit').value = autoSuggestedUv;
    $('#uvSuggestion').textContent = autoSuggestedUv
      ? `UV sugerida desde las coordenadas del local de muestra: ${autoSuggestedUv}. Verifique el punto y corrija la selección si está cerca de un límite.`
      : 'No se encontró una UV para estas coordenadas. Revise la ubicación y seleccione la unidad vecinal manualmente.';
  }
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
  $('#uvSuggestion').textContent = inferredUv
    ? `UV sugerida según las coordenadas guardadas: ${inferredUv}. Verifique el punto y corrija la selección si está cerca de un límite.`
    : '';
  updateLocal({ restore: true });
}
function suggestUvFromCoordinates() {
  if (!$('#latitude').value || !$('#longitude').value) { $('#uvSuggestion').textContent = ''; return; }
  const uv = getUvForCoordinates($('#latitude').value, $('#longitude').value);
  $('#uvSuggestion').textContent = uv
    ? `Sugerencia según coordenadas: ${uv}. Verifique el punto y corrija la selección si está cerca de un límite.`
    : 'No se encontró una UV para estas coordenadas. Revise la ubicación y seleccione la unidad vecinal manualmente.';
  if (!unitVecinalWasManuallySet || !$('#visitUnit').value || $('#visitUnit').value === autoSuggestedUv) {
    $('#visitUnit').value = uv || '';
    autoSuggestedUv = uv || '';
  }
}
function updateMenu() {
  const draft = getDraft(); if (!draft) return;
  const local = SAMPLE_LOCALS.find((item) => item.code === draft.localCode);
  $('#visitSummary').textContent = `${draft.id} · ${local?.name || draft.localCode} · ${draft.unitVecinal || 'Sin UV'} · ${draft.observationDate} · ${draft.collector}`;
  ['classification', 'availability', 'prices', 'origins'].forEach((name) => { $('#' + name + 'Status').textContent = draft.instruments[name]?.saved ? ' ✓ guardado' : draft.instruments[name]?.data ? ' · borrador' : ' · pendiente'; });
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
  const rowNumber = card.querySelectorAll('.price-observation').length;
  $('.price-range-label strong', row).textContent = rowNumber === 1 ? 'más bajo' : rowNumber === 2 ? 'más alto' : 'adicional';
}
function updatePriceRow(row, product, data = {}) {
  setOptions($('.unit', row), product.units); $('.unit', row).value = data.unit && product.units.includes(data.unit) ? data.unit : product.units[0];
  const isMeat = product.category === 'Carnes'; $('.conservation-field', row).hidden = !isMeat; $('.conservation', row).required = isMeat; $('.conservation', row).value = data.conservation || '';
}
function priceData() { return [...document.querySelectorAll('.product-card')].map((card) => ({ product: $('.price-product', card).value, prices: [...card.querySelectorAll('.price-observation')].map((row) => ({ brand: $('.brand', row).value, value: $('.price-value', row).value, unit: $('.unit', row).value, conservation: $('.conservation', row).value, origin: $('.origin', row).value, promotion: $('.promotion', row).value, notes: $('.notes', row).value })) })); }
function renderPrices(data) { $('#priceProducts').replaceChildren(); (data || []).forEach(addPriceProduct); }
function priceEntries_(data) { return data && !Array.isArray(data) ? data.products || [] : data || []; }
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
    item.innerHTML = `<strong>${entry.product}</strong><span>${entry.prices.length} precio(s): ${entry.prices[0]?.value || 'sin valor'} bajo · ${entry.prices[1]?.value || 'sin valor'} alto</span>`;
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
function classificationData() {
  return {
    unitVecinal: getDraft()?.unitVecinal || '', estadoLocal: 'abierto',
    sistemaAtencion: $('#classificationService').value,
    variedadesFrutasVerduras: $('#classificationProduceVarieties').value,
    categoriasProteicas: [...document.querySelectorAll('input[name="proteinCategory"]:checked')].map((input) => input.value),
    lacteosHabituales: $('#classificationDairyRegular').value,
    huevosHabituales: $('#classificationEggsRegular').value,
    personasAtendiendo: $('#classificationPeople').value,
    clasificacionOverride: $('#classificationOverride').value,
    justificacionOverride: $('#classificationJustification').value, observaciones: $('#classificationNotes').value,
    interiorAuthorized: $('#classificationInteriorPermission').checked,
    images: collectClassificationImages_(),
  };
}
function collectClassificationImages_() {
  const groups = { frontis: '#classificationFront', interior: '#classificationInterior', frutasVerduras: '#classificationProduceImages', carnes: '#classificationMeatImages', congelados: '#classificationFrozenImages' };
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
  const local = getLocal();
  const draft = getDraft();
  $('#classificationLinkedLocal').textContent = local ? `${local.code} · ${local.name} · ${local.address}` : 'No hay un local de SampleLocals vinculado.';
  $('#classificationLinkedUnit').textContent = draft?.unitVecinal || 'Sin unidad vecinal registrada en la visita.';
  const fields = {
    classificationService: data.sistemaAtencion === 'acceso_libre' ? 'autoservicio' : data.sistemaAtencion,
    classificationPeople: data.personasAtendiendo,
    classificationProduceVarieties: data.variedadesFrutasVerduras,
    classificationDairyRegular: data.lacteosHabituales,
    classificationEggsRegular: data.huevosHabituales,
    classificationOverride: data.clasificacionOverride,
    classificationJustification: data.justificacionOverride,
    classificationNotes: data.observaciones,
  };
  Object.entries(fields).forEach(([id, value]) => { if ($('#' + id)) $('#' + id).value = value || ''; });
  document.querySelectorAll('input[name="proteinCategory"]').forEach((input) => {
    input.checked = (data.categoriasProteicas || []).includes(input.value);
  });
  $('#classificationImageStatus').textContent = data.imageUrls ? 'Imágenes guardadas en Drive.' : '';
  $('#classificationInteriorPermission').checked = Boolean(data.interiorAuthorized);
  updateClassificationVisibility();
}
const PROTEIN_CATEGORIES = ['vacuno', 'cerdo', 'pollo', 'cordero', 'pescados_mariscos'];
function classifyLocal_(sistemaAtencion, produceVarieties, proteinCategories, dairyRegular, eggsRegular) {
  const varieties = Number(produceVarieties);
  const proteins = Array.isArray(proteinCategories) ? [...new Set(proteinCategories)] : [];
  const fulfilledCriteria = [
    Number.isInteger(varieties) && varieties > 10,
    proteins.filter((category) => PROTEIN_CATEGORIES.includes(category)).length >= 2,
    dairyRegular === 'si' && eggsRegular === 'si',
  ].filter(Boolean).length;
  return {
    classification: sistemaAtencion === 'autoservicio' && fulfilledCriteria >= 2
      ? 'minimarket' : 'almacen_barrio',
    fulfilledCriteria,
  };
}
function updateClassificationVisibility() {
  $('#classificationOpenFields').hidden = false;
  $('#classificationService').required = true;
  const manual = Boolean($('#classificationOverride').value);
  $('#classificationJustificationField').hidden = !manual; $('#classificationJustification').required = manual;
  const servicio = $('#classificationService').value;
  const variedades = $('#classificationProduceVarieties').value;
  const lacteos = $('#classificationDairyRegular').value;
  const huevos = $('#classificationEggsRegular').value;
  const categoriasProteicas = [...document.querySelectorAll('input[name="proteinCategory"]:checked')].map((input) => input.value);
  if (!servicio || variedades === '' || lacteos === '' || huevos === '') {
    $('#classificationResult').textContent = 'Complete el sistema de atención y los datos de los tres criterios para calcular.';
    return;
  }
  const result = classifyLocal_(servicio, variedades, categoriasProteicas, lacteos, huevos);
  $('#classificationResult').textContent = servicio !== 'autoservicio'
    ? 'Clasificación automática: ALMACÉN DE BARRIO — se requiere autoservicio. Criterios de surtido cumplidos: ' + result.fulfilledCriteria + ' de 3.'
    : 'Clasificación automática: ' + (result.classification === 'minimarket' ? 'MINIMARKET' : 'ALMACÉN DE BARRIO')
      + ' — criterios cumplidos: ' + result.fulfilledCriteria + ' de 3; se requieren al menos 2.';
}

function addOriginItem(data = {}) {
  const row = $('#originItemTemplate').content.firstElementChild.cloneNode(true); setOptions($('.origin-product', row), ORIGIN_PRODUCTS, 'Seleccione'); $('.origin-product', row).value = data.product || ''; $('.origin-value', row).value = data.origin || 'Local'; $('.origin-detail', row).value = data.detail || ''; $('.origin-notes', row).value = data.notes || ''; $('.remove-origin', row).addEventListener('click', () => row.remove()); $('#originItems').append(row);
}
function originData() { return [...document.querySelectorAll('.origin-item')].map((row) => ({ product: $('.origin-product', row).value, origin: $('.origin-value', row).value, detail: $('.origin-detail', row).value, notes: $('.origin-notes', row).value })); }
function renderOrigins(data) { $('#originItems').replaceChildren(); (data?.length ? data : [{}]).forEach(addOriginItem); }

async function saveInstrument(instrument, data, submitButton) {
  const draft = getDraft(); const payload = { visit: draft, instrument, data };
  if (submitButton) { submitButton.disabled = true; submitButton.dataset.originalText = submitButton.textContent; submitButton.textContent = 'Guardando…'; }
  try {
    if (!navigator.onLine) { const queue = getQueue(); queue.push(payload); setQueue(queue); draft.instruments[instrument] = { data, saved: false }; setDraft(draft); showMessage('Sin conexión: el instrumento quedó en borrador y pendiente de sincronización.', 'success'); if (instrument !== 'prices') showView('menuView'); return; }
    const result = await api(payload); draft.instruments[instrument] = { data, saved: true, savedAt: new Date().toISOString() }; setDraft(draft); showMessage(`${result.savedRows} registro(s) guardado(s) para ${instrument}.`, 'success'); if (instrument !== 'prices') showView('menuView');
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = submitButton.dataset.originalText; }
  }
}
async function syncQueue() { if (!navigator.onLine) return; const queue = getQueue(); while (queue.length) { await api(queue[0]); queue.shift(); setQueue(queue); } }

function openInstrument(instrument) {
  const data = getDraft().instruments[instrument]?.data;
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
      $('#uvSuggestion').textContent = '';
    }
    updateLocal();
  });
  $('#uvFilter').addEventListener('change', () => { populateLocalCodeOptions(); updateLocal(); });
  $('#visitUnit').addEventListener('change', () => { unitVecinalWasManuallySet = Boolean($('#visitUnit').value && $('#visitUnit').value !== autoSuggestedUv); });
  ['latitude', 'longitude'].forEach((id) => $('#' + id).addEventListener('input', suggestUvFromCoordinates));
  ['newLocalName', 'newLocalAddress', 'newLocalType'].forEach((id) => $('#' + id).addEventListener('input', updateLocal)); $('#locationButton').addEventListener('click', useCurrentLocation);
  $('#visitForm').addEventListener('submit', (event) => { event.preventDefault(); const current = getDraft(); const visit = visitFromForm(current); if (currentInitials().length < 2) { showMessage('Escriba el nombre de la persona recolectora (nombre y apellido).', 'error'); return; } if (!localFormIsValid()) { showMessage('Complete los datos del local seleccionado o del local nuevo.', 'error'); return; } rememberCollector(); setDraft(visit); showView('menuView'); });
  document.querySelectorAll('.instrument').forEach((button) => button.addEventListener('click', () => openInstrument(button.dataset.instrument)));
  document.querySelectorAll('.return-menu').forEach((button) => button.addEventListener('click', () => { showView('menuView'); updateMenu(); }));
  $('#editVisitButton').addEventListener('click', () => showView('visitView')); $('#backupJsonButton').addEventListener('click', () => downloadBackup('json')); $('#backupHtmlButton').addEventListener('click', () => downloadBackup('html')); $('#closeVisitButton').addEventListener('click', () => { if (confirm('¿Eliminar el borrador local de esta visita? Los instrumentos ya guardados permanecerán en la base de datos.')) { localStorage.removeItem(DRAFT_KEY); $('#visitForm').reset(); $('#observationDate').value = new Date().toISOString().slice(0, 10); showView('visitView'); } });
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
  ['classificationService', 'classificationDairyRegular', 'classificationEggsRegular']
    .forEach((id) => $('#' + id).addEventListener('change', updateClassificationVisibility));
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
