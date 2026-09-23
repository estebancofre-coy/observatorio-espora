# ESPORA Coyhaique

**ESPORA** — Economía Social, Precios, Orgánicos, Residuos y Alimentación — es una interfaz web estática para levantar disponibilidad, precios y origen de productos en Coyhaique. El nombre evoca la espora: dispersión, resistencia y regeneración territorial, ligada al compostaje y a la Economía Social y Solidaria (ESS). Guarda cada instrumento en Google Sheets mediante una aplicación web de Google Apps Script.

> Este proyecto se llamó anteriormente **POAA (Observatorio de Precios de Coyhaique)**. El rebrand a ESPORA no cambia el flujo de levantamiento ni el contrato del backend.

## Publicación

GitHub Pages publica la interfaz desde la rama `main`. La URL prevista es:

`https://estebancofre-coy.github.io/observatorio-espora/`

## Backend

El código del backend está en `apps-script/Code.gs` y `apps-script/SampleLocals.gs`. `DATABASE_SPREADSHEET_ID` en `Code.gs` identifica explícitamente la planilla de producción (`1kgIi0Ls6zaSfFZI8ToXHS6Kil610z73m1jqoCZwZQ_Y`); sólo debe modificarse al migrar a otra base. Pega ambos archivos en un proyecto de Google Apps Script, ejecuta `setupDatabase()` una vez y despliega una aplicación web con:

- **Ejecutar como:** Yo.
- **Quién tiene acceso:** Cualquiera.

**Importante:** Google Apps Script no actualiza automáticamente el `/exec` publicado cuando editas `Code.gs` en el editor. Cada vez que cambies el backend debes ir a **Implementar → Administrar implementaciones → editar (lápiz) → Nueva versión → Implementar** para que el código publicado coincida con el repositorio. Si no se crea una nueva versión, el `/exec` sigue sirviendo el código anterior y las peticiones fallarán silenciosamente en apariencia (aunque el cliente sí recibe y muestra un error).

La URL de implementación debe terminar en `/exec` y estar configurada en `app.js` como `API_URL`.

## Datos

La Google Sheet creada por `setupDatabase()` contiene `Visitas`, `Disponibilidad`, `Precios`, `Origen` y `Panel ESPORA`. Los instrumentos se enlazan mediante un ID de visita común. La hoja histórica `Observaciones` se conserva sin modificaciones.

## Instrumentos

- **Disponibilidad y variedad:** pauta de alimentos/preparaciones saludables, no saludables y variedad. La sección de publicidad se excluye.
- **Precios:** cada producto debe registrar al menos dos precios, cada uno con marca, valor, unidad y origen. La conservación se solicita sólo para carnes.
- **Origen:** borrador con carne vacuna, cordero, pollo/aves, pescado, lácteos, huevos y una opción abierta para otros productos.

La visita y los borradores de cada instrumento persisten localmente en el navegador para permitir volver al menú o recuperar el trabajo tras una interrupción.

En el campo de conservación para carnes están disponibles: **Fresco, Congelado, Al vacío, Embutido, Pillow bag y Granel (papel)**. Desde el menú de la visita activa se pueden descargar respaldos locales en **JSON** (recomendado para recuperar datos) o **HTML** (copia legible). El respaldo incluye la visita, sus instrumentos y cualquier envío pendiente de sincronización; no reemplaza la copia final almacenada en Google Sheets.

En el instrumento de precios, la pantalla inicia sin productos y permite agregar varios alimentos antes de guardar. Cada alimento exige al menos dos observaciones: una en el rango más bajo y otra en el rango más alto. Después de guardar, el instrumento permanece abierto para continuar agregando alimentos; `Volver al menú` permite cerrarlo explícitamente.

El flujo de precios se organiza en tres pantallas: entrada del instrumento, revisión de alimentos agregados y formulario de un alimento. La revisión permite agregar más alimentos, anotar observaciones generales, guardar el conjunto en Sheets o volver al menú.

## Instrumento especial de clasificación

`Clasificación` es el instrumento inicial de la recogida. Registra unidad vecinal, estado del local, estructura, sistema de atención, variedad, rubros mixtos y observaciones. Para locales abiertos calcula automáticamente `minimarket` cuando hay acceso libre y zona amplia de fruta/verdura o mostrador/freezer de carnes; si no, clasifica como `almacen_barrio`. Una corrección manual exige justificación. Para locales no abiertos se solicitan solo identificación, estado y observaciones.

Al publicar la versión que incorpora este instrumento, ejecuta `setupDatabase()` para crear la hoja **Clasificación** con sus encabezados. Si la hoja ya existe, la función verifica que su estructura coincida y no borra datos. Después crea una nueva versión del Web App para que el endpoint acepte `instrument: "classification"`.

## Muestra de locales

`sample-locals.js` contiene 107 locales de la muestra sugerida. Al ingresar su código, la aplicación completa nombre, dirección, tipo y subtipo; el backend vuelve a validar el código antes de guardar. La latitud y longitud se capturan en terreno mediante geolocalización o ingreso manual, y no se rellenan desde la muestra.

- Para locales **Almacén** o **Minimarket**, se solicita la recategorización observada entre ambas opciones.
- Para **Importador Frutas y Verduras**, se solicita confirmar si existe venta al detalle/menor.

## Diagnóstico: guardado y notificaciones

Si al enviar un instrumento no se ve la notificación de éxito/error, o los datos no llegan a Sheets, revisa en este orden:

1. **Implementación desactualizada de Apps Script.** Es la causa más común: el `/exec` publicado no coincide con el `Code.gs` del repositorio. Solución: crear una nueva versión de la implementación (ver sección Backend).
2. **Spreadsheet ID incorrecto** en `DATABASE_SPREADSHEET_ID`, o el proyecto de Apps Script no tiene permiso sobre esa planilla.
3. **Errores de red o de formato** en la respuesta del backend: `app.js` ahora distingue y muestra mensajes específicos para fallas de red, respuestas no-JSON y rechazos del servidor (`ok:false`), además de un manejo global de errores no capturados (`unhandledrejection`) para asegurar que siempre se muestre algo en pantalla.

## Créditos

Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.  
Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
