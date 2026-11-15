# yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep1

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep1` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model", es decir, un modelo especializado en recuperar y razonar sobre información almacenada en memoria a partir de pares sintéticos de pregunta-respuesta generados sobre BrowseComp-Plus, un conjunto de datos orientado a preguntas de navegación web y recuperación de información. El checkpoint publicado corresponde a la época 1 de un total de 3 épocas de entrenamiento.

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con 1.543.714.304 parámetros (1,5B), pesos en bf16 safetensors y compatibilidad directa con `transformers` mediante `AutoModelForCausalLM`. El contexto de entrenamiento se fijó en 8.096 tokens, aunque la longitud de contexto nativa del modelo base Qwen2.5-1.5B-Instruct es de 32.768 tokens (dato del modelo base, no verificado en esta ficha). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo es acotada: se trata de un experimento de investigación sobre memoria y agrupamiento semántico (clustering con HDBSCAN y agrupación por entidades) aplicado a un modelo pequeño. No es un modelo de propósito general ni compite con modelos frontera; su interés radica en la metodología de construcción del dataset y en el uso de hardware AMD Instinct MI325X para el entrenamiento. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia en entrenamiento); contexto nativo del modelo base no verificado |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni QLoRA) del checkpoint Qwen2.5-1.5B-Instruct. La arquitectura es la de Qwen2.5: un transformer decoder-only con atención causal estándar, sin innovaciones de atención lineal ni SSM. El entrenamiento se realizó con FSDP (Fully Sharded Data Parallel) sobre 8 GPUs AMD Instinct MI325X, con precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente. Los 1.543.714.304 parámetros fueron entrenables al 100%, lo que confirma un full fine-tuning y no una adaptación parametrizada eficiente.

El dataset de entrenamiento es un conjunto sintético de 3.671.014 ejemplos generado sobre BrowseComp-Plus, con un método de agrupamiento denominado `hdb_and_entity`: HDBSCAN con tamaño mínimo de cluster 2 combinado con agrupación por entidades con frecuencia documental máxima de 3 (max df 3). El fichero de datos se identifica como `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`. Los hiperparámetros incluyen batch efectivo de 1024 (128 por dispositivo, 1 acumulación, 8 GPUs), learning rate de 2e-05 constante con warmup del 5%, weight decay de 0.01, max grad norm de 1.0 y 3 épocas totales (el checkpoint publicado es la época 1). El entrenamiento completo de las 3 épocas supuso 2,35 horas de reloj (18,8 GPU-horas). No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Qwen2.5-1.5B-Instruct, con plantilla de chat Qwen.
- Memoria y recuperación de información: entrenado específicamente como memory model sobre pares QA sintéticos de BrowseComp-Plus, orientado a tareas de recuperación y razonamiento sobre información almacenada.
- Razonamiento multi-paso sobre documentos: el dataset de entrenamiento incluye combinación de entidades entre documentos (cross-doc entity combination), lo que sugiere capacidad de integrar información de múltiples fuentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero no se verifica en este ajuste).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Recuperación aumentada de memoria en asistentes conversacionales: el modelo puede gestionar conversaciones multi-turno donde debe recordar y recuperar información previa, gracias a su entrenamiento específico como memory model sobre pares QA. Adecuado para prototipos de asistentes con memoria persistente.
- Sistemas de pregunta-respuesta sobre documentación técnica: entrenado con combinación de entidades entre documentos, puede integrar información de varias fuentes para responder consultas que requieren cruzar datos.
- Investigación en metodologías de clustering para datasets de entrenamiento: el modelo sirve como artefacto reproducible para estudiar el efecto del agrupamiento HDBSCAN + entidades en el rendimiento de modelos de memoria.
- Experimentación académica con hardware AMD: el entrenamiento se realizó en 8x AMD Instinct MI325X, por lo que el checkpoint es útil como referencia para reproducir pipelines de fine-tuning en ROCm.
- Clasificación y agrupación semántica de consultas: aunque no es un modelo de embeddings, su entrenamiento con agrupamiento por entidades puede aprovecharse para tareas de desambiguación de entidades en pipelines de NLP.
- Base para fine-tuning posterior en dominios específicos: al ser un full fine-tuning con licencia Apache 2.0 y pesos safetensors, puede servir como punto de partida para ajustes adicionales en tareas de memoria o QA documental.
- Evaluación de alucinación en modelos pequeños de memoria: útil en investigación para medir hasta qué punto un modelo de 1,5B entrenado con datos sintéticos recupera información fielmente frente a inventarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1,543B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100 o AMD Instinct MI325X (el hardware de entrenamiento). Cabe en GPUs de consumo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (método documentado por el autor); compatible con text-generation-inference según los tags; vLLM, llama.cpp u Ollama no están verificados en la información proporcionada, aunque al ser un modelo Qwen2 estándar en safetensors deberían poder convertirse.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep1 | 1,5B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Memory model especializado, checkpoint época 1 de 3 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (nativo) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instructivo generalista |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 (nativo) | Apache 2.0 | Hugging Face | Modelo base sin ajuste instructivo |
| Modelos de memoria especializados de mayor tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas para este ajuste concreto |

La comparativa se limita al ecosistema Qwen2.5 porque no se han identificado en la información proporcionada otros modelos de memoria del mismo tamaño con metodología comparable. El ajuste sacrifica generalidad (contexto de entrenamiento de 8.096 tokens frente a 32.768 del base) a cambio de especialización en recuperación de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base Qwen2.5-1.5B-Instruct, es probable que arrastre sesgos de sus datos de preentrenamiento, pero no se especifica.
- Riesgo de alucinación: alto en modelos de 1,5B, especialmente en tareas de memoria donde el modelo puede confundir información recuperada con información inventada; el entrenamiento sobre datos sintéticos puede amplificar este riesgo.
- Limitaciones de contexto: la longitud máxima de secuencia en entrenamiento es de 8.096 tokens, inferior al contexto nativo del modelo base; no se garantiza un rendimiento correcto más allá de esa longitud.
- Limitaciones de idioma: no se especifican los idiomas soportados; el dataset BrowseComp-Plus está orientado a contenido web en inglés, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no hay restricciones adicionales documentadas.
- Caveat de producción: es un checkpoint intermedio (época 1 de 3) de un experimento de investigación con 0 descargas; no se ha validado su robustez en producción ni se han publicado evaluaciones. No se recomienda su uso en sistemas críticos sin una evaluación propia.
- El modelo es solo texto; no soporta visión, audio ni otras modalidades.
- No se documenta soporte de tool calling ni de agentes en este ajuste concreto, aunque el modelo base sí lo soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: no disponible en la información proporcionada
- Paper de Qwen2.5: no disponible en la información proporcionada
- Dataset BrowseComp-Plus: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
