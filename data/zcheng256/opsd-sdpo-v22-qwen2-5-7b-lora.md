# zcheng256/OPSD-SDPO-v22-Qwen2.5-7B-LoRA

## Resumen

OPSD-SDPO-v22-Qwen2.5-7B-LoRA es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario zcheng256. No se trata de un modelo completo, sino de un artefacto de entrenamiento: el repositorio agrupa los pares `adapter_config.json` + `adapter_model.safetensors` en FP32 para los conjuntos A/B/C/D en los pasos 0/25/50/75/100, es decir, veinte puntos de control de un mismo proceso de ajuste. El autor indica que los de los pasos 25/50/75/100 de A/B se subieron primero.

El interés del repositorio es fundamentalmente de investigación y auditoría: permite reproducir la evolución de un ajuste fino (presumiblemente destilación y/u optimización de preferencias, a juzgar por las siglas OPSD-SDPO, que la model card no desarrolla) paso a paso sobre un base de 7,61 mil millones de parámetros con 32.768 tokens de contexto nativos. Cada adaptador va acompañado de un `LORA_MANIFEST.json` y un recibo de verificación público `LORA_VERIFIED.json` con hash y longitud, lo que facilita comprobar la integridad de los ficheros.

Es relevante ahora por dos motivos. Primero, porque ejemplifica una práctica creciente: publicar adaptadores portables e independientes del estado completo de entrenamiento (que vive en otro repositorio, `zcheng256/OPSD-SDPO-v22-Qwen2.5-7B-checkpoints`). Segundo, porque el propio autor advierte explícitamente de que la presencia del LoRA no implica que la restauración ni la eficacia del ajuste hayan sido probadas. Con 0 descargas y 1 like en el momento de la consulta, debe tratarse como material experimental sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-7B-Instruct |
| Parámetros totales | 7,61 mil millones en el modelo base (6,53 mil millones sin embeddings); parámetros del adaptador: no disponible (el rango LoRA no se documenta) |
| Longitud de contexto | 32.768 tokens nativos en el base, ampliables a 131.072 con YaRN; el adaptador no modifica la ventana |
| Tipos de cuantización | Adaptador publicado en FP32; el base admite bf16/fp16, GPTQ, AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0, entre otros) |
| Idiomas soportados | Base: más de 29 idiomas; comportamiento del adaptador: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), librería `peft` |
| Tamaño del repositorio | 63,8 GB (agrupa múltiples adaptadores y sus manifiestos) |
| Modelo base y revisión | Qwen/Qwen2.5-7B-Instruct, revisión `a09a35458c702b33eeacc393d103063234e8bc28` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 28 capas con atención de consultas agrupadas (28 cabezas de consulta y 4 de clave/valor), normalización RMSNorm, activación SwiGLU, RoPE y un vocabulario de 152.064 tokens. El base se entrenó con 18 billones de tokens y un pipeline de post-entrenamiento con instrucciones y preferencias humanas; el adaptador hereda esa arquitectura sin cambios y solo añade las matrices de bajo rango sobre las proyecciones lineales.

La model card no documenta el proceso de entrenamiento del adaptador: no se indica el rango LoRA, el alfa, las capas objetivo, el número de tokens vistos, la composición del dataset, la función de pérdida ni si hubo RLHF, DPO o destilación. Las siglas OPSD-SDPO del nombre sugieren un esquema de destilación en política y optimización de preferencias, pero es una inferencia a partir del identificador y no un dato confirmado. Lo que sí se explicita es la política de publicación: los ficheros de recuperación completos (estudiante, profesor, optimizador, RNG, planificador y cargador) residen en un repositorio separado, y no se publican ejemplos de entrenamiento, entradas de rollout, registros ni credenciales. El `adapter_config.json` se conserva byte a byte respecto a la exportación nativa.

## Capacidades

- Generación de texto y razonamiento en el mismo rango que el base Qwen2.5-7B-Instruct, sin capacidades nuevas documentadas por el autor.
- Generación de código y matemáticas: heredadas del base, no evaluadas en el adaptador.
- Soporte de tool calling y function calling: disponible en el base; se desconoce si el ajuste lo preserva.
- Razonamiento multi-paso y uso como agente: no verificado en el adaptador.
- Multilingüismo: el base cubre más de 29 idiomas; no hay información sobre el efecto del ajuste en idiomas distintos del inglés.
- Puntos de control intermedios (pasos 0, 25, 50, 75 y 100) que permiten analizar la deriva del comportamiento durante el entrenamiento.
- Verificación de integridad mediante `LORA_MANIFEST.json` y `LORA_VERIFIED.json` (hash y longitud públicos).
- Sin visión, audio ni modo "thinking" declarado.

## Casos de uso

- Reproducción de experimentos de ajuste fino: cargar el base en la revisión indicada y aplicar cada carpeta de adaptador para replicar la curva de entrenamiento en los pasos 0/25/50/75/100 y comparar la evolución de las respuestas.
- Auditoría de cadena de suministro de modelos: usar los manifiestos y los recibos de verificación para comprobar hash y longitud de cada `adapter_model.safetensors` antes de desplegarlo en un entorno interno.
- Comparación A/B/C/D de configuraciones: los cuatro conjuntos de adaptadores permiten evaluar de forma controlada distintas variantes de entrenamiento sobre el mismo base y el mismo conjunto de evaluación.
- Estudio de olvido catastrófico y deriva de alineamiento: comparar el paso 0 con el paso 100 en tareas de rechazo, formato y seguimiento de instrucciones para cuantificar cuánto cambia el comportamiento del base.
- Servicio multi-adaptador con vLLM: cargar el base una sola vez y servir varios adaptadores con `--enable-lora`, enrutando por tenant o por experimento; el coste de VRAM adicional por adaptador es muy inferior al de un modelo completo.
- Punto de partida para un ajuste de dominio: continuar el entrenamiento desde uno de los adaptadores con datos propios (por ejemplo, atención al cliente o documentación técnica) en lugar de partir del base, siempre que una evaluación previa confirme que no ha degradado capacidades.
- Despliegue en hardware de consumo: fusionar el adaptador con `merge_and_unload()`, convertir a GGUF y cuantizar a Q4_K_M para ejecutarlo en una GPU de 8-12 GB con llama.cpp u Ollama.
- Docencia y formación técnica: el repositorio sirve como ejemplo real de estructura de un adaptador PEFT, de nomenclatura de puntos de control y de publicación de recibos de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el autor advierte explícitamente de que la finalización de los LoRA no implica una restauración ni una eficacia probadas.

| Evaluación | Adaptador | Modelo base |
|---|---|---|
| MMLU | no disponible | publicado por el autor del base, no replicado aquí |
| HumanEval | no disponible | publicado por el autor del base, no replicado aquí |
| GSM8K | no disponible | publicado por el autor del base, no replicado aquí |
| MATH | no disponible | publicado por el autor del base, no replicado aquí |
| Evaluación de seguridad o de rechazo | no disponible | no disponible en este repositorio |

## Requisitos de hardware

- VRAM para el base en bf16: aproximadamente 15,2 GB de pesos, más caché KV de unos 56 KB por token (28 capas × 2 × 4 cabezas KV × 128 dimensiones × 2 bytes), es decir, unos 1,8 GB adicionales a 32.768 tokens y unos 7,5 GB a 131.072 tokens.
- VRAM en 8 bits: unos 8,1 GB de pesos; en 4 bits: unos 4,7 GB, con la caché KV en el mismo orden que en bf16.
- El adaptador se publica en FP32; conviene convertirlo a bf16/fp16 al servirlo, ya que en FP32 ocupa el doble y algunos servidores (vLLM) esperan adaptadores en media precisión.
- GPU de datacenter: A100 40 GB u 80 GB y H100 para lotes grandes y contexto completo; el base en bf16 cabe holgadamente en una A100 40 GB con contexto moderado.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan el base en bf16 con contexto limitado; RTX 4060 Ti 16 GB, RTX 4080 y RTX 3060 12 GB requieren cuantización de 8 o 4 bits.
- Despliegue: vLLM con soporte LoRA, TGI con adaptadores, transformers + PEFT para evaluación, y llama.cpp u Ollama tras fusionar y convertir a GGUF (estos últimos no cargan adaptadores PEFT directamente).
- Latencia y throughput: no disponible. No hay mediciones publicadas ni datos de tokens por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| OPSD-SDPO-v22-Qwen2.5-7B-LoRA | 7,61 mil M (base) + adaptador de rango no documentado | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | LoRA PEFT en safetensors (FP32) | No disponible |
| Qwen2.5-7B-Instruct (base) | 7,61 mil M | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | safetensors, GPTQ, AWQ, GGUF | Sí, en su model card oficial |
| Llama 3.1 8B Instruct | 8,03 mil M | 128.000 | Llama 3.1 Community License | safetensors y GGUF | Sí, en su model card oficial |
| Mistral 7B Instruct v0.3 | 7,25 mil M | 32.768 | Apache 2.0 | safetensors y GGUF | Sí, en su model card oficial |

Frente a estos modelos completos, la diferencia práctica es que aquí no se distribuye un modelo listo para producir: hace falta descargar el base por separado (unos 15 GB adicionales en bf16) y aplicar el adaptador. La ventaja es el tamaño reducido de cada adaptador y la posibilidad de servir varias variantes sobre una sola copia del base; la desventaja es la ausencia total de métricas y de documentación del entrenamiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, no hay comparación con el base y el autor afirma que no se ha probado la restauración ni la eficacia del adaptador.
- Entrenamiento opaco: no se publican datos, hiperparámetros, rango LoRA, función de pérdida ni número de pasos completos; no es posible reproducir el proceso a partir del repositorio.
- Riesgo de alucinación: inherente al base Qwen2.5-7B-Instruct y no cuantificado tras el ajuste.
- Deriva de alineamiento: si el entrenamiento incluye optimización de preferencias, es esperable que cambien las tasas de rechazo y el estilo de respuesta respecto al base; conviene evaluarlo antes de cualquier uso en producción.
- Idiomas: no hay información sobre el comportamiento del adaptador fuera del inglés; el multilingüismo del base no garantiza que el ajuste no lo haya degradado.
- Tamaño del repositorio: 63,8 GB para veinte adaptadores en FP32 más manifiestos; requiere planificación de almacenamiento y de ancho de banda.
- Metadatos llamativos: las fechas de creación y actualización del repositorio (13 y 23 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citarlas.
- Señales de adopción muy bajas: 0 descargas y 1 like, sin pipeline declarado; no hay evidencia de uso en producción ni de revisión por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero se heredan las obligaciones de atribución del modelo base; conviene conservar el aviso de licencia y el identificador de la revisión del base.
- Integridad: los recibos `LORA_VERIFIED.json` permiten comprobar hashes, pero no sustituyen una evaluación funcional del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-7B-LoRA
- Repositorio de estados completos de entrenamiento: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-7B-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Revisión del base indicada por el autor: `a09a35458c702b33eeacc393d103063234e8bc28`
- Listado de modelos LoRA en HuggingFace (resultado de búsqueda): https://huggingface.co/models?p=1&sort=modified&search=lora
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
