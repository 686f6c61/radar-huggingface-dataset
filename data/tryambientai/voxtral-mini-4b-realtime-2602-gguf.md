# tryambientai/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602 es un modelo de reconocimiento automatico del habla (ASR) multilingue y nativamente en streaming, desarrollado por Mistral AI. Esta ficha describe la conversion a formato GGUF realizada por tryambientai para su uso con transcribe.cpp, una implementacion en C++ orientada a inferencia local eficiente. El modelo combina un codificador de audio causal de aproximadamente 970 millones de parametros con un decodificador Ministral de unos 3.4 mil millones de parametros, sumando 4.429.707.024 parametros totales.

El modelo resuelve el problema de la transcripcion en tiempo real con baja latencia: emite un token de texto por cada ranura de audio de 80 ms (12.5 Hz), lo que permite retardos configurables entre 240 ms y 2.4 s. A 480 ms de retardo iguala el rendimiento de sistemas offline de referencia, segun la model card. Soporta 13 idiomas con deteccion automatica de idioma y esta pensado para despliegue en dispositivo con requisitos de hardware modestos.

La relevancia actual radica en que es una de las primeras soluciones abiertas que alcanza precision comparable a sistemas offline manteniendo un retardo inferior a 500 ms, con licencia Apache-2.0 que permite uso comercial. La version GGUF aqui descrita preserva la precision del modelo original en BF16 (WER del 2.08 % en LibriSpeech test-clean) incluso tras cuantizacion hasta Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM en streaming: codificador de audio causal (~970M, conv stem causal con left-pad + transformer de 32 capas con RoPE de ventana deslizante) + proyector de grupos de 4 frames + decodificador Ministral (~3.4B, 26 capas, GQA 32/8, NEOX RoPE) con condicionamiento de latencia por delay-token |
| Parametros totales | 4.429.707.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un audio-LLM en streaming con un codificador de audio causal de aproximadamente 970 millones de parametros. El codificador emplea un stem convolucional causal con left-pad y un transformer de 32 capas con RoPE de ventana deslizante. La salida del codificador pasa por un proyector de grupos de 4 frames cuyas embeddings de audio se suman (fusion aditiva) a las de un decodificador Ministral de aproximadamente 3.4 mil millones de parametros, con 26 capas, atencion GQA con 32 cabezas de consulta y 8 de clave/valor, y RoPE NEOX. El decodificador incorpora condicionamiento de latencia mediante delay-token y emite un token de texto por cada ranura de audio de 80 ms (12.5 Hz).

La arquitectura es distinta de la familia Voxtral 2507 offline: tiene arquitectura propia, frontend de streaming, codificador causal y fusion aditiva del audio. La entrada es WAV mono a 16 kHz. El modelo soporta tanto streaming incremental (con latencia y calidad configurables mediante `--stream-chunk-ms` y `--stream-voxtral-delay`) como transcripcion offline con transcripcion final identica byte a byte. Los detalles sobre volumen de tokens de entrenamiento, composicion del dataset y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en streaming con latencia configurable (240 ms a 2.4 s) y modo offline.
- Reconocimiento automatico del habla multilingue en 13 idiomas con deteccion automatica de idioma.
- Emision de un token de texto por cada 80 ms de audio (12.5 Hz), con throughput superior a 12.5 tokens por segundo.
- Soporte de streaming incremental con transcripcion final identica byte a byte a la del modo offline.
- Entrada de audio WAV mono a 16 kHz.
- No soporta traduccion (campo `translate: false` en la configuracion de transcribe.cpp).
- No genera marcas de tiempo (campo `timestamps: none`).
- No se documentan capacidades de tool calling, function calling, agentes ni vision.

## Casos de uso

- Subtitulado en directo: el modelo emite texto a 12.5 Hz con retardos desde 240 ms, lo que permite generar subtitulos sincronizados en retransmisiones o videoconferencias con una latencia inferior a medio segundo.
- Asistentes de voz interactivos: al operar en streaming nativo con retardo configurable, se puede integrar en pipelines de reconocimiento de comandos donde la respuesta debe llegar antes de que el usuario termine de hablar.
- Transcripcion de reuniones en local: la version Q4_K_M (2.83 GB) cabe en equipos de consumo y permite transcribir audio de reuniones sin enviar datos a servicios en la nube, con precision WER del 2.08 % en ingles.
- Atencion al cliente automatizada: la deteccion automatica de idioma entre 13 lenguas permite enrutar o transcribir llamadas multilingues sin configurar el idioma de antemano.
- Accesibilidad y documentacion clinica o legal: la transcripcion offline con resultado byte a byte identico al streaming facilita flujos donde se graba y se transcribe despues con la misma calidad, sobre hardware modesto.
- Procesamiento en el borde (edge): con un rendimiento en tiempo real (RTF) de 8.6 en Metal sobre un Apple M4 Max y 2.5 en CPU, el modelo se puede desplegar en portatiles y dispositivos sin GPU dedicada.
- Investigacion en ASR en streaming: al ser codigo abierto con licencia Apache-2.0 y estar disponible en GGUF, sirve como base reproducible para experimentos de latencia frente a precision.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, normalizador de texto ingles de Whisper, ruta offline, batch 8 en NVIDIA L40S):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 8.87 GB | 2.08 % |
| F16 | 8.88 GB | 2.09 % |
| Q8_0 | 4.73 GB | 2.07 % |
| Q6_K | 3.66 GB | 2.08 % |
| Q5_K_M | 3.28 GB | 2.08 % |
| Q4_K_M | 2.83 GB | 2.08 % |

La referencia de HuggingFace Transformers (VoxtralRealtimeForConditionalGeneration, BF16, greedy) en la misma maquina obtiene 2.08 %, por lo que el GGUF en BF16 iguala la referencia. Todas las cuantizaciones se mantienen dentro del ruido de bootstrap (2.07-2.09 %), de modo que la escalera de cuantizacion es neutra en WER hasta Q4_K_M. El WER publicado es solo para ingles; el modelo es multilingue pero no se publican resultados por idioma.

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 8.6 |
| Apple M4 Max | CPU | 2.5 |
| AMD Ryzen 4750U | Vulkan | 0.9 |
| AMD Ryzen 4750U | CPU | 0.6 |

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q4_K_M 2.83 GB, Q5_K_M 3.28 GB, Q6_K 3.66 GB, Q8_0 4.73 GB, BF16 8.87 GB, F16 8.88 GB.
- Cabe en GPU de consumo: la version Q4_K_M (2.83 GB) y Q5_K_M (3.28 GB) son adecuadas para tarjetas con 4-6 GB de VRAM; Q8_0 requiere al menos 6 GB.
- GPU recomendadas: NVIDIA L40S (usada para medir WER), Apple Silicon con Metal (M4 Max medido con RTF 8.6), iGPU AMD con Vulkan (Ryzen 4750U con RTF 0.9). No se documentan resultados en A100, H100 ni RTX 4090.
- Despliegue: transcribe.cpp (libreria nativa, compilacion con CMake, CLI `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: emite 12.5 tokens por segundo (una ranura de 80 ms); throughput superior a 12.5 tokens/s en dispositivo segun la model card. Retardo configurable de 240 ms a 2.4 s.
- Entrada: WAV mono a 16 kHz (conversion con ffmpeg si es necesario).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming | Idiomas | Licencia | Formato |
|---|---|---:|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (esta ficha) | 4.43B | No disponible | Si, latencia 240 ms-2.4 s | 13 | Apache-2.0 | GGUF |
| Voxtral 2507 (familia offline de Mistral) | No disponible | No disponible | No (offline) | No disponible | No disponible | No disponible |
| Otras alternativas ASR abiertas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card indica que el modelo supera a las lineas base abiertas existentes en diversas tareas y que a 480 ms de retardo iguala a los principales modelos offline abiertos y a APIs en tiempo real, pero no se proporcionan cifras concretas de esos competidores en la informacion disponible.

## Limitaciones y advertencias

- El WER publicado (2.08 %) es solo para ingles; no hay datos de precision por idioma para los otros 12 idiomas soportados.
- No soporta traduccion (`translate: false`): transcribe en el idioma de origen, no traduce.
- No genera marcas de tiempo (`timestamps: none`), lo que limita su uso en tareas que requieran alineacion temporal por palabra o segmento.
- La entrada debe ser WAV mono a 16 kHz; requiere conversion previa de otros formatos.
- No se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada.
- No se documentan datos sobre volumen de entrenamiento, composicion del dataset ni alineamiento (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene consultar la model card original de Mistral AI para los terminos completos.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.
- La validacion numerica se realizo contra Transformers en el commit 483c122 de transcribe.cpp; cambios posteriores en la herramienta podrian afectar a la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tryambientai/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit del modelo base usado: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Pesos BF16 (repo handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-BF16.gguf
- Pesos Q4_K_M (repo handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf/resolve/main/Voxtral-Mini-4B-Realtime-2602-Q4_K_M.gguf
- Paper (referencia arXiv en tags): arxiv:2602.11298
