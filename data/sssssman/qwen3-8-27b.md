# Sssssman/Qwen3.8-27B

## Resumen
Qwen3.8-27B es un modelo denso de lenguaje y visión de 27 781 427 952 parámetros (aproximadamente 27,8 mil millones) publicado por el usuario Sssssman en Hugging Face bajo licencia Apache 2.0. Según su model card, se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y agentes autónomos de horizonte largo. Es un modelo nativo visión-lenguaje, capaz de procesar imágenes y vídeos además de texto.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention) en un patrón híbrido de 64 capas, con una dimensión oculta de 5120 y una dimensión intermedia de FFN de 17 408. Incorpora Multi-Token Prediction (MTP) entrenado con varios pasos y un contexto nativo de 262 144 tokens, extensible hasta 1 000 000. El modelo se distribuye en formato safetensors para transformers, con un tamaño de repositorio de 55,6 GB.

Es relevante porque propone un modelo denso de tamaño medio (27B) con capacidades de visión, control flexible del razonamiento y soporte para despliegue en infraestructuras estándar (vLLM, SGLang, TokenSpeed), lo que lo sitúa en la franja de modelos desplegables en una sola GPU de 80 GB o en configuraciones multi-GPU de consumo. No obstante, el repositorio no incluye información sobre idiomas soportados ni datos verificables de autoría más allá del usuario que lo publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention, 64 capas |
| Parametros totales | 27 781 427 952 (aproximadamente 27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer causal con codificador de visión, con un layout oculto de 16 bloques compuestos por 3 capas de Gated DeltaNet seguidas de 1 capa de Gated Attention, cada una emparejada con su FFN. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120, el FFN tiene dimensión intermedia 17 408 y el vocabulario (embedding y salida LM) es de 248 320 tokens con padding. Incorpora Multi-Token Prediction entrenado con varios pasos, lo que puede habilitar decodificación especulativa o generación multi-token.

Según la model card, el modelo ha pasado por pre-entrenamiento y post-entrenamiento, y está diseñado con control flexible del razonamiento: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento con modo thinking configurable (activado por defecto, desactivable por petición, con `reasoning_effort` ajustable).
- Comprensión nativa de imágenes y vídeos: diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (según la model card, evaluado en Terminal Bench 2.1).
- Planificación autónoma y ejecución de tareas de horizonte largo con manejo de retroalimentación del entorno.
- Soporte de tool calling y function calling implícito en su orientación a agentes y compatibilidad con harnesses de desarrollo.
- Retención del contexto de razonamiento entre mensajes mediante `preserve_thinking`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad de despliegue con transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso
- Agentes de terminal y automatización de DevOps: el modelo puede ejecutar tareas multi-paso en entornos de línea de comandos, interpretar la salida del entorno y corregir su planificación, gracias a su entrenamiento orientado a agentes y a su contexto de 262K tokens.
- Análisis de documentos técnicos y diagramas STEM: al ser un modelo visión-lenguaje nativo, puede extraer información de figuras, tablas y esquemas en papers o manuales, combinando la lectura visual con razonamiento textual largo.
- Comprensión de vídeos de larga duración: con soporte para vídeos de hasta una hora, resulta adecuado para resumir reuniones, analizar grabaciones de clases o revisar material audiovisual de formación.
- Asistencia a la programación en producción: su capacidad de coding y su compatibilidad con harnesses populares permiten integrarlo en pipelines de CI/CD, revisión de código y generación de parches con contexto de repositorio amplio.
- Investigación asistida: con contexto extensible a 1M tokens y modo thinking, puede sintetizar literatura, contrastar hipótesis y mantener hilos de razonamiento largos entre consultas.
- Atención al cliente con contexto largo: la ventana de 262K tokens permite gestionar conversaciones multi-turno con historial extenso y documentación adjunta, incluyendo capturas o imágenes enviadas por el usuario.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con licencia Apache 2.0, puede servirse en una sola GPU de 80 GB o en configuraciones multi-GPU, sin dependencia de APIs externas.

## Benchmarks y rendimiento
La model card incluye una tabla de resultados comparativos, aunque el contenido proporcionado está truncado y solo muestra la cabecera y la primera fila parcial (Terminal Bench 2.1, sin valor numérico legible). Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. No se dispone de los valores numéricos completos en la información proporcionada, por lo que no se presentan cifras que no puedan verificarse.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB o 2× L40S).
- En GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en precisión completa; requeriría cuantización (no documentada en la información disponible) o reparto multi-GPU.
- Opciones de despliegue: transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262K nativo, hasta 1M | Sí (imagen y vídeo) | Apache 2.0 | Hugging Face (repo del usuario Sssssman) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Citado en la model card |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado en la model card (posiblemente API) |
| Muse Glimmer-30B | 30B (aproximado) | No disponible | No disponible | No disponible | Citado en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Citado en la model card (posiblemente propietario) |

No se dispone de datos verificables de parámetros, contexto ni licencia de los modelos comparados más allá de lo citado en la model card; los valores marcados como no disponibles no deben interpretarse como ausencia de la capacidad.

## Limitaciones y advertencias
- El repositorio pertenece al usuario Sssssman y no a una organización oficial de Qwen; la autoría real y la procedencia de los pesos no pueden verificarse con la información disponible.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- No se documentan los datos de entrenamiento, la composición del dataset ni los procesos de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y riesgos de alucinación.
- El modo thinking activado por defecto puede incrementar la latencia y el consumo de tokens en producción si no se desactiva o limita con `reasoning_effort`.
- El contexto extensible a 1M tokens puede degradar la calidad y aumentar el uso de memoria; conviene validar el rendimiento en ventanas largas antes de desplegar.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los pesos no incorporen restricciones adicionales no reflejadas en la model card.
- No hay información sobre cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/Sssssman/Qwen3.8-27B
- Qwen Cloud (servicio gestionado citado en la model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
