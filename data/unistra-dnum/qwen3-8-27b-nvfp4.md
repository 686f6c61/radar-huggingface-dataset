# unistra-dnum/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una versión cuantizada del modelo Qwen3.8-27B, desarrollada por la Universidad de Estrasburgo (Unistra) mediante la herramienta LLM Compressor. El modelo original pertenece a la familia Qwen3.8 de Alibaba, un modelo de lenguaje causal con encoder de visión que integra comprensión de imágenes y vídeo, razonamiento flexible con modo de pensamiento activable y soporte nativo para tareas agénticas de largo alcance.

Esta variante cuantizada reduce el tamaño del modelo original de 27 000 millones de parámetros a aproximadamente 26,14 GiB mediante cuantización NVFP4 (4 bits de punto flotante), manteniendo la arquitectura Qwen3_5ForConditionalGeneration y la compatibilidad con el ecosistema Transformers, vLLM y SGLang. La cuantización se calibró con el dataset ultrachat_200k, lo que la hace adecuada para despliegue en entornos con restricciones de memoria.

La relevancia de este modelo radica en su combinación de capacidades multimodales (texto, imagen y vídeo) con un tamaño compacto y una licencia Apache 2.0, lo que permite su uso comercial y su integración en pipelines de producción sin costes de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (causal LM con vision encoder) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | NVFP4 (4 bits de punto flotante) |
| Idiomas soportados | No disponible (no especificado en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tambien compatible con GGUF via conversion) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention). La configuración de capas es 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con un total de 64 capas. El Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, mientras que el Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. El feed-forward tiene dimensión intermedia de 17 408 y la salida LM es de 248 320 tokens (padded).

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con Multi-Token Prediction (MTP) entrenado en múltiples pasos. El modelo soporta control flexible del razonamiento mediante parámetros como `reasoning_effort` y `preserve_thinking`, que permiten ajustar la profundidad del pensamiento y retener el contexto de razonamiento en conversaciones históricas. La cuantización NVFP4 se realizó con LLM Compressor sobre el dataset de calibración HuggingFaceH4/ultrachat_200k.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de programación, trabajo profesional, investigación y agentes de largo horizonte.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Modo de pensamiento (thinking mode) activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort`.
- Soporte de tool calling y function calling, integrable en pipelines de agentes autónomos.
- Capacidades agénticas mejoradas: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, TokenSpeed) y con el ecosistema de desarrollo existente.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar, revisar y depurar código en múltiples lenguajes, aprovechando su contexto de 262 144 tokens para manejar repositorios completos o documentación extensa. Su modo de razonamiento permite explicar decisiones de diseño.
- Análisis de documentos técnicos y científicos: gracias a su capacidad de visión, puede extraer información de diagramas, tablas y figuras en papers o informes, y generar resúmenes o responder preguntas específicas sobre el contenido.
- Agente de automatización de tareas empresariales: con soporte de tool calling y planificación autónoma, puede ejecutar flujos multi-paso como gestión de correos, generación de informes o integración con APIs externas, manteniendo el contexto de razonamiento entre pasos.
- Moderación y análisis de contenido multimedia: su capacidad de comprensión de vídeo permite procesar grabaciones de reuniones, tutoriales o vigilancia para extraer transcripciones, detectar eventos o generar resúmenes.
- Chatbot de atención al cliente multilingüe: aunque los idiomas no están especificados, el modelo base Qwen3.8 soporta múltiples idiomas, y su contexto largo permite gestionar conversaciones multi-turno con historial extenso y referencias a documentos adjuntos.
- Investigación académica y generación de hipótesis: puede analizar literatura científica, comparar resultados y proponer experimentos, gracias a su capacidad de razonamiento profundo y su ventana de contexto amplia.

## Benchmarks y rendimiento

La model card del modelo original incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en categorías como coding, pero los valores concretos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks específicos para la versión cuantizada NVFP4. Se recomienda consultar la model card original de Qwen/Qwen3.8-27B para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado ocupa 26,14 GiB en NVFP4, por lo que se recomienda al menos 32 GiB de VRAM para inferencia con contexto estándar. Con contexto de 262 144 tokens, la memoria adicional para caché KV puede superar los 16 GiB, requiriendo GPUs de 48 GiB o más.
- GPU recomendadas: NVIDIA A100 (40/80 GiB), H100 (80 GiB), RTX 4090 (24 GiB) no es suficiente para contexto completo, pero puede funcionar con contextos reducidos o usando offloading a CPU. Para despliegue en producción, se recomiendan A100 o H100.
- Opciones de despliegue: vLLM, SGLang, Transformers con `device_map="auto"`, llama.cpp (si se convierte a GGUF) y Ollama (tras conversión).
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo denso de 27B con cuantización 4-bit, se espera un throughput moderado en GPUs de alta gama, con latencia de decodificación típica para modelos de este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4 | 27B | 262K (ext. 1M) | Apache 2.0 | NVFP4 | Version cuantizada, multimodal |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | No disponible | Modelo base anterior de la misma familia |
| Qwen3.7-Plus | No disponible | No disponible | Propietaria | No disponible | Version de pago de Qwen Cloud |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Alternativa de otro proveedor |

La comparativa se basa en los datos disponibles en la model card. No se dispone de información detallada sobre los modelos alternativos para una comparación exhaustiva.

## Limitaciones y advertencias

- Al ser una cuantización NVFP4 (4 bits), puede existir una pérdida de precisión en tareas de razonamiento complejo o matemático en comparación con el modelo en precisión completa. Se recomienda evaluar en el caso de uso específico.
- La calibración se realizó únicamente con el dataset ultrachat_200k, por lo que el rendimiento en dominios muy diferentes al chat general podría degradarse.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión cuantizada. Como modelo generativo, es susceptible de producir contenido factualmente incorrecto o sesgado.
- El contexto de 1M tokens es una extensión posible, pero requiere hardware de alta capacidad y puede aumentar la latencia significativamente.
- Los idiomas soportados no están especificados, aunque el modelo base Qwen3.8 es multilingüe. Se recomienda verificar el rendimiento en el idioma objetivo antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las normativas de uso de los datos de entrenamiento del modelo original.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/unistra-dnum/Qwen3.8-27B-NVFP4
- Repositorio HuggingFace del modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Servicio Qwen Cloud (para el modelo original): https://www.qwencloud.com/models/qwen3.8-27b
