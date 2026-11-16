# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep1

## Resumen

`yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep1` es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-14B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se presenta como un "memory model": se ha entrenado sobre pares sinteticos de pregunta-respuesta generados a partir del corpus MuSiQue, un conjunto de datos de razonamiento multi-salto, con el objetivo de que el modelo memorice y reproduzca conocimiento factual estructurado en lugar de generalizar. El checkpoint publicado corresponde a la epoca 1 de un total de 3 planificadas durante el entrenamiento.

La relevancia de esta ficha es acotada: no se trata de un modelo de proposito general ni de una release oficial de Alibaba, sino de un experimento de investigacion sobre memorizacion y recuperacion de conocimiento en LLMs de 14.770 millones de parametros. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5, con licencia Apache 2.0 heredada del modelo base, y el formato de pesos es safetensors en bf16.

Dado que el repositorio no incluye resultados de benchmarks, no declara idiomas soportados de forma explicita ni aporta documentacion sobre evaluacion, esta ficha debe leerse como una descripcion tecnica del proceso de entrenamiento y de las caracteristicas heredadas del modelo base, no como una validacion de capacidades. Cualquier uso en produccion requeriria una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max sequence length de 8096 tokens. El modelo base Qwen2.5-14B-Instruct soporta hasta 131.072 tokens, pero no se confirma que este ajuste lo preserve |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso de 14.770 millones de parametros con atencion causal estandar y RoPE para codificacion posicional. El ajuste fino es completo (no LoRA ni adaptadores): la model card indica que los 14.770.033.664 parametros son entrenables, es decir, el 100% del modelo. El entrenamiento se realizo con FSDP sobre 8 GPUs AMD Instinct MI325X, en precision bf16, con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente.

Los hiperparametros documentados son: batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPUs), learning rate constante de 2e-05 con warmup del 5%, weight decay de 0.01, max grad norm de 1.0 y longitud maxima de secuencia de 8096 tokens. El dataset es un conjunto sintetico de 1.590.428 ejemplos de QA derivados de MuSiQue, construido mediante un pipeline de clustering etiquetado como `knn_k2_and_hdb` (kNN con k=2, deduplicacion de documentos y HDBSCAN con tamano minimo de cluster 2). El entrenamiento completo de 3 epocas consumio 6,74 horas de reloj (53,9 GPU-horas); este checkpoint corresponde a la epoca 1. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-14B-Instruct y del chat template de Qwen.
- Recuperacion de conocimiento memorizado: el objetivo declarado del ajuste es actuar como "memory model" sobre el corpus MuSiQue, es decir, responder preguntas factuales y multi-salto presentes en los datos de entrenamiento.
- Razonamiento multi-salto sobre entidades y relaciones, derivado de la naturaleza del dataset MuSiQue.
- Soporte de tool calling y function calling: presumiblemente heredado del modelo base, aunque no se documenta ni se verifica en la model card de este ajuste.
- Capacidades multilingues: no documentadas para este checkpoint; dependen del modelo base y del posible olvido catastrofico durante el ajuste fino.
- Modo thinking, vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre memorizacion en LLMs: el modelo sirve como sujeto de estudio para medir cuanto conocimiento factual del corpus MuSiQue retiene un ajuste fino completo de 14B y como afecta a la generalizacion.
- Evaluacion de olvido catastrofico: comparar el rendimiento del checkpoint frente al Qwen2.5-14B-Instruct original en tareas fuera de dominio permite cuantificar la degradacion de capacidades generales tras el ajuste.
- Reproduccion de experimentos de clustering y sintesis de datos: el pipeline `knn_k2_and_hdb` documentado en la model card puede reutilizarse para generar datasets de QA multi-salto a partir de otros corpus.
- Base para ajustes posteriores: al estar licenciado bajo Apache 2.0 y en safetensors bf16, puede servir como punto de partida para fine-tuning adicional con LoRA o QLoRA en dominios especificos.
- Pruebas de pipelines de inferencia: util para validar despliegues con transformers, TGI o vLLM en un modelo denso de 14B con pesos bf16.
- Analisis de calidad de datos sinteticos: comparar respuestas del modelo con las del dataset original permite auditar la fidelidad de los pares QA generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15 GB; en 4 bits, alrededor de 8-9 GB (aunque no se publican pesos cuantizados oficiales).
- GPUs recomendadas: A100 40/80 GB, H100 80 GB, AMD MI300X/MI325X para bf16; RTX 4090 (24 GB) solo viable con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en RTX 3090, 4090 o equivalentes con 24 GB; en bf16 no cabe en GPUs de consumo actuales.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), text-generation-inference (el repo esta marcado como `endpoints_compatible`), vLLM; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep1 | 14,77 B | no confirmado (entrenado a 8096) | Apache 2.0 | Hugging Face, checkpoint epoca 1 de 3 | Ajuste fino como memory model sobre MuSiQue |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 131.072 tokens | Apache 2.0 | Hugging Face, oficial | Modelo base; proposito general, con benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | Hugging Face, oficial | Alternativa de menor tamano para el mismo tipo de tareas |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | Hugging Face, oficial | Comparable en categoria; licencia con restricciones de uso comercial |

## Limitaciones y advertencias

- El checkpoint corresponde a la epoca 1 de 3; no es el modelo final del entrenamiento y su calidad puede ser inferior a la de la version completa.
- No se han publicado evaluaciones ni benchmarks: no hay evidencia de que las capacidades del modelo base se conserven tras el ajuste fino completo.
- Riesgo elevado de olvido catastrofico: al entrenar el 100% de los parametros sobre un dataset sintetico de un solo dominio, es probable la degradacion en tareas generales, codigo y matematicas.
- Riesgo de alucinacion: el objetivo de memorizacion puede producir respuestas confiadas pero incorrectas cuando la pregunta queda fuera del corpus MuSiQue.
- Sesgos conocidos: no documentados; hereda los del modelo base y los del corpus MuSiQue, sin auditoria publicada.
- Idiomas soportados no declarados; el ajuste se realizo sobre un dataset presumiblemente en ingles, lo que puede degradar el rendimiento en castellano.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su despliegue en produccion sin validacion previa.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset MuSiQue (referencia del corpus de entrenamiento): no se proporciona enlace en la model card
- Paper o blog del ajuste: no disponible
- Repositorio de codigo del pipeline `knn_k2_and_hdb`: no disponible
