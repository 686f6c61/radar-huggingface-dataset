# taha201201/shelf-pulse-ai

## Resumen

ShelfPulse AI es un detector de objetos de tipo dense retail product detection, publicado en Hugging Face por el usuario taha201201 bajo licencia Apache-2.0. Se trata de un modelo derivado de Ultralytics YOLO11 Nano (arquitectura CSPDarknet + C3k2 + SPPF) afinado sobre el conjunto de datos SKU-110K y exportado a NCNN en FP16 mediante PNNX dinámico. Su propósito es contar y localizar productos en lineales de supermercado de forma agnóstica a la clase (no distingue SKU concretas), pensado para ejecutarse íntegramente en dispositivos Android arm64-v8a sin conexión.

El modelo forma parte de una suite mayor denominada ShelfPulse AI, que integra detección densa con SAHI 3×3 Ultra Tiling, seguimiento en tiempo real con ByteTrack-cpp (Kalman 8D + LAPJV), estimación de profundidad de estante (multiplicador 1×–20×), integración ERP vía WorkManager (webhooks genéricos, InvenTree REST, ERPNext) y exportación bilingüe árabe/inglés con soporte RTL. La inferencia se realiza a través de un pipeline nativo C++17 con JNI, con conmutación dinámica entre CPU ARM NEON y GPU Vulkan.

Es relevante para desarrolladores que necesitan auditoría de inventario en el borde (edge), sin dependencia de la nube, con latencias de decenas de milisegundos y capacidad de ejecución sostenida a 30 FPS en hardware móvil de gama media-alta. El modelo es pequeño (YOLO11 Nano), lo que lo hace desplegable en dispositivos consumer y adecuado para escenarios de visión por computador en retail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11 Nano (CSPDarknet + C3k2 + SPPF) |
| Parametros totales | no disponible (YOLO11 Nano, cifra exacta no publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 (exportacion NCNN FP16 via PNNX dinamico) |
| Idiomas soportados | en, ar (interfaz y exportacion bilingue; el modelo en si es de vision) |
| Licencia | apache-2.0 |
| Formato de pesos | NCNN (PNNX dynamic export), FP16 |

## Arquitectura y entrenamiento

El modelo se basa en Ultralytics YOLO11 Nano, una red de deteccion de objetos de una etapa con backbone CSPDarknet, bloques C3k2 y modulo SPPF. La tarea es deteccion densa agnostica a la clase: la salida es un tensor `[1, 5, N]` con coordenadas `cx, cy, w, h` y confianza, sin etiquetas de SKU. El entrenamiento se realizo sobre el conjunto SKU-110K, un dataset de deteccion densa de productos en estantes de retail. No se especifican en la informacion proporcionada el numero de tokens (no aplica), la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a vision).

La innovacion tecnica destacable es el pipeline de despliegue en el borde: exportacion a NCNN FP16 mediante PNNX dinamico, inferencia nativa C++17 con JNI en Android arm64-v8a, conmutacion dinamica entre CPU ARM NEON y GPU Vulkan, y un parser de tensores dinamico con filtro geometrico FP (area, relacion de aspecto) y normalizacion letterbox-unpad a `[0,1]`. Se integra SAHI 3×3 Ultra Tiling (hasta 10 inferencias por imagen) para mejorar el recall en panoramas densos, y ByteTrack-cpp (Kalman 8D + LAPJV) para seguimiento multi-objeto a 30 FPS. Los umbrales por defecto son confianza 0.25 (UI 0.32) y NMS IoU 0.45.

## Capacidades

- Deteccion densa de productos en estantes de retail, agnostica a la clase (no clasifica SKU concretas).
- Conteo de items visibles en lineales, con estimacion de profundidad de estante (multiplicador 1×–20×) para filas traseras.
- Deteccion en tiempo real con seguimiento multi-objeto mediante ByteTrack-cpp (Kalman 8D + LAPJV) a 30 FPS sostenidos.
- Mejora de recall mediante SAHI 3×3 Ultra Tiling (+48% frente a inferencia de una sola pasada, segun el autor).
- Ejecucion 100% offline en Android arm64-v8a, con conmutacion CPU ARM NEON / GPU Vulkan.
- Escaneo de codigos de barras offline integrado (zxing-cpp) y enriquecimiento con Open Food Facts para vinculacion de SKU.
- Exportacion multi-formato: PDF bilingue (AR/EN RTL), JPEG anotado, CSV BOM, JSON 2.2.
- Integracion ERP via WorkManager: webhooks genericos, InvenTree REST, ERPNext Stock Reconciliation.
- Interfaz bilingue arabe/ingles con soporte completo de layout RTL.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Auditoria de inventario en tienda: el modelo detecta y cuenta productos en lineales desde la camara de un movil Android, funcionando 100% offline y con latencia de ~21 ms en CPU NEON o ~54,5 ms en Vulkan GPU, lo que permite recorrer pasillos y obtener recuentos en tiempo real.
- Verificacion de reposicion y planogramas: usando Snap & Verify a 640×640 con SAHI 2×2 o 3×3 Ultra, se comparan los productos detectados con el planograma esperado y se generan alertas de huecos o productos fuera de sitio.
- Conteo de stock en almacen denso: con SAHI 3×3 Ultra (10 inferencias, ~835 ms) sobre panoramas de 1920×1080 se detectan hasta 101 items frente a 57 en una sola pasada, adecuado para inventarios fisicos en almacen.
- Seguimiento de productos en video de auditoria: ByteTrack-cpp mantiene identidades de objetos entre frames a 30 FPS, util para grabar un recorrido de pasillo y post-procesar el conteo sin duplicados.
- Integracion con ERP para reconciliacion de stock: los resultados se envian via WorkManager a InvenTree REST o ERPNext Stock Reconciliation, automatizando el ajuste de inventario tras la auditoria.
- Generacion de informes bilingues para equipos en Oriente Medio: exportacion a PDF con soporte RTL arabe/ingles, CSV BOM y JSON 2.2, facilitando la entrega de resultados a operaciones y finanzas.
- Escaneo de codigos de barras y enriquecimiento de producto: combinacion de deteccion densa con zxing-cpp y Open Food Facts para vincular los items detectados a SKU concretas cuando se requiere granularidad.
- Despliegue en dispositivos de gama media sin conectividad: al ejecutarse en NCNN FP16 sobre arm64-v8a, es viable en moviles Android 8.0+ (API 26+) sin GPU dedicada, usando CPU NEON.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Metrica | Configuracion | Valor |
|---|---|---|
| Recall (items detectados) | Single-Pass 640px | 0,57 |
| Recall (items detectados) | SAHI 2×2 HD | 0,75 |
| Recall (items detectados, normalizado) | SAHI 3×3 Ultra | 1,01 |
| Latencia de inferencia Vulkan GPU (ms) | 320×320 | 15,9 |
| FPS sostenidos | Live Scan, Samsung Note 10 | 30,2 |

Tabla de tiling SAHI sobre panorama de 1920×1080 (Samsung Galaxy Note 10, SM-N970U):

| Modo | Inferencias | Candidatos brutos | Detecciones finales | Latencia total |
|---|---|---|---|---|
| Single-Pass 640px | 1 | 57 | 57 items | ~149 ms |
| SAHI 2×2 HD | 5 | 1.184 | 75 items | ~421 ms |
| SAHI 3×3 Ultra | 10 | 2.460 | 101 items (+77%) | ~835 ms |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible (modelo de vision en NCNN FP16, sin requisitos de VRAM publicados; el autor reporta latencias en movil, no en GPU de escritorio).
- GPU recomendadas: no disponible para escritorio; el autor valida en GPU Vulkan integrada de Samsung Galaxy Note 10 (Adreno/Mali) y CPU ARM NEON.
- Cabe en GPU consumer: no aplica en el sentido habitual; el modelo esta disenado para Android arm64-v8a (API 26+, Android 8.0+), no para GPU de escritorio.
- Opciones de despliegue: NCNN v20241226 (motor principal), pipeline nativo C++17 con JNI, exportacion PNNX dinamica, APK Android v2.4.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput estimados (Samsung Note 10): Live Scan 320×320 en CPU NEON ~21 ms, en Vulkan GPU ~54,5 ms (nota: el benchmark declara 15,9 ms en Vulkan a 320×320, cifra que difiere de la del diagrama; ambas son datos del autor); Snap & Verify 640px ~85 ms; SAHI 2×2 ~421 ms; SAHI 3×3 Ultra ~835 ms; 30,2 FPS sostenidos en Live Scan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShelfPulse AI (YOLO11n-SKU110K-NCNN-FP16) | no disponible (YOLO11 Nano) | 320×320 / 640×640 | Recall 0,57 single-pass; 0,75 SAHI 2×2; 1,01 SAHI 3×3; 30,2 FPS en Note 10 | Apache-2.0 | Hugging Face, APK Android |
| YOLO11 Nano (Ultralytics, base) | ~2,6 M (cifra publica de Ultralytics, no en la informacion) | 640×640 | No comparable directamente (entrenado en COCO, no SKU-110K) | AGPL-3.0 / Enterprise | Ultralytics, Hugging Face |
| Otros detectores SKU-110K | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de comparativas con alternativas especificas de deteccion densa de retail (por ejemplo, variantes de YOLOv8/v9 afinadas a SKU-110K o modelos tipo Detic/OWL-ViT adaptados). Se indica "no disponible" para esos casos.

## Limitaciones y advertencias

- El modelo es agnostico a la clase: no identifica SKU concretas, solo detecta y cuenta productos; la vinculacion a SKU requiere pasos adicionales (codigo de barras, Open Food Facts).
- Riesgo de falsos positivos y negativos en estantes muy densos u ocluidos; el recall single-pass es 0,57, por lo que en produccion conviene usar SAHI 2×2 o 3×3 Ultra.
- La cifra de recall normalizado de 1,01 en SAHI 3×3 Ultra supera 1,0, lo que sugiere una normalizacion no estandar; debe interpretarse con cautela y no como recall absoluto.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- Las latencias reportadas corresponden a un unico dispositivo (Samsung Galaxy Note 10, SM-N970U); el rendimiento en otros moviles puede variar notablemente.
- Idiomas soportados limitados a en y ar en la interfaz y exportacion; el modelo en si no procesa lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base YOLO11 de Ultralytics esta bajo AGPL-3.0/Enterprise; conviene revisar la compatibilidad de licencias antes de un despliegue comercial.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado para tareas de lenguaje.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o el repo esta vacio; verificar antes de usarlo.
- No se documentan sesgos especificos ni composicion del dataset SKU-110K mas alla de su nombre.

## Enlaces

- Hugging Face: https://huggingface.co/taha201201/shelf-pulse-ai
- GitHub: https://github.com/tahadeab-ai/shelf-pulse-ai
- Releases Android (APK v2.4.0): https://github.com/tahadeab-ai/shelf-pulse-ai/releases/latest
- Licencia: https://github.com/tahadeab-ai/shelf-pulse-ai/blob/main/LICENSE
- Logo: https://raw.githubusercontent.com/tahadeab-ai/shelf-pulse-ai/main/docs/assets/logo.svg
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- NCNN (Tencent): https://github.com/Tencent/ncnn
- PNNX: https://github.com/pnnx/pnnx
- SKU-110K dataset: https://github.com/eg4000/SKU110K_CVPR19
- SAHI (Slicing Aided Hyper Inference): https://github.com/obss/sahi
- ByteTrack: https://github.com/ifzhang/ByteTrack
- zxing-cpp: https://github.com/zxing-cpp/zxing-cpp
- Open Food Facts: https://world.openfoodfacts.org/
- InvenTree: https://inventree.org/
- ERPNext: https://erpnext.com/
