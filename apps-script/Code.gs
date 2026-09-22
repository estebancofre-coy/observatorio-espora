const DATABASE_SPREADSHEET_ID = '1FTm0ja8_i3Gwmgg5TorcPe9TA9s_SggZCFriZDI3lRQ';

const SHEETS = {
  visits: {
    name: 'Visitas',
    headers: ['ID de visita', 'Fecha de registro', 'Fecha de observación', 'Persona recolectora', 'Código de local', 'ID de muestra', 'Local', 'Dirección', 'Tipo de local', 'Subtipo de local', 'Latitud levantada', 'Longitud levantada', 'Recategorización observada', 'Importador con venta al detalle/menor'],
  },
  availability: {
    name: 'Disponibilidad',
    headers: ['ID de visita', 'Fecha de registro', 'Sección', 'Categoría', 'Ítem', 'Disponible (Sí/No)'],
  },
  prices: {
    name: 'Precios',
    headers: ['ID de visita', 'Fecha de registro', 'Categoría', 'Producto', 'Número de observación', 'Marca o proveedor', 'Precio observado (CLP)', 'Unidad de medida', 'Tipo de conservación', 'Origen (Local/Externo)', 'Precio en oferta o promoción', 'Observaciones'],
  },
  origins: {
    name: 'Origen',
    headers: ['ID de visita', 'Fecha de registro', 'Producto', 'Origen declarado', 'Proveedor, procedencia o detalle', 'Observaciones'],
  },
};

const PRODUCTS = [
  ['Arroz (grado 2)', 'Cereales y derivados', ['kg', '400 gr/500gr', 'Unidad']],
  ['Pastas (Fideos, Tallarines 5/77)', 'Cereales y derivados', ['400 gr/500gr', 'kg', 'Unidad']],
  ['Carne molida (Vacuno)', 'Carnes', ['kg']],
  ['Pollo', 'Carnes', ['kg']],
  ['Salchicha', 'Carnes', ['kg']],
  ['Choritos', 'Pescados y mariscos', ['kg']],
  ['Merluza Austral', 'Pescados y mariscos', ['kg']],
  ['Limón', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Manzana', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Palta', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Plátano', 'Frutas', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Cebolla', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Lechuga', 'Verduras y Tubérculos', ['Unidad', 'kg', 'malla (10 kg)', 'atado']],
  ['Papa', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Tomate', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Zanahoria', 'Verduras y Tubérculos', ['kg', 'Unidad', 'malla (10 kg)', 'atado']],
  ['Lenteja', 'Legumbres', ['kg', '400 gr/500gr', 'Unidad']],
  ['Poroto', 'Legumbres', ['kg', '400 gr/500gr', 'Unidad']],
  ['Maní Tostado sin Sal', 'Frutos secos', ['250g', '500g', 'kg']],
  ['Huevo', 'Lácteos y Huevos', ['Bandeja (12)', 'Bandeja (20)', 'Bandeja (30)', 'Unidad']],
  ['Leche', 'Lácteos y Huevos', ['Litro', '500 ml']],
  ['Queso Laminado (Gauda, Roda, Mantecoso)', 'Lácteos y Huevos', ['kg']],
  ['Yogur con sello', 'Lácteos y Huevos', ['Unidad']],
  ['Azúcar', 'Azúcares y dulces', ['kg', '400 gr/500gr', 'Unidad']],
  ['Aceite', 'Aceites y grasas', ['900 ml', 'Litro', '500 ml']],
  ['Mantequilla', 'Aceites y grasas', ['250gr']],
  ['Margarina', 'Aceites y grasas', ['250gr']],
  ['Salsa de tomate', 'Otros', ['Doypack (200gr)']],
].map(([name, category, units]) => ({ name: name, category: category, units: units }));

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('POAA Coyhaique')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    if (request.action !== 'saveInstrument') {
      throw new Error('La acción solicitada no es válida.');
    }
    return jsonResponse_({ ok: true, data: saveInstrument_(request.payload) });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupDatabase() {
  const database = getDatabase_();
  Logger.log('Base de datos: ' + database.getUrl());
  return database.getUrl();
}

function getDatabase_() {
  const database = SpreadsheetApp.openById(DATABASE_SPREADSHEET_ID);
  Object.keys(SHEETS).forEach((key) => ensureSheet_(database, SHEETS[key]));
  ensureDashboard_(database);
  return database;
}

function ensureSheet_(database, definition) {
  let sheet = database.getSheetByName(definition.name);
  if (!sheet) {
    sheet = database.insertSheet(definition.name);
    sheet.getRange(1, 1, 1, definition.headers.length).setValues([definition.headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, definition.headers.length)
      .setFontWeight('bold').setBackground('#1a73e8').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, definition.headers.length);
    return sheet;
  }
  const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const isPrefix = existing.every((value, index) => value === definition.headers[index]);
  if (!isPrefix) {
    throw new Error('La estructura de la hoja ' + definition.name + ' no coincide con la versión esperada. No se modificaron datos.');
  }
  if (existing.length < definition.headers.length) {
    sheet.getRange(1, existing.length + 1, 1, definition.headers.length - existing.length)
      .setValues([definition.headers.slice(existing.length)]);
    sheet.autoResizeColumns(1, definition.headers.length);
  }
  return sheet;
}

function ensureDashboard_(database) {
  let sheet = database.getSheetByName('Panel POAA');
  if (sheet) {
    return sheet;
  }
  sheet = database.insertSheet('Panel POAA');
  sheet.getRange('A1:F1').merge().setValue('Panel de seguimiento - POAA Coyhaique')
    .setBackground('#1a73e8').setFontColor('#ffffff').setFontWeight('bold')
    .setFontSize(14).setHorizontalAlignment('center');
  sheet.getRange('A3:B7').setValues([
    ['Indicador', 'Valor'],
    ['Visitas registradas', '=COUNTA(Visitas!A2:A)'],
    ['Registros de disponibilidad', '=COUNTA(Disponibilidad!A2:A)'],
    ['Observaciones de precio', '=COUNTA(Precios!A2:A)'],
    ['Registros de origen', '=COUNTA(Origen!A2:A)'],
  ]);
  sheet.getRange('A3:B3').setFontWeight('bold').setBackground('#d2e3fc');
  sheet.getRange('D3').setFormula('=QUERY(Visitas!A2:E,"select E,count(A) where A is not null group by E label E \'Código de local\', count(A) \'Visitas\'",0)');
  sheet.getRange('A9').setFormula('=QUERY(Precios!C2:C,"select C,count(C) where C is not null group by C label C \'Categoría\', count(C) \'Precios registrados\'",0)');
  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, 8);
  return sheet;
}

function saveInstrument_(payload) {
  validateVisit_(payload.visit);
  const instrument = payload.instrument;
  if (!['availability', 'prices', 'origins'].includes(instrument)) {
    throw new Error('El instrumento no es válido.');
  }
  const database = getDatabase_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    upsertVisit_(database, payload.visit);
    const rows = instrument === 'availability'
      ? availabilityRows_(payload.visit, payload.data)
      : instrument === 'prices'
        ? priceRows_(payload.visit, payload.data)
        : originRows_(payload.visit, payload.data);
    const sheet = database.getSheetByName(SHEETS[instrument].name);
    replaceRowsForVisit_(sheet, payload.visit.id, SHEETS[instrument].headers.length);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, SHEETS[instrument].headers.length).setValues(rows);
    return { savedRows: rows.length, instrument: instrument, visitId: payload.visit.id };
  } finally {
    lock.releaseLock();
  }
}

function replaceRowsForVisit_(sheet, visitId, columnCount) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  const rows = sheet.getRange(2, 1, lastRow - 1, columnCount).getValues()
    .filter((row) => row[0] !== visitId);
  sheet.getRange(2, 1, lastRow - 1, columnCount).clearContent();
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
  }
}

function validateVisit_(visit) {
  if (!visit || !visit.id || !visit.observationDate || !String(visit.collector || '').trim()) {
    throw new Error('Los datos generales de la visita están incompletos.');
  }
  const local = getSampleLocal_(visit.localCode);
  ['latitude', 'longitude'].forEach((key) => {
    if (!Number.isFinite(Number(visit[key]))) {
      throw new Error('La ' + (key === 'latitude' ? 'latitud' : 'longitud') + ' levantada es obligatoria.');
    }
  });
  if (Number(visit.latitude) < -90 || Number(visit.latitude) > 90 ||
      Number(visit.longitude) < -180 || Number(visit.longitude) > 180) {
    throw new Error('Las coordenadas levantadas no son válidas.');
  }
  if (['Almacén', 'Minimarket'].includes(local.criterion) &&
      !['Almacén', 'Minimarket'].includes(visit.recategorization)) {
    throw new Error('Seleccione la recategorización observada.');
  }
  if (local.criterion === 'Importador Frutas y Verduras' &&
      !['Sí', 'No'].includes(visit.retailSale)) {
    throw new Error('Indique si el importador tiene venta al detalle/menor.');
  }
}

function upsertVisit_(database, visit) {
  const local = getSampleLocal_(visit.localCode);
  const sheet = database.getSheetByName(SHEETS.visits.name);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row, index) => index && row[0] === visit.id);
  const row = [
    visit.id, new Date(), new Date(visit.observationDate + 'T12:00:00'),
    visit.collector.trim(), local.code, local.id, local.name, local.address,
    local.criterion, local.criterion2 || '', Number(visit.latitude), Number(visit.longitude),
    visit.recategorization || '', visit.retailSale || '',
  ];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function availabilityRows_(visit, data) {
  if (!Array.isArray(data) || !data.length || data.some((item) => !['Sí', 'No'].includes(item.value))) {
    throw new Error('Complete todas las respuestas de disponibilidad y variedad.');
  }
  return data.map((item) => [visit.id, new Date(), item.section, item.category, item.label, item.value]);
}

function priceRows_(visit, data) {
  if (!Array.isArray(data) || !data.length) {
    throw new Error('Agregue al menos un producto con dos precios.');
  }
  const productMap = new Map(PRODUCTS.map((product) => [product.name, product]));
  const rows = [];
  data.forEach((entry) => {
    const product = productMap.get(entry.product);
    if (!product || !Array.isArray(entry.prices) || entry.prices.length < 2) {
      throw new Error('Cada producto debe tener al menos dos observaciones de precio.');
    }
    entry.prices.forEach((price, index) => {
      if (!Number.isFinite(Number(price.value)) || Number(price.value) < 0 ||
          !product.units.includes(price.unit)) {
        throw new Error('Hay una observación de precio inválida.');
      }
      if (product.category === 'Carnes' && !['Fresco', 'Congelado', 'Al vacío'].includes(price.conservation)) {
        throw new Error('Seleccione el tipo de conservación para carnes.');
      }
      rows.push([
        visit.id, new Date(), product.category, product.name, index + 1,
        String(price.brand || '').trim(), Number(price.value), price.unit,
        product.category === 'Carnes' ? price.conservation : '',
        price.origin, price.promotion, String(price.notes || '').trim(),
      ]);
    });
  });
  return rows;
}

function originRows_(visit, data) {
  if (!Array.isArray(data) || !data.length) {
    throw new Error('Agregue al menos un registro de origen.');
  }
  return data.map((item) => {
    if (!String(item.product || '').trim() || !['Local', 'Externo', 'Mixto', 'No disponible', 'No sabe'].includes(item.origin)) {
      throw new Error('Complete producto y origen en todos los registros.');
    }
    return [visit.id, new Date(), item.product.trim(), item.origin, String(item.detail || '').trim(), String(item.notes || '').trim()];
  });
}

function getSampleLocal_(code) {
  const local = SAMPLE_LOCALS.find((entry) => entry.code === String(code || '').trim().toUpperCase());
  if (!local) {
    throw new Error('El código de local no pertenece a la muestra sugerida.');
  }
  return local;
}
