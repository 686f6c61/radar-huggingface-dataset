# sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet-v3

## Resumen

Qwen3-ASR-1.7B-Lyrics-Viet-v3 es un ajuste fino del modelo de reconocimiento automatico del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario sunbv56, especializado en la transcripcion de letras de canciones vietnamitas con voz cantada y musica de fondo. El modelo parte de la arquitectura Qwen3-ASR y se ha entrenado especificamente para superar las limitaciones del reconocimiento generico en audio musical, un dominio donde los ASR convencionales degradan notablemente su precision.

Esta tercera version amplia el conjunto de entrenamiento hasta 102.992 fragmentos (9.741 canciones, 470,9 horas), mas del doble que las 235,6 horas de la v2, incorporando generos que eran puntos debiles en versiones anteriores: canciones infantiles, rap y lanzamientos recientes. El modelo se ha reentrenado desde los pesos base mediante LoRA (rango 32, alpha 64) sobre las proyecciones de atencion y MLP, fusionada posteriormente en los pesos base.

La relevancia practica del modelo radica en su mejora medida: reduce el WER del 11,35 % (v2) al 9,73 % en el conjunto de evaluacion principal y del 17,27 % al 14,04 % en un conjunto de generos no vistos, con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder para reconocimiento del habla) |
| Parametros totales | 2.038.052.480 (~2,04 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor usa bfloat16) |
| Idiomas soportados | vietnamita (entrenamiento principal); conserva capacidades en ingles del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR del modelo base Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento automatico del habla de aproximadamente 2.038 millones de parametros. El ajuste fino se realizo mediante LoRA con rango 32 y alpha 64 aplicada a las proyecciones de atencion y MLP, entrenada durante 2 epocas (12.874 pasos, tamano de lote 16, tasa de aprendizaje 1e-4) en precision bf16, y posteriormente fusionada en los pesos base.

Los datos de entrenamiento combinan el conjunto limpio de la v2 con canciones vietnamitas nuevas rastreadas y filtradas desde Zing MP3, dirigidas especificamente a los generos debiles de la version anterior (canciones infantiles, rap y lanzamientos recientes). El total asciende a 102.992 fragmentos de 9.741 canciones (470,9 horas). Una innovacion destacable es que el modelo ha aprendido a emitir la etiqueta `language Vietnamese`, de modo que el modo de deteccion automatica (`language=None`) iguala practicamente al forzado en canciones vietnamitas (9,75 % frente a 9,73 % de WER).

## Capacidades

- Transcripcion de voz cantada en vietnamita con musica de fondo, incluyendo generos como pop, rap, canciones infantiles y lanzamientos recientes.
- Deteccion automatica de idioma con etiqueta de salida integrada (`language Vietnamese`).
- Transcripcion de habla leida en vietnamita (FLEURS `vi_vn`: 7,39 % WER) e ingles (LibriSpeech test-clean: 1,92 % WER en modo automatico).
- Decodificacion con multiple beam (1-beam y 4-beam); el 4-beam mejora significativamente los generos dificiles.
- Procesamiento de fragmentos de audio de hasta aproximadamente 20 segundos, alineados con la distribucion de entrenamiento.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Generacion automatica de letras sincronizadas para plataformas de streaming musical: el modelo transcribe fragmentos de hasta 20 segundos con un WER del 9,73 % en el conjunto principal, lo que permite alinear letras con marcas de tiempo tras segmentar el audio con VAD.
- Catalogacion y busqueda de canciones vietnamitas: transcribir el audio para indexar letras y habilitar busqueda por texto en bibliotecas musicales, aprovechando la mejora del 14,04 % de WER en generos no vistos.
- Moderacion de contenido en plataformas de karaoke o UGC musical: detectar letras explicitas o contenido inapropiado transcribiendo el audio antes de su publicacion.
- Investigacion en ASR musical: servir como linea base reproducible para experimentos sobre reconocimiento de voz cantada en vietnamita, con conjuntos de evaluacion y metricas documentadas (WER, CER, intervalos de confianza por bootstrap).
- Subtitulado de videoclips musicales y conciertos: transcribir actuaciones en directo o grabaciones con musica de fondo para generar subtitulos en vietnamita.
- Analisis de tendencias musicales: procesar grandes volumenes de canciones recientes para extraer tematicas y vocabulario, apoyandose en la mejora especifica sobre lanzamientos recientes (9,92 % WER en 1-beam).
- Transcripcion de audio educativo o infantil: aunque las canciones infantiles siguen siendo el caso mas dificil (13,15 %-15,02 % WER), el modelo es utilizable para contenido de baja criticidad.

## Benchmarks y rendimiento

Conjunto de evaluacion principal (949 fragmentos, 404 canciones, etiquetas corregidas v3; WER/CER en %, minusculas, sin puntuacion, normalizacion `norm2`, `language="Vietnamese"`, decodificacion 1-beam):

| Modelo | WER (%) | CER (%) | Fragmentos >50 % WER | IC 95 % (WER) |
|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 20,38 | 11,34 | 4,32 % | 19,04-21,80 |
| Qwen3-ASR-1.7B-Lyrics-Viet (v1) | 13,87 | 8,13 | 2,53 % | 12,69-15,12 |
| Qwen3-ASR-1.7B-Lyrics-Viet-v2 | 11,35 | 6,67 | 2,53 % | 10,24-12,52 |
| **v3 (este modelo)** | **9,73** | **5,90** | **1,48 %** | **8,74-10,80** |

Conjunto de retencion por genero (`eval_new`: 420 canciones, 4.117 fragmentos, sin solapamiento con entrenamiento):

| Subconjunto | Canciones / fragmentos | v2 (1-beam) WER | v3 (1-beam) WER | v3 (4-beam) WER | v3 4-beam menos v2 |
|---|---|---|---|---|---|
| Global | 420 / 4.117 | 17,27 | 14,04 | 12,73 | -4,55 |
| Infantil (`new_kids`) | 100 / 872 | 17,68 | 15,02 | 13,15 | -4,53 |
| Rap (`new_rap`) | 120 / 1.032 | 22,79 | 18,80 | 17,27 | -5,52 |
| Recientes (`new_recent`) | 200 / 2.213 | 12,76 | 9,92 | 8,98 | -3,78 |

Fuera del dominio de entrenamiento (150 clips por conjunto, WER en %):

| Conjunto | Modo | Base | v2 | v3 |
|---|---|---|---|---|
| LibriSpeech test-clean (ingles) | `language="English"` | 1,70 | 1,60 | 2,05 |
| LibriSpeech test-clean (ingles) | `language=None` | 1,70 | 2,02 | 1,92 |
| FLEURS `vi_vn` (habla leida) | `language="Vietnamese"` | 5,69 | 8,83 | 7,39 |
| FLEURS `vi_vn` (habla leida) | `language=None` | 5,67 | 8,74 | 7,39 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4-5 GB para los pesos (2.038 millones de parametros) mas memoria para activaciones y cache de audio, en torno a 6-8 GB en total.
- GPU recomendadas: NVIDIA A100 o H100 para procesamiento por lotes a gran escala; RTX 4090 o RTX 3090 para inferencia individual con holgura.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante) en bfloat16.
- Opciones de despliegue: el autor documenta el uso mediante la libreria `qwen_asr` con `Qwen3ASRModel.from_pretrained` y `device_map="cuda:0"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER principal (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Lyrics-Viet-v3 | ~2,04 mil millones | no disponible | 9,73 | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B-Lyrics-Viet-v2 | ~2,04 mil millones | no disponible | 11,35 | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B (base) | ~2,04 mil millones | no disponible | 20,38 | Apache 2.0 | Hugging Face |
| Qwen3-ASR-1.7B-Lyrics-Viet (v1) | ~2,04 mil millones | no disponible | 13,87 | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos ASR especializados en voz cantada vietnamita en la informacion proporcionada.

## Limitaciones y advertencias

- Las canciones infantiles y folk siguen siendo el modo de fallo mas frecuente: entre el 13,15 % y el 15,02 % de WER, y concentran la mayoria de los casos con mas del 50 % de WER (los datos infantiles representan menos del 4 % de las horas de entrenamiento).
- El rap con prestamos del ingles o jerga sigue siendo dificil (18,80 % en 1-beam, 17,27 % en 4-beam).
- La etiqueta automatica de idioma siempre devuelve `"Vietnamese"`, incluso cuando transcribe correctamente habla en ingles (1,92 % WER en LibriSpeech en modo automatico); para audio no vietnamita debe pasarse `language="English"` de forma explicita.
- La decodificacion 4-beam mejora los generos dificiles, pero en 1 de los 949 fragmentos del conjunto principal se observo un bucle de repeticion en ingles; conviene combinarla con control de repeticion en produccion.
- El modelo esta disenado para fragmentos de hasta unos 20 segundos; el audio mas largo debe segmentarse previamente (por ejemplo con VAD).
- Riesgo de alucinacion inherente a los modelos generativos de ASR, especialmente en pasajes con musica muy densa o voces poco claras; no se documentan sesgos especificos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y con 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet-v3
- Version anterior v2: https://huggingface.co/sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/sunbv56/song_dataset_training_20s_cleaned
- Conjunto de datos v2: https://huggingface.co/datasets/sunbv56/song_dataset_v2
