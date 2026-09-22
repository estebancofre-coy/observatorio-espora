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

- Se creó el repositorio público `estebancofre-coy/observatorio-precios-coyhaique`, posteriormente renombrado a `estebancofre-coy/observatorio-espora`.
- Se publicó la interfaz mediante GitHub Pages:
  `https://estebancofre-coy.github.io/observatorio-espora/`
- Se añadió un endpoint `doPost` al backend de Apps Script para recibir operaciones `analyze` y `save` desde GitHub Pages.
- Se actualizó la implementación de Google Apps Script con el backend versionado.
- Se verificó la integración completa sin crear registros de prueba:
  - GitHub Pages responde correctamente y carga la interfaz, JavaScript y logo.
  - El endpoint `/exec` responde en formato JSON y aplica las validaciones del backend.

## 2026-09-18 — Integración de muestra sugerida

- Se incorporó la muestra sugerida de 107 locales georreferenciados, con códigos únicos de registro.
- Al ingresar un código válido, la aplicación completa nombre, dirección, tipo y subtipo del local.
- Se incorporó validación de códigos tanto en el frontend como en Apps Script.
- Para Almacenes o Minimarkets, se solicita obligatoriamente recategorización observada como Almacén o Minimarket.
- Para Importadores de Frutas y Verduras, se solicita obligatoriamente indicar si tienen venta al detalle/menor.
- La hoja `Observaciones` ampliará su esquema con ID de muestra, tipo, subtipo, recategorización y venta al detalle al publicar el backend actualizado.
- Las coordenadas de la muestra no se precargan: latitud y longitud se capturarán en terreno mediante la aplicación para validar y corregir la georreferenciación existente.
- La actualización fue publicada en GitHub Pages en el commit `c734454`.
- Durante la actualización manual de Apps Script se detectó que se copió una versión anterior de `Code.gs`, que produce el error `ensureSchema_ is not a function`.
- La versión corregida está disponible en `apps-script/Code.gs` del repositorio; `ensureSchema_` y `getObservationSheet_` están definidas como funciones globales.

## 2026-09-22 — Plataforma multinstrumento POAA

- Se adaptó la plataforma a una landing común de visita: recolector, fecha, código de local, caracterización y coordenadas levantadas en terreno.
- Se incorpora un ID de visita persistente que vincula los tres instrumentos y conserva sus borradores locales al volver al menú.
- Se creó el instrumento de disponibilidad y variedad a partir de la pauta POAA; se excluyó solamente la sección de publicidad.
- Se rediseñó precios para exigir un mínimo de dos observaciones por producto, con marca, precio, unidad y origen por observación.
- El tipo de conservación sólo se solicita para productos de la categoría Carnes.
- Se añadió un borrador del instrumento de origen con carne vacuna, cordero, pollo/aves, pescado, lácteos, huevos y un campo abierto.
- Se adaptó la BBDD para crear las hojas `Visitas`, `Disponibilidad`, `Precios`, `Origen` y `Panel POAA`, sin modificar la hoja histórica `Observaciones`.
- Los instrumentos y la cola de envío se conservan localmente cuando no hay conexión.

### Pendiente para ajustar

1. Ajustar el instrumento de origen tras recibir la propuesta metodológica de Ana.
2. Reemplazar `Code.gs` de Apps Script desde el repositorio, mantener `SampleLocals.gs`, ejecutar `setupDatabase()` y crear una nueva versión de la implementación.
3. Probar desde móvil el flujo completo de los tres instrumentos, incluidos borradores locales y sincronización sin conexión.

## 2026-09-22 (2) — Rebrand a ESPORA, nueva planilla y fix de guardado/notificación

### Rebrand

- Se renombró el proyecto de **POAA (Observatorio de Precios de Coyhaique)** a **ESPORA (Economía Social, Precios, Orgánicos, Residuos y Alimentación)**.
- Se actualizaron título, meta tags (`description`, `og:title`, `og:description`), encabezado, landing/hero y footer en `index.html` para incorporar la identidad ESPORA y el concepto de la espora como dispersión, resistencia y regeneración territorial, ligado al compostaje y a la Economía Social y Solidaria (ESS).
- Se renombró la hoja de panel de seguimiento de `Panel POAA` a `Panel ESPORA` y el título de `doGet()` en `Code.gs`.
- Se renombraron las claves de `localStorage` (`DRAFT_KEY`/`QUEUE_KEY`) de `poaaCoyhaique...` a `esporaCoyhaique...`. Nota: esto invalida borradores/colas locales guardados en navegadores antes del rebrand; no afecta datos ya guardados en Sheets.

### Nueva planilla de datos

- Se actualizó `DATABASE_SPREADSHEET_ID` en `apps-script/Code.gs` de la planilla anterior a la nueva planilla `1kgIi0Ls6zaSfFZI8ToXHS6Kil610z73m1jqoCZwZQ_Y`. No se modificó ni se borró ningún dato en la planilla anterior ni en la nueva.

### Diagnóstico del bug de guardado/notificación

- Se probó en vivo el endpoint `/exec` configurado en `app.js` (`API_URL`) enviando `{"action":"saveInstrument", ...}`. El backend publicado respondió `{"ok":false,"error":"La acción solicitada no es válida."}`, es decir, **rechaza la acción `saveInstrument`** que sí es la que usa el `Code.gs` versionado en el repositorio.
- Esto confirma que **la implementación (deployment) de Apps Script publicada en `/exec` está desactualizada** respecto al `Code.gs` del repositorio (el punto 2 de "Pendiente" de la bitácora anterior seguía sin aplicarse). Google Apps Script no republica automáticamente el Web App al guardar cambios en el editor: se requiere crear una **nueva versión de la implementación** manualmente.
- Esta desactualización explica que los datos no llegaran a Sheets. El cliente sí recibía una respuesta JSON válida y la mostraba, pero el mensaje ("La acción solicitada no es válida.") no es autoexplicativo para el usuario de campo, y no había garantía de que **cualquier** fallo (red, JSON inválido, excepción no controlada) siempre se mostrara en pantalla.

### Fix aplicado en el cliente (`app.js`)

Se mantiene el mismo contrato/endpoint (`POST` a `API_URL` con `{action:'saveInstrument', payload}` y respuesta `{ok, data|error}`), pero se endureció el manejo de errores para garantizar notificación visible en todos los casos:

- `api()` ahora distingue y da mensajes específicos para: error de red (`fetch` falla), respuesta HTTP no exitosa, respuesta no parseable como JSON (indicio de una implementación de Apps Script desactualizada o con error no controlado) y rechazo lógico del servidor (`ok:false`).
- Los botones de guardado se deshabilitan y muestran "Guardando…" mientras la petición está en curso, evitando envíos duplicados y dando retroalimentación inmediata.
- `showMessage()` ahora hace scroll hacia el aviso para asegurar que sea visible tras cambiar de vista.
- Se agregó un manejador global `window.addEventListener('unhandledrejection', ...)` como red de seguridad para mostrar cualquier error no capturado explícitamente.

### Pasos manuales pendientes (fuera del alcance del código)

1. **Crear una nueva versión de la implementación de Apps Script** con el `Code.gs` actualizado (incluye el nuevo `DATABASE_SPREADSHEET_ID` y el rebrand). Sin este paso, `/exec` seguirá sirviendo el código antiguo y los guardados seguirán fallando.
2. Ejecutar `setupDatabase()` una vez sobre la nueva planilla para crear las hojas `Visitas`, `Disponibilidad`, `Precios`, `Origen` y `Panel ESPORA`.
3. Verificar que el proyecto de Apps Script tenga permisos de edición sobre la nueva planilla `1kgIi0Ls6zaSfFZI8ToXHS6Kil610z73m1jqoCZwZQ_Y`.
4. Probar un guardado real desde la interfaz publicada y confirmar en Sheets que la fila aparece en la hoja correspondiente.

## 2026-09-22 (3) — Conservación y respaldos locales

- Se ampliaron las alternativas de conservación para productos de carnes en `index.html` y `apps-script/Code.gs`: `Fresco`, `Congelado`, `Al vacío`, `Embutido`, `Pillow bag` y `Granel (papel)`.
- Se añadieron botones para descargar un respaldo de la visita activa en JSON y HTML. El JSON conserva la estructura completa de la visita, instrumentos y cola pendiente de sincronización; el HTML ofrece una copia legible.
- El respaldo se genera localmente en el navegador y no modifica ni elimina datos de la visita o de Google Sheets.
- Para que la validación ampliada de conservación opere en producción, se debe volver a publicar la versión actualizada de `Code.gs` en Apps Script.
