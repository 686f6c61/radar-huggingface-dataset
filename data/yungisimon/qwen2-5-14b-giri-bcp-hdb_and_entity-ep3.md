# yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep3

## Resumen

yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep3 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-14B-Instruct, desarrollado por el usuario yungisimon y publicado bajo licencia Apache 2.0. El modelo se ha entrenado como "memory model" sobre pares sinteticos de pregunta-respuesta generados a partir de BrowseComp-Plus, un conjunto de datos orientado a tareas de recuperacion y memoria de informacion. El checkpoint publicado corresponde a la epoca 3 de 3 del entrenamiento.

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 14.770.033.664 parametros, sin mezcla de expertos, que hereda las capacidades del modelo base de Alibaba (generacion de texto, razonamiento, codigo, tool calling y contexto largo). El ajuste fino no modifica la arquitectura, sino los pesos, y el objetivo declarado es especializar el modelo en tareas de memoria y agregacion de entidades a partir de documentos.

El interes de esta ficha es acotado: se trata de un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin model card extendida ni resultados de evaluacion publicados. Resulta relevante unicamente para quienes sigan la linea de trabajo de "memory models" sobre BrowseComp-Plus o quieran reproducir el pipeline de clustering descrito por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max sequence length de 8096 tokens) |
| Tipos de cuantizacion | no disponible (los pesos publicados son bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atencion causal estandar, sin innovaciones de atencion lineal ni estado recurrente. El ajuste fino es completo (no LoRA): los 14.770.033.664 parametros son entrenables (100,00 %), distribuidos con FSDP sobre 8 GPU AMD Instinct MI325X. La precision de entrenamiento es bf16 con gradient checkpointing y la perdida se calcula unicamente sobre los tokens del asistente.

Los hiperparametros documentados son: batch efectivo de 1024 (128 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate de 2e-05 con warmup del 5 % y decaimiento constante, weight decay 0,01, max grad norm 1,0, longitud maxima de secuencia 8096 y 3 epocas. El dataset es `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`, con 3.671.014 ejemplos sinteticos de QA construidos mediante clustering HDBSCAN (tamano minimo de cluster 2) combinado con agrupacion por entidad (max df 3). El coste total de las 3 epocas fue de 12,10 horas de reloj (96,8 GPU-horas). No se documenta RLHF, DPO ni ninguna fase de alineamiento adicional sobre el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct y ejercitada con la plantilla de chat de Qwen.
- Memoria y agregacion de informacion: el ajuste se orienta explicitamente a tareas de "memory model" sobre pares QA derivados de documentos, con agrupacion por entidad y por cluster.
- Razonamiento y respuesta a preguntas sobre contenido documental, segun el formato de entrenamiento (cross-doc entity combination).
- Capacidades del modelo base no verificadas en este checkpoint: generacion de codigo, matematicas, tool calling y function calling. La model card no documenta evaluaciones que confirmen que se conservan tras el ajuste.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas ni composicion linguistica del dataset.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre memory models: reproducir o comparar el pipeline de clustering HDBSCAN + agrupacion por entidad sobre BrowseComp-Plus, usando este checkpoint como referencia de la epoca 3.
- Preguntas y respuestas sobre corpus documentales: el modelo se ha entrenado con pares QA cross-document, por lo que es adecuado para prototipos de recuperacion y sintesis de informacion a partir de multiples documentos.
- Agregacion de entidades: tareas en las que hay que consolidar menciones de una misma entidad dispersas en un conjunto de textos, que es exactamente el sesgo del dataset de entrenamiento.
- Experimentos de ajuste fino completo: sirve como ejemplo de receta FSDP con bf16, batch efectivo 1024 y perdida solo en tokens del asistente sobre 8 GPU MI325X.
- Base para evaluaciones controladas: al ser un fine-tune del mismo modelo base con hiperparametros documentados, permite aislar el efecto del dataset de memoria frente a Qwen2.5-14B-Instruct original.
- Despliegue en pipelines de text-generation-inference: el repo incluye el tag `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI o con `transformers` usando la plantilla de chat de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, un minimo de 32-40 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 15 GB de pesos; en 4 bits, alrededor de 8-9 GB, mas cache KV (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o AMD MI325X para bf16 sin cuantizar; RTX 4090 (24 GB) solo con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion (por ejemplo, RTX 4090 o RTX 3090 en 4-8 bits); no en bf16.
- Opciones de despliegue: `transformers` (`AutoModelForCausalLM.from_pretrained`) con la plantilla de chat de Qwen, y text-generation-inference segun los tags del repo. Para cuantizacion, llama.cpp u Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep3 | 14,77 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de memoria sobre BrowseComp-Plus, sin benchmarks |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (segun model card publica de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generales y benchmarks publicados por el autor original |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun model card publica de Qwen) | Apache 2.0 | Hugging Face | Alternativa de menor tamano para el mismo tipo de tareas |
| Llama-3.1-8B-Instruct | 8 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Alternativa de tamano similar con contexto mayor, licencia con restricciones |

Los datos de contexto y licencia de los modelos comparados provienen de sus model cards publicas; los de este checkpoint no estan documentados mas alla de lo indicado.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce si el ajuste degrada capacidades generales del modelo base (codigo, matematicas, tool calling).
- El dataset de entrenamiento es sintetico y muy especifico (3.671.014 ejemplos de QA sobre BrowseComp-Plus con clustering HDBSCAN y agrupacion por entidad), lo que puede provocar sobreajuste a ese formato y sesgo hacia tareas de memoria documental.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 14 B sin evaluacion, no hay evidencia sobre su tasa de errores factuales.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingue equivalente al del modelo base.
- Longitud de contexto efectiva no documentada; el entrenamiento uso secuencias de 8096 tokens, inferior al contexto nativo de Qwen2.5-14B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- No se incluyen pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; el usuario debe generarlos por su cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-bcp-hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
