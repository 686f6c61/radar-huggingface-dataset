# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep2

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep2` es un ajuste fino completo (full fine-tuning) del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el usuario yungisimon. El modelo se ha entrenado como **memory model**: un modelo especializado en gestionar y recuperar información de memoria estructurada a partir de pares de pregunta-respuesta sintéticos derivados del conjunto de datos MuSiQue, un benchmark de razonamiento multi-salto sobre múltiples documentos.

La particularidad del entrenamiento reside en el pipeline de generación de datos: los pares sintéticos se construyeron agrupando documentos mediante una combinación de kNN con k=2, deduplicación documental, clustering HDBSCAN con tamaño mínimo de cluster 2 y agrupación por entidades con frecuencia documental máxima 3. El resultado es un conjunto de 2.681.852 ejemplos que el modelo ha consumido durante tres épocas; esta publicación corresponde al checkpoint de la época 2.

El modelo conserva la arquitectura Qwen2 original de 1.543.714.304 parámetros (1,5 mil millones) y se distribuye en safetensors bf16 cargables con `transformers`. Su interés es acotado: sirve como referencia para investigadores que trabajen en modelos de memoria, recuperación aumentada o ajuste fino con datos sintéticos, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8096 tokens (longitud máxima de secuencia durante el entrenamiento); contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Qwen2 del modelo base: un transformer decoder-only de 1.543.714.304 parámetros con atención causal estándar y tokenizador propio de Qwen. No se ha modificado la topología; el ajuste es completo, afectando al 100 % de los parámetros (1.543.714.304 entrenables), lo que descarta técnicas como LoRA o adaptadores.

El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, con un tamaño de lote efectivo de 256 (32 por dispositivo, sin acumulación, 8 dispositivos), tasa de aprendizaje constante de 2e-05 con warmup del 5 %, weight decay 0.01, norma máxima de gradiente 1.0 y precisión bf16 con checkpointing de gradientes. La pérdida se calculó únicamente sobre los tokens del asistente. La longitud máxima de secuencia fue de 8096 tokens y el entrenamiento completo de tres épocas consumió 2,79 horas de reloj (22,3 GPU-horas). El conjunto de datos, `msq_subset1000_numsamplingepochs1_knn2_doc_dedup_and_hdbscan_mcs2_and_entity_maxdf3_crossdoc_entity_combination_v3.json`, contiene 2.681.852 ejemplos generados mediante agrupación kNN (k=2), deduplicación de documentos, HDBSCAN con tamaño mínimo de cluster 2 y agrupación por entidades con df máximo 3.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Memoria estructurada: recuperación y razonamiento sobre información organizada en clusters documentales y entidades, según el esquema de entrenamiento.
- Razonamiento multi-salto sobre múltiples documentos, derivado del uso de MuSiQue como fuente de datos.
- Respuesta a pares pregunta-respuesta sintéticos con contexto de hasta 8096 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas potencialmente del modelo base, pero sin confirmar).

## Casos de uso

- Investigación en modelos de memoria: el modelo sirve como punto de partida para experimentos sobre representación y recuperación de memoria estructurada, ya que ha sido entrenado específicamente con ese objetivo sobre un esquema reproducible de clustering.
- Evaluación de pipelines de datos sintéticos: permite medir el impacto del esquema `knn_k2_and_hdb_and_entity` en el comportamiento del modelo frente al base, comparando checkpoints de distintas épocas.
- Recuperación aumentada multi-documento: su entrenamiento con pares derivados de MuSiQue lo hace adecuado para prototipos de QA que requieren combinar información de varios documentos dentro de una ventana de 8096 tokens.
- Baseline para ajuste fino completo: al ser un full fine-tune de 1,5B con receta documentada (FSDP, lr, batch, épocas), sirve como referencia reproducible para comparar con LoRA u otras técnicas.
- Experimentos de destilación o compresión: su tamaño contenido y licencia Apache 2.0 facilitan su uso como profesor o alumno en estudios de compresión.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros en bf16 (unos 3,1 GB de pesos) puede ejecutarse en GPU de consumo para pruebas de inferencia conversacional, siempre que el caso no exija capacidades generales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para secuencias cercanas a 8096 tokens se recomienda 16 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060, 4070, 4080 y 4090 con cuantización o secuencias moderadas.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte nativo documentado); compatible con text-generation-inference y endpoints según los tags; vLLM, llama.cpp u Ollama no están confirmados en la información disponible, aunque la arquitectura Qwen2 es ampliamente soportada por esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep2 | 1.543.714.304 | 8096 (entrenamiento) | Full fine-tune como memory model sobre 2,68 M ejemplos sintéticos de MuSiQue | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 (nativo, según documentación del modelo base) | Instruct tuning general | apache-2.0 | Hugging Face, ampliamente utilizado |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | 32.768 (nativo) | Instruct tuning general | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (nativo) | Instruct tuning general | apache-2.0 | Hugging Face |

La comparación relevante es con el modelo base: este checkpoint no supera al original en capacidades generales, sino que lo especializa en memoria estructurada a costa de un posible deterioro en tareas generales. No se dispone de benchmarks que cuantifiquen esa diferencia.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se ha realizado exclusivamente sobre pares sintéticos de MuSiQue; el rendimiento en tareas generales puede degradarse respecto al modelo base.
- Checkpoint intermedio: corresponde a la época 2 de 3, por lo que no es la versión final del entrenamiento.
- Sesgos: no documentados, pero heredados del modelo base y de los datos sintéticos generados automáticamente.
- Riesgo de alucinación: elevado en dominios fuera del esquema de memoria para el que fue entrenado; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas: no se especifican; el entrenamiento se realizó presumiblemente en inglés por la fuente MuSiQue, lo que puede degradar el rendimiento en castellano.
- Contexto: la longitud máxima de entrenamiento fue de 8096 tokens, inferior al contexto nativo del modelo base; no se garantiza un comportamiento correcto más allá de esa longitud.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- Datos de entrenamiento sintéticos: la calidad del pipeline de generación (kNN, HDBSCAN, agrupación por entidades) condiciona directamente el comportamiento del modelo; no se publican métricas de calidad del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb_and_entity-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Dataset MuSiQue (referencia del dominio de entrenamiento): https://github.com/StonyBrookNLP/musique
