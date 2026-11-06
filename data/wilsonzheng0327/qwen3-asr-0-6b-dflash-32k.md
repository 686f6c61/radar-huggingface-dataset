# wilsonzheng0327/Qwen3-ASR-0.6B-dflash-32k

## Resumen

Qwen3-ASR-0.6B-dflash-32k es un modelo borrador (draft) para decodificacion especulativa greedy sobre el modelo de reconocimiento automatico del habla Qwen3-ASR-0.6B. Lo publica el usuario wilsonzheng0327 en Hugging Face y no es un modelo autonomo: es un checkpoint auxiliar que propone tokens que el modelo objetivo verifica, acelerando la generacion sin alterar la transcripcion final. Su relevancia practica esta en reducir el coste por token generado en pipelines de ASR de produccion, donde el modelo objetivo de 0,6B ya es pequeno pero la latencia sigue siendo critica en streaming y transcripcion por lotes.

Tecnicamente es un DFlash draft con 5 capas Qwen3 (hidden 1024, intermediate 3072, 16 cabezas de atencion y 8 KV, head_dim 128), una cabeza de lenguaje reducida a 48.000 tokens (variante de 32.000 en el sufijo `-32k`) y un bloque de 8 posiciones con 7 propuestas por ronda. El checkpoint pesa 0,2 GB en bf16 y declara 114.754.432 parametros en safetensors, coherente con una red pequena de 5 capas y vocabulario recortado.

El modelo se entrena en dos fases con unos 1.600 horas de audio en ingles (51%), chino (28%) y japones (21%), usando las transcripciones greedy del propio modelo objetivo como etiquetas. La segunda fase eleva la ventana de contexto a 32.768 tokens y entrena con grabaciones de hasta 240 segundos, lo que corrige el colapso de la fase 1 en audio largo. La licencia es Apache 2.0 y el formato de pesos es safetensors con codigo personalizado (`custom_code`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft (5 capas transformer Qwen3, atencion causal por bloque, cabeza de lenguaje reducida) |
| Parametros totales | 114.754.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 32.768 tokens (entrenado con audio de hasta 240 s) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | ingles, chino y japones (datos de entrenamiento); el modelo objetivo soporta mas idiomas, no detallados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

Otros parametros tecnicos declarados: 5 capas draft, hidden 1024, intermediate 3072, 16 cabezas de atencion y 8 KV heads, head_dim 128; capas auxiliares del objetivo 2, 14 y 25; tamano de bloque 8 (7 propuestas por ronda, ancla en el ultimo token confirmado); token de mascara 151705; vocabulario draft de 48.000 (99,7% de los tokens de etiqueta de entrenamiento), con variante de 32.000 en el sufijo `-32k`; precision bf16.

## Arquitectura y entrenamiento

El modelo es un borrador DFlash para decodificacion especulativa greedy. Reutiliza el layout de `mattymchen/Qwen3-ASR-1.7B-speculator.dflash` dentro de la libreria `speculators`: incluye `fc`, `hidden_norm`, 5 capas Qwen3, `norm` y una `lm_head` de vocabulario reducido cuyas filas se congelan del embedding atado del modelo objetivo, con mapeos `d2t` y `t2d` para traducir entre vocabularios. El borrador consume los estados ocultos de las capas 2, 14 y 25 del objetivo y propone 7 tokens por ronda dentro de un bloque causal de 8 posiciones; el runtime acepta el prefijo mas largo que coincide con la transcripcion greedy del objetivo, que anade un token adicional.

El entrenamiento usa aproximadamente 1.600 horas de audio: LibriSpeech train-clean-360, People's Speech (clean), VoxPopuli en, Emilia-YODAS en/zh/ja (sin la parte CC BY-NC), AISHELL-1, Common Voice 17 ja y FLEURS en/zh/ja train. Las etiquetas son las transcripciones greedy del propio Qwen3-ASR-0.6B generadas con vLLM, contexto de sistema vacio y deteccion automatica de idioma, de modo que la salida conserva el prefijo `language X<asr_text>`. La fase 1 entrena 10 epocas sobre 591.786 clips de 0,5 a 30 s con AdamW, lr 6e-4, warmup del 4%, schedule coseno, batches empaquetados de 16k tokens y hasta 3.072 anclas por batch en una H100, usando la perdida `DFlashDraftModel` con pesos de posicion D-Pace. La fase 2 parte de ese checkpoint y entrena 4 epocas sobre 23.928 grabaciones largas (30-240 s, concatenando clips consecutivos de una misma fuente y etiquetando el conjunto completo) mas 150.000 clips cortos, elevando la ventana a 32.768. Segun la model card, la fase 1 sola colapsaba en audio largo (aceptacion de aproximadamente 1,5 a 60 s).

## Capacidades

- Decodificacion especulativa greedy para Qwen3-ASR-0.6B (y su variante `-hf`): propone 7 tokens por ronda y el objetivo verifica.
- Aceleracion de transcripcion ASR en ingles, chino y japones, con rendimiento medido en clips cortos, medios y largos.
- Mantenimiento del formato de salida del objetivo, incluido el prefijo de idioma `language X<asr_text>`.
- Manejo de audio largo gracias a la ventana de 32.768 tokens y al entrenamiento de fase 2 con grabaciones de hasta 240 s.
- No es un modelo de proposito general: no genera texto libre ni responde instrucciones por si mismo.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio directo; solo opera como borrador sobre el modelo objetivo.
- Soporte multilingue limitado a los idiomas presentes en entrenamiento (en, zh, ja); el resto depende del modelo objetivo.

## Casos de uso

- Transcripcion por lotes de reuniones y podcasts: el borrador acelera la generacion de Qwen3-ASR-0.6B en segmentos de hasta 240 s, reduciendo el coste de GPU por hora de audio procesada en pipelines offline.
- Subtitulado automatico en ingles, chino y japones: al mantener el prefijo de idioma del objetivo, la salida se integra sin postprocesado en flujos de generacion de subtitulos.
- Servicios de dictado y notas de voz: la decodificacion especulativa reduce la latencia por token, lo que mejora la experiencia en aplicaciones interactivas con audio corto (0,5-30 s).
- Transcripcion de centros de contacto: el rendimiento medido en People's Speech y VoxPopuli sugiere utilidad en audio telefónico y de reunion, siempre con el modelo objetivo verificando cada token.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un draft DFlash con vocabulario reducido y ventana de 32k para estudiar tasas de aceptacion.
- Evaluacion comparativa de borradores ASR: permite contrastar el draft de 0,6B frente al de 1,7B de mattymchen en las mismas condiciones de test (FLEURS, LibriSpeech, Common Voice, Emilia-YODAS).
- Despliegue en infraestructura con GPUs de gama media: al ser un checkpoint de 0,2 GB, el borrador anade poca memoria al servir el objetivo de 0,6B.

## Benchmarks y rendimiento

La model card publica tasas de aceptacion (tokens generados por ronda de verificacion) en decodificacion especulativa greedy simulada en CUDA con bf16, sobre conjuntos de test retenidos:

| Draft | Libri clean | Libri other | FLEURS en | Emilia en | FLEURS zh | Emilia zh | CV ja | FLEURS ja | Emilia ja | all | 60 s en | 60 s zh | 60 s ja | 180 s en | 180 s zh | 180 s ja |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| este draft (48k), Qwen3-ASR-0.6B | 6,36 | 5,83 | 5,64 | 5,86 | 5,34 | 5,26 | 4,27 | 4,67 | 4,04 | 5,19 | 6,18 | 5,50 | 4,46 | 6,21 | 5,57 | 4,44 |
| variante 32k | 6,09 | 5,66 | 5,23 | 5,68 | 4,91 | 5,18 | 4,26 | 4,66 | 4,03 | 5,04 | 5,90 | 5,22 | 4,45 | 5,95 | 5,24 | 4,44 |
| solo fase 1, 0.6B | 6,43 | 5,86 | 5,59 | 5,88 | 5,25 | 5,30 | 4,26 | 4,58 | 4,03 | 5,17 | 1,30 | 1,38 | 1,36 | 1,15 | 1,19 | 1,19 |
| referencia: draft 1.7B de mattymchen sobre Qwen3-ASR-1.7B | 6,23 | 5,94 | 4,72 | 5,08 | 5,04 | 4,34 | 2,10 | 2,09 | 2,09 | 3,51 | 5,45 | 4,76 | 1,87 | 2,94 | 2,96 | 1,54 |

No se han publicado resultados de benchmarks de precision ASR (WER) ni de MMLU, HumanEval o GSM8K en la informacion disponible; el modelo es un borrador y no se evalua como modelo generativo autonomo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en bf16; el consumo dominante es el del modelo objetivo Qwen3-ASR-0.6B, no disponible en la informacion proporcionada.
- GPU recomendadas: la model card cita una H100 para el entrenamiento; para inferencia basta una GPU con soporte bf16 y suficiente memoria para el objetivo y el borrador.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en cualquier GPU consumer moderna; el requisito real lo marca el modelo objetivo de 0,6B.
- Opciones de despliegue: el borrador usa la libreria `speculators` con `custom_code`; la model card menciona vLLM para generar las etiquetas del objetivo. No se detallan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; solo se publican tasas de aceptacion, no medidas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-dflash-32k (este) | 114,7 M | 32.768 | 5,04 | Apache 2.0 | Hugging Face |
| Variante 48k del mismo autor | no disponible | 32.768 | 5,19 | Apache 2.0 | Hugging Face |
| mattymchen Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | 3,51 | no disponible | Hugging Face |
| Qwen3-ASR-0.6B (objetivo, sin borrador) | 0,6 B | no disponible | no aplica | no disponible | Hugging Face |

La comparativa se limita a los borradores DFlash citados en la model card; no se dispone de datos de otros borradores especulativos para ASR en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Qwen3-ASR-0.6B o su variante `-hf` como objetivo y un runtime de decodificacion especulativa compatible con `speculators`.
- Solo funciona con decodificacion greedy; no se han publicado resultados para sampling, beam search ni otras estrategias.
- Idiomas de entrenamiento limitados a ingles, chino y japones; el rendimiento en otros idiomas no esta documentado.
- La fase 1 colapsaba en audio largo (aceptacion de aproximadamente 1,5 a 60 s); la calidad en grabaciones superiores a 240 s no esta evaluada.
- Posible riesgo de sesgo heredado de los corpus de entrenamiento (LibriSpeech, People's Speech, VoxPopuli, AISHELL-1, Common Voice, FLEURS, Emilia-YODAS), con distinta representacion por variedad dialectal y acento.
- Riesgo de alucinacion: al ser un borrador verificado por el objetivo, los tokens no aceptados se descartan, pero la calidad final de la transcripcion depende del modelo objetivo y de su propio riesgo de alucinacion.
- La licencia Apache 2.0 permite uso comercial del checkpoint, pero el modelo objetivo y los corpus de entrenamiento tienen sus propias condiciones; la parte CC BY-NC de Emilia no se uso en entrenamiento.
- El repositorio tiene 18 descargas y 0 likes en el momento de la consulta, sin validacion externa publicada.
- El uso de `custom_code` implica revisar el codigo remoto antes de cargar el modelo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-0.6B-dflash-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Referencia de layout DFlash: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Libreria `speculators`: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
