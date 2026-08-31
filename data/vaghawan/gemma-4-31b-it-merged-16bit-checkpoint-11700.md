# vaghawan/gemma-4-31b-it-merged-16bit-checkpoint-11700

## Resumen

Este repositorio contiene un checkpoint intermedio del modelo `unsloth/gemma-4-31B-it` (Gemma 4 31B instruct) tras un proceso de fine-tuning con LoRA mediante SFT. El autor, `vaghawan`, ha fusionado los adaptadores LoRA del paso de entrenamiento 11700 en los pesos base (`merge_and_unload`), generando un checkpoint completo en `bfloat16` listo para servir con vLLM sin necesidad de cargar adaptadores por separado. El modelo resultante es un `Gemma4ForConditionalGeneration`, es decir, una arquitectura multimodal que procesa tanto texto como imágenes.

La relevancia de este checkpoint radica en que demuestra un flujo de fine-tuning eficiente con Unsloth y TRL, y está orientado a tareas específicas como el chat en hausa y el tool calling, según las métricas de validación reportadas. Al ser un checkpoint intermedio (no el final del entrenamiento), su rendimiento puede no ser óptimo, pero sirve como referencia para evaluar la evolución del modelo durante el entrenamiento. No se han publicado benchmarks estándar, por lo que su evaluación se limita a las pérdidas de validación proporcionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (multimodal, imagen-texto) |
| Parametros totales | 31.273.086.512 (31B) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 256K tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | bfloat16 (16-bit) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero este checkpoint se entreno con hausa e ingles segun las metricas) |
| Licencia | gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, que combina un transformer denso con capacidades multimodales (procesamiento de imagenes y texto). El checkpoint concreto es el resultado de aplicar LoRA (Low-Rank Adaptation) sobre los pesos del modelo base `unsloth/gemma-4-31B-it` y fusionar los adaptadores en los pesos completos. El entrenamiento se realizo con SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace y Unsloth para acelerar el proceso. El paso 11700 corresponde a un punto intermedio del entrenamiento, no al final.

Los datos de entrenamiento no estan publicados, pero las metricas de validacion indican que se incluyeron tareas de chat en ingles, chat en hausa y tool calling. La perdida de tool calling es notablemente baja (0.2108), lo que sugiere que el modelo ha aprendido bien esa tarea especifica. No se menciona el uso de RLHF o DPO; el proceso es exclusivamente SFT con LoRA.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 31B IT, que incluyen razonamiento complejo, matematicas y generacion de codigo.
- Procesamiento multimodal: al ser un `Gemma4ForConditionalGeneration`, puede procesar imagenes junto con texto (por ejemplo, responder preguntas sobre una imagen).
- Tool calling / function calling: el fine-tuning incluyo tareas de tool calling, y la perdida de validacion para esta tarea es muy baja (0.2108), lo que indica un buen aprendizaje.
- Soporte de agentes y multi-step reasoning: el modelo base soporta razonamiento en varios pasos y puede integrarse en pipelines de agentes.
- Capacidades multilingues: el modelo base soporta mas de 140 idiomas, pero este checkpoint se entreno especificamente con hausa e ingles, por lo que su rendimiento en otros idiomas puede degradarse.
- Conversacion: el modelo esta orientado a tareas conversacionales, como indica la etiqueta `conversational`.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones en hausa e ingles, con soporte de tool calling para consultar bases de datos o APIs. Su ventana de contexto (aunque no especificada) permite mantener conversaciones multi-turno.
- Asistentes virtuales con integracion de herramientas: gracias al fine-tuning en tool calling, puede invocar funciones externas (por ejemplo, reservas, busquedas) de forma fiable, como sugiere la baja perdida de tool loss.
- Generacion de codigo asistida: el modelo base Gemma 4 destaca en tareas de programacion; este checkpoint puede usarse en entornos de desarrollo con generacion de codigo y explicaciones.
- Analisis de imagenes con texto: al ser multimodal, puede describir imagenes, extraer informacion o responder preguntas visuales, util en aplicaciones de documentacion o accesibilidad.
- Prototipado de agentes conversacionales: para investigadores que quieran evaluar el impacto del fine-tuning con LoRA en un modelo de 31B, este checkpoint sirve como punto de comparacion en el paso 11700.
- Traduccion y transcripcion en hausa: el entrenamiento especifico en hausa lo hace adecuado para tareas de traduccion o generacion de texto en ese idioma, aunque no se han publicado metricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento son las perdidas de validacion en el paso 11700:

| Metrica | Valor |
|---|---|
| `eval_all_loss` | 0.831619 |
| `eval_anchor_loss` | 0.803829 |
| `eval_english_chat_loss` | 1.123160 |
| `eval_hausa_chat_loss` | 1.198374 |
| `eval_tool_loss` | 0.210816 |

Estas perdidas indican que el modelo ha aprendido bien la tarea de tool calling, pero el chat en ingles y hausa muestra perdidas mas altas, lo que sugiere margen de mejora. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint en `bfloat16` ocupa aproximadamente 62 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) o dos GPUs con tensor parallel (por ejemplo, 2x A100 40GB).
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU con tensor parallel.
- No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente para 62 GB en bf16). Se necesitarian cuantizaciones de menor precision (no disponibles en este repo) para ejecutarlo en hardware de consumo.
- Opciones de despliegue: vLLM (recomendado, con `--enable-auto-tool-choice` y `--tool-call-parser gemma4`), Transformers con `device_map="auto"`. Tambien es compatible con FriendliAI segun la busqueda web.
- Latencia y throughput: no disponibles. Dependera del hardware y de la configuracion de vLLM (por ejemplo, `--max-model-len`).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este checkpoint especifico. Como referencia, el modelo base `unsloth/gemma-4-31B-it` pertenece a la familia Gemma 4, que incluye otros tamanos (E2B, E4B, 12B, 26B A4B). Sin embargo, no hay informacion sobre como se compara este checkpoint con esos modelos en tareas estandar. Se recomienda consultar la documentacion oficial de Gemma 4 para comparativas generales.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; el entrenamiento continuo mas alla del paso 11700 podria mejorar el rendimiento. Usar con precaucion en produccion.
- Sesgos del fine-tuning: el entrenamiento se centro en hausa e ingles, por lo que el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento o generacion de codigo.
- Licencia gemma: la licencia de Google Gemma impone restricciones de uso comercial (por ejemplo, no se permite el uso para ciertos fines o por empresas con mas de 700 millones de usuarios). Revisar los terminos antes de desplegar.
- Contexto no verificado: aunque el modelo base soporta hasta 256K tokens, no se ha confirmado que este checkpoint mantenga esa longitud de contexto. En los ejemplos de vLLM se usa `--max-model-len` de 8192 o 16384, lo que sugiere limitaciones practicas.
- Sin cuantizaciones alternativas: solo se ofrece `bfloat16`, lo que limita su despliegue en hardware con menos VRAM.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vaghawan/gemma-4-31b-it-merged-16bit-checkpoint-11700
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it
- Pagina de FriendliAI (inferencia): https://friendli.ai/models/vaghawan/gemma-4-31b-it-merged-16bit
- Model card oficial de Gemma 4 (Google): https://ai.google.dev/gemma/docs/core/model_card_4
