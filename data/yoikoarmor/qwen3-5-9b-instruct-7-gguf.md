# yoikoarmor/Qwen3.5-9B-Instruct-7-GGUF

## Resumen

Qwen3.5-9B-Instruct-7-GGUF es una cuantización Q4_K_M en formato GGUF de un derivado comunitario del modelo Qwen3.5-9B de Alibaba. El autor, yoikoarmor, partió del checkpoint base sin cuantizar en BF16, le aplicó el merge de un adaptador LoRA (el numero 7 de su serie de evaluaciones, de ahí el sufijo) y convirtió el resultado a GGUF con llama.cpp. No se trata de una release oficial de Qwen, sino de un derivado de la comunidad orientado a una tarea muy concreta: reescribir peticiones breves de imágenes en prompts positivos en inglés para Stable Diffusion.

El modelo conserva la arquitectura de texto de Qwen3.5: 32 capas, tamaño oculto de 4096 y un vocabulario de 248.320 tokens, con 8.953.803.264 parámetros totales. La componente multimodal y de visión se ha eliminado por completo, por lo que solo acepta entrada de texto. El contexto operativo documentado en las pruebas del autor es de 2048 tokens, aunque la longitud máxima nativa del modelo base no se especifica en la información disponible.

Su relevancia es acotada pero clara: ofrece una vía práctica de ejecutar localmente un modelo de ~9B especializado en generación de prompts para Stable Diffusion, con pesos de ~5,6 GB que caben en GPUs de consumo, licencia Apache 2.0 y un template de chat verificado contra el prompt original de Transformers en modo sin razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`qwen35`), 32 capas, hidden size 4096, vocabulario 248320 |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en las pruebas documentadas; máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (5.629.109.056 bytes, ~5,63 GB); checkpoint BF16 de origen en repo complementario |
| Tensores | 427 (217 Q4_K, 33 Q6_K, 177 F32) |
| Modelo base | yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16 (a su vez derivado de Qwen/Qwen3.5-9B, revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| LoRA aplicado | rank 16, alpha 32, epoch 3 / checkpoint 546, SHA-256 `d60d86811c44baebd5c5a4852532785fbea6822fbc7407bb8679548939bd764c` |
| SHA-256 del GGUF | `7480cb03124924db66bd72d2dcb78eb73829200e1b7727f273299675c76f49ff` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de texto identificado como `qwen35`, con 32 capas y un tamaño oculto de 4096. El vocabulario de 248.320 tokens es coherente con la familia Qwen3.5. El checkpoint fusionado no contiene tensores MTP (multi-token prediction), por lo que la conversión se realizó con `--no-mtp`, conservando únicamente el backbone de texto de 32 capas sin decodificación especulativa. Las componentes de visión y multimodal se omitieron deliberadamente, de modo que el modelo no admite entrada de imagen ni vídeo.

El entrenamiento del modelo base original corresponde a Qwen; sobre él se aplicó un adaptador LoRA (el número 7 de la serie evaluada por el autor, no siete adaptadores combinados) con rango 16 y alpha 32, seleccionado como el mejor adaptador en la época 3 / checkpoint 546. El merge se hizo con PEFT safe merge sobre el BF16 sin cuantizar, y la cuantización posterior a Q4_K_M se realizó con llama.cpp b9605 sin importance matrix, usando matrices BF16 en el intermedio y tensores F32 para normalización y matrices pequeñas. No se documenta el volumen de tokens de entrenamiento del LoRA ni la composición del dataset.

El modelo requiere un system prompt explícito en inferencia (no está embebido en los pesos) que instruye al modelo a reescribir peticiones breves en prompts positivos para Stable Diffusion y a controlar los pesos de atención de SD mediante la sintaxis `(phrase:weight)`, con rangos sugeridos de 0,8-0,95 para detalles secundarios, 1,1-1,2 para énfasis moderado y 1,25-1,4 para el sujeto central.

## Capacidades

- Generación de texto y reescritura de peticiones: convierte solicitudes cortas (incluido japonés) en prompts positivos en inglés para Stable Diffusion.
- Control de pesos de atención de Stable Diffusion mediante sintaxis `(phrase:weight)`, con instrucciones explícitas sobre rangos y criterios de ponderación.
- Modo sin razonamiento (thinking desactivado) verificado: el template de chat del GGUF produce un prompt idéntico al de Transformers en modo no-thinking.
- Multilingüe limitado a inglés y japonés según la model card; entrada en japonés validada en la prueba de humo.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No soporta visión, imagen ni vídeo: arquitectura exclusivamente de texto.
- No soporta audio (no documentado).

## Casos de uso

- Generación de prompts para Stable Diffusion en local: el modelo recibe una petición breve (por ejemplo, `少年の旅立ち`) y devuelve un prompt positivo en inglés con pesos de atención calibrados. Es adecuado porque el LoRA se entrenó específicamente para esta tarea y el system prompt define la política de ponderación.
- Integración en un front-end de generación de imágenes: desplegando `llama-server` con el template embebido y el endpoint `/apply-template`, el modelo actúa como capa de reescritura entre la interfaz de usuario y el pipeline de difusión, sin dependencia del repo BF16.
- Traducción y enriquecimiento de peticiones en japonés a prompts en inglés: útil para usuarios japoneses que escriben solicitudes cortas y necesitan un prompt detallado en inglés para modelos SD.
- Prototipado de herramientas de prompt engineering: el control explícito de pesos `(phrase:weight)` permite experimentar con énfasis de conceptos sin edición manual del prompt.
- Ejecución en estaciones de trabajo con GPU de consumo: los ~5,63 GB del Q4_K_M permiten cargar el modelo con `-ngl 99` en GPUs de 8-12 GB, dejando VRAM para el pipeline de difusión.
- Evaluación comparativa de adaptadores LoRA: el repo documenta el adaptador seleccionado (rank 16, alpha 32, checkpoint 546) con su SHA-256, lo que facilita reproducir la selección y comparar con otros adaptadores de la serie.
- Despliegue en entornos sin Transformers: al ser GGUF, se carga con llama.cpp, LM Studio (sujeto a la versión del runtime) o servidores compatibles, sin necesidad de bitsandbytes ni del cargador estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una prueba de humo: carga y generación de 128 tokens con llama.cpp b9605 (`85f99dca8`), CUDA 13.3 y RTX 5090, con decodificación greedy, contexto de 2048 tokens y thinking desactivado. El autor advierte que se trata de un smoke test, no de un benchmark de calidad ni de una prueba de equivalencia con BF16, y que la salida se truncó a 128 tokens, con posibilidad de repeticiones y pesos de atención uniformes.

## Requisitos de hardware

- VRAM estimada: ~5,63 GB solo para los pesos en Q4_K_M; con overhead de contexto y KV cache, prever 6-7 GB para 2048 tokens de contexto.
- GPU validadas: RTX 5090 con CUDA 13.3 y llama.cpp b9605 (prueba de humo del autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo solo; 12 GB o más si se comparte con el pipeline de difusión.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o superiores, gracias al tamaño Q4_K_M de ~5,63 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-completion`), LM Studio (compatibilidad dependiente de la versión del runtime, no verificada de forma independiente). No se carga mediante el path estándar de Transformers ni con bitsandbytes NF4.
- Latencia y throughput: no disponibles; no se documentan métricas de velocidad más allá de la generación de 128 tokens en la prueba de humo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Instruct-7-GGUF | 8,95B | 2048 (probado) | GGUF Q4_K_M | Apache 2.0 | Prompts para Stable Diffusion (LoRA) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | safetensors BF16 | no disponible en la información | Modelo generalista de texto |
| yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16 | 8,95B | no disponible | safetensors BF16 | Apache 2.0 | Mismo derivado sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización es con pérdida: Q4_K_M puede alterar los logits respecto al BF16 original, y el autor no realizó prueba de equivalencia.
- Repeticiones y estructuras truncadas: el autor advierte que aumentar el límite de salida no garantiza eliminarlas; en la prueba de humo se observaron pesos de atención uniformes.
- El system prompt es obligatorio en inferencia y no está embebido en los pesos; sin él, el comportamiento de reescritura de prompts no está garantizado.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto operativo de 2048 tokens en las pruebas; el máximo nativo no está documentado y podría ser mayor, pero no se valida.
- Sin capacidades de visión, audio, tool calling ni agentes; es un modelo de texto especializado en una única tarea.
- Compatibilidad con LM Studio no verificada de forma independiente; depende de la versión del runtime instalada.
- No se carga con el path estándar de Transformers; requiere llama.cpp u otro runtime compatible con GGUF de Qwen3.5.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un derivado comunitario no oficial de Qwen; conviene revisar la licencia del modelo base original.
- Riesgo de sesgos y alucinaciones inherente al modelo base, no evaluado en esta release; no se publican datos de entrenamiento ni evaluaciones de sesgo.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-GGUF
- Modelo base fusionado BF16: https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
