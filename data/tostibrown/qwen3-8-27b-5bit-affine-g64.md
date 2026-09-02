# Tostibrown/Qwen3.8-27B-5bit-affine-g64

## Resumen

Tostibrown/Qwen3.8-27B-5bit-affine-g64 es una cuantización MLX de 5 bits en modo affine con group size 64 del modelo Qwen/Qwen3.8-27B, creada por Tostibrown para el servidor de inferencia Mei, un proyecto Swift/MLX para Apple Silicon. El modelo base es un transformer denso de 27.000 millones de parámetros con arquitectura híbrida de atención (linear attention en 48 de sus 64 capas), torre de visión integrada y un cabezal de draft MTP para decodificación especulativa. Su contexto nativo es de 262.144 tokens, extensible a 1M en la versión alojada en Qwen Cloud.

Esta cuantización se produjo directamente desde el checkpoint original de Qwen mediante `mlx_lm.convert`, sin pasar por GGUF ni por el recetario Unsloth Dynamic (UD). El repositorio incluye un archivo de procedencia (`conversion-provenance.json`) que documenta la revisión fuente, el árbol de ficheros, la receta de cuantización y los hashes de salida. La validación realizada con Mei en Apple Silicon confirma la carga del modelo, una velocidad de decodificación de aproximadamente 13 tokens/s y un pico de memoria de 21,93 GB, con un límite de contexto probado de 65.536 tokens.

El interés de este artefacto radica en que ofrece una ruta reproducible y auditable para ejecutar un Qwen3.8-27B en hardware Apple con 5 bits de precisión, sin depender de conversiones de terceros. Está pensado como comparador secundario para el proyecto Mei, no como reemplazo de su modelo principal Ornith-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (linear attention en 48/64 capas, vision tower, MTP draft head) |
| Parametros totales | 26.895.993.856 (aprox. 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base); validado a 65.536 tokens en esta cuantizacion |
| Tipos de cuantizacion | 5-bit affine, group size 64 (g64), dtype bfloat16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multiples idiomas, pero no se detallan en esta cuantizacion) |
| Licencia | No especificada en la cuantizacion; el modelo base Qwen/Qwen3.8-27B es Apache-2.0 |
| Formato de pesos | Safetensors (MLX), 4 shards, 18.5 GB totales |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas emplean atención lineal (linear attention) para reducir el coste computacional en contextos largos, mientras que las 16 restantes usan atención completa. Incluye una torre de visión que permite procesar imágenes y vídeo, y un cabezal MTP (multi-token prediction) que actúa como draft head para decodificación especulativa. El contexto nativo es de 262.144 tokens, ampliable a 1M en la versión alojada.

Esta cuantización MLX se generó con `mlx_lm.convert` a partir de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio original de Qwen. El proceso aplica cuantización affine de 5 bits con group size 64, manteniendo los pesos en bfloat16 para los cálculos. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO) en la documentación de esta cuantización.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de "thinking mode" configurable (el modelo base permite ajustar la profundidad de razonamiento).
- Comprensión multimodal: el modelo base procesa texto, imágenes y vídeo (incluido vídeo de larga duración), aunque esta cuantización no ha sido validada para dichas modalidades.
- Tool calling y function calling: el modelo base soporta invocación de herramientas, lo que permite integrarlo en flujos agénticos.
- Capacidades de agente: razonamiento multi-paso y ejecución de tareas complejas de forma autónoma.
- Soporte multilingüe: el modelo base cubre múltiples idiomas, aunque no se especifican cuáles en esta cuantización.
- Decodificación especulativa mediante el cabezal MTP integrado, que acelera la generación en el modelo original.

## Casos de uso

- Servidor local de inferencia en Apple Silicon: el modelo está diseñado para usarse con Mei, un servidor OpenAI-compatible escrito en Swift/MLX, con chunked prefill, streaming y reutilización de KV-cache. Es adecuado para desplegar un endpoint local de chat o completado en un Mac con suficiente memoria unificada.
- Evaluación de trade-offs memoria/rendimiento: al ser una cuantización 5-bit affine con group size 64, permite comparar la calidad y velocidad frente a otras precisiones (4-bit, 6-bit, GGUF) en la misma arquitectura, útil para decidir la configuración óptima en hardware limitado.
- Reproducción de experimentos: el repositorio incluye metadatos de procedencia completos (revisión fuente, receta de conversión, hashes), lo que facilita reproducir exactamente el artefacto utilizado en validaciones o benchmarks.
- Desarrollo de aplicaciones de chat con contexto largo: con 65.536 tokens validados en esta cuantización (y hasta 262K en el modelo base), puede manejar conversaciones extensas o documentos largos en un Mac.
- Integración en pipelines de generación de código: el modelo base destaca en tareas de programación y soporta tool calling, por lo que puede usarse como asistente de código local, aunque esta cuantización no ha sido específicamente evaluada para ello.
- Investigación en cuantización MLX: sirve como ejemplo de conversión reproducible de un modelo Qwen3.8 a MLX, documentando el proceso y los resultados de validación, útil para quienes estudian el impacto de la cuantización en modelos híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica medicion de rendimiento reportada es la validacion realizada con Mei en Apple Silicon:

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion (hello probe) | 12,81 tokens/s |
| Velocidad de decodificacion (short decode) | 13,28 tokens/s |
| Pico de memoria | 21,93 GB |
| Contexto maximo probado | 65.536 tokens |
| Fallos de SmallVector | 0 |

Estas cifras corresponden a una unica prueba acotada y no constituyen un benchmark exhaustivo. Los resultados variaran segun el modelo de Apple Silicon, la presion de memoria unificada, la configuracion del servidor y la longitud del prompt.

## Requisitos de hardware

- VRAM estimada: pico de memoria de 21,93 GB durante la validacion con Mei, por lo que se recomienda un Mac con al menos 24 GB de RAM unificada (32 GB para margen de seguridad).
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 Pro/Max/Ultra) con 24 GB o mas de memoria unificada. No se han probado en GPU NVIDIA; al ser un formato MLX, su uso esta orientado a Apple.
- Opciones de despliegue: `mlx-lm` (CLI de generacion), Mei (servidor OpenAI-compatible), o integracion directa con la libreria MLX de Apple.
- Latencia y throughput: aproximadamente 13 tokens/s en decodificacion en la prueba realizada, con un pico de memoria de 21,93 GB. No se dispone de datos de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Tostibrown/Qwen3.8-27B-5bit-affine-g64 | 26,9B | 262K (nativo) | MLX 5-bit safetensors | Apache-2.0 (base) | Cuantizacion MLX para Apple Silicon, validada a 65K |
| Qwen/Qwen3.8-27B (original) | 26,9B | 262K | Safetensors (bf16) | Apache-2.0 | Modelo base sin cuantizar, requiere ~54 GB en bf16 |
| unsloth/Qwen3.8-27B-GGUF (Q5_K_M) | 26,9B | 262K | GGUF | Apache-2.0 | Cuantizacion GGUF UD, compatible con llama.cpp/Ollama |

La comparativa se limita a aspectos de formato y despliegue, ya que no se dispone de benchmarks de calidad para ninguna de las variantes. La cuantizacion MLX esta pensada exclusivamente para Apple Silicon, mientras que la GGUF es multiplataforma.

## Limitaciones y advertencias

- La cuantizacion no ha sido sometida a una matriz de paridad completa frente a la referencia GGUF UD; solo se ha validado la carga y generacion acotada.
- No se ha verificado el comportamiento multimodal (vision) en esta cuantizacion; las capacidades de imagen y video pertenecen al modelo base y podrian degradarse o fallar en el formato MLX.
- El contexto maximo probado es de 65.536 tokens, muy por debajo del limite nativo de 262K. No se garantiza un funcionamiento correcto en contextos superiores.
- La licencia del modelo base (Apache-2.0) aplica a esta cuantizacion, pero el autor no ha especificado una licencia propia para el artefacto cuantizado. Se debe revisar el repositorio original de Qwen antes de su redistribucion o uso comercial.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones idiomaticas especificas de esta cuantizacion. Estas dependen del modelo base y no han sido evaluadas en este artefacto.
- El rendimiento (13 tokens/s) es modesto y puede no ser adecuado para aplicaciones de produccion con alta concurrencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tostibrown/Qwen3.8-27B-5bit-affine-g64
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Mei (servidor Swift/MLX): https://github.com/tijs/mei
- Lineup de modelos de Mei: https://github.com/tijs/mei/blob/main/configs/model-lineup.json
- Wrapper de conversion: https://github.com/tijs/mei/blob/main/tools/convert_mlx_quant.py
- Guia local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Pagina de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guia de ejecucion local en GPUs: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
