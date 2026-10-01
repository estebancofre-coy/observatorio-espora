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

La Google Sheet creada por `setupDatabase()` contiene `Visitas`, `Clasificación`, `Disponibilidad`, `Precios`, `Origen` y `Panel ESPORA`. Los instrumentos se enlazan mediante un ID de visita común. La hoja histórica `Observaciones` se conserva sin modificaciones.

El diagrama de captura, persistencia, relaciones entre hojas y arquitectura propuesta para consolidar locales y generar mapas está en [FLUJO_DATOS_Y_MAPEO.md](FLUJO_DATOS_Y_MAPEO.md). Distingue el funcionamiento actual del diseño futuro; todavía no existe sincronización de la base con Google Earth ni una hoja maestra `Locales_Vigente`.

## Instrumentos

El orden de aplicación sigue el anexo metodológico (Zazo y Daiana, 30/09):

0. **Identificación del establecimiento** (página inicial obligatoria): persona que identifica el local, local de la muestra o nuevo, unidad vecinal y coordenadas. Da paso al menú de pautas.
1. **Clasificación** (opcional): se aplica solo en los locales indicados.
2. **Disponibilidad y variedad:** pauta de alimentos/preparaciones saludables, no saludables y variedad. Sin cambios respecto de la versión anterior.
3. **Origen:** solo productos con evidencia de origen regional. Cada ítem registra categoría alimentaria, variedad, comuna de Aysén, sector o localidad, marca o productor regional y fuente de la evidencia (observaciones obligatorias si la fuente es «Otra»). Se puede marcar «No se observaron productos de origen regional».
4. **Precios:** canasta de 18 alimentos centinela en cuatro grupos (comparables con ODEPA, básicos de referencia, proteicos relevantes para Aysén, emblemáticos regionales). Cada alimento registra el **precio mínimo** (obligatorio) y, si hay más de una opción, el **máximo**; marca, precio y unidad (kg, 0,5 kg, Unidad u Otros) son obligatorios, y las observaciones también si la unidad es «Otros». Se retiraron la conservación y el origen local/externo, que ahora se recogen en la pauta de Origen.

En pescaderías y carnicerías puede bastar con Origen y Precios. **Cada pauta registra su propia persona responsable** (nombre o código), porque la identificación y las pautas pueden aplicarlas personas distintas; el campo se precarga con el último nombre usado y se guarda en la columna `Persona responsable` al final de cada hoja.

La visita y los borradores de cada instrumento persisten localmente en el navegador para permitir volver al menú o recuperar el trabajo tras una interrupción.

En la pantalla inicial está **Continuar una visita existente**: con conexión, ingrese el código del local y la clave de acceso compartida del equipo; revise las visitas encontradas por fecha, persona e instrumentos guardados, y elija cuál retomar. La aplicación descarga la visita y sus pautas conservando el **mismo ID**, y guarda esa copia en el navegador del dispositivo. Cada persona completa el campo de responsable de su propia pauta. Después de cargarla, puede continuar sin conexión; los nuevos envíos quedan pendientes hasta recuperar internet. La primera búsqueda sí requiere conexión. No se crean columnas ni se altera el esquema de Sheets. La clave no se guarda en el borrador ni en el repositorio.

Desde el menú de la visita activa, **Descargar respaldo offline** agrupa las opciones **JSON** (recomendado para recuperar datos) y **HTML** (copia legible). El respaldo incluye la visita, sus instrumentos y cualquier envío pendiente de sincronización; no reemplaza la copia final almacenada en Google Sheets. El botón rojo **Cerrar visita** queda como paso explícito de finalización: advierte si hay borradores o sincronizaciones pendientes y confirma antes de borrar la copia local. Los instrumentos que ya se guardaron en Sheets permanecen allí.

En el instrumento de precios, la pantalla inicia sin productos y permite agregar varios alimentos antes de guardar. Después de guardar, el instrumento permanece abierto para continuar agregando alimentos; `Volver al menú` permite cerrarlo explícitamente.

El flujo de precios se organiza en tres pantallas: entrada del instrumento, revisión de alimentos agregados y formulario de un alimento. La revisión permite agregar más alimentos, anotar observaciones generales, guardar el conjunto en Sheets o volver al menú.

## Instrumento de clasificación (opcional)

`Clasificación` registra superficie aproximada (por número de góndolas), sistema de atención (autoservicio, tras mesón o **mixto**), personas atendiendo, rubros observados (frutas y hortalizas con su número de variedades; carne fresca con vacuno/cerdo/pollo/cordero; pescados y mariscos congelados; lácteos; huevos), fotos y observaciones. La unidad vecinal se hereda de la ficha de identificación.

La regla automática exige **autoservicio o atención mixta** como condición obligatoria. «Mixto» se guarda como categoría propia, pero en el cálculo pesa igual que autoservicio. Además, exige cumplir al menos **dos de estos tres criterios**:

1. 10 o más variedades distintas de frutas y hortalizas.
2. Al menos dos categorías proteicas entre vacuno, cerdo, pollo, cordero y pescados o mariscos (esta última agrupa pescados y mariscos en una sola categoría).
3. Presencia de lácteos y de huevos.

Si la atención es solo tras mesón, o se cumplen menos de dos criterios, asigna `almacen_barrio`. El resultado en pantalla indica cuántos criterios se cumplen. La selección manual puede cambiar el resultado, pero requiere justificación escrita.

La columna `Superficie estimada` vuelve a usarse (muy_pequeno, pequeno, mediano, grande). `Fruta y verdura` y `Carnes` guardan si/no según los rubros marcados, y `Otros rubros` lista los rubros observados. `Abarrotes básicos` queda vacía.

La interfaz **no muestra la preclasificación** (almacén o minimarket) que traen los locales de la muestra, para no sesgar la observación. Ese dato se sigue conservando en `SampleLocals` y en la columna `Tipo de local` de las hojas, pero no aparece en la ficha de identificación ni en la de Clasificación. Al registrar un local nuevo, el tipo ofrece una sola opción «Almacén o minimarket»; la distinción la hace la Clasificación.

### Guía de autocapacitación

[`guia-clasificacion.html`](guia-clasificacion.html) es una página independiente para estudiantes y profesionales de apoyo que aplican **solo** el instrumento de Clasificación. Explica la regla, el recorrido en el local en orden de observación, definiciones operativas de conteo, un simulador y siete casos de práctica con retroalimentación. Se abre desde la ficha de Clasificación de la aplicación.

El simulador y los casos replican `classifyLocal_` de `app.js`; si la regla cambia, también debe actualizarse la función `classify` de la guía. Las definiciones de conteo (por ejemplo, que colores de un mismo producto cuentan como una variedad o que los embutidos no cuentan como categoría proteica) son criterios operativos propuestos por el equipo y deben validarse metodológicamente.

`app.js` y `apps-script/Code.gs` implementan la misma regla. Si se modifica una, debe modificarse la otra. El backend conserva el conteo, las categorías seleccionadas y las dos respuestas de oferta habitual en columnas nuevas al final de `Clasificación`.

La foto del frontis es obligatoria. Las fotos del interior (solo con autorización), frutas y verduras, carnes, pescados y mariscos, y congelados son opcionales y están agrupadas en una sección plegable. Las imágenes se comprimen en el navegador y Apps Script las almacena en la carpeta de Drive `ESPORA - Imágenes de levantamiento`; la hoja `Clasificación` conserva sus enlaces.

Al aplicar estos cambios, actualiza `Code.gs` en Apps Script, ejecuta `setupDatabase()` una vez (o deja que el primer guardado lo haga) y crea una nueva versión del Web App. Las columnas nuevas (`Persona responsable` en las cuatro hojas de pautas, `Tipo de precio (mínimo/máximo)` en `Precios`, los seis campos de origen en `Origen` y `Fotos pescados y mariscos` en `Clasificación`) se **agregan al final**; no se borran ni reordenan datos. Publica también el frontend actualizado para que la captura y el cálculo coincidan con el backend. Los envíos en cola generados con la versión anterior de Origen o Precios serán rechazados con un mensaje que pide recargar y volver a completar la pauta.

La función **Continuar una visita existente** añade la acción `getVisitsForLocal` al mismo endpoint `/exec`. Esta búsqueda solo lee las pestañas existentes y no ejecuta `setupDatabase()` ni modifica filas o encabezados. Antes de desplegarla, configura una clave aleatoria y larga como propiedad de secuencia de comandos `ESPORA_RESUME_ACCESS_CODE` en Apps Script (Configuración del proyecto → Propiedades de secuencia de comandos) y compártela solo con los recolectores autorizados. Actualiza `Code.gs` y crea una nueva versión del Web App conservando su URL; no se requiere cambio de planilla.

La ficha de clasificación se vincula automáticamente con el código de local de la visita y vuelve a validar ese código contra `SampleLocals.gs`. La hoja `Clasificación` guarda también código, ID de muestra, nombre, dirección, tipo y subtipo provenientes de `SampleLocals`; por eso el panel inicial ya no solicita subtipo, recategorización ni venta al detalle.

La pantalla inicial primero permite filtrar y revisar la lista de muestra por UV; después de esa lista aparece la casilla **No aparece en la lista: registrar un local nuevo**. Al activarla genera un código local con el patrón `LMNNN1` (por ejemplo, `LM108N1`) usando una secuencia local del navegador, sin editar `SampleLocals.gs`. El nombre, dirección y tipo ingresados viajan con la visita; Apps Script acepta ese local y lo registra en `Visitas` y `Clasificación`. La incorporación posterior a `SampleLocals.gs` queda como tarea de sincronización metodológica.

Para gestión geoespacial conviene capturar además precisión horizontal del GPS, fecha/hora de captura, fuente de coordenadas (GPS del dispositivo o digitación), permiso para fotografiar, accesibilidad del local, relación con ferias o equipamientos cercanos, y un identificador territorial estable como zona censal o unidad vecinal. Estos campos permiten evaluar calidad posicional, proteger datos sensibles y hacer análisis de cobertura sin depender solo de la dirección.

## Unidad vecinal (UV) del local

La ficha de identificación de la visita ahora exige seleccionar la **unidad vecinal (UV)** del local, tanto para locales de la muestra como para locales nuevos. Esa UV se guarda en `Visitas` y se hereda automáticamente en `Clasificación` (ya no se pregunta dos veces).

Se agregó un botón **Ver mapa de unidades vecinales (Google Earth)** que abre en una pestaña nueva el proyecto:
`https://earth.google.com/earth/d/1ELFkikpamAG-HdZ0Kcy3PBn-gsOhvNup`
Ahí se ven los colores por UV para identificar visualmente en qué unidad está el local antes de registrar coordenadas.

### Asignación de UV por coordenadas

La capa adjunta de geodatabase contiene la tabla espacial `Unidades_Vecinales`, con los campos `NOMBRE_COMUNA`, `CODIGO_UV` y `NOMBRE_UV`. Se extrajeron las 34 unidades de Coyhaique, se transformaron del CRS original EPSG:4674 a WGS 84 (EPSG:4326) y se guardaron como geometrías multipoligonales en `uv-polygons.js`; `uv-boundaries.js` resuelve la UV con latitud/longitud, incluidos huecos y polígonos separados. El diccionario de variables adjunto documenta esos campos y la fuente del Censo 2017.

Al elegir un local de la muestra, la plataforma carga sus coordenadas existentes y asigna la UV que contiene ese punto. En locales nuevos, la UV se sugiere al usar GPS o ingresar las coordenadas. En ambos casos la selección se puede corregir antes de continuar. Los nombres de UV se muestran junto con su código para distinguir sectores homónimos.

El filtro territorial es una opción plegada **“Filtrar esta lista por UV — no es otro dato de la visita”** dentro de la sección de locales de muestra; no es otra pregunta ni cambia lo guardado. La única UV que se registra se muestra en **“Unidad vecinal del local”** y se hereda en Clasificación como dato informativo, sin volver a solicitarla.

**Precaución cartográfica:** los polígonos adjuntos corresponden al Censo 2017, no necesariamente a la división municipal vigente. Las 107 coordenadas de la muestra caen dentro de una UV del archivo; 19 están a menos de 20 m de un límite, por lo que conviene validar esos puntos en el mapa y confirmar con la fuente municipal. En particular, `LM04A1` (“JACE Panadería Artesanal”) tiene coordenadas `-45.343027, -72.055981`, que lo ubican en Villa Ortega y parecen no concordar con la dirección céntrica registrada; revise ese dato en `sample-locals.js` antes de usar su UV como definitiva. La capa de puntos `Locales Manuales - Por Subcategoría - Final (1).kml` no se utilizó para los límites: son puntos de locales por rubro y no polígonos de UV.

Este cambio solo modifica el frontend y la capa geográfica; no altera el contrato ni el esquema de Apps Script/Sheets. No requiere ejecutar `setupDatabase()` ni republicar el Web App. Basta publicar los archivos estáticos actualizados en GitHub Pages.

### Identificación de locales y responsabilidades por zona

Antes, el código de local (por ejemplo `LM01A1`) no bastaba para reconocer de qué negocio se trataba. Ahora el selector muestra **código — nombre — dirección**, asigna la UV mediante las coordenadas de muestra y ofrece el filtro territorial opcional para acotar la lista a la zona asignada. Así se facilita el reparto por UV y se reduce el riesgo de duplicar o confundir locales.

### Actualización del backend tras cambios

1. Copia el `Code.gs` actualizado al proyecto ESPORA de Apps Script y conserva el archivo `SampleLocals`.
2. Guarda y ejecuta `setupDatabase()` una vez. Si la hoja `Clasificación` ya tenía la estructura anterior, la nueva versión conserva sus columnas existentes y agrega al final las columnas de imágenes; no borra registros. La primera ejecución puede solicitar permisos adicionales para crear la carpeta de imágenes en Drive.
3. En **Implementar → Administrar implementaciones**, edita la aplicación web y crea una **nueva versión**. No crees otra URL si quieres mantener el `API_URL` actual del frontend.
4. Abre la URL `/exec` y verifica el mensaje `API activa`. Luego prueba guardar una clasificación: la respuesta ya no debe indicar `classificationRows_ is not defined`.

## Muestra de locales

`sample-locals.js` contiene 107 locales de la muestra sugerida. Al elegir un local, la aplicación completa nombre, dirección y coordenadas de muestra; el backend vuelve a validar el código antes de guardar. El tipo preasignado en la muestra no se muestra en pantalla: la categoría almacén/minimarket la determina el instrumento de Clasificación.

### Códigos de locales nuevos

Cuando un local no está en la muestra, la aplicación genera un código con el patrón `LM<número>N<iniciales>`, por ejemplo `LM108NMB`. El número continúa la numeración más alta de `sample-locals.js` y las iniciales identifican a quien registra.

Las iniciales ya no se preguntan: se obtienen automáticamente del campo **Persona recolectora**, tomando la primera letra de hasta tres palabras del nombre (se ignoran partículas como «de», «del» o «la»). Por ejemplo, «María José Bravo» genera `MJB` y «José de la Fuente» genera `JF`; si se escribe una sola palabra, se usan sus dos primeras letras («Camila» → `CA`). La ficha muestra las iniciales resultantes bajo el nombre, y el nombre queda recordado en el dispositivo. Existen porque el contador del número vive en el navegador de cada equipo: sin las iniciales, dos personas trabajando en terreno el mismo día generarían ambas `LM108`, y la colisión recién aparecería al sincronizar. Con las iniciales, cada dispositivo produce códigos de un espacio distinto y el conflicto no llega a ocurrir, incluso sin conexión. Conviene que cada persona escriba nombre y apellidos completos para reducir coincidencias. Si se cambia el nombre mientras se registra un local nuevo, el código se regenera con las nuevas iniciales; los borradores ya guardados conservan su código.

Como red de seguridad —por ejemplo si dos personas comparten iniciales, o si alguien usa dos dispositivos—, el backend verifica dentro de su bloqueo de escritura que el código no esté ya asignado a un local con **otro nombre**. Si lo está, rechaza el envío indicando qué local lo ocupa, y el botón **Generar otro código** permite reintentar con un número nuevo. Registrar otra visita al **mismo** local con el mismo código sí está permitido: es una revisita, no un conflicto.

Los códigos antiguos con el formato `LM108N1` siguen siendo válidos para lectura; solo la generación usa el formato nuevo. Las iniciales no se guardan como columna aparte: van dentro del código, de modo que este cambio no altera los encabezados de las hojas y no requiere ejecutar `setupDatabase()`.

## Presentación de la investigación

`presentacion/Entornos_Alimentarios_Coyhaique_ESPORA.pptx` (y su versión PDF) resume el propósito, el marco, el territorio y la muestra, los instrumentos, la regla de clasificación, el flujo de datos y los próximos pasos, con la autoría tal como figura en la plataforma y referencias en formato APA 7. Se descarga desde el pie de la aplicación y de la guía.

Para regenerarla: `pip install python-pptx` y `python presentacion/generar_presentacion.py`. El PDF se exporta desde PowerPoint. Las referencias a materiales internos (muestra, capa KML, matriz de precios) figuran como conjuntos de datos no publicados del Proyecto ESPORA. La capa de unidades vecinales se cita sin año (`s.f.`): conviene confirmar el año y la versión en los metadatos del archivo descargado.

## Diagnóstico: guardado y notificaciones

Si al enviar un instrumento no se ve la notificación de éxito/error, o los datos no llegan a Sheets, revisa en este orden:

1. **Implementación desactualizada de Apps Script.** Es la causa más común: el `/exec` publicado no coincide con el `Code.gs` del repositorio. Solución: crear una nueva versión de la implementación (ver sección Backend).
2. **Spreadsheet ID incorrecto** en `DATABASE_SPREADSHEET_ID`, o el proyecto de Apps Script no tiene permiso sobre esa planilla.
3. **Errores de red o de formato** en la respuesta del backend: `app.js` ahora distingue y muestra mensajes específicos para fallas de red, respuestas no-JSON y rechazos del servidor (`ok:false`), además de un manejo global de errores no capturados (`unhandledrejection`) para asegurar que siempre se muestre algo en pantalla.

## Créditos

Aplicación: Dr. Esteban Cofré-Morales — Universidad de Aysén.  
Investigación original: PhD. Ana Zazo Moratalla — Universidad Rey Juan Carlos.
