# wilsonzheng0327/Qwen3-Omni-30B-A3B-Instruct-thinker-dflash

## Resumen

Qwen3-Omni-30B-A3B-Instruct-thinker-dflash es un modelo borrador (draft model) para decodificación especulativa del thinker de `Qwen/Qwen3-Omni-30B-A3B-Instruct`, el modelo de mezcla de expertos de 48 capas que responde a entradas de texto, imagen, audio y vídeo. Lo publica el usuario wilsonzheng0327 y parte de `z-lab/Qwen3-Coder-30B-A3B-DFlash`, afinado sobre las propias respuestas del thinker a unas 170.000 indicaciones de texto y audio, más el split de entrenamiento de GSM8K. No es un modelo generativo autónomo: es un acelerador que propone tokens que el modelo objetivo verifica.

Su relevancia es práctica: la decodificación especulativa con DFlash reduce la latencia y aumenta el throughput del thinker sin alterar la precisión de las respuestas. Según la model card, el borrador alcanza 1,86x en clips/s sobre LibriSpeech test-clean con concurrencia 1 (frente a 1,63x del borrador de referencia de SpeechSpec) y 1,54x en MT-Bench con concurrencia 16. Además, al heredar el contexto de 65.536 posiciones del thinker, permite servir indicaciones largas de vídeo que el borrador alternativo (8.192 posiciones) no puede atender.

El repositorio pesa 0,9 GB y sus safetensors suman 473.995.264 parámetros, coherente con un borrador de 8 capas sin embedding ni cabeza de salida (usa las del objetivo). La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft DFlash (8 capas Qwen3) con `fc`, `hidden_norm` y `norm`; sin embedding ni cabeza de salida, usa los del objetivo |
| Parametros totales | 473.995.264 (dato de safetensors) |
| Parametros activos | no disponible (el borrador no es MoE; el objetivo sí lo es, 30B totales / 3B activos) |
| Longitud de contexto | 65.536 posiciones (la del thinker) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El borrador replica el diseño de z-lab: 8 capas con dimensión oculta 2048, intermedia 6144, 32 cabezas de atención y 4 cabezas KV, con `head_dim` 128. Consume las salidas de las capas decodificadoras 1, 12, 23, 34 y 45 de las 48 del objetivo (`dflash_config.target_layer_ids`), usa un tamaño de bloque de 8 (7 propuestas por ronda, no causal dentro del bloque) y el token de máscara 151662 (`<|fim_pad|>`). El vocabulario es el completo del objetivo (152.064) a través de su embedding y su cabeza de salida. El trabajador DFlash de SGLang lo carga tal cual.

El entrenamiento usó 170.740 indicaciones (todos los turnos de usuario) y 169.681 respuestas generadas por el thinker desde servidores sglang-omni solo texto; 1.059 quedaron reservadas. Las fuentes incluyen UltraChat 200k (40.000), OASST2 (5.807), Llama-Nemotron post-training (8.000 por categoría de chat, matemáticas y código), LibriSpeech train-clean-100 y 360 (50.000), AISHELL-1 (20.000), People's Speech (12.000), VoxPopuli inglés (10.000), FLEURS inglés/chino (2.596/3.242) y YODAS2 (1.262/1.833). No se usaron imágenes ni vídeo porque requerirían posiciones M-RoPE y filas deepstack en el entrenamiento. El entrenador fue `DFlashDraftModel` de speculators con pérdida de entropía cruzada y pesos de posición D-Pace, inicializado desde los pesos de z-lab, AdamW con lr 3e-4, weight decay 0,01, warmup del 4 % y coseno; 5 épocas (16.220 pasos) en lotes empaquetados de 16.384 tokens sobre dos H100, unas 2 h 41 min. Una segunda etapa para GSM8K añadió 2 épocas (1.462 pasos, lr 1e-4) sobre las respuestas del thinker al split de entrenamiento de GSM8K (7.473 preguntas) más 30.000 respuestas de replay.

## Capacidades

- Aceleración de decodificación especulativa del thinker de Qwen3-Omni-30B-A3B-Instruct para entradas de texto y audio.
- Propuesta de hasta 7 tokens por ronda con tamaño de bloque 8, verificados por el objetivo.
- Soporte de indicaciones de audio (transcripción, resumen, tema, traducción, tono del hablante, idioma) gracias al entrenamiento con LibriSpeech, AISHELL-1, People's Speech, VoxPopuli, FLEURS y YODAS2.
- Contexto de 65.536 posiciones, suficiente para servir indicaciones largas de vídeo con `--thinker.factory.max_seq_len 32768` como en el CI de Video-MME.
- No soporta salida de voz cuando se usa con el borrador (según las notas del cookbook).
- No entrena con imágenes ni vídeo; su uso con esos modalidades depende de que el objetivo los procese y de que el borrador opere sobre las posiciones correspondientes.
- Integración nativa con SGLang mediante el algoritmo DFLASH (`--thinker.engine.speculative_algorithm DFLASH`).

## Casos de uso

- Transcripción de audio a gran escala: con LibriSpeech test-clean el borrador sirve 12,91 clips/s frente a 6,90 sin borrador (1,86x) y reduce la latencia media de 145 ms a 77 ms, adecuado para pipelines de ASR por lotes.
- Servicio de chat multi-turno: en MT-Bench con concurrencia 16 alcanza 1.619 tok/s frente a 1.052 sin borrador (1,54x), útil para despliegues con many usuarios simultáneos.
- Razonamiento matemático: en GSM8K test (primeras 200) sirve 449-450 tok/s frente a 243 sin borrador (1,85x), lo que abarata la generación de cadenas de razonamiento largas.
- Procesamiento de vídeo de contexto largo: con el CI de Video-MME (50 casos, concurrencia 16, contexto de 32.768 tokens) sirve 0,351 req/s, mientras el borrador de SpeechSpec no puede atenderlo por su contexto de 8.192.
- Evaluación de calidad del thinker en producción: al no alterar la precisión (la aceptación en held-out se mantiene en 3,018), permite acelerar pruebas A/B y evaluaciones sobre las mismas respuestas.
- Despliegue en clústeres H100 con SGLang: se integra mediante el worker DFlash de sglang-omni sin cambios en el código del servidor, reduciendo coste por token en cargas de texto y audio.
- Atención al cliente con entrada de voz: combina la comprensión de audio del thinker con la aceleración del borrador para conversaciones multi-turno con contexto largo.

## Benchmarks y rendimiento

Resultados servidos con sglang-omni (`main` en b13b8d4ba, SGLang 0.5.23) sobre H100, una GPU y un servidor solo texto nuevo por ejecución, greedy. Cada configuración se ejecutó una vez en cada una de dos GPU; se muestran ambos valores. c1 es una petición a la vez, c16 dieciséis.

| Carga | Sin borrador | DFlash de SpeechSpec | Este borrador |
|---|---:|---:|---:|
| LibriSpeech test-clean, 2.620 clips, c1 (clips/s) | 6,90 / 6,95 | 11,30 / 11,30 (1,63x) | 12,91 / 12,89 (1,86x) |
| LibriSpeech test-clean, c1 latencia media | 145 / 144 ms | 88 / 88 ms | 77 / 78 ms |
| LibriSpeech test-clean, c16 (clips/s) | 29,9 / 29,8 | 48,4 / 48,1 (1,62x) | 54,5 / 54,6 (1,83x) |
| MT-Bench, 80 primeros turnos, c1 (tok/s) | 243 / 243 | 246 / 246 (1,01x) | 272 / 273 (1,12x) |
| MT-Bench, c16 (tok/s) | 1.052 / 1.052 | 1.458 / 1.465 (1,39x) | 1.619 / 1.615 (1,54x) |
| Held-out, 358 indicaciones de 13 fuentes, c1 (tok/s) | 239 / 238 | 253 / 253 (1,06x) | 299 / 300 (1,26x) |
| GSM8K test, primeras 200, c1 (tok/s) | 243 / 242 | 449 / 447 (1,85x) | 449 / 450 (1,85x) |
| Video-MME CI 50, c16, contexto 32.768 (req/s) | 0,345 | no puede servir (contexto 8.192) | 0,351 |

La precisión no cambia: la aceptación en held-out pasó de 3,027 a 3,018 tras la segunda etapa, y el thinker reconstruido coincidió con el token servido en el 98,2-98,3 % de los casos en AISHELL y FLEURS.

## Requisitos de hardware

- El borrador pesa 0,9 GB en bf16 y se sirve junto al thinker; la VRAM total la determina el objetivo (30B totales, 3B activos), no el borrador.
- GPU recomendadas: H100 (usadas en las mediciones de la model card), A100 80 GB y, en general, GPUs con memoria suficiente para el thinker en bf16.
- No cabe en GPUs de consumo para servir el thinker completo; el borrador por sí solo sí cabría, pero no es funcional sin el objetivo.
- Despliegue: SGLang con sglang-omni (`python -m sglang_omni.cli serve --model-path Qwen/Qwen3-Omni-30B-A3B-Instruct --text-only --port 8000 --thinker.engine.speculative_algorithm DFLASH --thinker.engine.speculative_draft_model_path wilsonzheng0327/Qwen3-Omni-30B-A3B-Instruct-thinker-dflash`).
- Throughput medido: hasta 1.619 tok/s en MT-Bench c16 y 449-450 tok/s en GSM8K c1 sobre H100.
- El tamaño de bloque (8) se toma de la configuración del borrador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (LibriSpeech c1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este borrador (wilsonzheng0327) | 474M | 65.536 | 12,91 clips/s (1,86x) | Apache-2.0 | Hugging Face |
| DFlash de SpeechSpec (`yuekai/qwen3_omni_30b_a3b_instruct_dflash_block8`) | 5 capas, tamaño no disponible | 8.192 | 11,30 clips/s (1,63x) | no disponible | Hugging Face |
| `z-lab/Qwen3-Coder-30B-A3B-DFlash` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Sin borrador (thinker solo) | 30B totales / 3B activos | 65.536 | 6,90 clips/s | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el thinker de Qwen3-Omni-30B-A3B-Instruct para funcionar.
- No se entrenó con imágenes ni vídeo; su uso con esas modalidades no está validado y depende del objetivo.
- No soporta salida de voz cuando se sirve con el borrador.
- Solo declara inglés y chino; el rendimiento en otros idiomas no está documentado.
- La aceptación media en held-out es de 3,018 tokens por ronda; valores inferiores implican menor aceleración.
- Las mediciones se hicieron en H100 con una sola GPU y una ejecución por GPU; no hay datos de latencia en otras GPU.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos tienen licencias diversas (MIT, Apache-2.0, CC BY 4.0, CC0, CC BY 3.0) que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.
- No hay información sobre sesgos ni sobre tasas de alucinación específicas del borrador; hereda las del thinker.

## Enlaces

- Hugging Face del borrador: https://huggingface.co/wilsonzheng0327/Qwen3-Omni-30B-A3B-Instruct-thinker-dflash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Árbol de archivos del objetivo: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct/tree/main
- Modelo base del borrador: https://huggingface.co/z-lab/Qwen3-Coder-30B-A3B-DFlash
- Borrador de referencia de SpeechSpec: https://huggingface.co/yuekai/qwen3_omni_30b_a3b_instruct_dflash_block8
