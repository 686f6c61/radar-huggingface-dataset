# tryambientai/gigaam-v3-ctc-gguf

## Resumen

GigaAM-v3-ctc-gguf es la conversión al formato GGUF del modelo ai-sage/GigaAM-v3 en su variante `ctc`, un sistema de reconocimiento automático del habla (ASR) especializado en ruso. Lo publica el usuario tryambientai dentro del ecosistema transcribe.cpp, una implementación en C/C++ pensada para inferencia local y offline de modelos de transcripción. El modelo base lo desarrolla ai-sage (equipo vinculado a SaluteDevices/Sber) y es la tercera generación de la familia GigaAM.

Se trata de un encoder Conformer de 16 capas con aproximadamente 220,7 millones de parámetros y una cabeza CTC basada en una convolución 1×1, entrenado con el objetivo HuBERT-CTC sobre datos de habla rusa. No es un modelo generativo de texto: su única salida es una transcripción en ruso en minúsculas, sin puntuación, sobre un vocabulario de 33 caracteres. Su relevancia actual radica en que ofrece un ASR ruso de alta calidad en un paquete de entre 174 MB y 842 MB que puede ejecutarse en CPU, GPU o dispositivos Apple Silicon sin dependencias de Python.

La conversión GGUF permite desplegar el modelo con transcribe.cpp en entornos donde no hay stack de PyTorch disponible, manteniendo una calidad prácticamente idéntica a la del modelo en precisión completa (WER de 8,29-8,42 % en FLEURS ru según la cuantización). Es, por tanto, una pieza orientada a producción local, transcripción de archivos y pipelines de audio en ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1×1 |
| Parámetros totales | 220.718.498 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio, no texto) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer de 16 capas entrenado con el objetivo HuBERT-CTC, una combinación de preentrenamiento autosupervisado tipo HuBERT seguido de ajuste fino con una cabeza CTC. La variante aquí convertida (`ctc`) usa decodificación CTC voraz (greedy) y produce texto en minúsculas sin puntuación ni normalización. El modelo base se preentrenó sobre 700.000 horas de habla rusa según la model card upstream, e incorpora conjuntos de datos internos nuevos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas.

La familia GigaAM-v3 incluye otras variantes (`ssl`, `rnnt`, `e2e_ctc`, `e2e_rnnt`) que no están cubiertas por esta conversión GGUF. La versión `e2e_ctc` y `e2e_rnnt` añaden puntuación y normalización de texto, capacidades que esta conversión `ctc` no ofrece. La conversión se realizó desde el commit upstream `15ef3b5` (fijado el 2026-05-12) y se validó contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ruso, offline y con decodificación CTC voraz.
- Salida en minúsculas, sin puntuación, sin normalización de texto y con vocabulario de 33 caracteres.
- Marcas de tiempo a nivel de token (`timestamps: token` según metadatos de transcribe.cpp).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No es un modelo de lenguaje: no genera texto libre, no razona, no hace tool calling ni soporta agentes.
- No tiene capacidades multimodales más allá del audio de entrada (sin visión, sin audio generativo).

## Casos de uso

- Transcripción por lotes de archivos de audio en ruso: el modelo procesa WAV mono a 16 kHz y devuelve la transcripción completa; su reducido tamaño (174 MB en Q4_K_M) permite procesar grandes volúmenes en CPU sin GPU.
- Subtitulado automático de contenido en ruso: combinando las marcas de tiempo a nivel de token con un postprocesado propio se pueden generar subtítulos sincronizados, aunque la puntuación debe añadirse externamente.
- Análisis de conversaciones de call center: el modelo base se entrenó específicamente con datos de call center y muestra un WER de 10,3 % en ese dominio (variante V3_CTC), lo que lo hace adecuado para minutas y análisis de calidad.
- Transcripción en dispositivos de borde: con cuantizaciones Q4_K_M o Q5_K_M y el runtime transcribe.cpp, el modelo cabe en dispositivos con poca memoria y funciona sin conexión, útil para grabadoras, asistentes locales o aplicaciones de escritorio.
- Pipelines de accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos rusos, con la ventaja de que el modelo maneja habla con características atípicas (WER de 20,6 % en V3_CTC, frente a 59,3 % de Whisper).
- Preprocesado para sistemas de búsqueda o indexación: convertir archivos de audio rusos en texto indexable antes de pasarlos a un motor de búsqueda o a un LLM, dado que el modelo es rápido y ligero.
- Investigación en ASR: servir como baseline reproducible en ruso con licencia MIT y pesos GGUF, facilitando comparaciones sin depender de entornos Python.

## Benchmarks y rendimiento

Resultados de WER (%) en FLEURS ru (775 utterances, decodificación voraz, sin LM externo), medidos por el autor de la conversión:

| Cuantización | Tamaño | WER FLEURS ru |
|---|---:|---:|
| F32 | 842 MB | 8,42 |
| F16 | 428 MB | 8,42 |
| Q8_0 | 259 MB | 8,40 |
| Q6_K | 216 MB | 8,38 |
| Q5_K_M | 195 MB | 8,29 |
| Q4_K_M | 174 MB | 8,42 |

Referencia: el paquete oficial `gigaam` del autor mide 9,81 % en el mismo manifiesto; la diferencia de 1,4 pp se debe a que el paquete upstream rechaza 5 utterances largas (>25 s) contándolas como errores de deleción al 100 %. En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con upstream. ai-sage no publica WER de FLEURS ru; esta cifra la mide el autor de la conversión.

Resultados del modelo base (WER %, variante V3_CTC) en dominios diversos, según la model card upstream:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

Rendimiento de inferencia (factor de tiempo real, RTF) reportado en la model card de la conversión:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 146 |
| Apple M4 Max | CPU | 29 |
| Ryzen 4750U | Vulkan | 33 |
| Ryzen 4750U | CPU | 9 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 174 MB (Q4_K_M) y 842 MB (F32); en la práctica cualquier dispositivo con al menos 1 GB libre puede ejecutarlo.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se reportan aceleraciones con Metal (Apple Silicon) y Vulkan (iGPU/discretas).
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, y en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: transcribe.cpp (runtime nativo C/C++); no está pensado para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF de 146 en Metal (M4 Max), 29 en CPU (M4 Max), 33 en Vulkan (Ryzen 4750U) y 9 en CPU (Ryzen 4750U). Un RTF de 146 implica procesar aproximadamente 146 segundos de audio por segundo de cómputo.
- Requiere audio de entrada en WAV mono a 16 kHz; para otros formatos hay que convertirlos previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER ruso (medio) | Licencia | Formato |
|---|---|---:|---:|---|---|
| GigaAM-v3-ctc (esta conversión) | 220,7 M | audio 16 kHz | 9,2 (V3_CTC) | MIT | GGUF |
| GigaAM-v3-rnnt (upstream) | 220-240 M | audio 16 kHz | 8,4 | MIT | PyTorch |
| T-One + LM | no disponible | audio 16 kHz | 19,4 | no disponible | no disponible |
| Whisper (large-v3) | no disponible en la información | audio 16 kHz | 25,1 | no disponible en la información | no disponible |

La comparativa se limita a los datos publicados en la model card upstream. No se dispone de datos de otros modelos ASR rusos (por ejemplo Vosk o Silero) en la información proporcionada.

## Limitaciones y advertencias

- Solo ruso: no transcribe otros idiomas ni detecta el idioma de entrada.
- Salida sin puntuación, sin mayúsculas y sin normalización; requiere postprocesado si se necesita texto legible.
- No soporta streaming; está pensado para decodificación offline de archivos completos.
- No soporta traducción ni marcas de tiempo a nivel de palabra más allá de las de token.
- Riesgo de errores en habla con ruido, acentos atípicos o dominios no cubiertos; el WER sube al 20,6 % en habla con características atípicas y al 10,3 % en call center.
- El modelo base puede heredar sesgos de los datos de entrenamiento (700.000 horas de habla rusa de dominios diversos); no se documentan sesgos específicos.
- Licencia MIT heredada del modelo base, lo que permite uso comercial, pero conviene revisar los términos del modelo upstream para confirmar obligaciones de atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad, aunque el autor documenta validación numérica contra el paquete oficial.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, código ni tareas de agente.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/tryambientai/gigaam-v3-ctc-gguf
- Modelo base upstream: https://huggingface.co/ai-sage/GigaAM-v3
- Commit upstream de referencia: https://huggingface.co/ai-sage/GigaAM-v3/commit/15ef3b5
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-ctc.md
- Repositorio GigaAM (métricas y evaluación): https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
