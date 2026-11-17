# yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep1

## Resumen

`yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep1` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se entrena como "memory model" sobre pares sinteticos de pregunta-respuesta derivados de BrowseComp-Plus, con el objetivo de que el modelo aprenda a retener y recuperar informacion a partir de un contexto documental inyectado. El checkpoint corresponde a la epoca 1 de 3 de un entrenamiento que no ha finalizado.

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 14.770.033.664 parametros, con licencia Apache 2.0 y pesos en safetensors bf16. El ajuste se realizo con FSDP sobre 8 aceleradores AMD Instinct MI325X, con una longitud maxima de secuencia de 8096 tokens y una perdida calculada unicamente sobre los tokens del asistente.

Su relevancia es acotada: se trata de un experimento de investigacion sobre memoria y agrupamiento de entidades en contextos multi-documento, no de un modelo listo para produccion. No hay informacion publicada sobre benchmarks, idiomas soportados ni evaluaciones de calidad, y el checkpoint es intermedio (epoca 1 de 3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8096 tokens durante el entrenamiento; no se especifica la ventana nativa de inferencia mas alla de la heredada de Qwen2.5-14B-Instruct |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), cargable con `transformers` mediante `AutoModelForCausalLM.from_pretrained` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar y sin mezcla de expertos. El ajuste es completo: los 14.770.033.664 parametros son entrenables (100,00 %), sin LoRA ni adaptadores. El entrenamiento se ejecuto con FSDP en precision bf16, gradient checkpointing y calculo de perdida restringido a los tokens del asistente, con una longitud maxima de secuencia de 8096 tokens.

Los datos de entrenamiento son pares sinteticos de pregunta-respuesta generados a partir de BrowseComp-Plus, agrupados mediante el metodo `entity_grping` (agrupamiento de entidades con un maximo de frecuencia documental de 3). El fichero de datos indicado en la model card es `bcp_subset300_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`, con 3.046.524 ejemplos. La configuracion de entrenamiento incluye batch efectivo de 1024 (128 por dispositivo, 1 acumulacion, 8 GPUs), learning rate constante de 2e-05 con warmup del 5 %, weight decay de 0,01, max grad norm de 1,0 y 3 epocas planificadas. El tiempo total de pared para las 3 epocas fue de 10,08 horas (80,6 GPU-horas) sobre 8 AMD Instinct MI325X. El checkpoint publicado corresponde a la epoca 1. No se documenta el uso de RLHF, DPO ni ninguna innovacion de decodificacion.

## Capacidades

- Generacion de texto conversacional, heredada de la base Qwen2.5-14B-Instruct y reforzada mediante ajuste sobre formato de chat Qwen.
- Memoria sobre contexto documental: el ajuste busca que el modelo retenga y recupere informacion de documentos inyectados en el prompt, con pares QA multi-documento.
- Razonamiento multi-paso sobre evidencia repartida entre documentos, segun el diseno del dataset de entrenamiento.
- Capacidades de codigo, matematicas y tool calling: no verificadas en este checkpoint; se heredan teoricamente de la base, pero no hay evaluacion publicada.
- Capacidades multilingues: no disponibles; no se documenta composicion linguistica del dataset.
- No se documenta vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion sobre memoria en LLM: el modelo sirve como punto de comparacion para estudiar como el ajuste supervisado sobre pares QA multi-documento afecta a la retencion de informacion en contexto. Es adecuado porque el dataset de entrenamiento esta disenado explicitamente para esa tarea.
- Experimentos de agrupamiento de entidades: permite evaluar si el metodo `entity_grping` mejora la recuperacion de entidades relacionadas a traves de documentos, usando el checkpoint como referencia de la epoca 1.
- Reproduccion de pipelines de entrenamiento: la model card documenta hiperparametros, hardware y fichero de datos, lo que facilita replicar el ajuste con FSDP sobre 8 aceleradores.
- Generacion de respuestas sobre corpus documentales controlados: en entornos de laboratorio, se puede inyectar un conjunto de documentos en el prompt y medir la fidelidad de las respuestas a la evidencia.
- Estudio de degradacion por entrenamiento intermedio: al ser la epoca 1 de 3, permite analizar la evolucion de capacidades a lo largo del ajuste comparandolo con epocas posteriores, si se publican.
- Base para posteriores ajustes de investigacion: al ser un full fine-tune con licencia Apache 2.0, puede reutilizarse como punto de partida en experimentos academicos, siempre que se validen sus capacidades antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 40-48 GB para secuencias largas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 15-16 GB para pesos; en 4 bits, en torno a 8-9 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB, AMD MI300X/MI325X para entrenamiento o inferencia en bf16 sin cuantizar.
- GPU de consumo: no cabe en bf16 en ninguna consumer GPU de 24 GB; en cuantizacion de 4 bits podria intentarse en RTX 4090 (24 GB), pero con contexto limitado y sin garantias de calidad.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte directo documentado); vLLM, TGI y llama.cpp no estan verificados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen2.5-14B-giri-bcp-entity_grping-ep1 | 14,77 B | 8096 en entrenamiento | Apache 2.0 | Checkpoint intermedio, sin benchmarks |
| Qwen2.5-14B-Instruct (base) | 14,77 B | No disponible en esta ficha | Apache 2.0 | Modelo oficial con evaluaciones publicadas |
| Otros ajustes de memoria sobre Qwen2.5-14B | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de rendimiento del checkpoint que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la epoca 1 de 3; su calidad puede ser inferior a la del modelo final y no representa el resultado completo del entrenamiento.
- Ausencia total de evaluacion: no hay benchmarks, evaluaciones humanas ni pruebas de regresion publicadas.
- Riesgo de alucinacion: el ajuste sobre datos sinteticos de QA puede favorecer respuestas plausibles no sustentadas en la evidencia; no se ha medido la fidelidad.
- Sesgos desconocidos: no se documenta la composicion del dataset ni la procedencia de los documentos de BrowseComp-Plus, por lo que no puede evaluarse el sesgo.
- Idiomas no documentados: no se especifica que lenguas cubre el entrenamiento; el uso en castellano no esta validado.
- Capacidades heredadas no garantizadas: tool calling, codigo y matematicas pueden haberse degradado con el ajuste; no hay verificacion.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluacion hace desaconsejable su uso en produccion sin validacion previa.
- Trazabilidad limitada: el autor es un usuario individual, sin publicacion asociada ni repositorio de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-entity_grping-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
