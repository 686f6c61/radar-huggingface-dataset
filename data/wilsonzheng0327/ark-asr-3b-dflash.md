# wilsonzheng0327/ARK-ASR-3B-dflash

## Resumen

ARK-ASR-3B-dflash es un modelo borrador (draft) para decodificación especulativa greedy sobre el modelo de reconocimiento automático de voz ARK-ASR-3B de AutoArk-AI (redirigido a Edge0/ARK-ASR-3B). Lo publica el usuario wilsonzheng0327 bajo licencia Apache 2.0 y su función no es transcribir audio por sí mismo, sino proponer tokens candidatos que el modelo objetivo verifica en paralelo, acelerando así la inferencia del ASR sin alterar la salida. Es, por tanto, una pieza de infraestructura de serving más que un modelo autónomo.

Técnicamente es un draft DFlash de la librería `speculators`: cinco capas Qwen3 con geometría idéntica a la del objetivo (hidden 2048, intermediate 11008, 16 cabezas de atención y 2 KV, head_dim 128), más `fc`, `hidden_norm`, `norm` y un `lm_head` de vocabulario reducido a 48.000 entradas de las 151.936 del modelo base. El checkpoint pesa 496.464.384 parámetros en safetensors (1,0 GB de repo) y opera en bf16 con un tamaño de bloque de 8 (7 propuestas por ronda).

Su relevancia es práctica: la decodificación representa el 71% del tiempo de una petición a ARK-ASR con concurrencia 1 y el 38% con concurrencia 16, de modo que un draft con aceptación alta reduce latencia y coste por transcripción. Cubre las 19 lenguas que transcribe el modelo objetivo, con una longitud de aceptación media de 3,78 tokens por ronda en el conjunto de evaluación retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft sobre decoder transformer tipo Qwen3 (5 capas, hidden 2048, intermediate 11008, 16 heads / 2 KV heads, head_dim 128) |
| Parametros totales | 496.464.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2.048 tokens (petición máxima: 30 s de audio, 375 tokens de audio, 256 tokens de salida) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | zh, en, de, ja, fr, ko, es, pl, it, ro, hu, cs, nl, fi, hr, sk, sl, et, lt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, librería `speculators`) |

## Arquitectura y entrenamiento

El draft replica la geometría del decoder de ARK-ASR-3B con cinco capas y toma estados ocultos auxiliares de las capas 2, 18 y 33 del objetivo (36 capas de decoder en total); sglang-omni captura las salidas de las capas 1, 17 y 32. Emplea un token máscara específico, 151662 (`<|fim_pad|>`), que los prompts de ARK nunca contienen, y un vocabulario reducido de 48.000 tokens que cubre el 99,64% de las etiquetas de entrenamiento, con mapeos `d2t`/`t2d` hacia el vocabulario completo del objetivo. La decodificación es causal dentro del bloque de 8 posiciones, con el último token confirmado como ancla.

El entrenamiento usó 358.572 clips (unas 1.065 horas) con licencias que permiten uso comercial: People's Speech clean (228,5 h, en), LibriSpeech train-clean-360 (117,1 h, en), YODAS2 en/zh/ja/ko (58,4/116,2/58,2/58,1 h), VoxPopuli (220 h en 16 lenguas europeas), FLEURS train (165 h en las 19 lenguas), AISHELL-1 (42,9 h, zh) y Common Voice 17 (21,8 h, ja). Por lengua: inglés 434 h, chino 169 h, japonés 87 h, coreano 66 h y entre 10 y 32 h para el resto. Las etiquetas son las transcripciones greedy del propio modelo objetivo generadas con sglang-omni (hasta 250 tokens nuevos, sin alcanzar el límite). Se usó el `DFlashDraftModel` de `speculators` con entropía cruzada y pesos de posición D-Pace, AdamW con lr 6e-4, weight decay 0,01, 4% de warmup, scheduler coseno, 8 épocas (17.048 pasos), batches empaquetados de 16.384 tokens en dos H200, hasta 3.072 anclas por batch y unos 77k tokens por segundo: 1 h 51 min en total. Las embeddings de audio se cachearon desde el encoder y adaptador del objetivo (186 GB), por lo que solo se entrenó el decoder. El checkpoint publicado corresponde al paso 12.592, el mejor sobre un subconjunto retenido (3,717), cuando la aceptación en retenido ya había dejado de subir (3,697 en el último paso).

## Capacidades

- Propuesta de tokens para decodificación especulativa greedy sobre ARK-ASR-3B: genera hasta 7 candidatos por ronda a partir de un ancla.
- Transcripción multilingüe indirecta: cubre las 19 lenguas del modelo objetivo (zh, en, de, ja, fr, ko, es, pl, it, ro, hu, cs, nl, fi, hr, sk, sl, et, lt).
- Integración con el audio tower y el adaptador del objetivo tal y como los sirve sglang-omni: el draft consume las mismas características mel y tokens de audio que el servidor construye.
- Compatibilidad con el worker DFlash de vocabulario reducido de sglang-omni (sgl-project/sglang-omni#3588).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de aceleración de inferencia, no un modelo conversacional.
- No tiene modo thinking, visión ni audio de entrada propio: el audio se procesa en el modelo objetivo.

## Casos de uso

- Serving de ASR en producción con baja latencia: desplegar ARK-ASR-3B junto a este draft en sglang-omni reduce el coste de decodificación, que supone el 71% del tiempo de petición con concurrencia 1 y el 38% con concurrencia 16.
- Transcripción por lotes de audio corto: con peticiones de hasta 30 s de audio y 256 tokens de salida, el draft encaja en pipelines de transcripción masiva donde el throughput importa más que la latencia individual.
- Subtitulado y actas multilingües: al cubrir 19 lenguas, permite un único despliegue para transcripción de reuniones, entrevistas o material audiovisual en europeo y asiático oriental.
- Atención al cliente con voz: transcripción en tiempo casi real de llamadas en inglés, chino, japonés, coreano o lenguas europeas, reduciendo el tiempo de respuesta del sistema.
- Evaluación comparativa de drafts: sirve como referencia publicada (aceptación 3,78 global) frente a otros borradores para ARK-ASR, como el pilot de AY0094 entrenado solo con 5.000 clips en inglés.
- Investigación en decodificación especulativa: su configuración DFlash con vocabulario reducido y ventana deslizante de 2.048 tokens es un caso reproducible para estudiar aceptación por lengua y por fuente de audio.
- Despliegue en infraestructura con H200: el modelo se sirvió en una sola H200 en bf16, por lo que es viable en nodos de gama alta sin clústeres grandes.

## Benchmarks y rendimiento

Longitud de aceptación en decodificación especulativa greedy simulada en CUDA (objetivo bf16), sobre 5.500 clips retenidos (FLEURS test de cada lengua, LibriSpeech test clean y other, VoxPopuli test en y de, y el último shard de YODAS2 de en, zh, ja y ko). Aceptación = tokens generados / rondas.

| Draft | Global | en | zh | ja | ko | de | fr | es | it | pl | nl | cs | ro | hu | fi | hr | sk | sl | et | lt |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Este draft (vocab 48k) | 3,78 | 6,11 | 5,18 | 3,71 | 3,69 | 3,47 | 3,63 | 4,04 | 3,96 | 3,00 | 3,19 | 3,83 | 3,00 | 3,47 | 3,80 | 3,48 | 3,56 | 3,19 | 3,57 | 2,85 |
| Variante vocab 32k | 3,69 | 5,88 | 4,63 | 3,66 | 3,61 | 3,37 | 3,45 | 3,67 | 3,81 | 2,93 | 3,14 | 3,81 | 2,97 | 3,46 | 3,80 | 3,48 | 3,55 | 3,18 | 3,57 | 2,84 |
| Pilot (AY0094) | 1,22 | 2,98 | 1,03 | 1,08 | 1,09 | 1,24 | 1,17 | 1,14 | 1,15 | 1,09 | 1,23 | 1,08 | 1,16 | 1,11 | 1,12 | 1,11 | 1,09 | 1,12 | 1,19 | 1,10 |

Desglose por fuente (este draft 48k / pilot): LibriSpeech clean 6,44 / 4,22; LibriSpeech other 5,89 / 3,96; VoxPopuli en 6,38 / 3,12; YODAS en 6,03 / 1,94; FLEURS en 5,77 / 3,28; FLEURS zh 5,22 / 1,04; YODAS zh 5,16 / 1,03; YODAS ja 4,05 / 1,10; YODAS ko 3,94 / 1,10; VoxPopuli de 3,37 / 1,35.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo borrador de ASR.

## Requisitos de hardware

- VRAM estimada: el checkpoint en bf16 ocupa aproximadamente 1 GB de pesos (496 M de parámetros); el repo completo es de 1,0 GB. A ello se suma la memoria del modelo objetivo ARK-ASR-3B y del audio tower, que dominan el consumo.
- GPU recomendadas: el autor sirvió el sistema en una sola H200; el entrenamiento se hizo en dos H200 con batches empaquetados de 16.384 tokens.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU consumer; el sistema depende de sglang-omni y del worker DFlash de vocabulario reducido, no de llama.cpp.
- Opciones de despliegue: sglang-omni con el soporte de DFlash (#3588) y una modificación local del autor (overlap como opt-in, aceptación por petición y torch.compile desactivado bajo el draft). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: con SeedTTS en una H200, greedy, sin prefix cache y servidores nuevos, el autor realizó barridos de carga con sglang-omni (legs ABBA) a concurrencia 1, 2, 4 y 8 comparando con y sin draft; la información proporcionada no incluye las cifras de esas columnas. La ganancia extremo a extremo es notablemente inferior a la longitud de aceptación bajo carga, porque la decodificación es solo el 71% (c1) o el 38% (c16) del tiempo de petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceptación global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARK-ASR-3B-dflash (este) | 496 M | 2.048 (ventana deslizante) | 3,78 | Apache 2.0 | Hugging Face (wilsonzheng0327) |
| ARK-ASR-3B-dflash vocab 32k | no disponible | 2.048 | 3,69 | Apache 2.0 | Variante comparada en la model card |
| AY0094/ark-asr-3b-dflash-pilot01-epoch8 | no disponible | no disponible | 1,22 | no disponible | Hugging Face (AY0094) |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | no disponible | no disponible | Hugging Face, referencia de formato para otro modelo objetivo |

## Limitaciones y advertencias

- No es un modelo de ASR autónomo: solo tiene sentido emparejado con ARK-ASR-3B y sirve exclusivamente para decodificación especulativa greedy; no produce transcripciones por sí mismo.
- La ganancia real en producción es menor que la aceptación teórica: con concurrencia 16 la decodificación es solo el 38% del tiempo de petición, por lo que el ahorro extremo a extremo queda acotado.
- Ventana de contexto muy corta: 2.048 tokens, con peticiones limitadas a 30 s de audio y 256 tokens de salida; audios más largos requieren troceado.
- Cobertura desigual por lengua: la aceptación va de 6,11 en inglés a 2,85 en lituano, y el rendimiento depende del volumen de datos de entrenamiento por idioma (el inglés concentra 434 h frente a 10-23 h en las doce lenguas europeas menores).
- Dependencia de sglang-omni y de un parche local no publicado como paquete: el autor usó el PR #3588 más cambios locales (overlap opt-in, aceptación por petición, torch.compile desactivado bajo el draft), lo que complica la reproducibilidad.
- Riesgo de alucinación heredado del modelo objetivo: el draft no corrige errores de ARK-ASR-3B, solo acelera su decodificación; la calidad final de la transcripción es la del objetivo.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los datasets de entrenamiento (LibriSpeech, VoxPopuli, Common Voice, FLEURS, AISHELL) tienen sesgos conocidos de dominio y de hablantes.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento se eligieron explícitamente por tener licencias compatibles con uso comercial; conviene verificar las condiciones de los datasets de origen si se redistribuye el modelo.
- Sin datos publicados de cuantización ni de ejecución en GPU consumer: no se puede garantizar su funcionamiento fuera de entornos con H200 y sglang-omni.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilsonzheng0327/ARK-ASR-3B-dflash
- Modelo base: https://huggingface.co/AutoArk-AI/ARK-ASR-3B (redirige a https://huggingface.co/Edge0/ARK-ASR-3B)
- Draft de referencia de formato: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Draft piloto comparado: https://huggingface.co/AY0094/ark-asr-3b-dflash-pilot01-epoch8
- PR de sglang-omni para el worker DFlash de vocabulario reducido: https://github.com/sgl-project/sglang-omni/pull/3588
- Librería `speculators`: no disponible en la información proporcionada
