# yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep3

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon y publicado bajo licencia Apache 2.0. El modelo se ha entrenado como "memory model", es decir, un modelo especializado en recuperar y razonar sobre información procedente de pares sintéticos de pregunta-respuesta generados a partir de BrowseComp-Plus, un conjunto de datos orientado a tareas de comprensión y memoria sobre documentos. El checkpoint publicado corresponde a la época 3 de 3 de un entrenamiento que utiliza la estrategia de agrupación de entidades `entity_grping` (entity grouping, con un máximo de frecuencia documental de 3).

La relevancia de esta ficha es acotada: se trata de un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card extendida ni resultados de benchmarks publicados. No obstante, su interés técnico reside en que documenta un pipeline de ajuste fino completo sobre 3.046.524 ejemplos sintéticos, con una longitud máxima de secuencia de 8096 tokens y un coste de 15,4 GPU-horas en 8 aceleradores AMD Instinct MI325X, lo que lo convierte en un caso práctico de entrenamiento eficiente sobre hardware AMD.

Arquitectónicamente hereda la estructura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales (100 % entrenables en este ajuste) y pesos en bf16 safetensors compatibles con `transformers`. Su utilidad principal es como base para experimentos de memoria y recuperación de información en contextos conversacionales, no como modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8096 tokens de longitud máxima de secuencia durante el entrenamiento; contexto nativo del modelo base no confirmado en la información disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y 1.543.714.304 parámetros. El ajuste se realizó mediante full fine-tuning con FSDP (Fully Sharded Data Parallel), entrenando el 100 % de los parámetros. La precisión fue bf16 con gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente, lo que es coherente con un objetivo de generación conversacional supervisada.

Los datos de entrenamiento proceden de pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus, con la estrategia de agrupación de entidades `entity_grping` (máximo df 3) y un total de 3.046.524 ejemplos. El entrenamiento se ejecutó durante 3 épocas con un batch efectivo de 1024 (128 por dispositivo, 1 acumulación, 8 GPUs), learning rate constante de 2e-05 con warmup ratio 0.05, weight decay 0.01, max grad norm 1.0 y longitud máxima de secuencia de 8096 tokens. El coste total fue de 1,93 horas de reloj (15,4 GPU-horas) sobre 8 AMD Instinct MI325X. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del pipeline de datos y el ajuste completo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct y reforzada con pares QA sintéticos.
- Memoria y recuperación de información: el modelo está entrenado explícitamente como "memory model" sobre pares de pregunta-respuesta derivados de BrowseComp-Plus, orientado a tareas de comprensión y recuerdo de contenido documental.
- Razonamiento sobre entidades: la estrategia de clustering `entity_grping` sugiere un entrenamiento orientado a agrupar y relacionar entidades a través de documentos.
- Soporte de plantilla de chat de Qwen, lo que permite su uso en pipelines conversacionales estándar con `transformers`.
- Capacidades del modelo base (código, matemáticas, tool calling) no verificadas en esta ficha: no se han publicado evaluaciones específicas tras el ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación en investigación sobre memoria en LLMs: el modelo sirve como checkpoint de referencia para estudiar cómo un ajuste completo sobre pares QA sintéticos afecta a la capacidad de recuperación de información en modelos de 1,5B parámetros.
- Recuperación de información documental en dominios acotados: dado su entrenamiento sobre BrowseComp-Plus, puede emplearse para responder preguntas sobre corpus de documentos previamente ingeridos en el contexto, con una ventana de hasta 8096 tokens.
- Evaluación de pipelines de datos sintéticos: permite comparar el efecto de la estrategia `entity_grping` frente a otras agrupaciones en la calidad de las respuestas, al ser un checkpoint reproducible con hiperparámetros documentados.
- Base para ajustes posteriores (continued fine-tuning): al estar publicado en safetensors bf16 y con licencia Apache 2.0, puede reutilizarse como punto de partida para tareas específicas de memoria o QA.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros, es viable en GPUs de consumo para prototipos de asistentes conversacionales con contexto moderado, siempre que se valide su calidad frente al modelo base.
- Estudio de eficiencia de entrenamiento en hardware AMD: el registro de 15,4 GPU-horas en 8 MI325X constituye una referencia útil para planificar entrenamientos similares en clústeres con aceleradores AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 para mayor throughput. El entrenamiento original se realizó en 8 AMD Instinct MI325X.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, siempre que se use bf16 o cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, aunque al ser un modelo Qwen2 en safetensors deberían ser compatibles previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep3 | 1,54B | 8096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste específico como memory model; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (nativo, según documentación de Qwen) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base; capacidades generales verificadas y benchmarks públicos |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (nativo) | Apache 2.0 | Hugging Face | Variante base sin instrucciones; referencia para comparar el efecto del ajuste |
| Modelos de memoria especializados de 1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas directamente comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente de su calidad.
- Ausencia total de benchmarks publicados: no es posible afirmar que mejore al modelo base en tareas generales; de hecho, el ajuste sobre un dataset sintético específico puede degradar capacidades generales (olvido catastrófico).
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos del modelo base y de los datos sintéticos de BrowseComp-Plus.
- Riesgo de alucinación: inherente a los modelos de 1,5B parámetros y potencialmente acentuado por el entrenamiento sobre pares QA sintéticos, que pueden contener ruido.
- Limitaciones de contexto: la longitud máxima de entrenamiento fue de 8096 tokens; no se garantiza un comportamiento correcto más allá de esa longitud aunque el modelo base soporte ventanas mayores.
- Idiomas: no disponibles; no se ha documentado el soporte multilingüe tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar los términos del modelo base Qwen2.5-1.5B-Instruct.
- Caveat para producción: al ser un checkpoint de época 3 de 3 sin evaluación publicada, se recomienda una validación exhaustiva en el dominio objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-entity_grping-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp-Plus: no disponible en la información proporcionada
