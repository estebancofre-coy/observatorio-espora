# Flujo de información de ESPORA

Este documento describe el comportamiento implementado en el repositorio a fecha 2026-09-29 y separa ese flujo del diseño futuro recomendado para consolidar locales y generar mapas. No crea ni sincroniza datos: sirve como plano de trabajo para decidir la siguiente etapa.

## 1. Flujo general implementado

```mermaid
flowchart TB
  subgraph FUENTES["Fuentes de referencia distribuidas con la página"]
    SM["sample-locals.js<br/>Muestra usada por el navegador"]
    SG["apps-script/SampleLocals.gs<br/>Copia de la muestra validada por Apps Script"]
    UV["uv-polygons.js<br/>Polígonos de 34 UV"]
    EARTH["Proyecto compartido de Google Earth<br/>Referencia visual de UV"]
  end

  subgraph CAPTURA["Dispositivo de la persona recolectora"]
    IDENT["Identificación de visita<br/>ID · fecha · recolectora<br/>código y datos del local"]
    GEO["Coordenadas GPS o manuales<br/>+ sugerencia de UV por polígono<br/>+ corrección manual de UV"]
    MENU["Menú de instrumentos"]
    DRAFT["Borrador de visita e instrumentos<br/>localStorage"]
    QUEUE["Cola de sincronización<br/>localStorage si no hay conexión"]
    IDENT --> GEO --> MENU
    MENU <--> DRAFT
    MENU -->|"sin conexión"| QUEUE
  end

  subgraph FORMULARIOS["Instrumentos asociados a la visita"]
    CL["0. Clasificación<br/>local abierto · modo de atención<br/>3 criterios de surtido · fotos<br/>clase automática/final"]
    AV["1. Disponibilidad y variedad<br/>respuestas Sí/No por ítem"]
    PR["2. Precios<br/>producto · observaciones de precio<br/>unidad · marca · origen · promoción"]
    OR["3. Origen (borrador)<br/>producto · origen declarado<br/>detalle · observaciones"]
  end
  MENU --> CL
  MENU --> AV
  MENU --> PR
  MENU --> OR
  CL --> DRAFT
  AV --> DRAFT
  PR --> DRAFT
  OR --> DRAFT

  subgraph SERVIDOR["Sincronización"]
    API["POST a API_URL /exec<br/>{action: saveInstrument, payload}<br/>o {action: getVisitsForLocal, payload}"]
    GAS["Google Apps Script<br/>doPost → consulta de lectura<br/>o validar → LockService → guardar"]
    DRIVE["Google Drive<br/>ESPORA - Imágenes de levantamiento"]
  end
  MENU -->|"con conexión"| API
  QUEUE -->|"al recuperar conexión"| API
  API --> GAS
  GAS -->|"fotos del instrumento Clasificación"| DRIVE

  subgraph BASE["Google Sheets de producción"]
    VIS["Visitas<br/>una fila por ID de visita"]
    DISP["Disponibilidad<br/>filas por ítem"]
    PRE["Precios<br/>filas por observación"]
    ORIG["Origen<br/>filas por producto declarado"]
    CLAS["Clasificación<br/>fila por visita clasificada"]
    PANEL["Panel ESPORA<br/>fórmulas de conteo y resumen"]
  end
  GAS --> VIS
  GAS --> DISP
  GAS --> PRE
  GAS --> ORIG
  GAS --> CLAS
  DISP -. "fórmulas recalculadas en Sheets" .-> PANEL
  PRE -. "fórmulas recalculadas en Sheets" .-> PANEL
  VIS -. "fórmulas recalculadas en Sheets" .-> PANEL
  DRIVE -->|"URLs en columnas de fotos"| CLAS
```

La base está identificada en `Code.gs` por Spreadsheet ID `1kgIi0Ls6zaSfFZI8ToXHS6Kil610z73m1jqoCZwZQ_Y`. Apps Script escribe en las cinco hojas de captura; `Panel ESPORA` se crea por `setupDatabase()` y sus fórmulas resumen los datos de las hojas, no recibe cada envío como una tabla transaccional.

## 2. Identificación, fuentes del local y geografía

```mermaid
flowchart LR
  PERSONA["Persona recolectora<br/>nombre"]
  CHOICE{"¿Local de la muestra?"}
  SAMPLE["Código existente<br/>buscar en sample-locals.js"]
  NEW["Local nuevo<br/>nombre + dirección + tipo<br/>código LM<número>N<iniciales>"]
  SAMPLECOPY["SampleLocals.gs<br/>validación autoritativa en Apps Script"]
  CODECHECK["Validación de colisión<br/>bajo LockService al guardar"]
  COORD["Latitud / longitud<br/>GPS o ingreso manual"]
  POLYGON["uv-polygons.js + uv-boundaries.js<br/>punto dentro de polígono"]
  UV["UV sugerida<br/>confirmación/corrección de campo"]
  VISIT["Registro Visitas<br/>local + visita + coordenadas + UV"]

  PERSONA --> CHOICE
  CHOICE -->|"sí"| SAMPLE
  CHOICE -->|"no"| NEW
  SAMPLE --> SAMPLECOPY
  NEW --> CODECHECK
  SAMPLECOPY --> VISIT
  CODECHECK --> VISIT
  COORD --> POLYGON --> UV --> VISIT
  PERSONA --> VISIT
```

- `sample-locals.js` y `apps-script/SampleLocals.gs` son copias del catálogo de muestra para dos capas distintas: selección en el navegador y validación/enriquecimiento en el backend. No son una tabla maestra sincronizada.
- Un local nuevo **no se inserta** en esas copias. Sus datos viajan con la visita y se escriben en `Visitas` y, para Clasificación, también en esa hoja con el código del local.
- El código de local nuevo incorpora iniciales, derivadas automáticamente del nombre de la persona recolectora, para separar los espacios de numeración offline. Apps Script comprueba que el código no esté asociado a otro nombre; una revisita al mismo local puede conservarlo.
- Las iniciales identifican el espacio de códigos, pero no se almacenan como columna aparte en `Visitas`; la hoja conserva el nombre de la recolectora y el código del local.
- El GPS no asigna la UV por proximidad a un punto de muestra: `uv-boundaries.js` prueba la coordenada contra los polígonos de `uv-polygons.js`. La sugerencia se puede corregir manualmente y se guarda la UV elegida en la visita.
- El botón de Google Earth abre un mapa compartido de referencia. **No** publica ni actualiza registros de ESPORA en ese mapa.

## 3. Qué registra cada instrumento

Todos los envíos llevan el mismo objeto `visit` y se relacionan por `ID de visita`. El backend guarda el contenido en una hoja distinta por instrumento. Si se vuelve a guardar el mismo instrumento para el mismo ID de visita, reemplaza sus filas anteriores; no conserva versiones históricas de cada edición.

Para retomar una visita en otro dispositivo, la persona busca por código de local y una clave compartida del equipo. La acción `getVisitsForLocal` verifica la propiedad de Apps Script `ESPORA_RESUME_ACCESS_CODE`, consulta las filas de `Visitas` y las cuatro hojas de instrumentos, devuelve las visitas coincidentes con sus pautas guardadas y no escribe ni cambia el esquema. Al seleccionar una, el frontend guarda la copia completa en el navegador y mantiene el mismo `ID de visita`; las pautas siguientes se enlazan por ese ID. La clave no se persiste en el navegador. La búsqueda requiere conexión; después de cargarla, el borrador local puede seguir usándose sin internet y las nuevas pautas se sincronizan al recuperar conexión.

Sin conexión, el payload del instrumento queda en la cola local del dispositivo. La aplicación intenta vaciarla al recuperar conexión y al iniciar. Si un envío de la cola falla, no retira ese payload ni los que vienen detrás. Cada payload incluye `responsible`, la persona responsable de esa pauta.

| Instrumento | Datos que captura | Forma de persistencia |
|---|---|---|
| **Identificación / visita** (página inicial) | ID de visita; fecha de observación; persona que identifica el local (columna `Persona recolectora`); código, ID de muestra, nombre, dirección, tipo/subtipo (heredado de la muestra y guardado, pero **no mostrado** en pantalla; en locales nuevos el tipo es «Almacén o minimarket»); latitud/longitud levantadas; UV. Las iniciales usadas al generar códigos no son una columna de Sheets. La pantalla inicial también permite buscar visitas por código y retomar una copia. | `Visitas`: una fila por ID de visita, actualizada si el mismo borrador se sincroniza de nuevo. `getVisitsForLocal` solo lee las hojas existentes; al retomar se conserva ese ID. |
| **1. Clasificación (opcional)** | Persona responsable; estado abierto; superficie (góndolas); sistema de atención (autoservicio, tras mesón o mixto); rubros observados con número de variedades de frutas/hortalizas y tipos de carne; pescados y mariscos congelados; lácteos; huevos; clasificación automática/final; modo/justificación manual; observaciones; fotos de frontis, interior autorizado y módulos opcionales (incluye pescados y mariscos). | `Clasificación`: fila asociada al ID de visita y código de local. Minimarket requiere autoservicio o mixto (mixto pesa como autoservicio) y al menos 2 de 3 criterios: ≥10 variedades de frutas/hortalizas, 2+ categorías entre vacuno/cerdo/pollo/cordero/pescados o mariscos, lácteos y huevos. `Superficie estimada`, `Fruta y verdura`, `Carnes` y `Otros rubros` vuelven a llenarse; `Abarrotes básicos` queda vacía. Al final: `Fotos pescados y mariscos` y `Persona responsable`. Archivos van a Drive; las URL quedan en la hoja. |
| **2. Disponibilidad y variedad** | Persona responsable; respuesta Sí/No por cada ítem de la pauta de disponibilidad, preparaciones y variedad. | `Disponibilidad`: varias filas por visita, una por ítem con sección, categoría, texto, respuesta y persona responsable. |
| **3. Origen** | Persona responsable; productos con evidencia de origen regional: categoría alimentaria, variedad, comuna de Aysén, sector o localidad, marca o productor, fuente de evidencia y observaciones; o la marca «sin productos regionales observados». | `Origen`: una fila por producto. Las columnas antiguas reciben un resumen (`Producto` = categoría: variedad; `Origen declarado` = comuna; detalle = sector · marca) y los campos nuevos quedan en columnas dedicadas al final. |
| **4. Precios** | Persona responsable; alimentos centinela (18) con precio mínimo obligatorio y máximo opcional; marca, precio CLP, unidad (kg, 0,5 kg, Unidad, Otros), oferta, observaciones. | `Precios`: una fila por precio, con `Tipo de precio (mínimo/máximo)` y `Persona responsable` al final. Las columnas de conservación y origen quedan vacías en registros nuevos. |

Las hojas `Disponibilidad`, `Precios`, `Origen` y `Clasificación` tienen la columna `ID de visita` como clave de relación con `Visitas`. Para consolidar por establecimiento se debe usar además `Código de local`: una visita no equivale a un local, porque el mismo local puede tener varias visitas.

## 4. Modelo de datos que existe hoy

```mermaid
erDiagram
  VISITAS ||--o{ DISPONIBILIDAD : "ID de visita"
  VISITAS ||--o{ PRECIOS : "ID de visita"
  VISITAS ||--o{ ORIGEN : "ID de visita"
  VISITAS ||--o| CLASIFICACION : "ID de visita"
  LOCAL_REFERENCIA ||--o{ VISITAS : "Código de local (lógico)"
  CLASIFICACION ||--o{ FOTO_DRIVE : "URLs agrupadas en celdas"

  VISITAS {
    string id_visita PK
    date fecha_observacion
    string persona_recolectora
    string codigo_local
    string id_muestra
    string nombre_local
    string direccion
    string tipo_previo
    float latitud
    float longitud
    string unidad_vecinal
  }
  DISPONIBILIDAD {
    string id_visita FK
    string seccion
    string categoria
    string item
    string disponible
  }
  PRECIOS {
    string id_visita FK
    string producto
    int numero_observacion
    number precio_clp
    string unidad
    string origen
    string promocion
  }
  ORIGEN {
    string id_visita FK
    string producto
    string origen_declarado
    string procedencia
  }
  CLASIFICACION {
    string id_visita FK
    string codigo_local
    int variedades_frutas_verduras
    string categorias_proteicas
    boolean oferta_habitual_lacteos
    boolean oferta_habitual_huevos
    string clasificacion_previa
    string clasificacion_terreno
    string modo
    string justificacion
    string uv
  }
  LOCAL_REFERENCIA {
    string codigo_local
    string fuente
    string nombre
    string direccion
  }
  FOTO_DRIVE {
    string grupo
    string url
  }
```

`FOTO_DRIVE` es una relación conceptual para representar los archivos externos: en la implementación no hay una hoja/tabla de fotos y las URLs de cada grupo se concatenan en una celda de la fila `Clasificación`. `LOCAL_REFERENCIA` representa el catálogo de muestra, no una hoja maestra desplegada: actualmente sus valores viven en los dos archivos `SampleLocals`. Tampoco existe hoy una hoja `Locales_Vigente` ni una función que consolide las distintas visitas.

## 5. Siguiente etapa recomendada: consolidación y mapa

```mermaid
flowchart LR
  S["SampleLocals<br/>clasificación previa / marco"]
  V["Visitas<br/>coordenadas, UV, fecha, código"]
  C["Clasificación<br/>resultado observado + trazabilidad"]
  P["Precios"]
  A["Disponibilidad"]
  O["Origen"]
  JOIN["Consolidación reproducible<br/>por Código de local"]
  MASTER["Locales_Vigente (derivada)<br/>una fila por local<br/>previo + último observado<br/>coordenada/UV vigente + estado"]
  KML["Exportación KML/GeoJSON<br/>colores por clasificación/UV"]
  EARTH["Google Earth / SIG"]
  AUDIT["Datos fuente intactos<br/>Visitas e instrumentos históricos"]

  S --> JOIN
  V --> JOIN
  C --> JOIN
  P -. "análisis asociado, no define identidad" .-> JOIN
  A -. "análisis asociado, no define identidad" .-> JOIN
  O -. "análisis asociado, no define identidad" .-> JOIN
  JOIN --> MASTER --> KML --> EARTH
  V --> AUDIT
  C --> AUDIT
  MASTER -. "reconstruible; no sobrescribe fuentes" .-> AUDIT
```

La capa derivada permitiría comparar **clasificación previa** (`criterion`/`criterion2` del marco) con **clasificación de terreno** (última visita clasificada), mostrar locales sin visita y producir un KML sin alterar los datos fuente. Antes de implementarla hay que acordar:

1. **Identidad y deduplicación:** `Código de local` es la clave operativa actual; definir cómo detectar dos códigos para el mismo comercio o un local que cambió de nombre/dirección.
2. **Qué significa “vigente”:** última visita por fecha de observación, desempate por fecha de registro/ID; decidir si manda el último resultado automático o una corrección manual justificada.
3. **Coordenada maestra:** una visita puede tener un GPS distinto de otra. Definir si el mapa usa la última coordenada, la mediana/promedio, o una coordenada maestra revisada por una persona.
4. **Clasificación previa vs. actual:** conservar ambas como atributos separados; no sobrescribir el marco muestral con lo observado.
5. **Locales nuevos:** incluirlos como entidades de la capa derivada sin agregarlos automáticamente a `SampleLocals.gs`.
6. **Publicación del mapa:** descargar e importar una nueva exportación KML/GeoJSON, o diseñar un endpoint/NetworkLink si el formato y el cliente de Google Earth elegido lo permiten. Actualmente no existe exportador ni sincronización con el proyecto compartido.
7. **Historial y calidad:** preservar todas las visitas como hechos fechados; marcar coordenadas fuera de polígonos, UV corregidas manualmente y posibles duplicados para revisión.

**Regla de seguridad:** generar `Locales_Vigente` y los KML como productos derivados y regenerables. No borrar ni editar `Visitas`, `Clasificación` ni `SampleLocals` para construirlos.
