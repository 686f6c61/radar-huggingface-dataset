# yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep1

## Resumen

yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-14B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se entrena como "memory model", es decir, un modelo especializado en recuperar y sintetizar información a partir de pares de pregunta-respuesta sintéticos generados sobre el corpus BrowseComp-Plus, orientado a tareas de memoria documental y respuesta con contexto recuperado.

El ajuste utiliza la metodología de agrupamiento `hdb_and_entity`, que combina HDBSCAN (con tamaño mínimo de cluster 2) y agrupamiento por entidad (df máximo 3) para construir el conjunto de datos de entrenamiento, compuesto por 3.671.014 ejemplos. Se trata de un checkpoint intermedio: la época 1 de un total de 3 planificadas.

Arquitectura transformer densa de 14.770.033.664 parámetros (100 % entrenables), pesos en bf16 safetensors, licencia Apache 2.0 y compatibilidad con `transformers` y text-generation-inference. Es relevante para quienes investigan modelos de memoria externa y recuperación aumentada, aunque su naturaleza de checkpoint intermedio y la ausencia de benchmarks publicados limitan su uso en producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia durante el entrenamiento); contexto nativo de Qwen2.5-14B-Instruct no especificado en la información disponible |
| Tipos de cuantizacion | no disponibles (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14.770.033.664 parámetros. El ajuste es completo (full fine-tuning con FSDP), con el 100 % de los parámetros entrenables, sobre 8 GPUs AMD Instinct MI325X. Se emplea precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. La tasa de aprendizaje es 2e-05 con decaimiento constante y warmup del 5 %, weight decay de 0,01 y max grad norm de 1,0. El batch efectivo es de 1024 (128 por dispositivo, 1 acumulación, 8 GPUs).

El conjunto de datos son pares de QA sintéticos derivados de BrowseComp-Plus, agrupados mediante el método `hdb_and_entity` (HDBSCAN con tamaño mínimo de cluster 2 más agrupamiento por entidad con df máximo 3), recogidos en el fichero `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`, con 3.671.014 ejemplos. El entrenamiento completo de 3 épocas requirió 12,10 horas de reloj (96,8 GPU-horas); este checkpoint corresponde a la época 1. No se documenta el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-14B-Instruct y ajustada con la plantilla de chat de Qwen.
- Memoria documental: entrenado para responder preguntas a partir de pares QA sintéticos sobre el corpus BrowseComp-Plus, con agrupamiento por entidad y cruce de documentos.
- Razonamiento multi-paso sobre información recuperada, orientado a tareas de recuperación aumentada.
- Capacidades base de Qwen2.5-14B-Instruct (código, matemáticas, instrucciones) presumiblemente conservadas, aunque no verificadas en la información disponible.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Sistemas de memoria externa para asistentes: el modelo se usaría como componente que sintetiza respuestas a partir de documentos recuperados, aprovechando su entrenamiento específico sobre pares QA de BrowseComp-Plus con agrupamiento por entidad.
- Recuperación aumentada (RAG) con contexto largo: con secuencias de hasta 8.096 tokens durante el entrenamiento, puede procesar varios fragmentos de documentos y generar una respuesta consolidada.
- Investigación en modelos de memoria: útil como punto de partida para estudiar cómo el ajuste fino sobre datos sintéticos de QA afecta a la capacidad de retención y recuperación de información.
- Experimentación académica con agrupamiento HDBSCAN y entidades: permite reproducir y comparar la metodología `hdb_and_entity` frente a otras estrategias de construcción de datasets de memoria.
- Evaluación de checkpoints intermedios: al ser la época 1 de 3, sirve para analizar la evolución del aprendizaje de memoria entre épocas.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y en safetensors bf16, puede cargarse con `transformers` y servir de punto de partida para fine-tunings posteriores con `AutoModelForCausalLM.from_pretrained`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14.770.033.664 parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 15 GB; en 4 bits: aproximadamente 8-9 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD Instinct MI325X (usada en entrenamiento); para bf16 en una sola GPU se requiere al menos 40 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16; podría caber en cuantización de 4 bits con margen ajustado, aunque no se documenta soporte de cuantización.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). Soporte de vLLM, llama.cpp u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep1 | 14,77 B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint época 1 de 3, ajuste de memoria |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | no disponible en la información | Apache 2.0 | Hugging Face | Modelo base, instrucciones generales |
| Modelos de memoria comparables | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas equivalentes en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 3), por lo que su rendimiento final puede diferir del modelo completamente entrenado.
- No se han publicado benchmarks ni evaluaciones cuantitativas; el rendimiento real es desconocido.
- Los datos de entrenamiento son sintéticos (pares QA generados sobre BrowseComp-Plus), lo que puede introducir sesgos y artefactos propios del corpus y del proceso de generación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al sintetizar información de documentos recuperados.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- La longitud de contexto de entrenamiento es de 8.096 tokens; secuencias más largas pueden degradar la calidad.
- Aunque la licencia es Apache 2.0, el uso comercial no está validado por evaluaciones de calidad ni por una model card completa.
- El modelo tiene 0 descargas y 0 likes, sin validación comunitaria; úsese con cautela en producción.
- No se documenta soporte de tool calling ni de agentes; no asumir dichas capacidades sin pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Corpus BrowseComp-Plus: no disponible en la información proporcionada
- Paper o blog del método `hdb_and_entity`: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
