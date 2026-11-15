# YuCeong-May/WakeCue-ASR

## Resumen

WakeCue-ASR es un modelo de reconocimiento de voz dirigido a un hablante concreto (target-speaker ASR) desarrollado por YuCeong-May. El sistema recibe una grabación donde varias personas hablan simultáneamente y una breve pista textual (una secuencia de pocas palabras que pronuncia el hablante objetivo) y transcribe únicamente a quien dice esa pista, ignorando al resto. Si nadie pronuncia la pista, el modelo rechaza la petición. El modelo se publicó originalmente como *Text-Cue-Guided TS-ASR-Qwen* y el repositorio se renombró sin cambios en los pesos.

Arquitectura híbrida: un front end acústico basado en 9 capas Conformer con atención cruzada a la pista textual en cada capa, un proyector de audio y un LLM Qwen2.5-0.5B ajustado con LoRA que genera la transcripción de forma autorregresiva. El modelo total tiene 579 M de parámetros, de los cuales 85 M son entrenables (adaptadores LoRA y proyector). Está especializado en mandarín (audio a 16 kHz, recomendado dentro de 20 segundos) y se distribuye bajo la licencia FunASR Model Open Source License 1.1.

Su relevancia actual radica en que resuelve el problema de la separación de hablantes en la transcripción sin necesidad de grabaciones de enrolamiento, usando únicamente una pista textual corta, y además incorpora un mecanismo explícito de rechazo cuando la pista no aparece o no corresponde al hablante objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: AcousticEncoder (9 x Conformer, dim 256) + AudioProjector + LLM Qwen2.5-0.5B con LoRA |
| Parametros totales | 579 M (494 M base + 85 M entrenables: 45 M LoRA + 40 M proyector y encoders) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio recomendado dentro de 20 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino mandarín (zh) |
| Licencia | FunASR Model Open Source License 1.1 |
| Formato de pesos | `model.pt` (1.6 GB, checkpoint único con pesos base y LoRA) |

## Arquitectura y entrenamiento

El pipeline consta de cuatro componentes. El front end extrae features fbank de 80 dimensiones estilo Kaldi (ventana de 25 ms, desplazamiento de 10 ms). El CueEncoder (7,5 M de parámetros) procesa la pista textual con un vocabulario de 8406 unidades (caracteres chinos y subpalabras) y 4 capas Transformer de dimensión 256. El AcousticEncoder (27,5 M) aplica dos Conv2d con stride 2 (submuestreo 4x hasta 25 Hz) seguidas de 9 capas Conformer (dim 256, 4 cabezas, FFN 2048, kernel convolucional 15); cada capa atiende por atención cruzada a la representación de la pista. El AudioProjector (3,6 M) usa Conv1d con compuerta de 4 frames y stride 2, produciendo 12,5 tokens de audio por segundo, con cuello de botella proyectado a 896 dimensiones para el LLM.

El LLM es Qwen2.5-0.5B (24 capas, hidden 896) con LoRA de rango 64 y alpha 128 aplicado a q/k/v/o, gate/up/down y lm_head. Se le promptea con la pista y genera de forma greedy con tokens especiales: `<psok>cue<peok>transcript` cuando encuentra al hablante objetivo (la pista se marca entre corchetes en su posición), `<reject/>` cuando la pista no está en el audio, o `<psok>cue<peok><reject/>` cuando se oye la pista pero no del hablante objetivo. El checkpoint incluye una cabeza de clasificación de hablante (1,8 M) usada solo en entrenamiento e ignorada en inferencia. El archivo `model.pt` almacena 715 M valores de peso porque la matriz de embeddings de entrada y la cabeza de salida están atadas y, al aplicar LoRA a `lm_head`, la matriz compartida aparece duplicada (idéntica elemento a elemento), lo que explica el tamaño de 1,6 GB. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Reconocimiento de voz dirigido a un hablante concreto mediante pista textual (2-5 caracteres en los experimentos).
- Transcripción selectiva: transcribe solo al hablante que pronuncia la pista e ignora a los demás hablantes simultáneos.
- Rechazo explícito: devuelve `<reject/>` cuando la pista no aparece en el audio o cuando aparece pero no del hablante objetivo.
- Manejo de audio multihablante (mezclas de dos hablantes en los conjuntos de evaluación).
- Procesamiento de audio a 16 kHz con features fbank de 80 dimensiones.
- Generación autorregresiva greedy con el LLM Qwen2.5-0.5B subyacente.
- Idioma: mandarín exclusivamente.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones multihablante: dado un audio donde varias personas hablan a la vez y una pista de pocas palabras que pronuncia el participante de interés, el modelo extrae únicamente su intervención, útil para generar actas por hablante sin separación previa de fuentes.
- Indexación y búsqueda por hablante en archivos de audio: usando una frase característica del locutor como pista, se puede localizar y transcribir sus fragmentos en grabaciones largas divididas en segmentos de hasta 20 segundos.
- Atención al cliente con grabaciones de llamadas: en llamadas donde intervienen agente y cliente, una pista textual permite transcribir solo al cliente para análisis de sentimiento o extracción de motivos de consulta, con rechazo automático si la pista no aparece.
- Verificación de presencia de una frase clave: el mecanismo de rechazo permite comprobar si un hablante concreto pronunció una secuencia determinada, lo que sirve para validación de consentimientos grabados o confirmaciones verbales.
- Subtitulado selectivo en entornos ruidosos o con solapamiento: en contenido donde varias voces se superponen, el modelo puede aislar la transcripción del hablante objetivo sin necesidad de una grabación de enrolamiento previa.
- Investigación en separación de hablantes y ASR dirigido: el modelo sirve como referencia reproducible para experimentos de target-speaker ASR con pistas textuales, comparando su comportamiento frente a sistemas que requieren enrolamiento.
- Prototipado de asistentes de transcripción en mandarín: con 579 M de parámetros y un checkpoint de 1,6 GB, es viable desplegarlo en entornos con recursos moderados para pruebas de concepto de transcripción selectiva.

## Benchmarks y rendimiento

Resultados en TS-Aishell (mezclas de dos hablantes de AISHELL-1 y AISHELL-2; 6000 mezclas por conjunto; pista de 2-5 caracteres; decodificación greedy). CER / SER / tasa de rechazo en %.

| Test set | 2 chars | 3 chars | 4 chars | 5 chars |
|---|---|---|---|---|
| aishell1-ts | 4,21 / 20,32 / 0,92 | 2,69 / 17,08 / 0,35 | 2,09 / 15,23 / 0,32 | **1,83** / 13,90 / 0,57 |
| aishell-ios-ts | 11,56 / 44,55 / 3,67 | 8,77 / 38,73 / 3,12 | 7,22 / 34,32 / 4,47 | **6,34** / 29,25 / 7,58 |
| aishell-android-ts | 15,00 / 49,98 / 4,70 | 11,26 / 43,78 / 3,57 | 9,60 / 38,75 / 4,18 | **8,76** / 34,58 / 6,50 |
| aishell-mic-ts | 12,21 / 46,02 / 3,85 | 9,33 / 39,63 / 3,23 | 7,62 / 34,93 / 4,10 | **6,42** / 30,23 / 6,68 |
| aishell-mix-ts | 8,35 / 37,55 / 2,78 | 5,91 / 32,37 / 2,63 | 4,76 / 28,55 / 3,32 | **3,94** / 23,70 / 5,40 |

Comparación con Unified-TS-ASR (Conformer + CTC, 37 M de parámetros, con pista textual y 5 s de enrolamiento) a pista de 5 caracteres:

| Test set | WakeCue-ASR (pista textual) | Unified-TS-ASR (pista + enrolamiento) |
|---|---|---|
| aishell1-ts | **1,83** / **13,90** / 0,57 | 5,12 / 37,98 / 0,13 |
| aishell-ios-ts | **6,34** / **29,25** / 7,58 | 9,94 / 49,23 / 0,32 |
| aishell-android-ts | **8,76** / **34,58** / 6,50 | 12,06 / 55,57 / 0,80 |

Según la model card, pasar de 2 a 5 caracteres de pista reduce el CER entre un 42 % y un 57 % relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint `model.pt` ocupa 1,6 GB, por lo que en precisión completa se requiere al menos esa cantidad más el overhead de activaciones y del front end.
- GPU recomendadas: no disponible en la información proporcionada. El modelo se ha desplegado en un Space con ZeroGPU.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño del checkpoint (1,6 GB) es plausible en GPUs consumer con suficiente VRAM, pero no se documenta oficialmente.
- Opciones de despliegue: el paquete `tcg_tsasr` del repositorio del Space proporciona la clase `TextCueGuidedTSASR` con `from_pretrained` y `transcribe`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WakeCue-ASR | 579 M (85 M entrenables) | Audio recomendado ≤ 20 s, 16 kHz | Pista textual + Conformer + Qwen2.5-0.5B con LoRA | FunASR Model Open Source License 1.1 | Hugging Face y Space |
| Unified-TS-ASR | 37 M | no disponible | Conformer + CTC con pista textual y enrolamiento | no disponible | Hugging Face y Space |
| Alternativas de ASR dirigido por hablante | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en mandarín; no soporta otros idiomas según la información disponible.
- Audio recomendado dentro de 20 segundos; no se documenta el comportamiento con grabaciones más largas.
- La tasa de rechazo crece con pistas más largas (hasta 7,58 % en aishell-ios-ts con 5 caracteres), lo que implica falsos rechazos en producción.
- El SER es elevado en los conjuntos con condiciones de micrófono y dispositivo (hasta 34,58 % en aishell-android-ts con pista de 5 caracteres), lo que refleja dificultad en entornos reales.
- La calidad depende críticamente de la longitud y unicidad de la pista: con 2 caracteres el CER se dispara (hasta 15,00 % en aishell-android-ts).
- Riesgo de alucinación inherente a la generación autorregresiva del LLM subyacente; las transcripciones rechazadas se puntúan sobre el texto producido, lo que indica que el modelo puede generar texto aunque rechace.
- La licencia FunASR Model Open Source License 1.1 es una licencia "other" con condiciones específicas; es necesario revisar el archivo `MODEL_LICENSE` antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- El checkpoint contiene una cabeza de clasificación de hablante usada solo en entrenamiento e ignorada en inferencia, y una duplicación de la matriz de embeddings que infla el archivo a 1,6 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YuCeong-May/WakeCue-ASR
- Paper: https://arxiv.org/abs/2609.33853
- Código: https://github.com/YuCeong-May/Unified-TS-ASR
- Modelo Unified-TS-ASR: https://huggingface.co/YuCeong-May/Unified-TS-ASR
- Demo WakeCue-ASR: https://yuceong-may-unified-ts-asr.hf.space/wakecue/
- Space WakeCue-ASR: https://huggingface.co/spaces/YuCeong-May/WakeCue-ASR
- Space Unified-TS-ASR: https://huggingface.co/spaces/YuCeong-May/Unified-TS-ASR
- Licencia: https://huggingface.co/YuCeong-May/WakeCue-ASR/blob/main/MODEL_LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
