const DATABASE_SPREADSHEET_ID = '1kgIi0Ls6zaSfFZI8ToXHS6Kil610z73m1jqoCZwZQ_Y';
const IMAGE_FOLDER_NAME = 'ESPORA - Imágenes de levantamiento';

const SHEETS = {
  visits: {
    name: 'Visitas',
    headers: ['ID de visita', 'Fecha de registro', 'Fecha de observación', 'Persona recolectora', 'Código de local', 'ID de muestra', 'Local', 'Dirección', 'Tipo de local', 'Subtipo de local', 'Latitud levantada', 'Longitud levantada', 'Recategorización observada', 'Importador con venta al detalle/menor', 'Unidad vecinal'],
  },
  availability: {
    name: 'Disponibilidad',
    headers: ['ID de visita', 'Fecha de registro', 'Sección', 'Categoría', 'Ítem', 'Disponible (Sí/No)', 'Persona responsable'],
  },
  prices: {
    name: 'Precios',
    headers: ['ID de visita', 'Fecha de registro', 'Categoría', 'Producto', 'Número de observación', 'Marca o proveedor', 'Precio observado (CLP)', 'Unidad de medida', 'Tipo de conservación', 'Origen (Local/Externo)', 'Precio en oferta o promoción', 'Observaciones', 'Tipo de precio (mínimo/máximo)', 'Persona responsable'],
  },
  origins: {
    name: 'Origen',
    headers: ['ID de visita', 'Fecha de registro', 'Producto', 'Origen declarado', 'Proveedor, procedencia o detalle', 'Observaciones', 'Categoría alimentaria', 'Variedad del producto', 'Comuna de origen declarada', 'Sector o localidad', 'Marca o productor regional', 'Fuente o evidencia de origen', 'Persona responsable'],
  },
  classification: {
    name: 'Clasificación',
    headers: ['ID de visita', 'Fecha de registro', 'Unidad vecinal', 'Estado del local', 'Superficie estimada', 'Sistema de atención', 'Personas atendiendo', 'Abarrotes básicos', 'Fruta y verdura', 'Carnes', 'Otros rubros', 'Es mixto', 'Rubro principal', 'Detalle mixto', 'Clasificación automática', 'Clasificación final', 'Modo de clasificación', 'Justificación de corrección', 'Observaciones', 'Código de local', 'ID de muestra', 'Local', 'Dirección', 'Tipo de local', 'Subtipo de local', 'Fotos frontis', 'Fotos interior autorizado', 'Fotos frutas y verduras', 'Fotos carnes', 'Fotos congelados', 'Variedades de frutas y verduras', 'Categorías proteicas', 'Oferta habitual de lácteos', 'Oferta habitual de huevos', 'Fotos pescados y mariscos', 'Persona responsable'],
  },
};

const PRICE_UNITS = ['kg', '0,5 kg', 'Unidad', 'Otros'];
const PRODUCTS = [
  ['Lechuga costina', 'Comparables con ODEPA'], ['Papa de guarda', 'Comparables con ODEPA'], ['Tomate larga vida', 'Comparables con ODEPA'],
  ['Zanahoria', 'Comparables con ODEPA'], ['Cebolla blanca', 'Comparables con ODEPA'], ['Manzana Fuji', 'Comparables con ODEPA'],
  ['Arroz blanco grado 1', 'Básicos de referencia'], ['Lenteja 6 mm', 'Básicos de referencia'], ['Leche entera pasteurizada de vaca', 'Básicos de referencia'], ['Pan marraqueta', 'Básicos de referencia'],
  ['Huevo blanco', 'Proteicos relevantes para Aysén'], ['Queso Gouda', 'Proteicos relevantes para Aysén'], ['Merluza austral congelada', 'Proteicos relevantes para Aysén'],
  ['Merluza austral fresca', 'Proteicos relevantes para Aysén'], ['Cordero (costillar o pulpa)', 'Proteicos relevantes para Aysén'],
  ['Calafate (temporada)', 'Emblemáticos regionales'], ['Lechuga local (hidropónica o de productor local)', 'Emblemáticos regionales'], ['Miel regional', 'Emblemáticos regionales'],
].map(([name, category]) => ({ name: name, category: category, units: PRICE_UNITS }));

const ORIGIN_CATEGORIES = ['Verduras y hortalizas frescas', 'Frutas frescas', 'Frutos rojos', 'Carne bovina', 'Carne ovina', 'Huevos',
  'Pescados frescos', 'Mariscos frescos', 'Productos congelados del mar', 'Quesos', 'Conservas', 'Mermeladas', 'Miel',
  'Otros productos procesados de origen regional'];
const AYSEN_COMMUNES = ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Río Ibáñez', 'Chile Chico', 'Cochrane', "O'Higgins", 'Tortel'];
const ORIGIN_SOURCES = ['Etiqueta o envase', 'Cartel', 'Información del responsable del establecimiento', 'Información del productor o feriante', 'Otra'];
const SURFACE_OPTIONS = ['muy_pequeno', 'pequeno', 'mediano', 'grande'];

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'ESPORA Coyhaique',
    message: 'API activa. Use POST /exec para guardar instrumentos.'
  });
}

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    if (request.action === 'getVisitsForLocal') {
      return jsonResponse_({ ok: true, data: getVisitsForLocal_(request.payload) });
    }
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

function getVisitsForLocal_(payload) {
  const code = String(payload && payload.localCode || '').trim().toUpperCase();
  if (!code) {
    throw new Error('Indique el código del local.');
  }
  const expectedAccessCode = PropertiesService.getScriptProperties().getProperty('ESPORA_RESUME_ACCESS_CODE');
  if (!expectedAccessCode) {
    throw new Error('La retoma aún no está habilitada: el administrador debe configurar la clave de acceso en Apps Script.');
  }
  if (String(payload.accessCode || '') !== expectedAccessCode) {
    throw new Error('La clave de acceso no es válida.');
  }
  const database = SpreadsheetApp.openById(DATABASE_SPREADSHEET_ID);
  const visitsSheet = database.getSheetByName(SHEETS.visits.name);
  if (!visitsSheet || visitsSheet.getLastRow() < 2) {
    return [];
  }
  const visitRows = visitsSheet.getRange(2, 1, visitsSheet.getLastRow() - 1, SHEETS.visits.headers.length).getValues()
    .filter((row) => String(row[4] || '').trim().toUpperCase() === code);
  if (!visitRows.length) {
    return [];
  }
  const instrumentRows = {};
  ['classification', 'availability', 'origins', 'prices'].forEach((key) => {
    const sheet = database.getSheetByName(SHEETS[key].name);
    instrumentRows[key] = sheet && sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, SHEETS[key].headers.length).getValues()
      : [];
  });
  return visitRows.map((row) => {
    const visit = visitFromSheetRow_(row);
    const instruments = {};
    Object.keys(instrumentRows).forEach((key) => {
      const rows = instrumentRows[key].filter((instrumentRow) => String(instrumentRow[0]) === String(visit.id));
      if (rows.length) {
        instruments[key] = {
          saved: true,
          responsible: String(rows[rows.length - 1][SHEETS[key].headers.length - 1] || ''),
          data: instrumentDataFromRows_(key, rows),
        };
      }
    });
    visit.instruments = instruments;
    return visit;
  }).sort((a, b) => String(b.observationDate).localeCompare(String(a.observationDate)));
}

function visitFromSheetRow_(row) {
  const code = String(row[4] || '').trim().toUpperCase();
  const sample = SAMPLE_LOCALS.find((local) => local.code === code);
  return {
    id: String(row[0]),
    observationDate: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[2] || ''),
    collector: String(row[3] || ''),
    collectorInitials: '',
    localCode: code,
    unitVecinal: String(row[14] || ''),
    latitude: String(row[10] || ''),
    longitude: String(row[11] || ''),
    isNewLocal: !sample,
    localName: sample ? '' : String(row[6] || ''),
    localAddress: sample ? '' : String(row[7] || ''),
    localType: sample ? '' : String(row[8] || ''),
    instruments: {},
  };
}

function instrumentDataFromRows_(instrument, rows) {
  if (instrument === 'availability') {
    return rows.map((row) => ({ section: row[2], category: row[3], label: row[4], value: row[5] }));
  }
  if (instrument === 'origins') {
    if (rows.some((row) => row[2] === 'Sin productos regionales observados')) {
      return { noneObserved: true, items: [] };
    }
    return {
      noneObserved: false,
      items: rows.map((row) => ({
        category: row[6], variety: row[7], commune: row[8], sector: row[9],
        brand: row[10], source: row[11], notes: row[5],
      })),
    };
  }
  if (instrument === 'prices') {
    const products = {};
    rows.forEach((row) => {
      const name = String(row[3] || '');
      if (!products[name]) products[name] = { product: name, prices: [] };
      products[name].prices.push({
        type: row[12], brand: row[5], value: String(row[6]), unit: row[7],
        promotion: row[10], notes: row[11],
      });
    });
    Object.keys(products).forEach((name) => {
      products[name].prices.sort((a, b) => (a.type === 'Mínimo' ? -1 : 1) - (b.type === 'Mínimo' ? -1 : 1));
    });
    return { products: Object.keys(products).map((name) => products[name]), notes: '' };
  }
  const row = rows[rows.length - 1];
  const imageUrls = {
    frontis: row[25], interior: row[26], frutasVerduras: row[27],
    carnes: row[28], congelados: row[29], pescadosMariscos: row[34],
  };
  return {
    unitVecinal: row[2], estadoLocal: row[3], superficie: row[4], sistemaAtencion: row[5],
    personasAtendiendo: row[6], rubroFrutasHortalizas: row[8], rubroCarneFresca: row[9],
    variedadesFrutasVerduras: String(row[30]), categoriasProteicas: String(row[31] || '').split(', ').filter(Boolean),
    lacteosHabituales: row[32], huevosHabituales: row[33],
    clasificacionOverride: row[16] === 'manual' ? row[15] : '',
    justificacionOverride: row[17], observaciones: row[18], imageUrls: imageUrls,
  };
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
  let sheet = database.getSheetByName('Panel ESPORA');
  if (sheet) {
    return sheet;
  }
  sheet = database.insertSheet('Panel ESPORA');
  sheet.getRange('A1:F1').merge().setValue('Panel de seguimiento - ESPORA Coyhaique')
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

function normalizeLocalName_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toUpperCase();
}

function assertNewLocalCodeIsFree_(database, visit) {
  if (!visit.isNewLocal) {
    return;
  }
  const code = String(visit.localCode || '').trim().toUpperCase();
  const sheet = database.getSheetByName(SHEETS.visits.name);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return;
  }
  const values = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const conflict = values.filter(function (row) {
    return String(row[4] || '').trim().toUpperCase() === code &&
      String(row[0]) !== String(visit.id) &&
      normalizeLocalName_(row[6]) !== normalizeLocalName_(visit.localName);
  })[0];
  if (conflict) {
    throw new Error('El código ' + code + ' ya está asignado al local "' + conflict[6] +
      '". Use «Generar otro código» en la ficha del local nuevo y vuelva a enviar.');
  }
}

function saveInstrument_(payload) {
  validateVisit_(payload.visit);
  const instrument = payload.instrument;
  if (!['availability', 'prices', 'origins', 'classification'].includes(instrument)) {
    throw new Error('El instrumento no es válido.');
  }
  if (instrument === 'classification') {
    classificationCriteria_(payload.data);
  }
  const database = getDatabase_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    assertNewLocalCodeIsFree_(database, payload.visit);
    let rows;
    if (instrument === 'classification') {
      const previousImageUrls = payload.data.imageUrls || {};
      payload.data.imageUrls = {};
      classificationRows_(payload.visit, payload.data);
      payload.data.imageUrls = saveClassificationImages_(payload.visit, payload.data, previousImageUrls);
      rows = classificationRows_(payload.visit, payload.data);
    } else if (instrument === 'availability') {
      rows = availabilityRows_(payload.visit, payload.data);
    } else if (instrument === 'prices') {
      rows = priceRows_(payload.visit, payload.data);
    } else {
      rows = originRows_(payload.visit, payload.data);
    }
    const responsible = String(payload.responsible || payload.visit.collector || '').trim();
    rows = rows.map((row) => row.concat([responsible]));
    upsertVisit_(database, payload.visit);
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
  if (!String(visit.unitVecinal || '').trim()) {
    throw new Error('Seleccione la unidad vecinal del local.');
  }
  if (visit.isNewLocal && !/^LM\d+N([A-Z]{2,3}|\d+)$/i.test(String(visit.localCode || '').trim())) {
    throw new Error('El código del local nuevo no tiene un formato válido. Genere el código desde la ficha de identificación.');
  }
  getVisitLocal_(visit);
  ['latitude', 'longitude'].forEach((key) => {
    if (!Number.isFinite(Number(visit[key]))) {
      throw new Error('La ' + (key === 'latitude' ? 'latitud' : 'longitud') + ' levantada es obligatoria.');
    }
  });
  if (Number(visit.latitude) < -90 || Number(visit.latitude) > 90 ||
      Number(visit.longitude) < -180 || Number(visit.longitude) > 180) {
    throw new Error('Las coordenadas levantadas no son válidas.');
  }
}

function upsertVisit_(database, visit) {
  const local = getVisitLocal_(visit);
  const sheet = database.getSheetByName(SHEETS.visits.name);
  const values = sheet.getDataRange().getValues();
  const rowIndex = values.findIndex((row, index) => index && row[0] === visit.id);
  const row = [
    visit.id, new Date(), new Date(visit.observationDate + 'T12:00:00'),
    visit.collector.trim(), local.code, local.id, local.name, local.address,
    local.criterion, local.criterion2 || '',
    Number(visit.latitude), Number(visit.longitude),
    visit.recategorization || '', visit.retailSale || '',
    String(visit.unitVecinal || '').trim(),
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
  const entries = Array.isArray(data) ? data : data && data.products;
  const generalNotes = Array.isArray(data) ? '' : String(data && data.notes || '').trim();
  if (!Array.isArray(entries) || !entries.length) {
    throw new Error('Agregue al menos un alimento centinela con su precio mínimo.');
  }
  const productMap = new Map(PRODUCTS.map((product) => [product.name, product]));
  const rows = [];
  entries.forEach((entry) => {
    const product = productMap.get(entry.product);
    if (!product) {
      throw new Error('El producto "' + entry.product + '" no pertenece a la canasta centinela vigente. Recargue la página.');
    }
    if (!Array.isArray(entry.prices) || entry.prices.length < 1 || entry.prices.length > 2) {
      throw new Error('Registre el precio mínimo (y, si corresponde, el máximo) de ' + product.name + '.');
    }
    entry.prices.forEach((price, index) => {
      if (!String(price.brand || '').trim() || String(price.value).trim() === '' ||
          !Number.isFinite(Number(price.value)) || Number(price.value) < 0 ||
          !product.units.includes(price.unit)) {
        throw new Error('Complete marca, precio y unidad de ' + product.name + '.');
      }
      if (price.unit === 'Otros' && !String(price.notes || '').trim()) {
        throw new Error('Indique en observaciones el formato de ' + product.name + ' (unidad «Otros»).');
      }
      const type = price.type || (index === 0 ? 'Mínimo' : 'Máximo');
      rows.push([
        visit.id, new Date(), product.category, product.name, index + 1,
        String(price.brand).trim(), Number(price.value), price.unit,
        '', '', price.promotion === 'Sí' ? 'Sí' : 'No',
        [String(price.notes || '').trim(), generalNotes].filter(Boolean).join(' — '),
        type,
      ]);
    });
  });
  return rows;
}

function originRows_(visit, data) {
  if (Array.isArray(data)) {
    throw new Error('La pauta de origen cambió de formato. Recargue la página y vuelva a completarla.');
  }
  if (data && data.noneObserved) {
    return [[visit.id, new Date(), 'Sin productos regionales observados', '', '', '', '', '', '', '', '', '']];
  }
  const items = data && Array.isArray(data.items) ? data.items : [];
  if (!items.length) {
    throw new Error('Agregue al menos un producto regional o marque que no se observaron.');
  }
  return items.map((item) => {
    const variety = String(item.variety || '').trim();
    const sector = String(item.sector || '').trim();
    const brand = String(item.brand || '').trim();
    const notes = String(item.notes || '').trim();
    if (!ORIGIN_CATEGORIES.includes(item.category) || !variety ||
        !AYSEN_COMMUNES.includes(item.commune) || !ORIGIN_SOURCES.includes(item.source)) {
      throw new Error('Complete categoría, variedad, comuna y fuente en todos los productos regionales.');
    }
    if (item.source === 'Otra' && !notes) {
      throw new Error('Describa en observaciones la fuente de origen «Otra» para ' + variety + '.');
    }
    return [visit.id, new Date(), item.category + ': ' + variety, item.commune,
      [sector, brand].filter(Boolean).join(' · '), notes,
      item.category, variety, item.commune, sector, brand, item.source];
  });
}

const PROTEIN_CATEGORIES = ['vacuno', 'cerdo', 'pollo', 'cordero', 'pescados_mariscos'];
function classificationCriteria_(data) {
  const source = data || {};
  const keys = ['variedadesFrutasVerduras', 'categoriasProteicas', 'lacteosHabituales', 'huevosHabituales'];
  const present = keys.filter((key) => Object.prototype.hasOwnProperty.call(source, key));
  if (!present.length) {
    return { varieties: '', proteins: [], dairy: '', eggs: '', fulfilledCriteria: 0 };
  }
  if (present.length !== keys.length) {
    throw new Error('Complete los tres criterios de surtido antes de guardar la clasificación.');
  }
  if (String(source.variedadesFrutasVerduras).trim() === '') {
    throw new Error('Ingrese el número de variedades de frutas y verduras.');
  }
  const varieties = Number(source.variedadesFrutasVerduras);
  if (!Number.isInteger(varieties) || varieties < 0) {
    throw new Error('Ingrese un número entero igual o mayor que cero para las variedades de frutas y verduras.');
  }
  if (!Array.isArray(source.categoriasProteicas) ||
      source.categoriasProteicas.some((category) => !PROTEIN_CATEGORIES.includes(category))) {
    throw new Error('Seleccione solo categorías proteicas válidas: vacuno, cerdo, pollo, cordero o pescados y mariscos.');
  }
  if (!['si', 'no'].includes(source.lacteosHabituales) ||
      !['si', 'no'].includes(source.huevosHabituales)) {
    throw new Error('Indique si ofrece habitualmente lácteos y huevos.');
  }
  const proteins = [...new Set(source.categoriasProteicas)];
  const fulfilledCriteria = [
    varieties >= 10,
    proteins.length >= 2,
    source.lacteosHabituales === 'si' && source.huevosHabituales === 'si',
  ].filter(Boolean).length;
  return {
    varieties: varieties,
    proteins: proteins,
    dairy: source.lacteosHabituales,
    eggs: source.huevosHabituales,
    fulfilledCriteria: fulfilledCriteria,
  };
}
function classifyLocal_(sistemaAtencion, criteria) {
  const service = sistemaAtencion === 'acceso_libre' ? 'autoservicio' : sistemaAtencion;
  // Mixto se registra como categoría propia, pero pesa como autoservicio en el cálculo.
  return ['autoservicio', 'mixto'].includes(service) && criteria.fulfilledCriteria >= 2
    ? 'minimarket' : 'almacen_barrio';
}

function classificationRows_(visit, data) {
  if (!String(visit.unitVecinal || '').trim()) {
    throw new Error('Falta la unidad vecinal registrada en la visita.');
  }
  if (!data || data.estadoLocal !== 'abierto') {
    throw new Error('Solo se registran locales abiertos.');
  }
  const local = getVisitLocal_(visit);
  if (!['autoservicio', 'transmeson', 'mixto', 'acceso_libre'].includes(data.sistemaAtencion)) {
    throw new Error('Indique el sistema de atención del local.');
  }
  if (!SURFACE_OPTIONS.includes(data.superficie)) {
    throw new Error('Indique la superficie aproximada del local.');
  }
  if (Array.isArray(data.images && data.images.interior) && data.images.interior.length && !data.interiorAuthorized) {
    throw new Error('El interior solo puede registrarse con autorización.');
  }
  const criteria = classificationCriteria_(data);
  const automatic = classifyLocal_(data.sistemaAtencion, criteria);
  if (data.clasificacionOverride && !String(data.justificacionOverride || '').trim()) {
    throw new Error('Justifique la corrección manual de la clasificación.');
  }
  const finalClassification = data.clasificacionOverride || automatic;
  return [[
    visit.id, new Date(), String(visit.unitVecinal).trim(), 'abierto', data.superficie || '', data.sistemaAtencion || '',
    data.personasAtendiendo || '', '', data.rubroFrutasHortalizas || '', data.rubroCarneFresca || '',
    observedRubros_(data, criteria), '', '', '', automatic, finalClassification,
    data.clasificacionOverride ? 'manual' : 'automatica', String(data.justificacionOverride || '').trim(),
    String(data.observaciones || '').trim(), local.code, local.id, local.name, local.address,
    local.criterion, local.criterion2 || '', data.imageUrls.frontis || '', data.imageUrls.interior || '',
    data.imageUrls.frutasVerduras || '', data.imageUrls.carnes || '', data.imageUrls.congelados || '',
    criteria.varieties, criteria.proteins.join(', '), criteria.dairy, criteria.eggs,
    data.imageUrls.pescadosMariscos || '',
  ]];
}

function observedRubros_(data, criteria) {
  return [
    data.rubroFrutasHortalizas === 'si' ? 'Frutas y hortalizas frescas' : '',
    data.rubroCarneFresca === 'si' ? 'Carne fresca' : '',
    criteria.proteins.includes('pescados_mariscos') ? 'Pescados y mariscos congelados' : '',
    criteria.dairy === 'si' ? 'Lácteos' : '',
    criteria.eggs === 'si' ? 'Huevos' : '',
  ].filter(Boolean).join(', ');
}

function saveClassificationImages_(visit, data, previousImageUrls) {
  const folder = getImageFolder_();
  const urls = {};
  Object.keys(data.images || {}).forEach((group) => {
    const files = Array.isArray(data.images[group]) ? data.images[group] : [];
    urls[group] = files.length ? files.map((image, index) => {
      if (!image || !image.data || image.mimeType !== 'image/jpeg') {
        throw new Error('Una imagen del grupo ' + group + ' no tiene un formato válido.');
      }
      const bytes = Utilities.base64Decode(image.data);
      const blob = Utilities.newBlob(bytes, image.mimeType, visit.id + '-' + group + '-' + (index + 1) + '.jpg');
      return folder.createFile(blob).getUrl();
    }).join('\n') : previousImageUrls[group] || '';
  });
  return urls;
}

function getImageFolder_() {
  const folders = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGE_FOLDER_NAME);
}

function getSampleLocal_(code) {
  const local = SAMPLE_LOCALS.find((entry) => entry.code === String(code || '').trim().toUpperCase());
  if (!local) {
    throw new Error('El código de local no pertenece a la muestra sugerida.');
  }
  return local;
}

function getVisitLocal_(visit) {
  const sample = SAMPLE_LOCALS.find((entry) => entry.code === String(visit.localCode || '').trim().toUpperCase());
  if (sample) {
    return sample;
  }
  if (visit.isNewLocal && String(visit.localName || '').trim() &&
      String(visit.localAddress || '').trim() && String(visit.localType || '').trim()) {
    return {
      code: String(visit.localCode).trim().toUpperCase(),
      id: '',
      name: String(visit.localName).trim(),
      address: String(visit.localAddress).trim(),
      criterion: String(visit.localType).trim(),
      criterion2: '',
    };
  }
  throw new Error('El código de local no pertenece a la muestra y faltan datos del local nuevo.');
}
