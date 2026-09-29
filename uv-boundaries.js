// Límites de unidades vecinales (UV) de Coyhaique para asignación automática por coordenadas.
//
// Este archivo se mantiene vacío hasta contar con el KML/KMZ exportado del proyecto de Google Earth:
// https://earth.google.com/earth/d/1ELFkikpamAG-HdZ0Kcy3PBn-gsOhvNup
//
// Cómo exportarlo y completar este archivo:
// 1. Abra el proyecto en https://earth.google.com/earth/d/1ELFkikpamAG-HdZ0Kcy3PBn-gsOhvNup con su cuenta editora.
// 2. Menú (⋮) del proyecto → "Exportar como KML" (o KMZ). Si exporta KMZ, descomprímalo: es un .kml dentro de un zip.
// 3. Comparta ese archivo .kml con este equipo (adjúntelo en el chat o súbalo al repositorio en /apps-script/uv.kml).
// 4. Con las coordenadas de cada polígono de UV se completará UV_POLYGONS abajo y quedará operativa
//    la sugerencia automática de UV al capturar latitud/longitud y el filtro de locales por UV asignada.
//
// Formato esperado por polígono: lista de pares [longitud, latitud] en el mismo orden que trae el KML
// (<coordinates>longitud,latitud[,altitud] ...</coordinates>), sin repetir el último punto si es igual al primero.
//
// Ejemplo (no real, solo referencia de formato):
// const UV_POLYGONS = {
//   'UV1': [[-72.075, -45.565], [-72.060, -45.565], [-72.060, -45.575], [-72.075, -45.575]],
//   'UV2': [[...]],
// };
const UV_POLYGONS = {};

// Prueba de punto dentro de polígono (ray casting). polygon: [[lng, lat], ...].
function pointInPolygon_(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lngI, latI] = polygon[i];
    const [lngJ, latJ] = polygon[j];
    const intersects = ((latI > lat) !== (latJ > lat)) &&
      (lng < (lngJ - lngI) * (lat - latI) / (latJ - latI) + lngI);
    if (intersects) inside = !inside;
  }
  return inside;
}

// Devuelve el nombre de la UV que contiene el punto, o null si no hay límites cargados o no coincide ninguna.
function getUvForCoordinates(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const entries = Object.entries(UV_POLYGONS);
  if (!entries.length) return null;
  for (const [uv, polygon] of entries) {
    if (pointInPolygon_(latitude, longitude, polygon)) return uv;
  }
  return null;
}

// true cuando ya se cargaron límites reales (permite avisar en la interfaz si aún falta el KML).
function hasUvBoundaries() {
  return Object.keys(UV_POLYGONS).length > 0;
}
