# thunquant/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo insignia de la familia Qwen3.8, desarrollado por Alibaba Qwen y publicado en agosto de 2026. Se trata del primer modelo de clase Qwen-Max liberado con pesos abiertos, un modelo de lenguaje causal de arquitectura MoE (Mixture of Experts) con 2,4 billones de parámetros totales y aproximadamente 95 mil millones activos por token. Está construido sobre la base arquitectónica de Qwen3.5 e incorpora un backbone híbrido de 92 capas que intercala atención lineal Gated DeltaNet con atención completa Gated Attention, lo que permite gestionar contextos nativos de 262 144 tokens extensibles hasta 1 010 000.

El modelo destaca por sus mejoras integrales en generación de código, trabajo profesional, investigación y tareas agénticas de horizonte largo. Además, introduce control flexible del razonamiento mediante el parámetro `reasoning_effort` y conserva el contexto de razonamiento de mensajes históricos con `preserve_thinking`. Es compatible con los principales motores de inferencia como vLLM, SGLang y TokenSpeed, y ofrece una ventana de contexto de 1M tokens en su versión oficial Qwen3.8-Max a través de la API de Qwen Cloud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2 446 182 725 504 (2,4T) |
| Parametros activos | 95 mil millones (10 expertos activos + 1 compartido) |
| Longitud de contexto | 262 144 nativa, extensible hasta 1 010 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B emplea una arquitectura de MoE híbrida con 92 capas dispuestas en un layout de 23 bloques, cada uno compuesto por 3 unidades de atención lineal Gated DeltaNet seguidas de MoE y 1 unidad de Gated Attention seguida de MoE. La atención lineal utiliza 128 cabezas para V y 16 para QK con dimensión de cabezal 128, mientras que la atención completa usa 64 cabezas para Q y 4 para KV con dimensión 256 y posición rotatoria de 64 dimensiones. El bloque MoE contiene 512 expertos con 10 activos por token más un experto compartido, con dimensión intermedia de 2048.

El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, e incorpora predicción multi-token (MTP) entrenada con múltiples pasos. El embedding de tokens tiene 248 320 entradas (padding incluido) y la salida del LM usa la misma dimensión. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y conversación causal con soporte de razonamiento de múltiples pasos.
- Razonamiento profundo configurable mediante el parámetro `reasoning_effort`.
- Conservación del contexto de razonamiento en mensajes históricos con `preserve_thinking`.
- Ejecución de tareas agénticas de horizonte largo, incluyendo planificación autónoma y manejo de feedback del entorno.
- Capacidades de codificación avanzadas, incluyendo agentes de terminal y resolución de problemas de software.
- Soporte de herramientas (tool calling) y funciones de agente, aunque los detalles específicos de integración no se detallan en la información proporcionada.
- Compatibilidad con vLLM, SGLang y TokenSpeed para despliegue en producción.
- La versión oficial Qwen3.8-Max añade visión, soporte de no-pensamiento y contexto de 1M tokens por defecto.

## Casos de uso

- Desarrollo de agentes autónomos de software: el modelo puede planificar y ejecutar tareas de programación complejas de principio a fin, gestionando feedback de entorno y errores de ejecución en repositorios reales, como demuestra su rendimiento en Terminal Bench 2.1 (86.6) y SWE-bench Pro (80.0).
- Asistente de investigación científica: con su contexto de hasta 1M tokens, puede procesar y razonar sobre corpus extensos de papers, documentación técnica y datos experimentales en tareas de investigación de largo alcance.
- Automatización de operaciones de terminal y administración de sistemas: el modelo puede interpretar y ejecutar comandos en entornos de terminal, útil para scripts de despliegue, diagnóstico de sistemas y orquestación de infraestructura.
- Soporte técnico de nivel experto: su capacidad de razonamiento profundo permite resolver consultas complejas de programación, debugging y arquitectura de software en conversaciones multi-turno con contexto histórico preservado.
- Integración en pipelines de CI/CD: con soporte para vLLM y SGLang, puede actuar como agente de revisión de código, generación de tests y resolución de incidencias dentro de flujos de integración continua.
- Investigación y desarrollo de modelos: como modelo de pesos abiertos, sirve como base para fine-tuning y experimentación en laboratorios académicos y empresariales, aunque su licencia específica debe verificarse para uso comercial.

## Benchmarks y rendimiento

La tabla de benchmarks publicada en la model card del modelo Qwen3.8-Max (versión oficial del mismo modelo base) incluye los siguientes resultados parciales:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| SWE-bench Pro | 69.2 | 80.0 | 64.6 | 60.6 | 80.0 |

Nota: la tabla completa no se ha proporcionado en la información disponible. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval, etc.) en los datos disponibles.

## Requisitos de hardware

- El modelo completo en precisión FP16/BF16 ocupa aproximadamente 4,9 TB de memoria, por lo que requiere un clúster multi-GPU de alta gama.
- Con cuantización de 4 bits se estima un uso de memoria de alrededor de 1,2 TB, lo que sigue exigiendo infraestructura de centro de datos.
- GPUs recomendadas: clústeres de NVIDIA A100 (80 GB) o H100 (80 GB) en configuración multi-GPU; no es viable en GPUs de consumo como RTX 4090 o RTX 5090 de forma individual.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, y compatible con el formato Transformers de Hugging Face.
- La latencia y el throughput dependen fuertemente del hardware y de la configuración de cuantización; no se han publicado cifras oficiales en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T | 95B | 262k-1M | qwen3.7-max (propietaria) | Pesos abiertos |
| Qwen3.7-Max | no disponible | no disponible | no disponible | no disponible | API propietaria |
| Opus 4.7 | no disponible | no disponible | no disponible | no disponible | API propietaria |
| GPT-5.6 Sol (max) | no disponible | no disponible | no disponible | no disponible | API propietaria |

La comparativa con modelos de código abierto de la misma categoría no está disponible en la información proporcionada. Los datos de la tabla anterior provienen de los benchmarks publicados por Qwen, que comparan con modelos propietarios de otras compañías.

## Limitaciones y advertencias

- La licencia `qwen3.7-max` no es una licencia de código abierto estándar; se debe verificar el archivo LICENSE del repositorio para conocer las restricciones de uso comercial y redistribución.
- El modelo tiene un tamaño de 2,4T parámetros, lo que hace impracticable su despliegue en hardware de consumo; requiere infraestructura de centro de datos y costes operativos muy elevados.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones lingüísticas específicas en la información disponible.
- El contexto de 1M tokens es una extensión sobre los 262k nativos; el rendimiento en longitudes de contexto muy largas puede degradarse y requiere pruebas específicas en el caso de uso concreto.
- La versión abierta no incluye capacidades de visión ni el soporte de herramientas oficial de la versión Qwen3.8-Max, que están disponibles solo a través de la API de Qwen Cloud.
- No se ha publicado información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos derivados de la composición de datos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/thunquant/Qwen3.8-2.4T-A95B
- Página oficial del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Análisis de especificaciones y requisitos VRAM: https://apxml.com/models/qwen38-24t-a95b
- Blog oficial de Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
