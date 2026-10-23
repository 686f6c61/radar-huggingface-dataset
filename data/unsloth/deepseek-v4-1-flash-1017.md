# unsloth/DeepSeek-V4.1-Flash-1017

## Resumen

DeepSeek-V4.1-Flash-1017 es una actualización menor de DeepSeek-V4.1-Flash, el modelo multimodal de DeepSeek-AI publicado originalmente bajo licencia MIT. Esta revisión se centra en mejoras de razonamiento, generación de código, tareas agénticas y benchmarks visuales, y según la model card reduce además el tiempo de ejecución de tareas y la longitud de las salidas, lo que se traduce en menor coste por tarea. El repositorio analizado es una redistribución de unsloth en formato transformers/safetensors.

El modelo declara 763.205.315.794 parámetros (unos 763,2 mil millones) según los tensores en safetensors, con un repositorio de 510,3 GB, y una ventana de contexto de 1.000.000 de tokens con `max_tokens` recomendado igual o superior a 256K. El pipeline declarado es `image-text-to-text`, por lo que acepta imágenes intercaladas en la conversación además de texto, y soporta modo de razonamiento (thinking) con esfuerzo numérico configurable, llamadas a herramientas y mensajes de sistema intercalados a mitad de conversación.

Su relevancia ahora mismo está en la combinación de contexto de un millón de tokens, capacidades agénticas de terminal y repositorio (Terminal-Bench 4.0: 42,3; DeepSWE v1.1: 77,0) y licencia MIT permisiva, con una reducción de coste frente a la versión anterior. La cita del autor sugiere que el informe técnico se titula "Pushing the Limits of KV Cache Compression", lo que apunta a la compresión de caché KV como línea de trabajo principal para sostener el contexto de 1M tokens.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el pipeline declarado es `image-text-to-text` y la etiqueta de arquitectura es `deepseek_v41` |
| Parámetros totales | 763.205.315.794 (~763,2 mil millones), según safetensors |
| Parámetros activos | No disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tokens máximos de salida | ≥ 256K (valor recomendado en la model card) |
| Tipos de cuantización | FP8 / 8-bit (etiquetas del repositorio); no se detallan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (librería transformers) |
| Tamaño del repositorio | 510,3 GB |
| Parámetros de muestreo recomendados | `temperature` = 1.0, `top_p` = 1.0 |
| Plantilla de chat | No incluye plantilla Jinja; se proporciona `encoding/encoding.py` como implementación de referencia |
| Descargas / likes | 759 descargas, 12 likes |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-19 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, tipo de atención, uso de MoE, composición del dataset ni volumen de tokens de entrenamiento). Lo que sí se documenta es el pipeline multimodal `image-text-to-text`, la aceptación de contenido de imagen intercalado en la conversación y la existencia de un modo de razonamiento con esfuerzo numérico configurable. La cita bibliográfica del autor, "DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression", indica que la compresión de la caché KV es la innovación técnica central, coherente con una ventana de contexto de 1M tokens.

En el plano del formato de prompts, esta versión no incluye plantilla de chat en formato Jinja. En su lugar, el repositorio publica la carpeta `encoding` con una implementación de referencia en Python (`encoding.py`) que cubre conversaciones multi-turno, llamadas a herramientas, modo thinking, esfuerzo de razonamiento numérico, mensajes de sistema a mitad de conversación y contenido de imagen intercalado. Para producción se referencia `deepseek-recipe`, un conjunto de librerías en Rust con bindings de Python que convierten peticiones de Messages, Chat Completions y Responses API al formato Conversation, las codifican a prompts o token IDs de DeepSeek V4 y V4.1, y parsean la salida del modelo (incluyendo thinking, tool calls, imágenes y parámetros de generación). No se han publicado datos sobre RLHF, DPO u otras etapas de alineación en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, con modo thinking y esfuerzo de razonamiento numérico configurable (los tests de `encoding.py` cubren ambos).
- Generación y comprensión de código, con resultados publicados en Terminal-Bench 4.0, DeepSWE v1.1, ProgramBench y NL2Repo-Bench.
- Capacidades agénticas: ejecución de tareas multi-paso, uso de herramientas y trabajo en entornos de terminal (harness Claude Code para Terminal-Bench 4.0, Mini-SWE-V2 para DeepSWE v1.1).
- Llamadas a funciones y herramientas (tool calling) integradas en el formato de prompt y en `deepseek-recipe`.
- Comprensión de imágenes: pipeline `image-text-to-text`, con contenido de imagen intercalado en la conversación y resultados en Chartography, BabyVision y ZeroBench-main con herramientas.
- Contexto largo: ventana de 1M tokens para conversaciones, documentos y repositorios extensos.
- Mensajes de sistema intercalados a mitad de conversación, lo que permite cambiar instrucciones sin reiniciar el contexto.
- Capacidades multilingües: no disponibles como dato explícito; la model card no enumera idiomas.

## Casos de uso

- Agentes de codificación en terminal: el modelo está evaluado con harness tipo Claude Code (Terminal-Bench 4.0: 42,3) y Mini-SWE-V2 (DeepSWE v1.1: 77,0), por lo que encaja en flujos donde el agente ejecuta comandos, inspecciona errores y aplica parches sobre un repositorio real.
- Reconstrucción y navegación de repositorios completos: con 68,2 en NL2Repo-Bench y 1M tokens de contexto, puede ingerir árboles de proyecto amplios y responder preguntas de arquitectura o localizar puntos de cambio sin trocear el código.
- Automatización de tareas de oficina y RPA: los resultados en Automation-Bench v1.0.6 (60,5) y Agents' Last Exam (35,4) lo sitúan como candidato para orquestar acciones sobre aplicaciones mediante tool calling.
- Extracción de datos de gráficos e infografías: Chartography con herramientas alcanza 83,0, útil para convertir capturas de paneles o informes en tablas estructuradas dentro de un pipeline ETL.
- Atención al cliente multi-turno con contexto largo: la ventana de 1M tokens permite mantener el histórico completo de una cuenta o un caso de soporte, y los mensajes de sistema intercalados permiten reajustar políticas a mitad de conversación sin perder el hilo.
- Control de coste por razonamiento adaptativo: el esfuerzo de razonamiento numérico permite asignar presupuesto bajo a tareas triviales y alto a tareas complejas, con una `temperature` recomendada de 1.0 y salidas de hasta 256K tokens.
- Análisis de documentación técnica con imágenes: al aceptar imágenes intercaladas, puede procesar manuales, diagramas y capturas junto al texto en una misma conversación (ZeroBench-main con herramientas: 51,0).
- Asistente de refactorización en CI/CD: integrable vía API compatible con endpoints y con `deepseek-recipe` para parsear tool calls en streaming, revisando diffs y proponiendo cambios antes de fusionar.

## Benchmarks y rendimiento

Resultados publicados en la model card (autorreportados por el autor del modelo):

| Benchmark | DS-V4.1-Flash-1017 | DS-V4.1-Flash | K3 | GLM-5.3 | GPT-5.6 Sol | Opus 5 |
|---|---|---|---|---|---|---|
| HLE sin herramientas | 42,6 (44,0†) | 36,8 (39,1†) | 43,5 | 42,0† | 44,5 | 56,3 |
| Terminal-Bench 4.0 | 42,3 | 31,2 | 12,6 | 37,9 | 39,9 | 51,8 |
| DeepSWE v1.1 | 77,0 | 74,2 | 67,5 | 66,9 | 73,0 | 74,0 |
| ProgramBench | 29,1 | 20,3 | 17,5 | 19,0 | 23,0 | 37,0 |
| NL2Repo-Bench | 68,2 | 65,4 | 58,0 | 58,0 | 56,8 | 75,3 |
| Automation-Bench v1.0.6 | 60,5 | 54,8 | 46,7 | 48,8 | 45,8 | 50,3 |
| Agents' Last Exam | 35,4 | 31,8 | 27,6 | 28,5 | 26,7 | 28,6 |
| Apex Bench v1.1 | 72,1 | 64,6 | 47,8 | 56,6 | 54,3 | 65,8 |
| Chartography (con herramientas) | 83,0 | 78,9 | 68,1 | — | 79,9 | 84,0 |
| BabyVision (con herramientas) | 92,5 | 89,6 | 85,7 | — | 88,9 | 94,1 |
| ZeroBench-main (con herramientas) | 51,0 | 49,0 | 41,0 | — | 53,0 | 52,0 |

† Subconjunto de HLE solo texto. Terminal-Bench 4.0 se ejecuta con el harness Claude Code y DeepSWE v1.1 con Mini-SWE-V2. No se han publicado resultados de MMLU, GSM8K ni HumanEval en la información disponible.

## Requisitos de hardware

- Pesos en FP8: ~763 GB solo para los parámetros, más caché KV y activaciones. No cabe en una única GPU de 80 GB; requiere un nodo multigpu (estimación calculada a partir del número de parámetros, no publicada por el autor).
- Pesos en 4 bits: ~382 GB teóricos, lo que exigiría al menos 5 GPU de 80 GB solo para pesos, sin margen para caché KV de contexto largo (estimación propia).
- GPU recomendadas: H100 80 GB o A100 80 GB en configuraciones de 8 o más unidades para FP8; H200/B200 si se quiere mantener contexto de 1M tokens con holgura de memoria.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090 24 GB, RTX 5090 u similares). Tampoco en una estación de 8× RTX 4090 (192 GB) en FP8.
- Despliegue: el repositorio incluye la carpeta `inference` con instrucciones de conversión de pesos e inferencia local; el formato es transformers/safetensors. No hay GGUF publicado, por lo que llama.cpp u Ollama no son viables sin una cuantización propia. Para servir en producción se recomienda vLLM o TGI sobre el checkpoint convertido, y `deepseek-recipe` para el encoding de prompts y el parseo de salidas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HLE sin herramientas | Terminal-Bench 4.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 | 763,2 mil millones | 1M tokens | 42,6 | 42,3 | MIT | Pesos abiertos en HuggingFace |
| DeepSeek-V4.1-Flash | No disponible | No disponible | 36,8 | 31,2 | MIT (según repositorio referenciado) | Pesos abiertos en HuggingFace |
| K3 | No disponible | No disponible | 43,5 | 12,6 | No disponible | No disponible |
| GLM-5.3 | No disponible | No disponible | 42,0† | 37,9 | No disponible | No disponible |
| GPT-5.6 Sol | No disponible | No disponible | 44,5 | 39,9 | No disponible (propietario) | No disponible |
| Opus 5 | No disponible | No disponible | 56,3 | 51,8 | No disponible (propietario) | No disponible |

La comparativa se limita a los benchmarks publicados en la model card: no se dispone de parámetros, contexto ni licencia de los modelos de referencia en la información proporcionada. Frente a la versión anterior, las ganancias más marcadas son Terminal-Bench 4.0 (+11,1 puntos), ProgramBench (+8,8) y Apex Bench v1.1 (+7,5).

## Limitaciones y advertencias

- No incluye plantilla de chat Jinja: es obligatorio usar `encoding/encoding.py` o `deepseek-recipe` para un formato de prompt correcto; un formato incorrecto degrada la calidad y rompe el tool calling.
- No hay datos publicados sobre idiomas soportados, por lo que la calidad en castellano o en lenguas cooficiales no está garantizada y debe evaluarse antes de producción.
- Riesgo de alucinación estándar en modelos generativos, especialmente en HLE sin herramientas (42,6), donde queda por debajo de varios de los modelos comparados.
- El benchmark de agentes de terminal es sensible al harness: los resultados de Terminal-Bench 4.0 usan Claude Code y los de DeepSWE v1.1 usan Mini-SWE-V2; reproducirlos con otro harness puede dar cifras distintas.
- Todos los benchmarks están autorreportados por el autor del modelo y no se han verificado de forma independiente en la información disponible.
- El tamaño (763,2 mil millones de parámetros) implica un coste de despliegue alto: no es viable en hardware de consumo ni en estaciones de trabajo convencionales.
- La licencia MIT permite uso comercial y modificación, pero el repositorio analizado es una redistribución de unsloth, no el repositorio oficial; conviene verificar la procedencia e integridad de los pesos antes de usarlos en producción.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.
- El rendimiento real con 1M tokens de contexto depende de la compresión de caché KV, cuya tasa y efecto sobre la calidad no se documentan en detalle.
- El repositorio ocupa 510,3 GB, lo que implica requisitos de almacenamiento y tiempos de descarga considerables.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Repositorio analizado: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Informe técnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Toolkit de encoding de prompts: https://github.com/deepseek-ai/deepseek-recipe
- Implementación de referencia del encoding: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017/tree/main/encoding
- Instrucciones de inferencia y conversión de pesos: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017/tree/main/inference
- Licencia MIT: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Página corporativa: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Cuenta de Twitter/X: https://twitter.com/deepseek_ai
