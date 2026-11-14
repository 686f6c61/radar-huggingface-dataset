# xix3r/voxix-gigaam-v3-e2e-rnnt-gguf

## Resumen

GigaAM-v3 es un modelo fundacional de reconocimiento automático del habla (ASR) especializado en ruso, desarrollado por SberDevices (ai-sage) y publicado como continuación de la familia GigaAM. Esta ficha concreta documenta la conversión a formato GGUF realizada por el usuario xix3r del checkpoint `e2e_rnnt`, es decir, la variante end-to-end con decodificador RNN-T que genera texto ruso con mayúsculas, puntuación y normalización directamente, sin post-procesado adicional. El modelo base emplea una arquitectura Conformer de 16 capas con aproximadamente 222 millones de parámetros y se distribuye bajo licencia MIT.

La relevancia de esta conversión radica en que empaqueta un modelo ASR de calidad estado del arte para ruso en ficheros de entre 175 MB y 849 MB, ejecutables con la librería transcribe.cpp en CPU y GPU de consumo, incluyendo soporte Metal y Vulkan. Frente a alternativas multilingües como Whisper, el modelo base reporta mejoras sustanciales en dominios difíciles (habla telefónica, habla natural, habla con características atípicas), con un WER medio de 8,4 % frente al 25,1 % de Whisper en la comparativa publicada por el autor original.

El modelo está pensado exclusivamente para audio corto (hasta 25 segundos por utterance), no soporta streaming, no traduce y no realiza detección de idioma. Es, por tanto, una pieza especializada para pipelines de transcripción offline en ruso, no un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (16 capas de encoder) + cabecera RNN-T (transducer) |
| Parametros totales | 222.518.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; restriccion practica de 25 s por utterance (audio corto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ruso (ru) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (libreria transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un Conformer de 220–240 millones de parámetros preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa. Sobre ese encoder se aplica un ajuste fino con decodificador RNN-T para la variante `rnnt` y, en el caso de esta conversión, con la variante `e2e_rnnt`, que añade puntuación y normalización de texto de extremo a extremo. La decodificación es greedy RNN-T y el vocabulario de salida procede de un tokenizer SentencePiece de 1024 piezas, lo que explica que la salida sea texto ruso con mayúsculas y puntuación sin necesidad de un modelo de lenguaje externo.

El entrenamiento del modelo original incorpora datasets internos nuevos respecto a generaciones anteriores: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según el autor original, esto supone una mejora media del 30 % en esos dominios manteniendo la calidad en benchmarks públicos. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de audio ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR). La conversión GGUF se realizó desde el commit `ec1dc1f` del modelo base y se validó contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ruso con salida en minúsculas/mayúsculas correctas, puntuación y normalización de texto (end-to-end).
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Manejo de dominios difíciles: habla telefónica, habla natural, habla con música de fondo y habla con características atípicas.
- Timestamps a nivel de token (según la metadata `timestamps: token` de la model card).
- Ejecución en CPU y GPU mediante transcribe.cpp, con aceleración Metal y Vulkan.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción offline de reuniones y notas de voz en ruso: el modelo procesa utterances de hasta 25 segundos, por lo que se encadenaría una segmentación previa (VAD o similar) para audio largo, generando texto con puntuación listo para actas o resúmenes posteriores.
- Subtitulado de contenido audiovisual en ruso: el soporte de timestamps a nivel de token permite alinear la transcripción con el audio para generar subtítulos sincronizados, aunque requiere segmentación externa por la limitación de 25 segundos.
- Análisis de llamadas de call center: el modelo base está entrenado específicamente con conversaciones de call center y reporta un WER del 9,5 % en ese dominio (frente al 23,9 % de Whisper), lo que lo hace adecuado para minería de conversaciones, control de calidad y análisis de sentimiento sobre transcripciones.
- Dictado y accesibilidad en aplicaciones de escritorio: con cuantizaciones Q4_K_M (175 MB) o Q5_K_M (197 MB) cabe holgadamente en cualquier equipo y puede ejecutarse en CPU con transcribe.cpp para dictado local sin conexión.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el rendimiento en CPU (RTF 8 en Ryzen 4750U y 25 en Apple M4 Max) permite transcribir varias horas de audio en tiempos razonables en hardware modesto.
- Investigación en ASR para ruso: al ser un modelo MIT de 222 M de parámetros con conversión GGUF reproducible y validación numérica documentada, sirve como baseline ligero para experimentos de adaptación de dominio o comparación de decodificadores.
- Preservación y búsqueda en archivos de audio históricos en ruso: la transcripción local con modelos pequeños permite indexar grandes volúmenes de audio sin enviar datos a servicios en la nube, relevante por privacidad.

## Benchmarks y rendimiento

Resultados reportados en la model card de esta conversión (WER sobre FLEURS ru, 775 utterances, decodificación greedy sin LM externo):

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 849 MB | 5,35 % |
| F16 | 431 MB | 5,35 % |
| Q8_0 | 261 MB | 5,36 % |
| Q6_K | 217 MB | 5,37 % |
| Q5_K_M | 197 MB | 5,42 % |
| Q4_K_M | 175 MB | 5,36 % |

Referencia del paquete oficial `gigaam` sobre el mismo manifiesto: 6,78 %; la diferencia de 1,4 pp se debe a que el paquete original rechaza 5 utterances de más de 25 segundos (contabilizadas como errores de deleción al 100 %). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con el paquete oficial. ai-sage no publica WER de FLEURS ru; esta cifra se midió en la conversión.

Rendimiento (RTF, mayor es mejor) reportado en la model card:

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 88 |
| Apple M4 Max | CPU | 25 |
| Ryzen 4750U | Vulkan | 22 |
| Ryzen 4750U | CPU | 8 |

Comparativa por dominios del modelo base GigaAM-v3 (WER %, tabla del autor original):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa 175 MB y F32 849 MB. Cabe en cualquier GPU de consumo, incluida una iGPU.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en todas (GTX 1050 en adelante, iGPU integradas, Apple M1 o posterior).
- Despliegue: transcribe.cpp (compilación desde fuente con CMake, binario `transcribe-cli`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF 88 en Apple M4 Max con Metal, 25 en CPU del M4 Max, 22 en Ryzen 4750U con Vulkan y 8 en CPU del Ryzen 4750U. Un RTF de 88 implica procesar audio unas 88 veces más rápido que tiempo real.
- Preprocesado: el audio debe ser WAV mono a 16 kHz; la model card sugiere conversión con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | WER ruso (referencia) | Licencia | Formato |
|---|---|---|---|---|---|---|
| GigaAM-v3 e2e_rnnt (esta conversion) | 222 M | ≤25 s por utterance | ru | 5,35 % FLEURS ru (medido); 8,4 % media multi-dominio | MIT | GGUF |
| GigaAM-v3 ctc (variante del mismo modelo base) | ~220–240 M | ≤25 s | ru | 9,2 % media multi-dominio (CTC) | MIT | safetensors (upstream) |
| T-One + LM | no disponible | no disponible | ru | 19,4 % media multi-dominio | no disponible | no disponible |
| Whisper (large-v3 en la tabla del autor) | 1.550 M (large-v3) | 30 s por ventana | multilingue | 25,1 % media multi-dominio; 12,0 % en datasets abiertos | MIT | safetensors, GGUF, etc. |

La comparación se limita a los datos publicados por el autor original de GigaAM-v3; no se dispone de cifras de otros modelos ASR rusos en la información proporcionada.

## Limitaciones y advertencias

- Solo ruso: no soporta otros idiomas ni detección de idioma; introducir audio en otro idioma producirá salidas incorrectas o vacías.
- Solo audio corto: utterances de más de 25 segundos deben segmentarse externamente; el paquete oficial rechaza esos ficheros con error.
- Sin streaming: no apto para transcripción en tiempo real; requiere audio completo por segmento.
- Sin traducción: no convierte ruso a otro idioma.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencio o habla solapada; no se documentan tasas específicas.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad en la información disponible; el WER del 19,2 % en habla con características atípicas indica degradación notable en ese dominio.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar los términos del modelo base `ai-sage/GigaAM-v3` para confirmar condiciones de atribución.
- Repositorio de conversión con muy poca tracción (21 descargas, 0 likes, creado en noviembre de 2026): no hay garantía de mantenimiento ni de actualizaciones respecto al modelo base.
- Los enlaces de descarga de la model card apuntan al repositorio `handy-computer/gigaam-v3-e2e-rnnt-gguf`, no al repositorio `xix3r` donde se aloja esta ficha; verificar la procedencia de los ficheros antes de usarlos en producción.
- Dependencia de transcribe.cpp: no hay soporte documentado en otros runtimes (llama.cpp, ONNX Runtime, etc.), lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xix3r/voxix-gigaam-v3-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado: https://huggingface.co/ai-sage/GigaAM-v3/commit/ec1dc1f
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-rnnt.md
- Repositorio oficial GigaAM (SberDevices): https://github.com/salute-developers/GigaAM
- Métricas oficiales GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
