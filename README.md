# Observatorio de precios Coyhaique

Interfaz web estática para registrar precios observados de productos en Coyhaique. Guarda cada producto en Google Sheets mediante una aplicación web de Google Apps Script.

## Publicación

GitHub Pages publica la interfaz desde la rama `main`. La URL prevista es:

`https://estebancofre-coy.github.io/observatorio-precios-coyhaique/`

## Backend

El código del backend está en `apps-script/Code.gs` y `apps-script/SampleLocals.gs`. Pega ambos archivos en un proyecto de Google Apps Script, ejecuta `setupDatabase()` una vez y despliega una aplicación web con:

- **Ejecutar como:** Yo.
- **Quién tiene acceso:** Cualquiera.

Después de modificar Apps Script, crea una nueva versión de la implementación. La URL de implementación debe terminar en `/exec` y estar configurada en `app.js` como `API_URL`.

## Datos

La Google Sheet creada por `setupDatabase()` contiene las hojas `Observaciones` y `Panel de seguimiento`. No se publica ni se comparte mediante GitHub Pages.

## Muestra de locales

`sample-locals.js` contiene 107 locales de la muestra sugerida. Al ingresar su código, la aplicación completa nombre, dirección, tipo y subtipo; el backend vuelve a validar el código antes de guardar. La latitud y longitud se capturan en terreno mediante geolocalización o ingreso manual, y no se rellenan desde la muestra.

- Para locales **Almacén** o **Minimarket**, se solicita la recategorización observada entre ambas opciones.
- Para **Importador Frutas y Verduras**, se solicita confirmar si existe venta al detalle/menor.

## Créditos

Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.  
Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
