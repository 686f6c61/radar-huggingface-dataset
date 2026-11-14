# xix3r/voxix-gigaam-v3-ctc-gguf

## Resumen

GigaAM-v3 CTC es la variante de reconocimiento automatico del habla (ASR) de la tercera generacion de la familia GigaAM, desarrollada por ai-sage (Sber). Se trata de un modelo Conformer de 220 millones de parametros especializado exclusivamente en ruso, preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de audio y afinado despues con una cabeza CTC para transcripcion. Esta ficha cubre la conversion a GGUF publicada por xix3r para su uso con transcribe.cpp, una implementacion en C++ pensada para inferencia offline sin dependencias de Python.

La relevancia de esta conversion radica en que permite ejecutar un ASR de calidad estado del arte en ruso sobre hardware modesto: el fichero cuantizado Q5_K_M ocupa solo 195 MB y mantiene un WER del 8,29% en FLEURS ru, practicamente identico al del modelo en F32 (8,42%). El modelo base declara mejoras medias del 30% en dominios nuevos (callcenter, habla natural, habla con musica de fondo y habla atipica) respecto a generaciones anteriores, manteniendo la calidad en benchmarks publicos.

La arquitectura es un encoder Conformer de 16 capas con una cabeza Conv1d 1x1 para CTC y decodificacion greedy. La salida es texto en ruso en minusculas, sin puntuacion, con un vocabulario de 33 caracteres. No soporta streaming, traduccion ni deteccion de idioma; los timestamps son a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con cabeza CTC Conv1d 1x1 |
| Parametros totales | 220.718.498 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; el modelo base recomienda fragmentar audios largos) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un Conformer de 220-240 millones de parametros preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa. La variante `ctc` que se ha convertido a GGUF anade una cabeza de clasificacion CTC (Conv1d 1x1) sobre el encoder y se afina para transcripcion directa de caracteres. La decodificacion es greedy, sin modelo de lenguaje externo. El vocabulario de salida consta de 33 entradas y produce texto en minusculas sin puntuacion.

El entrenamiento incorpora conjuntos de datos internos nuevos respecto a generaciones anteriores: conversaciones de callcenter, habla con musica de fondo, habla natural y habla con caracteristicas atipicas. Segun el autor del modelo base, esto se traduce en una mejora media del 30% en esos dominios sin degradar los benchmarks publicos. No se detalla en la informacion disponible si hubo fases de RLHF o DPO; el pipeline documentado es preentrenamiento autosupervisado seguido de fine-tuning supervisado con CTC.

La conversion a GGUF la ha realizado xix3r a partir del commit `15ef3b5` del modelo base (fijado el 2026-05-12) y se ha validado contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp. La implementacion usa decodificacion greedy CTC y no soporta streaming.

## Capacidades

- Transcripcion de voz a texto offline en ruso, con salida en minusculas y sin puntuacion.
- Decodificacion CTC greedy sin modelo de lenguaje externo.
- Timestamps a nivel de token.
- Ejecucion en CPU y en GPU mediante los backends de transcribe.cpp (Metal en Apple Silicon, Vulkan, CPU).
- No soporta streaming: requiere el audio completo antes de transcribir.
- No soporta traduccion.
- No soporta deteccion automatica de idioma.
- No soporta tool calling ni function calling (es un modelo puramente ASR).
- No soporta agentes ni razonamiento multi-paso.
- No es multimodal en el sentido de vision o audio generativo: solo consume audio y produce texto.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas en ruso: el modelo procesa ficheros WAV de 16 kHz mono y devuelve texto plano; con 195 MB en Q5_K_M se puede desplegar en un servidor modesto y procesar horas de audio sin coste de API.
- Subtitulado offline de contenido audiovisual en ruso: los timestamps a nivel de token permiten alinear el texto con el audio para generar subtitulos, siempre que se acepte la ausencia de puntuacion y mayusculas.
- Procesamiento de conversaciones de callcenter: el modelo base declara un WER del 10,3% en el dominio de callcenter (frente al 23,9% de Whisper), lo que lo hace adecuado para analitica de calidad y cumplimiento sobre grabaciones telefonicas.
- Transcripcion de habla natural y espontanea: con un WER del 7,8% en el conjunto de habla natural del modelo base, es util para diarios de voz, notas de campo o investigacion cualitativa.
- Accesibilidad y dictado en aplicaciones de escritorio: al ejecutarse con transcribe.cpp en CPU (RTF 9 en un Ryzen 4750U y 29 en un M4 Max), puede integrarse en herramientas de escritorio sin GPU dedicada.
- Procesamiento en dispositivos con recursos limitados: la cuantizacion Q4_K_M ocupa 174 MB y mantiene un WER del 8,42%, lo que permite embeberlo en aplicaciones moviles o sistemas empotrados con backend Vulkan o CPU.
- Investigacion en ASR para ruso: sirve como linea base reproducible con licencia MIT y pesos GGUF para comparar tecnicas de cuantizacion o de decodificacion.

## Benchmarks y rendimiento

Resultados de WER sobre el split de test completo de FLEURS ru (775 enunciados), decodificacion greedy sin LM externo, medidos por el autor de la conversion:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 842 MB | 8,42% |
| F16 | 428 MB | 8,42% |
| Q8_0 | 259 MB | 8,40% |
| Q6_K | 216 MB | 8,38% |
| Q5_K_M | 195 MB | 8,29% |
| Q4_K_M | 174 MB | 8,42% |

El paquete de referencia del autor (`gigaam`) mide un 9,81% en el mismo manifiesto; la diferencia de 1,4 puntos porcentuales se debe a que el paquete original rechaza 5 enunciados largos (mas de 25 s) con el error `Too long wav file, use 'transcribe_longform' method.`, que se contabilizan como errores de delecion al 100%. En el subconjunto de 770 enunciados que ambos decodifican, transcribe.cpp coincide exactamente con el paquete original. ai-sage no publica un WER de FLEURS ru; esta cifra la ha medido el autor de la conversion.

Rendimiento de inferencia (RTF, menor es mejor) segun la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 146 |
| Apple M4 Max | CPU | 29 |
| AMD Ryzen 4750U | Vulkan | 33 |
| AMD Ryzen 4750U | CPU | 9 |

Resultados del modelo base GigaAM-v3 en diversos dominios (WER %), comparado con T-One + LM y Whisper:

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| **Media** | **9,2** | **8,4** | **19,4** | **25,1** |

## Requisitos de hardware

- VRAM estimada: entre 174 MB (Q4_K_M) y 842 MB (F32) solo para los pesos; el consumo real depende del backend y del buffer de audio.
- Cabe en cualquier GPU de consumo actual: RTX 4090, RTX 3060, e incluso iGPU con Vulkan.
- En CPU funciona sin GPU dedicada; el RTF de 9 en un Ryzen 4750U indica que procesa audio mas rapido que tiempo real en un portatil de gama media.
- En Apple Silicon con Metal alcanza un RTF de 146 en un M4 Max.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`, compilado con CMake). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no estan pensadas para modelos ASR de este tipo.
- Latencia y throughput: medidos como RTF en la tabla de benchmarks; no se publican cifras absolutas de latencia por segundo de audio.
- Requiere audio de entrada en WAV mono a 16 kHz; si no, hay que convertirlo previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ruso (media) | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-v3 CTC (esta conversion) | 220 M | no disponible | 9,2% (modelo base) | MIT | GGUF |
| GigaAM-v3 RNNT | 220-240 M | no disponible | 8,4% (modelo base) | MIT | safetensors |
| T-One + LM | no disponible | no disponible | 19,4% | no disponible | no disponible |
| Whisper (large-v3) | no disponible | no disponible | 25,1% | MIT | safetensors, GGUF |

La comparativa se limita a los datos publicados en la model card del modelo base. GigaAM-v3 CTC y RNNT comparten arquitectura y datos de entrenamiento; la variante RNNT obtiene mejor WER medio (8,4% frente a 9,2%) a costa de un decodificador mas complejo. Frente a T-One y Whisper, la ventaja en ruso es sustancial en todos los dominios evaluados, especialmente en habla atipica (20,6% frente a 51,0% y 59,3%) y callcenter (10,3% frente a 13,5% y 23,9%).

## Limitaciones y advertencias

- Solo soporta ruso; no detecta idioma ni traduce.
- Salida en minusculas y sin puntuacion; para texto con puntuacion habria que usar las variantes `e2e_ctc` o `e2e_rnnt` del modelo base, no incluidas en esta conversion.
- No soporta streaming: hay que disponer del audio completo antes de transcribir.
- El paquete de referencia del autor rechaza audios de mas de 25 segundos; en transcribe.cpp no se documenta ese limite, pero la model card no detalla el comportamiento con audios largos.
- Riesgo de alucinacion en segmentos con ruido extremo o silencio prolongado, comun en modelos CTC sin LM externo; no se han publicado tasas especificas.
- Sesgos no documentados: no se detalla la composicion demografica del corpus de 700.000 horas ni posibles sesgos por acento, edad o genero.
- Licencia MIT heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas; conviene verificar los terminos del modelo base en su model card.
- La conversion tiene solo 22 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- El autor de la conversion no es el autor del modelo base; la responsabilidad sobre la calidad de la cuantizacion recae en xix3r, aunque se ha validado contra el paquete de referencia.

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/xix3r/voxix-gigaam-v3-ctc-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado: https://huggingface.co/ai-sage/GigaAM-v3/commit/15ef3b5
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-ctc.md
- Repositorio GigaAM (salute-developers): https://github.com/salute-developers/GigaAM
- Metricas detalladas del modelo base: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
