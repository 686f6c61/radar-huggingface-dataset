# ToastyPigeon/gemma4-31b-confetti-adapter

## Resumen

ToastyPigeon/gemma4-31b-confetti-adapter es un adaptador LoRA publicado en HuggingFace por el usuario ToastyPigeon, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base Columbidae/gemma4-31b-pt-embed-it, una variante de la familia Gemma 4 de 31 000 millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (PEFT), no el modelo completo, y ocupa aproximadamente 1,0 GB.

El adaptador se entreno con rango LoRA 32, alpha 8, rsLoRA activado, dropout 0,0 y cuantizacion de 4 bits (nf4) durante el entrenamiento, aplicando los modulos LoRA a las proyecciones de atencion (q, k, v, o) y a las proyecciones MLP (gate, up, down) de todas las capas del modelo de lenguaje. El entrenamiento consumio 9 770 385 tokens repartidos en 5 503 muestras y 2 epocas, con una longitud maxima de secuencia de 4096 tokens.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card completa, sin licencia declarada y sin resultados de evaluacion publicados. Su relevancia es limitada fuera del contexto del autor: no hay benchmarks, no hay documentacion de capacidades y la informacion sobre el modelo base es escasa, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura concreta del modelo base no disponible |
| Parametros totales | No disponible (adaptador LoRA r=32 sobre un modelo base de 31 000 millones de parametros; el numero de parametros entrenables del adaptador no se especifica) |
| Parametros activos | No aplica / no disponible: el modelo base de 31B no se describe como MoE en la informacion disponible |
| Longitud de contexto | 4096 tokens durante el entrenamiento (max_length del SFT); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | 4-bit nf4 usado durante el entrenamiento del adaptador; no se publican pesos cuantizados del adaptador (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el marcador `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA); repositorio de 1,0 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre Columbidae/gemma4-31b-pt-embed-it y modifica exclusivamente las proyecciones de atencion (self_attn.q_proj, k_proj, v_proj, o_proj) y las proyecciones MLP (mlp.gate_proj, up_proj, down_proj) de cada capa del modelo de lenguaje, segun el patron regex declarado en la configuracion. La configuracion LoRA usa r=32, alpha=8 (ratio alpha/r de 0,25, inusualmente bajo), rsLoRA activado, dropout 0,0 y cuantizacion 4-bit nf4 con bitsandbytes durante el entrenamiento. La atencion se implemento con flex_attention, se activo gradient checkpointing no reentrante, chunked cross-entropy y chunked MLP con 16 fragmentos.

El entrenamiento se ejecuto con TRL y PEFT (PEFT 0.18.1, Transformers 5.5.4, PyTorch 2.6.0+cu124) en precision bf16, con learning rate 1e-5, scheduler personalizado "rex" (max_lr=1e-5, min_lr=1e-6, warmup_ratio=0,05), optimizador paged_adamw_8bit, batch efectivo de 4 (batch 1 x 4 pasos de acumulacion), 2 epocas y max_grad_norm 1,0. El paralelismo de modelo se repartio entre dos dispositivos con limites de memoria de 16 GiB y 24 GiB. El conjunto de datos combina cuatro fuentes: brainrot_chatlog.jsonl (3 232 muestras, 1 115 996 tokens), counter_signal_training_balanced.jsonl (1 038 muestras, 4 173 666 tokens), worm_chapters.json (658 muestras, 2 268 255 tokens) y erotica_quality_cleaned_20pct_seed42.json (575 muestras, 2 212 468 tokens). No se menciona ninguna fase de RLHF, DPO o preferencias; el pipeline es exclusivamente SFT con perdida NLL. El efecto combinado de un alpha/r de 0,25 y solo 2 epocas sugiere una adaptacion deliberadamente suave, pero no hay evaluacion publicada que lo confirme.

Nota de trazabilidad: la model card del repositorio se titula "gemma4-31b-pt-embed-r32a8-textcomp" y no "confetti-adapter", por lo que el README parece reutilizado de otro entrenamiento. Los hiperparametros y el dataset podrian no corresponder exactamente a los pesos publicados en este repositorio.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base de 31B; no hay evaluacion especifica del adaptador.
- El adaptador se entreno sobre datos de texto de caracter narrativo y conversacional (ficcion, "worm_chapters", chatlogs y un dataset de senal balanceada), por lo que su efecto esperado es un cambio de estilo o de distribucion en la generacion, no la adquisicion de capacidades nuevas.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; los nombres de los datasets sugieren contenido mayoritariamente en ingles, pero no se declara idioma alguno.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La busqueda web indica que la familia Gemma 4 es multimodal (VLM) en su version oficial de Google, pero no hay confirmacion de que el modelo base Columbidae conserve esas capacidades ni de que el adaptador afecte a torres no textuales.

## Casos de uso

- Experimentacion academica sobre LoRA: el adaptador sirve como ejemplo reproducible de fine-tuning SFT con PEFT, cuantizacion nf4 y rsLoRA sobre un modelo de 31B, util para estudiar el efecto de un alpha/r bajo (0,25) y de solo 2 epocas.
- Analisis de sesgo y seguridad en datasets: los datos de entrenamiento incluyen fuentes de ficcion explicita y de contenido de baja calidad ("brainrot"), lo que lo convierte en un caso de estudio para medir como se filtran rasgos de estilo y contenido hacia las salidas del modelo.
- Generacion de narrativa con estilo controlado: si el objetivo es reproducir el registro de los corpus usados en el SFT, el adaptador puede aplicarse sobre el base para tareas de escritura creativa, siempre con revision humana y filtros de contenido previos.
- Investigacion sobre desaprendizaje y control de comportamiento: aplicar o desactivar el adaptador (load/unload en PEFT) permite comparar salidas con y sin ajuste sobre el mismo modelo base, algo util en estudios de atribucion de comportamiento.
- Desarrollo de pipelines de evaluacion de adaptadores: dado que no hay benchmarks publicados, el adaptador es un candidato para construir baterias de evaluacion internas (perplejidad, win-rate, toxicidad, fidelidad) antes de cualquier despliegue.
- Prototipado interno con PEFT: cargar el base en 4 bits y aplicar el adaptador permite experimentar en una sola GPU de 24 GB, adecuado para entornos de laboratorio con recursos limitados.
- Fine-tuning posterior (continued training): el adaptador puede servir como punto de partida para nuevos SFT sobre dominios especificos, aunque la falta de licencia clara es un bloqueo para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros accesibles.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano del modelo base (31 000 millones de parametros); no son datos publicados por el autor.

- Peso de los pesos en bf16/fp16: aproximadamente 62 GB solo para los pesos, mas cache KV y activaciones.
- VRAM estimada para inferencia en bf16: alrededor de 70-80 GB para secuencias cortas; requiere una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en dos GPU de 40-48 GB mediante tensor parallelism.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 31-35 GB; cabe en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- VRAM estimada en cuantizacion de 4 bits (nf4/GPTQ/AWQ): aproximadamente 16-20 GB mas cache KV; cabe en RTX 4090 24GB, RTX 3090 24GB y L4 24GB con secuencias moderadas.
- GPU recomendadas por escenario: A100 80GB o H100 80GB para bf16 sin cuantizar; A100 40GB o L40S para 8 bits; RTX 4090/3090 para 4 bits en contexto corto.
- El adaptador anade un consumo marginal (repositorio de 1,0 GB, que incluye estados del optimizador ademas de los pesos LoRA).
- Opciones de despliegue: transformers + PEFT (carga del base y aplicacion del adaptador), vLLM con soporte LoRA, TGI con adaptadores, y llama.cpp/Ollama solo si se fusiona el adaptador y se convierte a GGUF manualmente (no se publican GGUF).
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas del autor ni de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToastyPigeon/gemma4-31b-confetti-adapter | Adaptador LoRA sobre base de 31B | 4096 en entrenamiento (nativo del base: no disponible) | Adaptador PEFT | No disponible | HuggingFace, 0 descargas |
| google/gemma-4-31B | 31B | No disponible en la informacion recogida | Modelo denso (presuntamente) | Terminos de uso de Gemma (segun la model card oficial) | HuggingFace, modelo oficial de Google DeepMind |
| google/gemma-4-26B A4B | 26B totales, 4B activos | No disponible en la informacion recogida | MoE con modelo draft para decodificacion especulativa | Terminos de uso de Gemma | HuggingFace, modelo oficial de Google DeepMind |
| google/gemma-4-12B | 12B | No disponible en la informacion recogida | Denso | Terminos de uso de Gemma | HuggingFace, modelo oficial de Google DeepMind |

No hay datos de rendimiento comparado para el adaptador. La comparacion se limita a parametros, licencia y disponibilidad. No se ha confirmado en la informacion disponible que la variante Columbidae/gemma4-31b-pt-embed-it derive directamente de google/gemma-4-31B, aunque el nombre y el pipeline lo sugieren.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks, sin metricas de perdida final y sin comparaciones, no hay evidencia publica de que el adaptador mejore al modelo base en ninguna tarea.
- Licencia no declarada. La model card incluye un marcador generico (`licence: license`), lo que deja el uso comercial en un limbo legal. Ademas, el modelo base podria estar sujeto a los terminos de uso de Gemma, que imponen obligaciones adicionales de atribucion y uso aceptable.
- Riesgo elevado de alucinacion: al ser un ajuste sobre un modelo base de la familia Gemma, conserva la propension generica a inventar hechos, agravada por la falta de evaluacion.
- Contenido de entrenamiento potencialmente problematico: uno de los datasets se denomina explicitamente "erotica_quality_cleaned_20pct_seed42" y otro "brainrot_chatlog". Es esperable que el adaptador reproduzca registros coloquiales, contenido sexual o texto de baja calidad, y que aumente el riesgo de salidas inapropiadas en produccion.
- Sesgos desconocidos: no se documenta composicion demografica ni proceso de filtrado de los corpus, por lo que los sesgos heredados del base mas los introducidos por el SFT no estan caracterizados.
- Limitacion de contexto: el entrenamiento se realizo con max_length de 4096, de modo que el comportamiento del adaptador mas alla de esa longitud es impredecible aunque el modelo base soporte ventanas mayores.
- Idiomas no declarados: no hay garantia de comportamiento multilingue; los corpus parecen anglofonos.
- Inconsistencia documental: la model card se titula con otro nombre de modelo ("gemma4-31b-pt-embed-r32a8-textcomp"), lo que sugiere que el README puede no describir este adaptador concreto. Los hiperparametros y estadisticas de dataset deben tratarse como no verificados.
- Reputacion y mantenimiento: 0 descargas, 0 likes y un unico commit practicamente simultaneo a la creacion del repositorio. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Requisito de infraestructura no trivial: aunque el adaptador es pequeno, exige cargar un modelo base de 31B, lo que implica al menos 24 GB de VRAM en 4 bits y del orden de 62 GB de disco para los pesos en bf16.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ToastyPigeon/gemma4-31b-confetti-adapter
- Modelo base declarado: https://huggingface.co/Columbidae/gemma4-31b-pt-embed-it
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/cooawoo-personal/Gemma4-31B/runs/lkdzz1dj
- Modelo oficial google/gemma-4-31B: https://huggingface.co/google/gemma-4-31B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Vision general de Gemma 4 (tamanos E2B, E4B, 12B, 26B A4B, 31B y decodificacion especulativa): https://ai.google.dev/gemma/docs/core
