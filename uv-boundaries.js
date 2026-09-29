// Asigna una coordenada a la unidad vecinal oficial que contiene el punto.
// Las geometrías tienen polígonos múltiples y anillos interiores (huecos).
function pointInRing_(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngI, latI] = ring[i];
    const [lngJ, latJ] = ring[j];
    const intersects = ((latI > lat) !== (latJ > lat)) &&
      (lng < (lngJ - lngI) * (lat - latI) / (latJ - latI) + lngI);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon_(lat, lng, rings) {
  return rings.length > 0 && pointInRing_(lat, lng, rings[0]) &&
    !rings.slice(1).some((ring) => pointInRing_(lat, lng, ring));
}

function getUvForCoordinates(lat, lng) {
  if (lat === '' || lat === null || lat === undefined || lng === '' || lng === null || lng === undefined) return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  for (const unit of UV_POLYGONS) {
    for (const polygon of unit.polygons) {
      const [minLng, minLat, maxLng, maxLat] = polygon.bounds;
      if (longitude < minLng || longitude > maxLng || latitude < minLat || latitude > maxLat) continue;
      if (pointInPolygon_(latitude, longitude, polygon.rings)) return unit.value;
    }
  }
  return null;
}

function hasUvBoundaries() {
  return UV_POLYGONS.length > 0;
}
