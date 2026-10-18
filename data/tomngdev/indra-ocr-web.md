# tomngdev/indra-ocr-web

## Resumen

`tomngdev/indra-ocr-web` es un paquete de despliegue en navegador de los modelos ONNX de `datalab-to/indra-ocr` (etiqueta v3.1.1), acompanado de un cargador en JavaScript que los ejecuta mediante `onnxruntime-web` sobre el backend WebAssembly. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion con port del pre y postprocesado desde el paquete Python `indra-ocr` (repositorio `datalab-to/indra`). Su tarea declarada en HuggingFace es `image-to-text`, es decir, reconocimiento optico de caracteres (OCR) sobre imagenes de paginas.

El problema que resuelve es concreto: permitir OCR dentro del navegador sin enviar las imagenes a un servidor, lo que simplifica el cumplimiento de privacidad y elimina la dependencia de infraestructura de inferencia. La API expuesta devuelve, por pagina, un objeto con `lines` (cada linea con `box`, `text` y `conf`), el texto completo agregado y la `rotation` detectada. Los modelos opcionales se pueden desactivar con las opciones `cjk`, `orient` y `order`, de modo que el desarrollador decide que partes del pipeline carga.

La relevancia actual es la del OCR en el borde (client-side): el repo ocupa 0.0 GB segun HuggingFace y acumula 5 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto muy reciente y con validacion comunitaria practicamente nula. La model card no publica arquitectura interna, numero de parametros, longitud de contexto ni resultados de benchmarks del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura interna; se distribuyen pesos ONNX derivados de `datalab-to/indra-ocr` v3.1.1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un pipeline OCR por lineas/pagina; no se especifica) |
| Tipos de cuantizacion | no disponible (la model card no indica precision ni esquema de cuantizacion de los pesos ONNX) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ejecutados con `onnxruntime-web`), mas modulo JavaScript ESM `indra-ocr-web.mjs` |
| Tarea (pipeline) | image-to-text |
| Runtime de inferencia | `onnxruntime-web` 1.30.0, backend wasm |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Modelo base | `datalab-to/indra-ocr` |
| Descargas / likes | 5 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo subyacente: la model card se limita a indicar que se distribuyen los modelos ONNX de `datalab-to/indra-ocr` (tag v3.1.1) junto con un cargador que los ejecuta en `onnxruntime-web` sobre wasm, y que el pre y postprocesado es un port del paquete Python `indra-ocr` del repositorio `datalab-to/indra`. No se especifican tipo de red (transformer, CNN, detector + reconocedor, etc.), numero de parametros, volumen de tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta el proceso de exportacion a ONNX ni si los pesos se han cuantizado.

La innovacion tecnica destacable no esta en el modelo, sino en el modo de ejecucion: el pipeline completo (deteccion de lineas, reconocimiento, estimacion de orientacion y orden de lectura) corre en el navegador con WebAssembly, con modelos opcionales que se pueden omitir (`cjk: false`, `orient: false`, `order: false`) para reducir el coste de carga e inferencia. La model card advierte de que, sin aislamiento de origen cruzado (cabeceras COOP/COEP), el backend wasm funciona en modo monohilo, lo que afecta directamente al rendimiento. No se han publicado datos de entrenamiento ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de paginas, con salida estructurada por lineas: caja delimitadora (`box`), texto (`text`) y confianza (`conf`).
- Devolucion del texto agregado de la pagina y de la rotacion detectada (`rotation`).
- Soporte de escritura CJK mediante el modelo opcional activado con `cjk: true`, segun los idiomas declarados (en, zh).
- Deteccion de orientacion de pagina como modulo opcional (`orient`).
- Reconstruccion del orden de lectura como modulo opcional (`order`).
- Ejecucion 100% en el cliente: inferencia en navegador via wasm, sin llamadas a servidor.
- Integracion sencilla en aplicaciones web mediante `importmap` y modulos ESM, o mediante bundler/npm instalando `onnxruntime-web`.
- Lectura de imagenes en escala de grises a traves de la utilidad `readGrayBrowser`, que devuelve `{data, width, height}`.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, tool calling, function calling, agentes, vision general, audio ni modo "thinking"; es un pipeline OCR, no un modelo de lenguaje conversacional.

## Casos de uso

- OCR con privacidad por diseno en aplicaciones web: el usuario sube un escaneo y el reconocimiento se ejecuta en su propio navegador con wasm, de modo que la imagen nunca sale del dispositivo. Adecuado para sectores con requisitos estrictos de tratamiento de datos.
- Digitalizacion de documentos en PWAs y aplicaciones offline: al no requerir backend de inferencia, el pipeline puede cachearse y funcionar sin conexion, util para tecnicos de campo o entornos con conectividad limitada.
- Extraccion de texto en gestores documentales: la salida por lineas con `box` y `conf` permite indexar el contenido y, ademas, resaltar la ubicacion del texto sobre la imagen original para revisión humana.
- Revision asistida de formularios y recibos: usando el campo `conf` se pueden marcar automaticamente las lineas de baja confianza para que un operador las valide, reduciendo el coste de correccion manual.
- Accesibilidad: conversion de capturas de pantalla o imagenes escaneadas en texto legible por lectores de pantalla dentro de la propia pagina, sin enviar contenido a terceros.
- Preprocesado en herramientas de escritorio basadas en web (Electron, Tauri con frontend web): normalizacion de rotacion (`orient`) y orden de lectura (`order`) antes de pasar el texto a un pipeline posterior de extraccion de campos.
- Procesamiento de documentos bilingues ingles-chino: activando `cjk: true` se cubre el reconocimiento de caracteres chinos, dentro del alcance declarado por el autor.
- Demos y prototipos sin infraestructura: pruebas de concepto de OCR que solo necesitan un CDN y un navegador, utiles para validar la viabilidad antes de invertir en un servicio de inferencia dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal; la inferencia se ejecuta en CPU mediante WebAssembly dentro del navegador. No se dispone de estimaciones de memoria para el conjunto de modelos ONNX.
- GPU recomendadas: no disponible. El paquete esta planteado para el backend wasm de `onnxruntime-web`; no se documenta uso de WebGPU, WebGL ni aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante para el flujo documentado; el requisito es un navegador moderno con soporte de WebAssembly y modulos ES.
- Memoria RAM del cliente: no disponible (dependera del tamano de los modelos ONNX, que la model card no detalla).
- Opciones de despliegue: `onnxruntime-web` 1.30.0 cargado desde CDN (`https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.wasm.bundle.min.mjs`) o instalado via npm en aplicaciones con bundler. No se documentan otras rutas de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no aplican a este artefacto.
- Multihilo: requiere aislamiento de origen cruzado con cabeceras COOP/COEP; sin ellas el backend wasm corre en monohilo, lo que reduce el rendimiento.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tiempo por pagina ni de lineas por segundo.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tomngdev/indra-ocr-web` | Pesos ONNX + cargador JS para navegador (wasm) | no disponible | no disponible | en, zh | apache-2.0 | HuggingFace, 5 descargas |
| `datalab-to/indra-ocr` | Modelo original (referencia del anterior), etiqueta v3.1.1 | no disponible | no disponible | en, zh | apache-2.0 (segun el artefacto derivado) | HuggingFace |
| Otros motores OCR (por ejemplo, Tesseract u OCR basados en deteccion + reconocimiento) | Binarios o librerias ejecutables en servidor | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de benchmarks ni especificaciones tecnicas de alternativas que permitan una comparacion cuantitativa de precision, latencia o cobertura linguistica. La unica comparacion verificable es la jerarquia entre este paquete y su modelo base: `tomngdev/indra-ocr-web` anade el runtime de navegador y el port del pre/postprocesado, mientras que `datalab-to/indra-ocr` es el origen de los pesos.

## Limitaciones y advertencias

- Cobertura linguistica reducida: solo se declaran ingles y chino; el rendimiento en otras lenguas (castellano incluido) no esta documentado ni garantizado.
- Ausencia total de datos de evaluacion: no hay benchmarks de precision (CER/WER), latencia ni robustez, por lo que cualquier decision de produccion exige una evaluacion propia sobre el dominio objetivo.
- Validacion comunitaria practicamente nula: 5 descargas y 0 likes, con creacion y ultima actualizacion en octubre de 2026; el artefacto es reciente y sin evidencia de uso en produccion.
- Riesgo de error de reconocimiento: como todo sistema OCR, puede confundir caracteres similares, especialmente en textos pequenos, baja resolucion, ruido, manuscrito o caracteres CJK complejos. El campo `conf` por linea deberia usarse para filtrar o marcar revision humana; no debe asumirse texto perfecto.
- Sin garantias sobre el modelo base: la model card de este paquete no documenta el proceso de entrenamiento, los sesgos del dataset ni las limitaciones del reconocedor original; esa informacion debe consultarse en `datalab-to/indra-ocr`.
- Rendimiento dependiente del cliente: sin cabeceras COOP/COEP el backend wasm se ejecuta en monohilo, con lo que la latencia por pagina puede ser considerable en dispositivos modestos. No hay cifras publicadas.
- Carga inicial: los modelos ONNX deben descargarse en el navegador; el repositorio figura como 0.0 GB en HuggingFace, lo que no permite estimar el peso real de los ficheros y, por tanto, el tiempo de primera carga.
- Ambiguedad sobre el contenido del repositorio: el tamano reportado (0.0 GB) es compatible con punteros LFS o con una publicacion incompleta; conviene verificar la lista de ficheros antes de integrar.
- Licencia: apache-2.0 permite uso comercial y modificacion con atribucion, pero debe conservarse el aviso de licencia y verificarse que el modelo base mantiene la misma licencia.
- No apto como sustituto de un LLM: no realiza razonamiento, generacion libre, tool calling ni planificacion de agentes; cualquier flujo que requiera interpretacion semantica necesita un modelo adicional.

## Enlaces

- [HuggingFace: tomngdev/indra-ocr-web](https://huggingface.co/tomngdev/indra-ocr-web)
- [Modelo base: datalab-to/indra-ocr](https://huggingface.co/datalab-to/indra-ocr)
- [Repositorio del paquete Python indra-ocr (datalab-to/indra)](https://github.com/datalab-to/indra)
- [Documentacion de onnxruntime-web](https://onnxruntime.ai/docs/get-started/web)
- [CDN de onnxruntime-web 1.30.0 en jsDelivr](https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/ort.wasm.bundle.min.mjs)

No se han encontrado en la informacion proporcionada otros enlaces relevantes (papers, blogs tecnicos, demos o espacios de HuggingFace) para este modelo.
