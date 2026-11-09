# wilsonzheng0327/Ming-3.0-audio-flash-dflash

## Resumen

Ming-3.0-audio-flash-dflash es un modelo borrador (draft model) para decodificacion especulativa del modelo base inclusionAI/Ming-3.0-audio-flash, un modelo nativo audio-lenguaje de tipo Mixture-of-Experts. Lo publica el usuario wilsonzheng0327 bajo licencia MIT y esta entrenado especificamente para transcripcion en ingles y chino. Su funcion no es generar texto de forma autonoma, sino proponer bloques de tokens candidatos que el modelo objetivo (el "thinker" de Ming-3.0-audio-flash) verifica y acepta, acelerando la inferencia sin alterar la salida greedy.

El borrador es un transformer denso de 8 capas con 646 millones de parametros (hidden 2560, intermediate 6144, 20 cabezas de atencion y 4 cabezas KV, head_dim 128) que consume los estados residuales de tres capas auxiliares del objetivo (2, 21 y 39) y opera con un vocabulario reducido de 48.000 tokens sobre los 157.184 del objetivo. La relevancia de esta ficha es practica: documenta un artefacto de aceleracion de inferencia para un modelo de 125B parametros, con mediciones de longitud de aceptacion y throughput, algo poco habitual en modelos borrador publicados.

El modelo base, Ming-3.0-audio-flash, es un decodificador hibrido Ling V3 de 42 capas con atencion delta de Kimi en cinco de cada seis capas y MLA con compuerta en la sexta, 512 expertos enrutados con 8 activos mas uno compartido, y unos 125B parametros totales con 6.5B activos. Este borrador se entrena contra la revision `db94e0de19` del thinker y solo es util en ese contexto de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (borrador DFlash) sobre estados residuales de un decoder hibrido MoE |
| Parametros totales | 646.110.592 |
| Parametros activos | no disponible (no es MoE; el objetivo tiene 6.5B activos) |
| Longitud de contexto | ventana deslizante de 2.048 tokens (maximo ~30 s de audio mas prompt y transcripcion) |
| Tipos de cuantizacion | bf16 (unica precision publicada) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (layout speculators DFlash: `fc`, `hidden_norm`, capas Qwen3 densas, `norm`, `lm_head` reducido con `d2t`/`t2d`) |

## Arquitectura y entrenamiento

El borrador sigue el layout DFlash de la libreria speculators: una capa `fc` que proyecta los estados auxiliares del objetivo, normalizacion, 8 capas transformer densas con atencion de 20 cabezas y 4 cabezas KV, y una cabeza de lenguaje reducida a 48.000 filas congeladas de la cabeza del objetivo, mapeadas mediante tablas `d2t`/`t2d`. Propone bloques de 16 tokens (15 propuestas por ronda, con ancla en el ultimo token confirmado) y usa un token mascara (156910, `<|reserved_token_15|>`) que no aparece en ningun prompt servido. El checkpoint incluye ademas una cabeza MTP de una capa, servible via sgl-project/sglang-omni#3574, que se usa como referencia comparativa.

El entrenamiento emplea 285.828 clips de audio (893 horas) con licencias que permiten uso comercial: People's Speech, LibriSpeech train-clean-360, YODAS2 en000 y zh000, VoxPopuli, FLEURS y AISHELL-1 (531 h en ingles, 362 h en chino). Las etiquetas son las transcripciones greedy del propio objetivo obtenidas via sglang-omni, con formato `<language>\t<transcript><|role_end|><|endoftext|>` y hasta 384 tokens nuevos. Como el objetivo no cabe en el bucle de entrenamiento, `hidden.py` lo ejecuto una vez en modo teacher-forced sobre dos GPUs y almaceno los tres estados auxiliares y la salida pre-norm de la ultima capa para cada posicion (bf16, 20 KB por token); el argmax del decoder coincide con la etiqueta servida en 99,49% de tokens held-out. El entrenamiento uso `DFlashDraftModel` con perdida de entropia cruzada y pesos de posicion D-Pace, AdamW con lr 6e-4, weight decay 0.01, 4% warmup, schedule coseno, 8 epocas (5.912 pasos), batches empaquetados de 16.384 tokens en cuatro H200 durante 57 minutos. Se publica el paso 5.205, el mejor sobre un subconjunto held-out.

## Capacidades

- Decodificacion especulativa greedy: propone hasta 15 tokens por ronda que el objetivo verifica, manteniendo la salida identica a la del modelo base.
- Transcripcion de voz en ingles y chino como tarea de entrenamiento principal.
- Consumo de estados internos del objetivo: requiere acceso a las salidas de las capas 1, 20 y 38 del thinker.
- Integracion con sglang-omni mediante el worker DFlash de vocabulario reducido.
- No genera respuestas de forma autonoma ni realiza razonamiento, tool calling, vision ni agentes por si mismo; esas capacidades residen en el modelo objetivo.
- No soporta function calling ni multi-step reasoning de forma nativa.
- Cobertura multilingue limitada a en y zh.

## Casos de uso

- Aceleracion de transcripcion por lotes: procesar grandes volumenes de audio en ingles y chino con el thinker de Ming-3.0-audio-flash, donde el borrador multiplica el throughput de 2,6 a 6,8 peticiones por segundo en configuracion c8 sin grafos CUDA.
- Servicio de ASR de baja latencia en streaming: con grafos CUDA activos y concurrencia 1, el borrador alcanza 4,07 peticiones por segundo frente a 2,64 sin borrador, adecuado para dictado o subtitulado casi en tiempo real.
- Subtitulado de reuniones y actas: clips de hasta 30 segundos encajan en la ventana de 2.048 tokens, permitiendo transcribir intervenciones cortas con contexto de prompt e idioma.
- Pipelines de datos para entrenamiento: generar transcripciones masivas de corpus en ingles y chino con mayor eficiencia energetica por token frente al modelo base sin borrador.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el checkpoint y sus mediciones de longitud de aceptacion (7,10 global, 7,78 en ingles, 5,70 en chino) sirven como referencia reproducible para investigacion en aceleracion de inferencia.
- Despliegue en entornos con restricciones de latencia y dos H200: la configuracion medida (thinker con tensor-parallel 2 mas borrador sincrono) es una receta concreta para produccion.
- Investigacion sobre borradores con vocabulario reducido: el mapeo `d2t`/`t2d` y la mascara dedicada son un caso de estudio para disenar draft models sobre cabezas congeladas.

## Benchmarks y rendimiento

Longitud de aceptacion simulada en CUDA sobre estados almacenados, 1.500 clips held-out (FLEURS test en/zh, LibriSpeech test clean y other, VoxPopuli test en, YODAS2 held-out):

| Borrador | Datos | Bloque | Capas | Global | en | zh | Libri clean | Libri other | VoxPopuli | YODAS en | FLEURS en | YODAS zh | FLEURS zh |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A | 196k clips (603 h) | 8 | 5 | 5,26 | 5,63 | 4,44 | 5,93 | 5,32 | 5,90 | 5,85 | 5,03 | 4,56 | 4,27 |
| B | 196k clips | 16 | 5 | 6,57 | 7,47 | 4,92 | 8,06 | 6,64 | 8,39 | 8,01 | 6,29 | 5,17 | 4,59 |
| C | 286k clips (893 h) | 16 | 5 | 6,81 | 7,50 | 5,43 | 8,01 | 6,82 | 8,44 | 8,21 | 6,12 | 5,86 | 4,89 |
| D (publicado) | 286k clips | 16 | 8 | 7,10 | 7,78 | 5,70 | 8,43 | 7,13 | 8,78 | 8,38 | 6,28 | 6,15 | 5,15 |
| E | 286k clips | 8 | 8 | 5,32 | 5,53 | 4,80 | 5,91 | 5,30 | 6,03 | 5,42 | 5,02 | 5,04 | 4,48 |
| F | 286k clips | 12 | 8 | 6,52 | 6,98 | 5,50 | 7,37 | 6,30 | 7,66 | 7,63 | 5,90 | 5,93 | 4,97 |

Throughput en servicio con sglang-omni sobre dos H200 (thinker tensor-parallel 2, greedy), peticiones por segundo:

| Configuracion | Grafos off c1 | Grafos off c8 | Grafos on c1 | Grafos on c8 |
|---|---:|---:|---:|---:|
| Mezcla held-out, sin borrador | 0,39 | 2,60 | 2,64 | 8,21 |
| MTP (#3574) | 0,81 (2,07x) | 4,52 (1,74x) | 3,37 (1,27x) | 9,92 (1,21x) |
| DFlash A | 1,45 (3,69x) | 6,83 (2,62x) | 4,07 (1,54x) | 11,71 (no disponible en el extracto) |

Los datos de DFlash B-F en servicio no aparecen en la informacion disponible. Cada brazo se midio con un servidor nuevo y una sola ejecucion.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 1,3 GB en bf16; en inferencia necesita ademas los estados auxiliares del thinker, por lo que el consumo dominante es el del modelo objetivo.
- GPU recomendadas: el sistema medido usa dos H200 (thinker con tensor-parallel 2 mas borrador sincrono); el entrenamiento uso cuatro H200.
- No cabe en GPU consumer: el thinker de ~125B parametros con 6.5B activos excede la VRAM de tarjetas como RTX 4090 incluso con cuantizacion agresiva, y el borrador depende de sus estados internos.
- Opciones de despliegue: sglang-omni con el worker DFlash de vocabulario reducido; la libreria speculators para cargar el checkpoint.
- Latencia y throughput: entre 1,45 y 11,71 peticiones por segundo segun concurrencia y grafos CUDA, con aceleraciones de 1,21x a 3,69x frente al servicio sin borrador.
- La ventana deslizante de 2.048 tokens limita las peticiones a unos 30 segundos de audio mas prompt y transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming-3.0-audio-flash-dflash (este) | 646M (borrador) | 2.048 | Borrador especulativo para ASR en/zh | MIT | Hugging Face |
| Cabeza MTP de Ming-3.0-audio-flash | no disponible | no disponible | Borrador alternativo servible via sglang-omni#3574 | MIT (hereda del base) | Incluida en el checkpoint |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | Borrador DFlash para Qwen3-ASR-1.7B | no disponible | Hugging Face |
| Ming-3.0-audio-flash (objetivo) | ~125B (6.5B activos) | no disponible | Modelo audio-lenguaje nativo | no disponible en la informacion | Hugging Face, GitHub |

La comparacion directa con MTP muestra que DFlash supera la cabeza MTP en todas las configuraciones medidas (por ejemplo, 6,83 frente a 4,52 peticiones por segundo con grafos off y c8).

## Limitaciones y advertencias

- Solo funciona con la revision `db94e0de19` del thinker de Ming-3.0-audio-flash; cambios en el objetivo invalidan los estados auxiliares esperados.
- No es un modelo autonomo: no responde prompts por si mismo, solo propone tokens para verificacion.
- Ventana de 2.048 tokens: peticiones con audio superior a unos 30 segundos quedan fuera del diseno.
- Cobertura limitada a ingles y chino; otros idiomas no estan representados en el entrenamiento.
- Sesgos: los datasets de entrenamiento (People's Speech, LibriSpeech, YODAS2, VoxPopuli, FLEURS, AISHELL-1) condicionan el dominio acustico y los acentos cubiertos.
- Riesgo de alucinacion: el borrador no inventa salida final porque el objetivo verifica cada token, pero una longitud de aceptacion baja degrada la aceleracion sin cambiar la correccion.
- Licencia MIT para el borrador; las licencias del modelo base y de los datos de entrenamiento deben verificarse por separado para uso comercial.
- Mediciones de servicio con una sola ejecucion por brazo y servidor nuevo, por lo que la variabilidad entre ejecuciones no esta caracterizada.
- Los grafos CUDA del thinker estan desactivados por defecto en main (sgl-project/sglang-omni#2921) porque tres transcripciones cambiaron; activarlos altera la reproducibilidad exacta.
- Sin pipeline declarado en Hugging Face y con cero descargas, el soporte de la comunidad es minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilsonzheng0327/Ming-3.0-audio-flash-dflash
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-audio-flash
- Repositorio del modelo base: https://github.com/inclusionAI/Ming-3.0-audio-flash
- Referencia de layout DFlash: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Issue de sglang-omni sobre la cabeza MTP: sgl-project/sglang-omni#3574
- Issue de sglang-omni sobre grafos CUDA: sgl-project/sglang-omni#2921
