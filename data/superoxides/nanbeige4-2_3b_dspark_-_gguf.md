# SUPEROXIDES/NANBEIGE4.2_3B_DSPARK_-_GGUF

## Resumen

Nanbeige4.2-3B-DSpark es un modelo de lenguaje compacto desarrollado por el equipo Nanbeige, diseñado específicamente para comportarse como un agente autónomo con capacidades de razonamiento y uso de herramientas. El modelo base, Nanbeige4.2-3B, utiliza una arquitectura Looped Transformer que reutiliza la pila de capas para incrementar la capacidad efectiva sin añadir parámetros, logrando 3B parámetros no-embedding (4B totales) y un rendimiento que supera a modelos significativamente más grandes en tareas agénticas y de razonamiento. Este repositorio en particular contiene las cuantizaciones GGUF del modelo DSpark, que es el modelo de draft (borrador) diseñado para acelerar la inferencia del modelo principal mediante decodificación especulativa, aunque también puede usarse de forma independiente.

La relevancia de este modelo radica en su capacidad para ejecutar tareas agénticas complejas (uso de herramientas, navegación web, edición de código, automatización de oficina) en dispositivos con recursos limitados, como teléfonos móviles o portátiles con GPU de consumo. Su licencia Apache 2.0 permite uso comercial sin restricciones, y el formato GGUF facilita su despliegue con herramientas como llama.cpp, Ollama o LM Studio. El modelo está entrenado desde cero sobre 28T tokens y ha sido refinado mediante SFT con entornos reales y sintéticos, seguido de RL con recompensas de proceso y resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (reutilización de capas) |
| Parametros totales | 4B (3B no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (generadas con llama.cpp build 10729) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.2-3B emplea una arquitectura Looped Transformer que reutiliza el mismo bloque de capas varias veces, aumentando la profundidad efectiva sin incrementar el número de parámetros. Este diseño permite una mayor capacidad de razonamiento manteniendo un tamaño compacto. El modelo fue preentrenado desde cero sobre 28T tokens, y posteriormente refinado mediante SFT con una diversidad de entornos reales y sintéticos, incluyendo integraciones con herramientas reales y scaffolds agénticos variados. El entrenamiento de refuerzo combina recompensas de resultado y de proceso para estabilizar el aprendizaje en un modelo pequeño. El repositorio GGUF corresponde al modelo DSpark, que es la versión draft (borrador) utilizada para decodificación especulativa junto con el modelo principal, aunque también puede ejecutarse de forma independiente.

## Capacidades

- Agente general: uso de herramientas (tool calling), ejecución de tareas multi-paso, navegación web y operaciones con MCP (Model Context Protocol).
- Agente de código: resolución de issues en repositorios (SWE-Bench), edición de archivos, ejecución de comandos en terminal.
- Razonamiento: matemáticas avanzadas, ciencia y lógica, con resultados destacados en GPQA-Diamond (87.4) y HLE (17.8 sin búsqueda).
- Razonamiento agéntico: planificación y ejecución de tareas complejas con múltiples pasos, como las evaluadas en GDPval y Claw-Gym.
- Asistente personal local: integración con scaffolds como OpenClaw para tareas de oficina, investigación y asistencia diaria.
- Multilingüe: soporte para inglés y chino.

## Casos de uso

- Asistente personal local: ejecutar tareas de oficina (creación de documentos, gestión de correos) y búsqueda de información en un portátil o dispositivo móvil, gracias a su tamaño reducido y capacidades agénticas.
- Automatización de tareas de desarrollo: resolver issues de GitHub, generar parches de código y ejecutar tests en pipelines de CI/CD, usando su rendimiento en SWE-Bench Verified (63.6).
- Chatbot de atención al cliente con herramientas: integrar el modelo en un sistema de soporte que pueda consultar bases de datos, APIs internas o realizar transacciones, gracias a su soporte de tool calling y MCP.
- Agente de investigación: realizar búsquedas web, resumir documentos y extraer conclusiones, apoyándose en su razonamiento científico (SciCode 35.6) y su capacidad de uso de herramientas.
- Aplicaciones educativas: tutor interactivo para matemáticas y ciencias, aprovechando su rendimiento en GPQA-Diamond y HMMT.
- Despliegue en edge: ejecutar el modelo cuantizado en dispositivos con pocos recursos (Raspberry Pi, teléfonos) para tareas de generación de texto y razonamiento básico, usando el formato GGUF con llama.cpp.
- Desarrollo de agentes autónomos: construir sistemas que requieran planificación multi-paso y ejecución de acciones en entornos simulados o reales, como los evaluados en Claw-Gym.

## Benchmarks y rendimiento

Según la model card del modelo base, Nanbeige4.2-3B supera a modelos más grandes en la mayoría de benchmarks agénticos y de razonamiento. Los datos publicados son los siguientes:

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B | Gemma4-E4B |
|---|---|---|---|---|---|
| GDPval rubrics | 74.3 | 61.9 | 46.7 | 68.5 | 31.5 |
| Agent-IF-Oneday | 67.5 | 60.4 | 56.9 | — | — |
| Office-QA-Pro | 21.1 | 15.8 | 8.3 | 15.3 | 3.1 |
| Pinch-Bench-V2 | 74.7 | 68.2 | 63.9 | 53.8 | 33.3 |
| Claw-Gym | 65.0 | 56.1 | 53.0 | 40.8 | 16.4 |
| Claw-Eval pass^3 | 52.2 | 47.1 | 36.9 | 25.5 | 15.9 |
| MCP-Atlas | 57.8 | 47.4 | 40.8 | 30.5 | 15.0 |
| SWE-Bench Verified | 63.6 | 53.1 | 38.8 | 44.2 | 14.0 |
| SWE-Bench Pro | 46.9 | 33.8 | 29.4 | 21.9 | 4.0 |
| Terminal-Bench 2.0 | 44.1 | 29.2 | 25.8 | 21.1 | 12.4 |
| HLE w/o Search | 17.8 | 12.5 | 6.8 | 14.8 | 4.0 |
| SciCode | 35.6 | 32.7 | 22.7 | 38.2 | 24.9 |
| GPQA-Diamond | 87.4 | 81.7 | 78.2 | 78.8 | 60.6 |

Nota: los valores de HMMT-Feb-2026 no aparecen en la información disponible. Se recomienda consultar el paper técnico para el conjunto completo de resultados.

## Requisitos de hardware

- Al tratarse de un modelo de 4B parámetros totales (3B no-embedding), las cuantizaciones GGUF típicas (Q4_K_M, Q5_K_M, Q8_0) requieren aproximadamente entre 2 y 4 GB de VRAM para inferencia, dependiendo de la precisión.
- Es ejecutable en GPUs de consumo como RTX 3060 (12 GB) o superiores, y también en CPUs modernas con suficiente RAM (8-16 GB) mediante llama.cpp u Ollama.
- Para decodificación especulativa con el modelo principal Nanbeige4.2-3B, se necesita ejecutar ambos modelos simultáneamente, lo que incrementa los requisitos de memoria.
- Herramientas de despliegue compatibles: llama.cpp (build 10729 o superior), Ollama, LM Studio, llama-cpp-python, y cualquier framework que soporte GGUF.
- No se proporcionan datos oficiales de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Params totales | Contexto | Licencia | Rendimiento agéntico (GDPval) | SWE-Bench Verified |
|---|---|---|---|---|---|
| Nanbeige4.2-3B | 4B | No disponible | Apache 2.0 | 74.3 | 63.6 |
| Qwen3.5-9B | 10B | No disponible | Apache 2.0 (asumido) | 61.9 | 53.1 |
| Gemma4-12B | 12B | No disponible | Gemma license | 68.5 | 44.2 |
| Gemma4-E4B | 8B (4B activos) | No disponible | Gemma license | 31.5 | 14.0 |

El modelo de Nanbeige supera en rendimiento agéntico y de código a alternativas más grandes, con un coste computacional menor. Sin embargo, el contexto exacto no está publicado en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo compacto, puede presentar limitaciones en tareas que requieren conocimiento enciclopédico extenso o razonamiento de muy largo alcance, comparado con modelos de cientos de miles de millones de parámetros.
- La cuantización GGUF puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo en precisión completa (FP16/BF16), especialmente en tareas de razonamiento complejo.
- El modelo está entrenado principalmente en inglés y chino; el rendimiento en otros idiomas no está garantizado.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como cualquier LLM, puede generar contenido incorrecto o sesgado, especialmente en contextos no cubiertos por sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia del modelo base y de las cuantizaciones.
- El modelo DSpark está diseñado como draft para decodificación especulativa; su uso independiente puede ofrecer un rendimiento inferior al del modelo principal en algunas tareas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SUPEROXIDES/NANBEIGE4.2_3B_DSPARK_-_GGUF
- Modelo base (Nanbeige4.2-3B-DSpark): https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Modelo principal (Nanbeige4.2-3B): https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper técnico (arXiv): https://arxiv.org/abs/2607.22083
- Versión HTML del paper: https://arxiv.org/html/2607.22083v1
- Modelo base sin fine-tuning (Nanbeige4.2-3B-Base): https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Análisis de Spark fit para el modelo base: https://howtospark.com/models/Nanbeige/Nanbeige4.2-3B-Base
