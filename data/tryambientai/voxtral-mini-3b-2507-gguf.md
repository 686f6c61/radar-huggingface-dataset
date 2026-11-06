# tryambientai/Voxtral-Mini-3B-2507-gguf

## Resumen

Voxtral-Mini-3B-2507-gguf es la conversión a formato GGUF del modelo Voxtral Mini 3B (2507) de Mistral AI, publicada por el usuario tryambientai para su uso con el runtime transcribe.cpp. Voxtral Mini es un modelo de audio-lenguaje que combina un codificador de audio bidireccional basado en Whisper-large-v3 con un decodificador causal Ministral-3B (30 capas, GQA 32/8, NEOX RoPE, SwiGLU), unidos mediante inyección de tokens de audio a través de un proyector de 4 grupos de frames que genera 375 tokens de audio por cada fragmento de 30 segundos. El resultado es un sistema capaz de transcribir y traducir voz de forma offline, además de razonar sobre el contenido del audio.

El modelo resuelve el problema de la transcripción y comprensión de audio multilingüe sin depender de servicios en la nube: acepta WAV mono a 16 kHz y produce transcripciones mediante decodificación greedy, con detección automática de idioma y traducción de voz integrada. Es relevante porque ofrece una ventana de contexto de 32k tokens que permite procesar audios de hasta 30 minutos para transcripción (40 minutos para comprensión), manteniendo las capacidades de comprensión textual de su backbone Ministral-3B.

Esta ficha se centra en la variante GGUF publicada por tryambientai, que incluye cuantizaciones desde BF16 (9,37 GB) hasta Q4_K_M (2,98 GB), todas validadas numéricamente contra la referencia en Transformers con una paridad byte-exacta en BF16. La licencia Apache-2.0 heredada del modelo base facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio Whisper-large-v3 (bidireccional) + proyector de 4 frame-groups + decodificador causal Ministral-3B (30 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parametros totales | 4.676.297.232 (según safetensors del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens (hasta 30 min de audio para transcripción, 40 min para comprensión) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

Voxtral Mini 3B sigue una arquitectura de audio-lenguaje en la que un codificador de audio bidireccional derivado de Whisper-large-v3 procesa la entrada de audio y la proyecta mediante un proyector de 4 grupos de frames (375 tokens de audio por fragmento de 30 s) hacia un decodificador causal Ministral-3B. Este decodificador consta de 30 capas con atención de consultas agrupadas (GQA) con ratio 32/8, RoPE en variante NEOX y activación SwiGLU. La inyección de tokens de audio se realiza directamente en la secuencia del decodificador, lo que permite al modelo razonar sobre el audio como si fuera texto.

El modelo es el hermano pequeño de Voxtral Small 24B: comparte codificador, proyector, frontend log-mel y tokenizador tekken, sustituyendo el decodificador Mistral-Small-24B por el Ministral-3B. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La conversión GGUF fue realizada a partir del commit 3060fe3 del modelo base (fijado el 2026-06-06) y validada contra la referencia en Transformers en el commit 483c122 de transcribe.cpp, con 43 tensores verificados dentro de tolerancia y transcripción byte-exacta en BF16. La decodificación es greedy y no se soporta streaming según los metadatos del autor de la conversión.

## Capacidades

- Transcripción de voz (speech-to-text) en modo dedicado, con detección automática del idioma de origen y transcripción en consecuencia.
- Traducción de voz (speech translation) mediante la plantilla instruct de mistral-common.
- Comprensión de audio: respuesta a preguntas (Q&A) y generación de resúmenes estructurados directamente sobre el audio, sin pipeline ASR + LLM separado.
- Multilingüe nativo: inglés, español, francés, portugués, hindi, alemán, neerlandés e italiano.
- Function calling a partir de la voz: activación de funciones de backend, flujos de trabajo o llamadas a API según la intención hablada del usuario.
- Capacidades de comprensión textual heredadas del backbone Ministral-3B.
- Contexto largo: 32k tokens, suficiente para 30 minutos de audio en transcripción y 40 minutos en comprensión.
- Sin soporte de streaming (según metadatos de la conversión).
- Sin marcas de tiempo (timestamps: none).

## Casos de uso

- Transcripción offline de reuniones y entrevistas: el modelo procesa WAV mono a 16 kHz y genera actas completas de hasta 30 minutos en una sola pasada, gracias a la ventana de 32k tokens. Adecuado para entornos con requisitos de privacidad donde no se puede enviar audio a la nube.
- Subtitulado y traducción de contenido audiovisual: combinando la detección automática de idioma y la traducción de voz, se puede transcribir un vídeo en inglés y generar la versión en español en el mismo paso, usando la plantilla instruct de mistral-common.
- Asistentes de voz con function calling: el modelo puede interpretar la intención hablada y disparar llamadas a API o flujos de backend directamente, lo que permite construir interfaces de voz para sistemas de reservas, control de dispositivos o atención al cliente sin un NLU separado.
- Análisis y resumen de llamadas de atención al cliente: con la capacidad de Q&A sobre audio, se puede preguntar directamente "¿cuál fue el motivo de la llamada?" o "¿se resolvió la incidencia?" sobre una grabación, generando resúmenes estructurados sin pipeline ASR + LLM.
- Investigación lingüística y análisis de corpus orales: la combinación de transcripción multilingüe (8 idiomas) y contexto largo permite procesar entrevistas o grabaciones de campo de forma local, con cuantizaciones Q4_K_M de 2,98 GB que caben en portátiles.
- Despliegue en dispositivos de borde: las cuantizaciones Q4_K_M y Q5_K_M (2,98 GB y 3,46 GB) permiten ejecutar el modelo en CPU o GPU integrada mediante transcribe.cpp, con ratios de tiempo real de 2x en CPU y 14,9x en Metal (M4 Max) según los datos del autor.
- Procesamiento por lotes de archivos de audio en servidores sin GPU dedicada: con RTF de 0,5 en CPU Ryzen 4750U y 1,2 en Vulkan, es viable transcribir grandes volúmenes de audio en hardware de consumo.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,88 | 1,89 | 1,87 | 1,87 | 1,91 | 1,94 |

Referencia en Hugging Face Transformers (VoxtralForConditionalGeneration, BF16, attn_implementation=eager, greedy): 1,87% WER. El GGUF BF16 coincide dentro del redondeo. La paridad BF16-referencia es la puerta de validación numérica de la familia: 43 tensores verificados dentro de tolerancia y transcripción byte-exacta.

| Métrica de rendimiento | Valor |
|---|---|
| RTF en Metal (M4 Max) | 14,9 |
| RTF en CPU (M4 Max) | 2,0 |
| RTF en Vulkan (Ryzen 4750U) | 1,2 |
| RTF en CPU (Ryzen 4750U) | 0,5 |
| Streaming | No |
| Traducción | Sí |
| Detección de idioma | Sí |
| Timestamps | No |

No se han publicado en la información disponible resultados de benchmarks de audio más allá de LibriSpeech test-clean (WER), ni de benchmarks de texto (MMLU, GSM8K, etc.) para esta variante GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 ~9,4 GB; F16 ~9,4 GB; Q8_0 ~5,0 GB; Q6_K ~3,9 GB; Q5_K_M ~3,5 GB; Q4_K_M ~3,0 GB.
- GPU recomendadas: NVIDIA L40S (usada para la validación de WER), A100/H100 para despliegues de alto throughput; RTX 4090 y RTX 3090 para inferencia local con cuantizaciones Q8_0 o Q6_K.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs con 4-6 GB de VRAM (GTX 1650, RTX 3050, etc.); Q8_0 requiere al menos 6 GB.
- Opciones de despliegue: transcribe.cpp (runtime principal, con soporte Metal, Vulkan y CPU); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: RTF de 14,9 en Metal (M4 Max), 2,0 en CPU (M4 Max), 1,2 en Vulkan (Ryzen 4750U) y 0,5 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real; un RTF de 0,5 indica el doble de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---:|---|---|---|---:|
| Voxtral-Mini-3B-2507 (este GGUF) | 4,68B totales | 32k tokens | 8 | Apache-2.0 | GGUF | 1,87-1,94% |
| Voxtral Small 24B | No disponible | No disponible | No disponible | Apache-2.0 (heredada) | No disponible | No disponible |
| Whisper-large-v3 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos comparativos de benchmarks para Voxtral Small 24B ni Whisper-large-v3 frente a este modelo, más allá de la mención de que comparten codificador y frontend. La comparativa cuantitativa con alternativas de la misma categoría (audio-LLM de ~3B) no está disponible.

## Limitaciones y advertencias

- El modelo no soporta streaming según los metadatos de la conversión; requiere archivos de audio completos (WAV mono a 16 kHz).
- No genera marcas de tiempo (timestamps: none), lo que limita su uso en subtitulado sincronizado.
- La decodificación es greedy, sin opciones de muestreo configurables en la interfaz de transcribe.cpp.
- El contexto de 32k tokens limita la duración del audio a 30 minutos para transcripción y 40 minutos para comprensión; audios más largos requieren segmentación.
- Riesgo de alucinación inherente a los modelos de lenguaje: en pasajes de audio con ruido o silencios prolongados, el decodificador puede generar texto no presente en el audio.
- Sesgos conocidos: no se documentan en la información disponible; al heredar el backbone Ministral-3B, es probable que presente sesgos similares a los de los modelos de lenguaje de su familia, no cuantificados aquí.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base en mistralai/Voxtral-Mini-3B-2507, que es la fuente autoritativa.
- La conversión GGUF está publicada por un tercero (tryambientai) y no por Mistral AI; la validación numérica se realizó contra una versión concreta de Transformers y de transcribe.cpp, por lo que cambios futuros en el runtime podrían afectar a la paridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- El tamaño del repositorio es de 5,0 GB, aunque las cuantizaciones individuales varían entre 2,98 GB y 9,38 GB.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/tryambientai/Voxtral-Mini-3B-2507-gguf
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Commit del modelo base usado para la conversión: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/commit/3060fe3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-mini-3b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de Voxtral en arXiv: https://arxiv.org/abs/2507.13264
- Anuncio de Ministral 3B: https://mistral.ai/news/ministraux
