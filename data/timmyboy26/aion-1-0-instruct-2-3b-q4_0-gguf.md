# timmyboy26/aion-1.0-instruct-2.3b-q4_0-gguf

## Resumen

Aion 1.0 Instruct 2.3B es un modelo de lenguaje de 2.288.831.488 parámetros (aproximadamente 2,3 mil millones) desarrollado por Microsoft, orientado a generación de texto conversacional e instrucciones. Esta ficha cubre específicamente la cuantización Q4_0 en formato GGUF publicada por el usuario timmyboy26, pensada para ejecución local en dispositivos móviles mediante llama.cpp dentro del runtime on-device de LLM Hub.

El modelo base es `microsoft/Aion-1.0-Instruct-2.3B`, del que esta versión es una conversión directa desde los pesos bf16 originales, sin modificaciones más allá de la cuantización. El archivo GGUF ocupa 1.401.770.144 bytes (unos 1,4 GB) con pesos Q4_0 y embeddings de tokens en Q6_K, lo que lo sitúa en el rango de modelos desplegables en teléfonos de gama alta y media.

Su relevancia actual radica en el enfoque en inferencia on-device: el autor publica mediciones reales de velocidad en dispositivos como iPhone 15 Pro Max, Galaxy Tab S9+, Galaxy A56, Redmi Note 13+ y Pixel 10, con backends de GPU (Metal, OpenCL, Vulkan), NPU (Hexagon) y CPU. Es un caso práctico de cuantización agresiva para entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el GGUF declara la arquitectura `aion`, no soportada por llama.cpp estándar) |
| Parametros totales | 2.288.831.488 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información del modelo; en las pruebas se usaron 8192 tokens (Android) y 4096 tokens (iPhone) |
| Tipos de cuantizacion | Q4_0 (pesos), Q6_K (embeddings de tokens); origen bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (texto de Microsoft, "Copyright (c) Microsoft Corporation") |
| Formato de pesos | GGUF (archivo único `Aion-1.0-Instruct-2.3B-Q4_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. El GGUF declara una arquitectura denominada `aion`, que llama.cpp estándar no reconoce todavía: requiere una compilación con el parche de arquitectura `aion` (basado en el `aion-llama.cpp.patch` de Xylolabs). El vocabulario es de aproximadamente 200.000 tokens y la capa de salida usa embeddings atados (tied embeddings).

El proceso de conversión fue: `convert_hf_to_gguf.py --outtype bf16` sobre los pesos bf16 y posteriormente `llama-quantize ... Q4_0`. No se indica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento en el modelo base.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones (pipeline `text-generation`, tag `conversational`).
- Respuesta a preguntas factuales sencillas: en las pruebas responde correctamente "Paris" a la pregunta por la capital de Francia en todos los dispositivos donde la inferencia funciona correctamente.
- Ejecución on-device en llama.cpp con backends de CPU, GPU (Metal, OpenCL, Vulkan) y NPU (Hexagon en Snapdragon).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones móviles: el modelo cabe en 1,4 GB y genera entre 26 y 28 tok/s en un iPhone 15 Pro Max vía Metal, lo que permite diálogos multi-turno fluidos sin conexión a red.
- Procesamiento de texto privado en el dispositivo: al ejecutarse localmente con llama.cpp, los datos no salen del teléfono, lo que resulta adecuado para borradores, resúmenes o clasificación de texto sensible.
- Respuesta a preguntas factuales en apps de productividad: con contexto de 8192 tokens en Android, puede mantener el hilo de una conversación o un documento de trabajo de longitud moderada.
- Prototipado de funciones de IA en hardware de gama media: en un Galaxy A56 (Exynos 1580) alcanza 10,5 tok/s por GPU Vulkan y 9,2 tok/s por CPU, suficiente para tareas asíncronas como autocompletado o generación de respuestas cortas.
- Evaluación de backends de inferencia (CPU vs. GPU vs. NPU): las mediciones publicadas permiten comparar el rendimiento del mismo archivo en Metal, OpenCL, Vulkan y Hexagon, útil para elegir la ruta de ejecución en un producto.
- Integración en el runtime LLM Hub: el archivo está pensado para el runtime on-device de LLM Hub y puede cargarse directamente en esa aplicación (tiempo de carga de 0,7 a 0,9 s en iPhone y de 2,1 a 2,8 s en el Tab S9+ por CPU/NPU).
- Pruebas de regresión de cuantización: al ser una conversión directa desde bf16 con hash SHA-256 publicado, sirve como referencia reproducible para validar pipelines de cuantización Q4_0.

## Benchmarks y rendimiento

Datos medidos por el autor en dispositivos reales con llama.cpp b12613 y el parche `aion`, cargando este archivo exacto. La velocidad es la generación (decode) de un párrafo de unas 150 palabras tras leer el prompt.

| Dispositivo | Chip | Backend | Velocidad de generación | Respuesta a "capital de Francia" |
|---|---|---|---:|---|
| iPhone 15 Pro Max (8 GB) | A17 Pro | GPU (Metal) | 26,0 a 28,1 tok/s | Paris |
| Galaxy Tab S9+ (12 GB) | Snapdragon 8 Gen 2 | NPU (Hexagon) | 21,1 a 21,3 tok/s | Paris |
| Galaxy Tab S9+ (12 GB) | Snapdragon 8 Gen 2 | CPU | 16,6 a 18,7 tok/s | Paris |
| Galaxy Tab S9+ (12 GB) | Snapdragon 8 Gen 2 | GPU (OpenCL, Adreno 740) | 13,4 a 14,1 tok/s | Paris |
| Galaxy A56 | Exynos 1580 | GPU (Vulkan, Xclipse 540) | 10,5 tok/s | Paris |
| Galaxy A56 | Exynos 1580 | CPU | 9,2 tok/s | Paris |
| Redmi Note 13+ | Dimensity 7200-Ultra | GPU (Vulkan, Mali-G610) | 4,6 tok/s | Paris |
| Redmi Note 13+ | Dimensity 7200-Ultra | CPU | 4,6 tok/s | Paris |
| Pixel 10 | Tensor G5 | CPU | pasa (velocidad no registrada) | Paris |
| Pixel 10 | Tensor G5 | GPU (Vulkan, PowerVR) | salida incorrecta, no usable | texto corrupto |

Notas de medición: iPhone y Galaxy Tab S9+ son dispositivos propios, con rango sobre dos ejecuciones; Galaxy A56, Redmi Note 13+ y Pixel 10 son ejecuciones únicas en AWS Device Farm. En Android se usó contexto de 8192 tokens y temperatura 0,1; en iPhone, contexto de 4096 tokens, muestreo greedy y todas las capas en GPU. Tiempos de carga: 0,7 a 0,9 s en iPhone, 2,1 a 2,8 s en el Tab S9+ por CPU y NPU, y 6,5 a 6,9 s en su GPU. En la GPU Snapdragon la capa de salida (embeddings atados, vocabulario de 200k, Q6_K) se ejecuta en CPU en cada token, por lo que la GPU resulta más lenta que la CPU en este modelo.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo GGUF ocupa 1,4 GB; en dispositivos móviles se ejecuta en memoria unificada. En GPU de escritorio, una estimación conservadora es disponer de al menos 2 GB libres para pesos y estado de inferencia.
- GPU recomendadas: no hay datos publicados para A100, H100 o RTX 4090; las mediciones disponibles son exclusivamente móviles (A17 Pro, Snapdragon 8 Gen 2, Exynos 1580, Dimensity 7200-Ultra, Tensor G5).
- Cabe en GPU de consumo: por tamaño (1,4 GB en Q4_0) es desplegable en cualquier GPU de consumo moderna; no se han publicado mediciones en ellas.
- Opciones de despliegue: llama.cpp con el parche de arquitectura `aion` (basado en `aion-llama.cpp.patch` de Xylolabs); runtime on-device de LLM Hub. vLLM, TGI, Ollama y otros motores no están confirmados en la información disponible.
- Latencia y throughput: 26,0 a 28,1 tok/s en iPhone 15 Pro Max (Metal); 21,1 a 21,3 tok/s en Snapdragon 8 Gen 2 (Hexagon NPU); 16,6 a 18,7 tok/s en el mismo chip por CPU; 4,6 tok/s en Dimensity 7200-Ultra. Tiempos de carga de 0,7 a 6,9 s según dispositivo y backend.
- Advertencia de backend: el backend Hexagon NPU solo funciona en Snapdragon; en el Pixel 10 la ruta GPU Vulkan sobre PowerVR produce texto corrupto y debe usarse la CPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras variantes del propio Aion 1.0 Instruct 2.3B en otros formatos, u otros modelos de ~2-3B cuantizados para móvil), por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Aion 1.0 Instruct 2.3B Q4_0 GGUF (esta ficha) | 2.288.831.488 | no disponible (pruebas con 4096-8192) | MIT | GGUF | Hugging Face, runtime LLM Hub |
| microsoft/Aion-1.0-Instruct-2.3B (base) | 2.288.831.488 | no disponible | MIT | safetensors/bf16 (según información disponible) | Hugging Face |
| Alternativas de ~2-3B cuantizadas para móvil | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere una compilación de llama.cpp con el parche de arquitectura `aion`; llama.cpp estándar no reconoce esta arquitectura y no podrá cargar el archivo.
- El backend GPU Vulkan sobre PowerVR del Pixel 10 (Tensor G5) produce texto corrupto; en ese dispositivo hay que usar la CPU.
- En GPUs Snapdragon la capa de salida se ejecuta en CPU en cada token, lo que hace que la GPU sea más lenta que la CPU en este modelo.
- El backend Hexagon NPU solo está disponible en chips Snapdragon; en el resto de dispositivos no hay ruta NPU.
- No hay información publicada sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base.
- No hay datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) que permitan evaluar su fiabilidad en razonamiento, código o matemáticas.
- El contexto máximo real del modelo no está documentado; las pruebas usan 8192 tokens en Android y 4096 en iPhone, sin confirmar que ese sea el límite del modelo.
- La licencia MIT se hereda del modelo base (texto de Microsoft); el autor de la cuantización no está afiliado ni respaldado por Microsoft.
- Algunas mediciones provienen de una sola ejecución en AWS Device Farm (Galaxy A56, Redmi Note 13+, Pixel 10), por lo que su variabilidad no está caracterizada.
- El modelo tiene un número reducido de descargas (124) y ningún "like", lo que indica poca validación por parte de la comunidad.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/timmyboy26/aion-1.0-instruct-2.3b-q4_0-gguf
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Runtime LLM Hub: https://www.llm-hub.app
- Parche de arquitectura `aion` para llama.cpp (Xylolabs): no disponible como URL directa en la información proporcionada
