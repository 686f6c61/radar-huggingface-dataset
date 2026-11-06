# tuevuong/Nemotron-3.5-Parse-NVFP4

## Resumen

Nemotron-3.5-Parse-NVFP4 es una cuantizacion comunitaria en formato NVFP4 del modelo nvidia/Nemotron-3.5-Parse, un parser de imagenes de documentos desarrollado originalmente por NVIDIA. El modelo base es un VLM especializado en OCR y extraccion estructurada de documentos, compuesto por un encoder visual C-RADIOv4-SO400M y un decodificador de prefijo visual mBART de 10 capas, con aproximadamente 630,8 millones de parametros totales. Esta version cuantizada reduce el peso de 2,4 GiB a 481 MiB (unas 5,2 veces menos) manteniendo una calidad de generacion practicamente identica al modelo en BF16.

El interes de esta ficha radica en que permite ejecutar un parser de documentos de calidad industrial en hardware de consumo con soporte de tensor cores FP4, concretamente GPUs Blackwell como la RTX 5070 Ti. No es una publicacion oficial de NVIDIA, sino una cuantizacion PTQ weight-only realizada por el usuario tuevuong, que conserva la licencia OpenMDW-1.1 del modelo original.

La relevancia actual es doble: por un lado, demuestra que la cuantizacion FP4 a nivel de pesos con escalas por bloque de 16 elementos es viable para tareas de extraccion estructurada sensible a coordenadas; por otro, abre la puerta a pipelines de digitalizacion de documentos en local sin depender de GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: encoder visual C-RADIOv4-SO400M + decodificador de prefijo visual mBART de 10 capas (transformer) |
| Parametros totales | 630.800.504 (~0,63B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, escala FP8-E4M3 por bloque de 16 elementos, escala global FP32 por tensor), weight-only PTQ; modulos preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`), 8-bit, `custom_code` |

## Arquitectura y entrenamiento

El modelo base combina un encoder visual C-RADIOv4-SO400M con un decodificador de tipo mBART de 10 capas que opera sobre prefijos visuales. La salida es texto estructurado con coordenadas de bounding boxes normalizadas, orientado a tareas de parsing de documentos (texto, layout y localizacion de regiones). El checkpoint original se distribuye en F32 y requiere el plugin `vllm_tied_patch` para su ejecucion en vLLM, ya que `embed_tokens` esta atado con `lm_head`.

Esta version concreta aplica una cuantizacion post-entrenamiento (PTQ) weight-only sobre 168 pesos `nn.Linear`: 27 bloques del encoder visual (qkv, proj, fc1, fc2) y 10 capas del decodificador (q/k/v/out_proj, fc1/fc2). Se mantienen en BF16 `embed_tokens` (atado con `lm_head`), las cabezas MTP (`decoder.extra_*`), el patch embedding, `sum_proj`, convoluciones, normas, todos los sesgos y las tablas de posicion. El esquema usa redondeo al vecino mas cercano sobre la rejilla E2M1, escala por bloque de 16 elementos recortada al rango E4M3 y escala global calculada como `448·6/amax`. No se uso datos de calibracion ni fine-tuning posterior.

## Capacidades

- Parsing de imagenes de documentos con salida de texto y bounding boxes normalizadas.
- OCR y extraccion estructurada de contenido a partir de paginas renderizadas.
- Generacion de texto condicionada a imagen (pipeline `image-text-to-text`).
- Soporte conversacional multi-turno segun los tags del repositorio.
- Capacidad de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, vision adicional o audio: no disponible en la informacion.

## Casos de uso

- Digitalizacion masiva de facturas y albaranes: el modelo extrae texto y coordenadas de campos sobre imagenes de pagina, permitiendo mapear importes, fechas y lineas de detalle a un esquema JSON posterior.
- Procesamiento de formularios escaneados: al devolver bounding boxes normalizadas, se puede validar la posicion de cada campo y detectar formularios mal escaneados o rotados.
- Extraccion de tablas en informes financieros: el parser localiza celdas y texto, facilitando la reconstruccion de tablas en pipelines ETL documentales.
- Archivado y busqueda documental: indexar el texto extraido junto con su ubicacion en pagina para busqueda con resaltado de coincidencias.
- Despliegue en estacion de trabajo con GPU Blackwell: al ocupar 481 MiB en FP4, cabe holgadamente en una RTX 5070 Ti y permite procesar lotes de documentos en local sin enviar datos sensibles a la nube.
- Preprocesado para RAG documental: generar texto y layout de PDFs escaneados antes de chunking y embedding, mejorando la calidad de recuperacion frente a OCR plano.
- Automatizacion de back-office en entornos regulados: la ejecucion local con licencia OpenMDW-1.1 facilita el cumplimiento de requisitos de residencia de datos, siempre que se respeten los terminos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta una comprobacion de calidad frente al modelo BF16:

| Metrica | Resultado |
|---|---|
| RMSE relativo medio por tensor cuantizado | ~0,095 |
| Texto generado (greedy) vs BF16 en paginas renderizadas | identico |
| Coordenadas de bbox (normalizadas) vs BF16 | diferencia ~0,001 |
| Similitud de cadena | >= 0,89 |
| Reduccion de tamano | 481 MiB vs 2,4 GiB (~5,2x) |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB para los pesos en FP4; el consumo real depende del runtime, del encoder visual y del tamano de lote de imagenes.
- GPU recomendadas: Blackwell (SM120) con tensor cores FP4, por ejemplo RTX 5070 Ti mediante kernels NVFP4 de FlashInfer. El modelo apunta explicitamente a este hardware.
- Compatibilidad con consumer GPU: si, en GPUs Blackwell. En generaciones anteriores (Ampere, Ada) no se garantiza la aceleracion FP4 nativa; podria requerir de-cuantizacion o fallback.
- Opciones de despliegue: transformers (libreria declarada), vLLM con el plugin `vllm_tied_patch` del modelo base; otros runtimes que lean `nvfp4-pack-quantized` de compressed-tensors.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tuevuong/Nemotron-3.5-Parse-NVFP4 | ~0,63B | no disponible | NVFP4 (safetensors) | OpenMDW-1.1 | Cuantizacion comunitaria, requiere Blackwell para FP4 nativo |
| nvidia/Nemotron-3.5-Parse | ~0,63B | no disponible | F32 | OpenMDW-1.1 | Modelo base oficial, 2,4 GiB, requiere plugin para vLLM |
| Alternativas de parsing documental de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Es una cuantizacion no oficial: no procede de NVIDIA y no cuenta con validacion del fabricante.
- La cuantizacion es weight-only PTQ sin calibracion; aunque la comprobacion reportada es favorable, puede degradar casos limite no cubiertos (documentos densos, tipografias raras, tablas complejas).
- La aceleracion FP4 depende de hardware Blackwell y de kernels especificos (FlashInfer); en otras GPUs el rendimiento puede ser peor que el del modelo BF16.
- El modelo base exige el plugin `vllm_tied_patch` para funcionar en vLLM; sin el, la carga puede fallar.
- Riesgo de alucinacion en texto OCR: como cualquier VLM, puede generar contenido plausible no presente en la imagen.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingue sin evaluacion previa.
- Longitud de contexto no disponible; documentos muy largos pueden requerir paginacion manual.
- Licencia OpenMDW-1.1: revisar los terminos antes de uso comercial; los derechos sobre los pesos pertenecen a NVIDIA.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tuevuong/Nemotron-3.5-Parse-NVFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Model card original con benchmarks y ejemplos de uso: https://huggingface.co/nvidia/Nemotron-3.5-Parse
