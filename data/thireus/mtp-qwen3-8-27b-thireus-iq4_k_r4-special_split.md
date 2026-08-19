# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_K_R4-SPECIAL_SPLIT

## Resumen

Este repositorio contiene una cuantización del modelo Qwen3.8-27B realizada por Thireus mediante su propia herramienta GGUF Tool Suite. El nombre del archivo indica un esquema de cuantización IQ4_K_R4 con un "split especial" (SPECIAL_SPLIT), lo que sugiere una partición de capas optimizada para la inferencia local. El modelo base, Qwen3.8-27B, es un LLM de 27 000 millones de parámetros con una ventana de contexto de 262 000 tokens, arquitectura transformer con encoder de visión integrado y licencia Apache 2.0, según fuentes externas. Esta cuantización concreta se distribuye bajo licencia MIT y en formato GGUF, pensada para ejecutarse en hardware de consumo mediante motores como llama.cpp, Ollama o LM Studio.

La model card del autor no incluye información adicional más allá de la licencia, por lo que los datos específicos de esta versión (perplexity, benchmarks, requisitos exactos) no están disponibles. No obstante, el contexto del modelo base y las características de la cuantización permiten orientar su uso en escenarios de inferencia local con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, con encoder de vision) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 262 000 tokens (modelo base, segun fuentes externas) |
| Tipos de cuantizacion | IQ4_K_R4 (4 bits, con split especial) |
| Idiomas soportados | no disponible (el modelo base Qwen suele ser multilingue, pero no se confirma) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atención de tiempo completo y un encoder de visión integrado, lo que le permite procesar tanto texto como imágenes. Según el artículo de Yottalabs, el modelo fue entrenado con un corpus masivo y posteriormente refinado mediante técnicas de alineación (RLHF/DPO), aunque no se detallan los volúmenes exactos de datos. La cuantización IQ4_K_R4 es un post-proceso que reduce los pesos a 4 bits mediante la técnica de cuantización inteligente (IQ) con un esquema de agrupación K y una variante R4, aplicada con una división especial de capas para optimizar el rendimiento en hardware heterogéneo. No se dispone de información sobre el dataset de entrenamiento específico de esta cuantización ni sobre el proceso de calibración utilizado.

## Capacidades

Las capacidades que se enumeran a continuación corresponden al modelo base Qwen3.8-27B, según fuentes externas. No se han verificado de forma independiente para esta cuantización concreta.

- Generación de texto y razonamiento complejo en múltiples dominios.
- Comprensión y generación de código, con soporte para múltiples lenguajes de programación.
- Razonamiento matemático y resolución de problemas.
- Capacidades de visión: el modelo base incluye un encoder de visión, por lo que puede procesar imágenes y responder preguntas sobre ellas.
- Soporte de tool calling y function calling, lo que permite su integración en flujos de agentes.
- Capacidades multilingües, típicas de la familia Qwen, aunque no se confirma la lista exacta de idiomas.
- Ventana de contexto larga (262k tokens), adecuada para tareas que requieren procesar documentos extensos o conversaciones multi-turno.

## Casos de uso

- Inferencia local en equipos de escritorio: gracias a la cuantización de 4 bits, el modelo puede ejecutarse en GPUs consumer con 12-16 GB de VRAM, permitiendo asistencia personal, generación de texto o análisis de documentos sin conexión.
- Desarrollo de agentes conversacionales: con soporte de tool calling y contexto largo, puede gestionar diálogos complejos con acceso a APIs externas, bases de conocimiento o ejecución de comandos.
- Análisis de documentos extensos: la ventana de 262k tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o libros completos en una sola pasada.
- Generación de código asistida: integrable en entornos de desarrollo (IDEs, pipelines CI/CD) para autocompletar, revisar o documentar código, aprovechando su capacidad de razonamiento y generación de código.
- Aplicaciones de visión y lenguaje: al incluir un encoder de visión, puede utilizarse para tareas de captioning de imágenes, respuesta a preguntas visuales o análisis de capturas de pantalla en entornos de automatización.
- Despliegue en servidores de baja potencia: con motores como llama.cpp o Ollama, puede servir peticiones en CPU o GPU de gama media, adecuado para prototipos o entornos con restricciones de coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. El artículo de Yottalabs menciona que el modelo base Qwen3.8-27B tiene benchmarks publicados, pero no se incluyen los valores en los resultados de búsqueda. Tampoco se dispone de mediciones de perplexity o velocidad de inferencia para la versión IQ4_K_R4. Se recomienda consultar el repositorio del autor o ejecutar pruebas propias para evaluar el rendimiento en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada: para una cuantización de 4 bits de un modelo de 27B, se estima un uso de memoria de aproximadamente 14-16 GB, incluyendo overhead de contexto y activaciones.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como RTX 4080/4090, RTX 3090, A4000 o superiores. También puede ejecutarse en GPUs de 12 GB con cuantización más agresiva o limitando la longitud de contexto.
- Compatibilidad con hardware consumer: sí, es viable en GPUs de gama alta para consumidores, así como en CPUs modernas con suficiente RAM (32 GB o más) usando llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptación para GGUF), SGLang, entre otros.
- Latencia y throughput: no disponibles. Dependen del hardware, la longitud de contexto y el número de peticiones concurrentes. En una RTX 4090, se puede esperar una velocidad de generación de 20-40 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_K_R4-SPECIAL_SPLIT | 27B | 262k (base) | MIT | GGUF | Cuantizacion IQ4_K_R4 con split especial |
| Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT | 27B | 262k (base) | MIT | BF16 | Version en precision BF16, mayor calidad pero mas pesada |
| Thireus/mtp-Qwen3.6-27B-THIREUS-IQ4_KS_R4-SPECIAL_SPLIT | 27B | no disponible | MIT | GGUF | Variante de Qwen3.6 con cuantizacion IQ4_KS |
| Qwen3.8-27B (modelo base) | 27B | 262k | Apache 2.0 | safetensors | Modelo original, requiere mas VRAM |

La comparativa se basa en los nombres de los repositorios y en la información pública. No se dispone de datos de rendimiento comparativo entre estas versiones.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, alucinaciones o limitaciones específicas de esta cuantización. Se asume que hereda las características del modelo base, que pueden incluir sesgos de género, raza o idioma presentes en los datos de entrenamiento.
- La cuantización de 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con la versión BF16, especialmente en tareas de razonamiento complejo o matemáticas.
- No se ha verificado el soporte de tool calling o visión en esta versión cuantizada; es posible que el proceso de cuantización afecte a estas capacidades.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base es Apache 2.0, por lo que se deben respetar los términos de la licencia original si se redistribuye o modifica.
- El nombre "SPECIAL_SPLIT" sugiere una partición de capas no estándar; es recomendable probar la compatibilidad con el motor de inferencia elegido antes de usarlo en producción.
- No hay garantías de soporte o mantenimiento por parte del autor, dado que el repositorio no muestra actividad reciente ni documentación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_K_R4-SPECIAL_SPLIT
- Version BF16 del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Articulo de Yottalabs con especificaciones y requisitos: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Repositorio de Thireus en GitHub: https://github.com/Thireus
