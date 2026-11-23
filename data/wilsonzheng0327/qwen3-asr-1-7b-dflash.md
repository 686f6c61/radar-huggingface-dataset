# wilsonzheng0327/Qwen3-ASR-1.7B-dflash

## Resumen

Qwen3-ASR-1.7B-dflash es un modelo borrador (draft) para decodificacion especulativa codiciosa (greedy speculative decoding) sobre el modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B. Lo publica el usuario wilsonzheng0327 en Hugging Face y sigue el formato de checkpoints de la libreria `speculators` (variante DFlash), tomando como referencia el layout de `mattymchen/Qwen3-ASR-1.7B-speculator.dflash`. No es un modelo autonomo de ASR: es un acelerador que propone tokens que el modelo objetivo verifica, de modo que la transcripcion final es identica a la del objetivo en decodificacion codiciosa, pero con menos rondas de verificacion.

El checkpoint contiene 362.770.944 parametros (unos 363 M) en bf16, con 5 capas Qwen3 de borrador, hidden de 2048, 16 cabezas de atencion y 8 de KV, y una cabeza de salida (`lm_head`) de vocabulario reducido a 48.000 tokens (99,4% de los tokens de etiqueta del entrenamiento), mapeada al vocabulario del objetivo mediante tablas `d2t`/`t2d`. Se entrena sobre estados ocultos auxiliares de las capas 2, 14 y 25 del objetivo, con un tamano de bloque de 8 (7 propuestas por ronda) y una ventana deslizante de 32.768 tokens.

Su relevancia practica es directa: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir la latencia de modelos autorregresivos sin alterar la salida. Este borrador esta especializado en audio multilingue (ingles, chino y japones) y, segun las mediciones del autor, alcanza una longitud de aceptacion media de 5,43 tokens por ronda en el conjunto agregado, frente a 3,51 del checkpoint de referencia, con mejoras especialmente marcadas en japones (4,60 frente a 2,09) y en grabaciones largas de 60 y 180 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (borrador de 5 capas Qwen3) para decodificacion especulativa DFlash sobre Qwen3-ASR-1.7B |
| Parametros totales | 362.770.944 (aproximadamente 363 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana deslizante de 32.768 tokens; entrenado con grabaciones de hasta 240 s |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | ingles, chino y japones (entrenamiento); el modelo objetivo Qwen3-ASR-1.7B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El borrador replica el layout de `mattymchen/Qwen3-ASR-1.7B-speculator.dflash`: un proyector `fc`, una `hidden_norm`, 5 capas Qwen3 (hidden 2048, intermediate 6144, 16 cabezas de atencion y 8 de KV, head_dim 128), una `norm` final y un `lm_head` de vocabulario reducido a 48.000 tokens construido con filas congeladas del embedding atado del objetivo, mas las tablas de mapeo `d2t` y `t2d`. Toma como entrada los estados ocultos de las capas auxiliares 2, 14 y 25 del modelo objetivo. Usa un tamano de bloque de 8 (7 propuestas por ronda, con el ultimo token confirmado como ancla) y atencion causal dentro del bloque; el token de mascara es el 151705. Existe una variante con vocabulario de 32.000 tokens en el subdirectorio `-32k`. Precision bf16.

El entrenamiento se realizo en dos fases con el `DFlashDraftModel` y la perdida de `speculators` (entropia cruzada con pesos de posicion D-Pace). Los datos de audio suman unas 1.600 horas: LibriSpeech train-clean-360, People's Speech (clean), VoxPopuli en, Emilia-YODAS en/zh/ja (excluyendo la parte CC BY-NC), AISHELL-1, Common Voice 17 ja y FLEURS en/zh/ja train; por clips, 51% ingles, 28% chino y 21% japones. Las etiquetas son las transcripciones codiciosas del propio objetivo generadas con vLLM (contexto de sistema vacio, idioma automatico), de modo que la salida conserva el prefijo `language X<asr_text>`. La fase 1 uso AdamW con lr 6e-4, 4% de warmup, decaimiento coseno, 10 epocas (33.920 pasos) sobre 591.765 clips de 0,5 a 30 s, empaquetados en lotes de 16k tokens en dos H200, con hasta 3.072 anclas por lote. La fase 2 partio de ese checkpoint, con lr 3e-4, 8 epocas (21.864 pasos) sobre 23.938 grabaciones largas (fragmentos de 30 a 240 s etiquetados completos) mas 150.000 clips cortos, y elevo la ventana a 32.768. El checkpoint publicado corresponde al paso 21.864 de la fase 2, elegido por el mejor acepte combinado en conjuntos cortos y largos.

## Capacidades

- Propuesta de tokens para decodificacion especulativa codiciosa sobre Qwen3-ASR-1.7B y Qwen3-ASR-1.7B-hf; no genera transcripciones de forma autonoma.
- Aceleracion de la inferencia ASR manteniendo la salida identica a la del objetivo en modo greedy.
- Cobertura multilingue de borrador en ingles, chino y japones, con rendimiento medido por separado en cada idioma.
- Manejo de grabaciones cortas (0,5 a 30 s) y largas (30 a 240 s) gracias a la ventana deslizante de 32.768 tokens.
- Conservacion del formato de salida del objetivo, incluido el prefijo `language X<asr_text>`.
- Variante de vocabulario reducido a 32.000 tokens (`-32k`) para entornos con menor presupuesto.
- No soporta tool calling, function calling, agentes ni vision: su unica funcion es la propuesta de tokens de texto ASR.

## Casos de uso

- Transcripcion por lotes de audio corto: integrado en un pipeline con vLLM sobre Qwen3-ASR-1.7B, reduce las rondas de verificacion (acepte medio de 5,43 tokens en el agregado) y por tanto el coste de GPU por hora de audio procesada.
- Subtitulado de reuniones y podcasts de hasta varios minutos: la fase 2 y la ventana de 32.768 tokens permiten mantener un acepte de 6,25, 5,75 y 4,75 en grabaciones de 60 s en ingles, chino y japones respectivamente.
- Procesamiento de archivos de audio largos (unos 180 s): con acepte de 6,15 (en), 5,64 (zh) y 4,70 (ja), es adecuado para pipelines de transcripcion de entrevistas o clases sin trocear en exceso.
- Servicio de dictado o notas de voz en produccion: al no alterar la salida del objetivo, se puede desplegar como acelerador transparente sin revalidar la calidad de las transcripciones.
- Transcripcion de contenido en japones: es donde la mejora frente al checkpoint de referencia es mayor (4,60 frente a 2,09 en el agregado de japones), por lo que resulta especialmente indicado para productos centrados en ese idioma.
- Evaluacion e investigacion en decodificacion especulativa: sirve como caso de estudio de entrenamiento en dos fases con datos sinteticos generados por el objetivo y de ajuste de vocabulario reducido con tablas `d2t`/`t2d`.
- Despliegue con restricciones de memoria: la variante `-32k` reduce el coste del `lm_head` a cambio de un acepte algo menor (5,24 en el agregado frente a 5,43).

## Benchmarks y rendimiento

Los datos disponibles son de longitud de aceptacion simulada en CUDA con objetivo en bf16: desde cada ancla el borrador propone 7 tokens, se acepta el prefijo mas largo que coincide con la transcripcion codiciosa del objetivo y el objetivo anade un token; acepte = tokens generados / rondas. Solo se usan clips reservados (FLEURS test, LibriSpeech test, Common Voice ja test y un shard no visto de Emilia-YODAS por idioma). No se han medido en un runtime de servicio (vLLM, MLX) ni con objetivo cuantizado.

| Borrador | Libri clean | Libri other | FLEURS en | Emilia en | FLEURS zh | Emilia zh | CV ja | FLEURS ja | Emilia ja | en | zh | ja | all | 60 s en | 60 s zh | 60 s ja | 180 s en | 180 s zh | 180 s ja |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| este borrador (vocab 48k) | 6,43 | 5,87 | 5,79 | 6,13 | 5,62 | 5,60 | 4,51 | 4,99 | 4,31 | 6,09 | 5,61 | 4,60 | 5,43 | 6,25 | 5,75 | 4,75 | 6,15 | 5,64 | 4,70 |
| variante vocab 32k | 6,17 | 5,68 | 5,32 | 5,90 | 5,05 | 5,44 | 4,49 | 4,98 | 4,28 | 5,81 | 5,27 | 4,58 | 5,24 | 5,98 | 5,41 | 4,74 | 5,89 | 5,36 | 4,69 |
| solo fase 1 (clips cortos) | 6,45 | 5,99 | 5,82 | 6,09 | 5,55 | 5,66 | 4,57 | 5,05 | 4,33 | 6,12 | 5,62 | 4,64 | 5,46 | 1,48 | 1,57 | 1,49 | 1,25 | 1,29 | 1,24 |
| referencia: mattymchen/Qwen3-ASR-1.7B-speculator.dflash | 6,22 | 5,94 | 4,72 | 5,08 | 5,04 | 4,35 | 2,11 | 2,09 | 2,09 | 5,46 | 4,60 | 2,09 | 3,51 | 5,46 | 4,75 | 1,87 | 2,94 | 2,96 | 1,54 |

No se han publicado resultados de benchmarks de calidad ASR (WER, MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo es un borrador y no produce transcripciones propias.

## Requisitos de hardware

- VRAM estimada para el borrador: unos 0,7 GB en bf16 (363 M de parametros); el repo ocupa 0,7 GB. La memoria dominante es la del objetivo Qwen3-ASR-1.7B, no la del borrador.
- GPU recomendadas: el autor entreno con dos H200; para servicio con el objetivo completo se recomienda A100, H100 o L40S. El borrador por si solo cabe en cualquier GPU consumer con mas de 1-2 GB libres.
- Cabe en GPU consumer: si, el borrador cabe en cualquier RTX con 4 GB o mas; el objetivo de 1,7 B en bf16 requiere unos 3,5 GB, por lo que una RTX 4090 o una RTX 3060 de 12 GB pueden alojar el conjunto.
- Opciones de despliegue: el autor solo cita vLLM y MLX como runtimes objetivo no medidos; no se documenta soporte de llama.cpp, Ollama ni TGI. La carga requiere la libreria `speculators` y `custom_code`.
- Latencia y throughput: no medidos en runtime de servicio. La longitud de aceptacion (5,43 en el agregado) es el unico indicador publicado; no se aportan tokens por segundo ni latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acepte agregado (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wilsonzheng0327/Qwen3-ASR-1.7B-dflash | 363 M | 32.768 | 5,43 | Apache 2.0 | Hugging Face |
| wilsonzheng0327/Qwen3-ASR-1.7B-dflash (-32k) | 363 M (vocab 32k) | 32.768 | 5,24 | Apache 2.0 | Hugging Face |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | 3,51 | no disponible | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (objetivo) | 1,7 B | no disponible | no aplica (no es borrador) | no disponible | Hugging Face |

La comparativa se limita a los borradores DFlash para el mismo objetivo; no se dispone de datos de otros aceleradores (EAGLE, Medusa) para Qwen3-ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con decodificacion codiciosa; no se ha validado con muestreo ni con decodificacion especulativa no greedy.
- El acepte se ha medido en simulacion sobre CUDA con objetivo bf16; no hay mediciones en vLLM, MLX ni con objetivo cuantizado, por lo que el rendimiento real en produccion puede diferir.
- Cobertura de borrador limitada a ingles, chino y japones; en otros idiomas del objetivo el acepte podria degradarse notablemente.
- Entrenado con transcripciones generadas por el propio objetivo, por lo que hereda sus sesgos y errores de etiquetado.
- La fase 1 sola colapsa en grabaciones largas (acepte de 1,24-1,57 a 60 y 180 s); solo el checkpoint de fase 2 es apto para audio largo.
- No es un modelo de ASR autonomo: no debe usarse sin el objetivo Qwen3-ASR-1.7B.
- Requiere `custom_code` y la libreria `speculators`; la integracion en pipelines existentes exige adaptar el runtime.
- Licencia Apache 2.0 en el borrador, pero el uso comercial depende tambien de la licencia del modelo objetivo, no indicada en la informacion disponible.
- Sin likes ni pipeline declarado y con 466 descargas en la fecha de actualizacion; el soporte de la comunidad es minimo.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base (formato HF): https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Checkpoint de referencia del layout: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Libreria `speculators`: no disponible
- Paper, blog o demo: no disponible
