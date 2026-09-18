# zankich/gemma-4-12B-it-W4A16-FP8KV

## Resumen

zankich/gemma-4-12B-it-W4A16-FP8KV es un checkpoint cuantizado del modelo multimodal google/gemma-4-12B-it, publicado por el usuario zankich. No es un modelo entrenado desde cero: se trata de una cuantización post-entrenamiento generada con llm-compressor 0.13.0 (con un parche propio de compressed_tensors 0.18.0) que reduce los pesos a INT4 con grupo de 128 y simétrico (W4A16, GPTQ weight-only), mantiene las activaciones en bfloat16 y añade una caché KV calibrada en FP8 E4M3.

El objetivo declarado es servir el modelo en GPUs Ampere (SM80/SM86) y anteriores a SM100, donde el stack estándar no resuelve correctamente este checkpoint. El autor publica un fork de vLLM (rama v0.29.0z) y una imagen Docker precompilada para cubrir ese hueco. El tamaño del repositorio baja de unos 24 GB en bfloat16 a 7,3 GB repartidos en cuatro shards, lo que permite ejecutar la variante unificada de 12B en GPUs de 24 GB.

El checkpoint es relevante para quien necesite inferencia multimodal (texto, imagen y audio) con presupuesto de VRAM ajustado y sobre hardware Ampere, pero su adopción exige asumir una dependencia fuerte del fork de vLLM, servir la caché KV en FP8 calibrado y aceptar que no hay benchmarks publicados por el autor. Con 35 descargas y 0 likes en el momento de redactar esta ficha, la validación por parte de la comunidad es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (transformer multimodal unificado, any-to-any: texto, visión y audio). Dos geometrías de atención: 40 capas con ventana deslizante, 8 cabezas KV y head_dim 256; y 8 capas de atención completa multi-query con 1 cabeza KV y head_dim 512 |
| Parámetros totales | 2.507.432.688 según los metadatos de safetensors; el nombre del checkpoint y la model card del autor indican 12B (discrepancia no explicada por el autor) |
| Parámetros activos | No aplica: el autor no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A16: pesos INT4 group-128 simétrico, weight-only, GPTQ; activaciones bfloat16; caché KV FP8 E4M3 con escalas estáticas simétricas por tensor. Formato compressed-tensors pack-quantized. Se mantienen en bf16: lm_head, embeddings de texto y las proyecciones de embedding de audio y visión |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 en los metadatos del repositorio, con enlace a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized), 4 shards, 7,3 GB en total; repositorio de 7,8 GB |
| Modelo base | google/gemma-4-12B-it |
| Librería de inferencia | vLLM (auto-detecta el formato desde config.json) |
| Pipeline declarado | any-to-any |
| GPU objetivo | Ampere y anteriores a SM100 con el fork de vLLM; SM100+ con vLLM estándar sin parches |
| Escalas KV calibradas | 96 tensores k_scale/v_scale, un par por capa, cada uno dimensionado para su geometría |
| Descargas / likes | 35 / 0 |
| Fechas | Creado el 18/09/2026, actualizado el 20/09/2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma4Unified, un transformer multimodal unificado en el que el modelo procesa texto, imagen y audio. Según los datos de calibración de la caché KV que documenta el autor, el backbone mezcla dos geometrías de atención sobre un total de 48 capas: 40 capas con atención de ventana deslizante (8 cabezas KV, head_dim 256) y 8 capas de atención completa con multi-query attention (1 cabeza KV, head_dim 512). El checkpoint no incluye pesos de torres de visión o audio, sino únicamente las proyecciones de embedding de ambas modalidades, que se conservan en bfloat16 junto con los embeddings de texto y el lm_head.

zankich no ha entrenado ni ajustado el modelo: la aportación es exclusivamente de cuantización. La receta ejecutada es un GPTQModifier de llm-compressor con esquema W4A16 sobre todos los módulos Linear excepto lm_head, embeddings y las proyecciones de visión y audio (excluidas mediante las expresiones regulares `re:.*vision.*`, `re:.*audio.*` y `re:.*embed.*`), con dampening_frac 0.2. La calibración de la caché KV se realiza en las mismas pasadas forward que la de los pesos, mediante kv_cache_scheme (8 bits, float, estrategia tensor, simétrica, no dinámica), sin paso de calibración adicional. No hay información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; el autor remite a la model card de google/gemma-4-12B-it para todo lo relativo a capacidades y entrenamiento.

## Capacidades

- Generación de texto y razonamiento en modo thinking, activable o desactivable por petición mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Comprensión de imágenes: la ruta multimodal (Triton) admite entradas de imagen, con 2496 tokens de encoder por imagen. El autor verificó una imagen sintética con respuesta correcta en forma y color.
- Comprensión y transcripción de audio: la imagen Docker incluye los extras `vllm[audio]`, por lo que el audio funciona sin instalación adicional. En una prueba con un clip de voz real de 20 segundos con acento de archivo, el autor reporta aproximadamente un 80-85 % de precisión de palabra.
- Modo texto puro optimizado: con `--language-model-only` y backend FlashInfer se desactivan las rutas de audio y visión para no malgastar memoria.
- Servicio compatible con la API de OpenAI a través de la imagen `zankich/vllm-openai:0.29.0z`.
- Detección automática del formato de cuantización por parte de vLLM a partir de config.json, sin configuración manual del esquema.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (más allá del modo thinking).
- Capacidades multilingües: no disponible en la información proporcionada; la model card no declara idiomas.

## Casos de uso

- Servicio de chat de texto en GPUs Ampere: con el modo FlashInfer y `--language-model-only`, el checkpoint ocupa 7,3 GB de pesos en lugar de los ~24 GB en bf16, lo que permite destinar el resto de la VRAM de una A100, A10 o RTX 3090 al KV cache y a un batch mayor.
- Despliegue en infraestructura SM100 o superior: en esas GPUs vLLM estándar sirve el checkpoint tal cual, sin necesidad del fork, lo que lo convierte en una vía sencilla para recortar el consumo de memoria sin cambiar de stack.
- Descripción de imágenes y respuesta a preguntas visuales (VQA): mediante la ruta Triton con `--max-num-batched-tokens` por encima de 2496 (3072 en el ejemplo del autor), cada imagen se procesa como 2496 tokens del encoder de visión.
- Transcripción de audio: indicado para archivos de voz donde se prioriza el contenido semántico antes que la literalidad exacta; conviene desactivar el modo thinking para que la transcripción no se consuma dentro del canal de razonamiento.
- Análisis de audio con razonamiento: resúmenes, clasificación o preguntas sobre el contenido de un clip se comportan con normalidad con thinking activado, según las notas del autor.
- Investigación con una única GPU de 24 GB: equipos que necesitan probar un modelo multimodal unificado en hardware de gama alta de consumo pueden hacerlo combinando 7,3 GB de pesos, KV en FP8 y un batch moderado.
- Reproducción de técnicas de cuantización: el repositorio documenta de forma explícita la receta (compressed-tensors 0.18.0, dampening_frac 0.2, kv_cache_scheme), lo que sirve como referencia para replicar W4A16 + KV FP8 sobre otras arquitecturas con llm-compressor.
- Backend interno compatible con OpenAI: al exponerse a través de vLLM con el servidor openai, puede integrarse como endpoint en aplicaciones que ya consumen la API de OpenAI, sin cambios en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, y remite a la model card del modelo base para capacidades y benchmarks. Las únicas validaciones publicadas son cualitativas y no comparan contra las escalas E4M3:

| Validación cualitativa | Resultado reportado |
|---|---|
| Imagen sintética (ruta Triton, KV E5M2) | Respuesta correcta en forma y color |
| Audio real de 20 s con acento (ruta Triton, KV E5M2) | ~80-85 % de precisión de palabra, errores atribuidos a W4A16 + KV E5M2 |
| Comparación a nivel de logprobs contra E4M3 | No realizada |

## Requisitos de hardware

- Pesos: 7,3 GB (INT4) frente a los ~24 GB del checkpoint en bfloat16.
- VRAM estimada solo para pesos: unos 7,5-8 GB, ya que activaciones, embeddings y proyecciones multimodales se mantienen en bfloat16.
- Caché KV en FP8: la geometría documentada suma 172.032 bytes por token (40 capas × 8 cabezas × 256 de head_dim + 8 capas × 1 cabeza × 512, para K y V). Estimación derivada de esos datos: unos 1,4 GB para 8.192 tokens y unos 5,6 GB para 32.768 tokens.
- GPU compatibles: Ampere (A100, A10, RTX 3090) y posteriores anteriores a SM100 requieren el fork `zankich/vllm` (rama v0.29.0z) o la imagen `zankich/vllm-openai:0.29.0z`. En SM100+ funciona con vLLM estándar.
- GPU de consumo: con 7,3 GB de pesos y KV en FP8, el modelo cabe con holgura en tarjetas de 24 GB como la RTX 3090 (SM86) o la RTX 4090 (SM89). En GPUs de 16 GB el ajuste depende del batch y de la longitud de contexto y no está verificado por el autor.
- Particularidad de la ruta Triton: el dtype E4M3 no compila por debajo de SM89, por lo que en la ruta multimodal se sirve la caché KV en E5M2.
- Opciones de despliegue: vLLM (fork del autor en pre-SM100, vLLM estándar en SM100+), con dos configuraciones documentadas (FlashInfer texto-only y Triton multimodal). No se mencionan llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. El autor no publica medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zankich/gemma-4-12B-it-W4A16-FP8KV | 12B nominal (2.507.432.688 según safetensors) | W4A16 INT4 + KV FP8 E4M3 | 7,3 GB (4 shards) | No disponible | apache-2.0 (enlace a licencia Gemma 4) | vLLM; fork necesario en pre-SM100 |
| google/gemma-4-12B-it (modelo base) | 12B nominal | Sin cuantizar, bfloat16 | ~24 GB | No disponible | Licencia de Gemma 4 | vLLM y otros stacks estándar |
| Otras cuantizaciones de gemma-4-12B-it | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada otros checkpoints comparables (por ejemplo, variantes GGUF, AWQ o GPTQ alternativas), ni resultados de rendimiento que permitan una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: los metadatos de safetensors indican 2.507.432.688 parámetros, muy lejos de los 12B que sugiere el nombre del checkpoint y del tamaño de 7,3 GB en INT4. El autor no aclara el motivo.
- Dependencia de un fork: en GPUs anteriores a SM100 hay que usar `zankich/vllm` (rama v0.29.0z) o la imagen Docker del autor. Esto implica mantener una dependencia no oficial y asumir su ciclo de actualizaciones.
- La caché KV en bfloat16 corrompe la generación de forma silenciosa: el servidor se declara sano, la salida greedy degenera en texto sin sentido y las comprobaciones estructuradas fallan sin dejar rastro en los logs. Las escalas FP8 calibradas son parte del contrato del checkpoint, no una opción de ajuste.
- La ruta Triton sirve la caché KV en E5M2 en lugar de E4M3, lo que aproximadamente duplica el ruido de cuantización por elemento. No se ha realizado ninguna comparación a nivel de logprobs entre ambas rutas.
- La ruta multimodal exige `--max-num-batched-tokens` superior a 2496; presupuestos menores provocan un fallo en la comprobación de arranque del modo multimodal.
- FlashInfer no soporta la atención multimodal de Gemma4Unified, de modo que el modo texto-only no puede servir imagen ni audio y mantener esas rutas activas solo desperdicia memoria.
- En peticiones de transcripción literal con thinking activado, el modelo tiende a transcribir dentro del canal de razonamiento y agota el presupuesto de tokens antes de emitir contenido; hay que desactivar thinking a nivel de petición.
- Calidad de la cuantización no evaluada de forma independiente: las cifras de audio (80-85 % de precisión de palabra) proceden del propio autor, sobre un único clip y con audio con acento de archivo, un escenario desfavorable.
- Sin benchmarks publicados: no hay métricas objetivas que permitan estimar la degradación frente al modelo base en razonamiento, código o matemáticas.
- Contexto e idiomas no documentados, lo que dificulta planificar despliegues multilingües o con ventanas largas.
- Licencia: el repositorio declara apache-2.0, pero el enlace de licencia apunta a los términos de Gemma 4 de Google. Conviene verificar las condiciones reales de uso comercial del modelo base antes de desplegarlo en producción.
- Validación comunitaria mínima: 35 descargas y 0 likes en el momento de redactar esta ficha.
- Sesgos y alucinaciones: no documentados por el autor; se heredan del modelo base y pueden verse agravados por la cuantización INT4, especialmente en tareas de razonamiento y en la ruta de audio con KV E5M2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zankich/gemma-4-12B-it-W4A16-FP8KV
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Fork de vLLM del autor: https://github.com/zankich/vllm
- Imagen Docker vLLM del autor: https://hub.docker.com/repository/docker/zankich/vllm-openai/tags/0.29.0z
- Búsqueda web: los resultados devueltos no contenían información relacionada con el modelo (eran páginas sobre servidores de Minecraft de Aternos), por lo que no se añaden enlaces adicionales.
