const DATABASE_PROPERTY = 'PRECIOS_COYHAIQUE_SPREADSHEET_ID';

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
].map(([name, category, conservation, units]) => ({
  name: name,
  category: category,
  conservation: conservation,
  units: units,
  origins: ['Local', 'Externo'],
}));

const HEADERS = [
  'Fecha de registro',
  'ID de lote',
  'Fecha de observación',
  'Persona recolectora',
  'Código interno del local',
  'Local o establecimiento',
  'Dirección o referencia',
  'Latitud',
  'Longitud',
  'Categoría',
  'Producto',
  'Precio observado (CLP)',
  'Tipo de conservación',
  'Unidad sugerida / presentación observada',
  'Origen (Local/Externo)',
  'Marca o proveedor',
  'Precio en oferta o promoción',
  'Observaciones',
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Registro de precios observados - Coyhaique')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    let data;
    if (request.action === 'analyze') {
      data = analyzeObservations(request.payload);
    } else if (request.action === 'save') {
      data = saveObservations(request.payload, request.confirmations);
    } else {
      throw new Error('La acción solicitada no es válida.');
    }
    return jsonResponse_({ ok: true, data: data });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAppConfig() {
  const database = getOrCreateDatabase_();
  return {
    products: PRODUCTS,
    databaseUrl: database.getUrl(),
    dashboardUrl: database.getUrl() + '#gid=' + getDashboard_(database).getSheetId(),
  };
}

function analyzeObservations(payload) {
  validatePayload_(payload);
  return analyzeObservations_(payload, getOrCreateDatabase_());
}

function saveObservations(payload, confirmations) {
  validatePayload_(payload);
  const database = getOrCreateDatabase_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const analysis = analyzeObservations_(payload, database);
    const approval = confirmations || {};
    if (analysis.duplicates.length && !approval.allowDuplicates) {
      throw new Error('Se detectaron registros duplicados. Revise la advertencia y confirme antes de guardar.');
    }
    if (analysis.outliers.length && !approval.allowOutliers) {
      throw new Error('Se detectaron precios atípicos. Revise la advertencia y confirme antes de guardar.');
    }

    const recordedAt = new Date();
    const batchId = Utilities.getUuid();
    const rows = payload.items.map((item) => [
      recordedAt,
      batchId,
      new Date(payload.observationDate + 'T12:00:00'),
      payload.collector.trim(),
      payload.internalCode.trim(),
      payload.establishment.trim(),
      payload.address.trim(),
      Number(payload.latitude),
      Number(payload.longitude),
      item.category,
      item.product,
      Number(item.price),
      item.conservation,
      item.unit,
      item.origin,
      item.brand.trim(),
      item.promotion,
      item.notes.trim(),
    ]);
    const sheet = getObservationSheet_(database);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return {
      batchId: batchId,
      savedRows: rows.length,
      databaseUrl: database.getUrl(),
      dashboardUrl: database.getUrl() + '#gid=' + getDashboard_(database).getSheetId(),
    };
  } finally {
    lock.releaseLock();
  }
}

function setupDatabase() {
  const database = getOrCreateDatabase_();
  Logger.log('Base de datos: ' + database.getUrl());
  return database.getUrl();
}

function getOrCreateDatabase_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(DATABASE_PROPERTY);
  if (existingId) {
    const database = SpreadsheetApp.openById(existingId);
    ensureSchema_(database);
    return database;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const storedId = properties.getProperty(DATABASE_PROPERTY);
    if (storedId) {
      const database = SpreadsheetApp.openById(storedId);
      ensureSchema_(database);
      return database;
    }

    function ensureSchema_(database) {
      const sheet = getObservationSheet_(database);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (headers.length === HEADERS.length + 1 && headers[3] === 'Persona recolectora' &&
          headers[4] === 'Correo institucional' && headers[5] === 'Código interno del local') {
        sheet.deleteColumn(5);
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.autoResizeColumns(1, HEADERS.length);
        return;
      }
      if (headers.length === HEADERS.length - 1 && headers[3] === 'Persona recolectora' &&
          headers[4] === 'Código interno del local') {
        sheet.insertColumnBefore(5);
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.autoResizeColumns(1, HEADERS.length);
        return;
      }
      if (headers.length !== HEADERS.length ||
          headers.some((header, index) => header !== HEADERS[index])) {
        throw new Error('La estructura de la hoja Observaciones no coincide con la versión esperada. No se modificaron datos.');
      }
    }

    function getObservationSheet_(database) {
      const sheet = database.getSheetByName('Observaciones');
      if (!sheet) {
        throw new Error('No se encontró la hoja Observaciones en la base de datos.');
      }
      return sheet;
    }

    const database = SpreadsheetApp.create('Base de datos - Precios observados Coyhaique');
    const sheet = database.getActiveSheet();
    sheet.setName('Observaciones');
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1a73e8')
      .setFontColor('#ffffff');
    sheet.autoResizeColumns(1, HEADERS.length);
    createDashboard_(database);
    properties.setProperty(DATABASE_PROPERTY, database.getId());
    return database;
  } finally {
    lock.releaseLock();
  }
}

function getDashboard_(database) {
  return database.getSheetByName('Panel de seguimiento') || createDashboard_(database);
}

function createDashboard_(database) {
  const existing = database.getSheetByName('Panel de seguimiento');
  if (existing) {
    return existing;
  }

  const sheet = database.insertSheet('Panel de seguimiento');
  sheet.getRange('A1:F1').merge()
    .setValue('Panel de seguimiento - Precios observados Coyhaique')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');
  sheet.getRange('A3:B6').setValues([
    ['Indicador', 'Valor'],
    ['Registros totales', '=COUNTA(Observaciones!A2:A)'],
    ['Lotes registrados', '=COUNTA(UNIQUE(FILTER(Observaciones!B2:B,Observaciones!B2:B<>"")))'],
    ['Último registro', '=IFERROR(MAX(Observaciones!A2:A),"")'],
  ]);
  sheet.getRange('A3:B3').setFontWeight('bold').setBackground('#d2e3fc');
  sheet.getRange('A8').setFormula(
    '=QUERY(Observaciones!J2:J,"select J,count(J) where J is not null group by J label J \'Categoría\', count(J) \'Registros\'",0)'
  );
  sheet.getRange('D8').setFormula(
    '=QUERY(Observaciones!C2:K,"select Col1,Col3,Col9,count(Col9) where Col1 is not null group by Col1,Col3,Col9 having count(Col9)>1 label Col1 \'Fecha observación\', Col3 \'Código local\', Col9 \'Producto\', count(Col9) \'Registros duplicados\'",0)'
  );
  sheet.getRange('A7').setValue('Registros por categoría').setFontWeight('bold');
  sheet.getRange('D7').setValue('Posibles duplicados').setFontWeight('bold');
  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, 6);
  return sheet;
}

function analyzeObservations_(payload, database) {
  const values = getObservationSheet_(database).getDataRange().getValues().slice(1);
  const targetDate = payload.observationDate;
  const localCode = payload.internalCode.trim().toLowerCase();
  const duplicates = [];
  const outliers = [];

  payload.items.forEach((item, index) => {
    const productRows = values.filter((row) => row[10] === item.product);
    const localRows = productRows.filter(
      (row) => String(row[4]).trim().toLowerCase() === localCode
    );
    const sameDay = localRows.filter(
      (row) => formatDate_(row[2]) === targetDate
    );
    if (sameDay.length) {
      duplicates.push({
        index: index + 1,
        product: item.product,
        count: sameDay.length,
      });
    }

    const referenceRows = localRows.length >= 3 ? localRows : productRows;
    const prices = referenceRows
      .map((row) => Number(row[11]))
      .filter((price) => Number.isFinite(price) && price >= 0);
    if (prices.length >= 3) {
      const referencePrice = median_(prices);
      const observedPrice = Number(item.price);
      const deviation = Math.abs(observedPrice - referencePrice) / referencePrice;
      if (referencePrice > 0 && deviation >= 0.3) {
        outliers.push({
          index: index + 1,
          product: item.product,
          observedPrice: observedPrice,
          referencePrice: referencePrice,
          deviationPercent: Math.round(deviation * 100),
          referenceScope: localRows.length >= 3 ? 'este local' : 'todos los locales',
        });
      }
    }
  });

  const repeatedProducts = new Map();
  payload.items.forEach((item, index) => {
    const indexes = repeatedProducts.get(item.product) || [];
    indexes.push(index + 1);
    repeatedProducts.set(item.product, indexes);
  });
  repeatedProducts.forEach((indexes, product) => {
    if (indexes.length > 1) {
      duplicates.push({
        index: indexes.join(', '),
        product: product,
        count: indexes.length,
      });
    }
  });

  return { duplicates: duplicates, outliers: outliers };
}

function median_(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatDate_(value) {
  return value instanceof Date
    ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    : '';
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('No se recibió información de levantamiento.');
  }

  ['observationDate', 'collector', 'internalCode', 'establishment'].forEach((key) => {
    if (!String(payload[key] || '').trim()) {
      throw new Error('El campo "' + key + '" es obligatorio.');
    }
  });

  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('La latitud debe ser un número entre -90 y 90.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('La longitud debe ser un número entre -180 y 180.');
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Agregue al menos un producto antes de guardar.');
  }

  const productsByName = new Map(PRODUCTS.map((product) => [product.name, product]));
  payload.items.forEach((item, index) => {
    const product = productsByName.get(item.product);
    const prefix = 'Producto ' + (index + 1) + ': ';
    if (!product) {
      throw new Error(prefix + 'no está en la muestra.');
    }
    if (item.category !== product.category) {
      throw new Error(prefix + 'la categoría no coincide.');
    }
    if (!product.conservation.includes(item.conservation)) {
      throw new Error(prefix + 'el tipo de conservación no es válido.');
    }
    if (!product.units.includes(item.unit)) {
      throw new Error(prefix + 'la unidad o presentación no es válida.');
    }
    if (!product.origins.includes(item.origin)) {
      throw new Error(prefix + 'el origen no es válido.');
    }
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(prefix + 'el precio debe ser un número igual o mayor que cero.');
    }
  });
}
