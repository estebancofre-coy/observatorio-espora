# Bitácora de cambios

## 2026-09-17 — Preparación de datos y aplicación de levantamiento

### Datos geográficos y clasificación

- Se analizó el KML de locales manuales: 215 puntos distribuidos en 22 subcategorías.
- Se normalizaron las 215 coordenadas al formato KML bidimensional `longitud,latitud`, sin altitud.
- Se corrigió la coordenada de la ficha descriptiva de **ECOMERCADO FOSIS - I.M. Coyhaique** para que coincida con su punto KML.
- Se ajustaron las clasificaciones FAO de:
  - **Envasadora Aysén Punto de Venta**: procesamiento y transformación agroalimentaria.
  - **Envasadora Aysén Casa Matriz**: logística, acopio y comercio mayorista.
- Se generaron KML y CSV optimizados para Google My Maps, con atributos estructurados y estilos simplificados.
- Se cruzó el CSV con la matriz de clasificación georreferenciada y se completaron ocho registros mediante coincidencias exactas verificables.

### Matriz de precios

- Se procesó la matriz de recolección de Coyhaique.
- Se definieron los 28 productos marcados en la selección muestral.
- Se incorporaron alternativas por producto para tipo de conservación, unidad/presentación y origen local o externo.

### Aplicación de levantamiento

- Se creó un frontend HTML para registrar múltiples productos en un mismo lote.
- Cada fila guarda fecha de observación, persona recolectora, código interno del local, establecimiento, dirección, coordenadas, producto, precio, conservación, unidad/presentación, origen, marca, promoción y observaciones.
- Se incorporó el logo del Departamento de Ciencias Sociales y Humanidades de la Universidad de Aysén.
- Se añadieron créditos:
  - Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.
  - Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
- Se implementó geolocalización desde navegador y entrada manual validada de latitud y longitud.
- Se implementó almacenamiento temporal local para lotes sin conexión y sincronización posterior.
- Se implementó detección de posibles duplicados por fecha, código interno y producto, además de duplicados dentro del mismo lote.
- Se implementó alerta de precios atípicos cuando la desviación frente a la mediana histórica es igual o superior a 30 %.

### Base de datos y seguimiento

- El backend de Apps Script crea una Google Sheet en Drive llamada **Base de datos - Precios observados Coyhaique**.
- La hoja **Observaciones** guarda cada producto como una fila y asigna un ID de lote común.
- La hoja **Panel de seguimiento** muestra registros totales, lotes, último registro, distribución por categoría y posibles duplicados.
- Se eliminaron restricciones y registro de correo institucional: el acceso queda definido por la configuración de la implementación de Apps Script.

### Publicación

- Se creó el repositorio público `estebancofre-coy/observatorio-precios-coyhaique`.
- Se publicó la interfaz mediante GitHub Pages:
  `https://estebancofre-coy.github.io/observatorio-precios-coyhaique/`
- Se añadió un endpoint `doPost` al backend de Apps Script para recibir operaciones `analyze` y `save` desde GitHub Pages.

### Pendiente de implementación

1. Copiar `apps-script/Code.gs` del repositorio al proyecto de Google Apps Script.
2. Crear una nueva versión de la implementación web de Apps Script para publicar el endpoint `doPost`.
3. Probar desde móvil el ciclo completo: registro, detección de duplicados, precio atípico, cola sin conexión y sincronización.
