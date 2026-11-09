# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep1

## Resumen

Qwen2.5-32B-Instruct-memory-nqa-full-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-32B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta generados a partir de NarrativeQA, un corpus de narrativa (libros y guiones) utilizado habitualmente en tareas de comprension lectora de largo alcance. El checkpoint corresponde a la primera de tres epocas de entrenamiento planificadas.

El modelo hereda la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales, y se distribuye en formato bf16 safetensors (65,5 GB de repositorio). El objetivo del ajuste es dotar al modelo de capacidad para retener y recuperar informacion de contextos narrativos largos, de ahi la etiqueta "memory-model" y el uso de un dataset con 1.276.668 ejemplos sinteticos que combinan fragmentos de documentos cruzados y combinaciones de entidades.

Su relevancia es acotada: se trata de un checkpoint intermedio de un experimento de investigacion, con cero descargas y cero likes en el momento de la consulta, sin model card extendida mas alla de la tabla de entrenamiento y sin datos de evaluacion publicados. Resulta util como referencia para quienes investigan ajuste fino de modelos de 32B para tareas de memoria y recuperacion en narrativa, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con chat template de Qwen |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens (longitud maxima de secuencia durante el entrenamiento); contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), cargable con transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. El ajuste fino es completo (no LoRA ni QLoRA): los 32.763.876.352 parametros son entrenables (100,00%). El entrenamiento se realizo con FSDP sobre 8 GPU AMD Instinct MI325X, con precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La longitud maxima de secuencia fue de 8.096 tokens.

Los hiperparametros documentados son: batch efectivo de 512 (64 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate de 2e-05 con scheduler constante y warmup del 5%, weight decay de 0,01, max grad norm de 1,0 y tres epocas planificadas, de las cuales este checkpoint corresponde a la primera. El tiempo total de entrenamiento para las tres epocas fue de 8,61 horas (68,9 GPU-horas). El dataset es `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 1.276.668 ejemplos sinteticos de pregunta-respuesta construidos a partir de NarrativeQA, incluyendo combinaciones de entidades y referencias cruzadas entre documentos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional con el chat template de Qwen, heredado del modelo base.
- Memoria y recuperacion de informacion en contextos narrativos largos, objetivo explicito del ajuste fino.
- Razonamiento multi-turno sobre documentos extensos, segun el formato de los pares QA de NarrativeQA.
- Capacidades generales del modelo base Qwen2.5-32B-Instruct (codigo, matematicas, instrucciones), potencialmente conservadas pero no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre memoria en modelos de lenguaje: el checkpoint permite analizar como evoluciona la capacidad de retencion de informacion narrativa tras una epoca de ajuste fino con 1,27 millones de ejemplos sinteticos, comparandolo con el modelo base.
- Preguntas y respuestas sobre narrativa larga: el modelo puede responder preguntas sobre libros, guiones o relatos extensos, aprovechando el entrenamiento especifico sobre NarrativeQA para localizar entidades y eventos distribuidos en el texto.
- Analisis de referencias cruzadas entre documentos: el dataset de entrenamiento incluye combinaciones de entidades entre documentos, por lo que el modelo esta preparado para tareas de consolidacion de informacion dispersa en varias fuentes narrativas.
- Generacion de resumenes de tramas: dado un fragmento narrativo, el modelo puede producir resumenes o respuestas que integren informacion de distintos pasajes, una habilidad reforzada por el entrenamiento en memoria.
- Base para experimentos de ajuste fino adicional: al ser un checkpoint intermedio en bf16 con licencia Apache 2.0, sirve como punto de partida para otros investigadores que quieran continuar el entrenamiento o adaptarlo a dominios narrativos propios.
- Evaluacion de tecnicas de entrenamiento con FSDP y hardware AMD: el registro de hiperparametros y del uso de 8 GPU MI325X lo convierte en una referencia practica para reproducir pipelines de full fine-tuning de modelos de 32B en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica requiere al menos 2 GPU de 48 GB o una GPU de 80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 33 GB, viable en una A100 40 GB o en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits (aproximadamente 16-18 GB).
- GPU recomendadas: A100 80 GB, H100 80 GB, 2x A100 40 GB o 2x L40S para bf16; RTX 4090 o RTX 3090 solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) unicamente con cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep1 | 32,76 B | 8.096 tokens (entrenamiento) | apache-2.0 | Checkpoint experimental, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | 32.768 tokens (nativo, segun especificaciones publicas de Qwen2.5) | apache-2.0 | Modelo base oficial, ampliamente utilizado |
| Qwen2.5-72B-Instruct | 72,7 B | 32.768 tokens (nativo) | apache-2.0 | Version superior de la misma familia |
| Modelos de memoria especializados (p. ej. variantes de long-context) | no disponible | no disponible | no disponible | No se dispone de comparaciones verificadas en la informacion proporcionada |

La comparacion directa con alternativas especializadas en memoria no esta disponible en la informacion proporcionada; el unico punto de referencia fiable es el modelo base, del que este checkpoint hereda arquitectura y licencia pero del que se diferencia por el ajuste fino sobre NarrativeQA y por un contexto de entrenamiento limitado a 8.096 tokens.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la epoca 1 de 3, por lo que el entrenamiento no esta completado y el rendimiento puede no representar el estado final del experimento.
- Ausencia total de evaluacion: no hay benchmarks, metricas de perdida ni comparaciones publicadas; no es posible afirmar mejoras sobre el modelo base.
- Contexto de entrenamiento limitado a 8.096 tokens, inferior al contexto nativo de Qwen2.5-32B-Instruct; el uso con contextos mas largos puede degradar el rendimiento en tareas de memoria.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar detalles no presentes en el texto fuente, especialmente en tareas de recuperacion de informacion narrativa.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los sesgos del modelo base y los del corpus NarrativeQA.
- Idiomas soportados no documentados; el entrenamiento se realizo sobre un dataset en ingles (NarrativeQA), lo que puede degradar el rendimiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint experimental sin evaluacion, no se recomienda su despliegue en produccion sin validacion previa.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion independiente.
- El dataset de entrenamiento es sintetico y generado automaticamente, lo que puede introducir artefactos o ruido en las respuestas aprendidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-full-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset NarrativeQA (referencia del corpus): https://huggingface.co/datasets/deepmind/narrativeqa
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
