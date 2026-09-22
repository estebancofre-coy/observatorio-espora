# Observatorio de precios Coyhaique

Interfaz web estática para levantar disponibilidad, precios y origen de productos en Coyhaique. Guarda cada instrumento en Google Sheets mediante una aplicación web de Google Apps Script.

## Publicación

GitHub Pages publica la interfaz desde la rama `main`. La URL prevista es:

`https://estebancofre-coy.github.io/observatorio-precios-coyhaique/`

## Backend

El código del backend está en `apps-script/Code.gs` y `apps-script/SampleLocals.gs`. `DATABASE_SPREADSHEET_ID` en `Code.gs` identifica explícitamente la planilla de producción; sólo debe modificarse al migrar a otra base. Pega ambos archivos en un proyecto de Google Apps Script, ejecuta `setupDatabase()` una vez y despliega una aplicación web con:

- **Ejecutar como:** Yo.
- **Quién tiene acceso:** Cualquiera.

Después de modificar Apps Script, crea una nueva versión de la implementación. La URL de implementación debe terminar en `/exec` y estar configurada en `app.js` como `API_URL`.

## Datos

La Google Sheet creada por `setupDatabase()` contiene `Visitas`, `Disponibilidad`, `Precios`, `Origen` y `Panel POAA`. Los instrumentos se enlazan mediante un ID de visita común. La hoja histórica `Observaciones` se conserva sin modificaciones.

## Instrumentos

- **Disponibilidad y variedad:** pauta POAA de alimentos/preparaciones saludables, no saludables y variedad. La sección de publicidad se excluye.
- **Precios:** cada producto debe registrar al menos dos precios, cada uno con marca, valor, unidad y origen. La conservación se solicita sólo para carnes.
- **Origen:** borrador con carne vacuna, cordero, pollo/aves, pescado, lácteos, huevos y una opción abierta para otros productos.

La visita y los borradores de cada instrumento persisten localmente en el navegador para permitir volver al menú o recuperar el trabajo tras una interrupción.

## Muestra de locales

`sample-locals.js` contiene 107 locales de la muestra sugerida. Al ingresar su código, la aplicación completa nombre, dirección, tipo y subtipo; el backend vuelve a validar el código antes de guardar. La latitud y longitud se capturan en terreno mediante geolocalización o ingreso manual, y no se rellenan desde la muestra.

- Para locales **Almacén** o **Minimarket**, se solicita la recategorización observada entre ambas opciones.
- Para **Importador Frutas y Verduras**, se solicita confirmar si existe venta al detalle/menor.

## Créditos

Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.  
Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
