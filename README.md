# Observatorio de precios Coyhaique

Interfaz web estática para registrar precios observados de productos en Coyhaique. Guarda cada producto en Google Sheets mediante una aplicación web de Google Apps Script.

## Publicación

GitHub Pages publica la interfaz desde la rama `main`. La URL prevista es:

`https://estebancofre-coy.github.io/observatorio-precios-coyhaique/`

## Backend

El código del backend está en `apps-script/Code.gs`. Pégalo en un proyecto de Google Apps Script, ejecuta `setupDatabase()` una vez y despliega una aplicación web con:

- **Ejecutar como:** Yo.
- **Quién tiene acceso:** Cualquiera.

Después de modificar Apps Script, crea una nueva versión de la implementación. La URL de implementación debe terminar en `/exec` y estar configurada en `app.js` como `API_URL`.

## Datos

La Google Sheet creada por `setupDatabase()` contiene las hojas `Observaciones` y `Panel de seguimiento`. No se publica ni se comparte mediante GitHub Pages.

## Créditos

Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.  
Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
