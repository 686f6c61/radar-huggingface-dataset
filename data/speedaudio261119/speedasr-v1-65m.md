# SpeedAudio261119/SpeedASR-v1-65M

## Resumen

SpeedASR-v1-65M es un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado por SpeedAudio261119 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transductor Zipformer2 no causal con 65.551.059 parámetros (65,55 M), pensado para transcripción offline de audio completo, no para streaming nativo. El modelo incluye el checkpoint FP32 original, un vocabulario de 500 entradas, código de inferencia por lotes y exportaciones ONNX del codificador, decodificador y joiner.

Su relevancia radica en el equilibrio entre tamaño reducido (65 M de parámetros) y rendimiento medido en el Open ASR Leaderboard público: un WER medio del 6,8986 % en siete conjuntos de prueba en inglés y un RTFx agrupado de 200,77 sobre NVIDIA H200 en FP32, lo que lo sitúa como una opción ligera y rápida para despliegues de transcripción por lotes. No incorpora modelo de lenguaje externo ni normalización de WER dentro de la inferencia, y aplica etiquetas de capitalización y puntuación del sistema VoiceA.

El modelo está pensado para audio mono a 16 kHz con muestras en coma flotante, utiliza características Fbank de 80 bins (kaldifeat, dither 0, `snip_edges=False`, `high_freq=-400`) y decodificación mediante búsqueda por haz modificada con beam 4 en FP32. Su ventana de proceso es de 30 segundos por fragmento, con concatenación sin solapamiento para audios más largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer2 (encoder no causal de seis stacks y 16 capas; red de predicción tipo transductor con contexto 3 y dimensión 512; joiner de dimensión 512) |
| Parametros totales | 65.551.059 (65,55 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa fragmentos de audio de hasta 30 segundos y concatena sin solapamiento |
| Tipos de cuantizacion | no disponible (release en FP32; exportaciones ONNX sin paridad numérica evaluada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pretrained.pt`, 262.613.934 bytes) y ONNX (encoder/decoder/joiner) |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2 con encoder no causal de seis stacks y 16 capas, red de predicción con contexto 3 y dimensión 512, y joiner de dimensión 512. Procesa grabaciones completas (offline), no dispone de reconocedor en streaming nativo y no declara benchmark medido en teléfono ni NPU. La entrada es audio mono a 16 kHz con muestras en coma flotante y características Fbank de 80 bins calculadas con kaldifeat (dither 0, `snip_edges=False`, `high_freq=-400`).

El checkpoint publicado corresponde al alias `epoch-30-avg-9`; los nombres `epoch-99` de los ficheros ONNX son etiquetas de exportación, no indican que el modelo sea de la época 99. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La decodificación emplea búsqueda por haz modificada con beam 4 en FP32, sin modelo de lenguaje externo, y restaura etiquetas de capitalización y puntuación de VoiceA sin aplicar normalización de WER dentro de la inferencia.

## Capacidades

- Reconocimiento automático del habla offline en inglés sobre audio completo.
- Procesamiento por lotes (`transcribe_batch`) y CLI sobre ficheros WAV.
- Manejo de audios de distinta duración: relleno para entradas menores de un segundo y decodificación en piezas consecutivas de 30 segundos sin solapamiento para entradas más largas.
- Restauración de capitalización y puntuación mediante etiquetas de VoiceA.
- Verificación de integridad en carga: comprobación de hashes de checkpoint y tokens, carga estricta del state dict y verificación del recuento de parámetros.
- Descarga de pesos, tokens y configuración desde el Hub con commit fijado mediante `SpeedASR.from_pretrained`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio de salida ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción por lotes de reuniones y llamadas: el modelo procesa audios completos y decodifica en piezas de 30 segundos, lo que encaja con pipelines que ingieren grabaciones largas y necesitan texto con puntuación y mayúsculas.
- Generación de subtítulos offline para vídeo y pódcast: con un RTFx agrupado de 200,77 en H200, permite transcribir grandes volúmenes de audio en tiempos muy inferiores a la duración real.
- Indexación y búsqueda de archivos de audio: la salida con capitalización y puntuación restauradas facilita la construcción de índices de texto sobre grabaciones históricas.
- Análisis de atención al cliente: transcripción de llamadas en inglés para extraer métricas y alimentar sistemas de analítica, dado el bajo WER en dominios como SPGISpeech (3,89 %) y VoxPopuli (3,27 %).
- Preprocesado para pipelines de NLP: conversión de audio a texto en inglés como paso previo a resumen, clasificación o extracción de entidades, con un modelo de 65 M que reduce requisitos de memoria frente a alternativas mayores.
- Despliegue en entornos con recursos limitados: el tamaño reducido del checkpoint (262,6 MB en FP32) y las exportaciones ONNX permiten integrar la transcripción en servicios contenedorizados o en hardware modesto, siempre que se respete el ABI de k2 y kaldifeat.
- Evaluación y reproducción de benchmarks ASR: los artefactos públicos (predicciones, metadatos y revisiones fijadas) permiten reproducir los resultados del Open ASR Leaderboard en inglés.

## Benchmarks y rendimiento

Resultados públicos en NVIDIA H200 (FP32, beam 4, límite de 2.048 clips y presupuesto de lote de 5.000 segundos de audio con relleno), ejecutados el 22 de noviembre de 2026:

| Conjunto de prueba | Clips evaluados | WER | RTFx |
|---|---:|---:|---:|
| AMI-Cleaned | 7.715 | 9,48 % | 213,77 |
| GigaSpeech-Cleaned | 18.757 | 8,07 % | 201,59 |
| VoxPopuli-AA-Cleaned | 628 | 3,27 % | 184,82 |
| Earnings22-Cleaned-AA (por fragmentos) | 341 | 6,78 % | 191,19 |
| SPGISpeech | 39.341 | 3,89 % | 200,50 |
| URGENT2024 | 1.000 | 12,34 % | 192,83 |
| Voice Arena Monsoon | 2.102 | 4,46 % | 195,60 |
| Media de siete conjuntos / RTFx agrupado | 69.884 | 6,8986 % | 200,77 |

La media de WER pondera por igual los siete conjuntos. El RTFx agrupado divide la duración total del audio entre el tiempo de inferencia medido. Los 341 fragmentos de Earnings22 se reensamblaron y puntuaron contra seis referencias a nivel de llamada. Se trata de resultados ejecutados por el autor; la verificación por parte de los mantenedores y la evaluación en conjuntos privados están pendientes. Existen además resultados históricos locales en NVIDIA GeForce RTX 3090 Ti (FP32) generados el 19 de noviembre de 2026, pero la información disponible no incluye sus cifras completas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 65,55 M de parámetros en FP32 el checkpoint ocupa 262,6 MB, por lo que la huella de pesos es reducida y el consumo dominante proviene de activaciones y del cálculo de características.
- GPU recomendadas: NVIDIA H200 para los benchmarks publicados; NVIDIA GeForce RTX 3090 Ti para los resultados históricos locales. No se documentan otras GPU.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente memoria para el entorno CUDA 12.4 y PyTorch 2.6.0, aunque no se publica una tabla de VRAM por GPU.
- Opciones de despliegue: inferencia PyTorch con `inference.py` y `SpeedASR`; exportaciones ONNX incluidas (sin paridad numérica evaluada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Entorno fijado: Linux x86-64, Python 3.10, CUDA 12.4 y PyTorch 2.6.0, con wheels de k2 y kaldifeat compatibles con el ABI de PyTorch/CUDA.
- Latencia y throughput: RTFx entre 184,82 y 213,77 según conjunto en H200; RTFx agrupado de 200,77. No se publica latencia absoluta por clip.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, WER, licencia y disponibilidad) para construir una comparativa fiable. Los resultados publicados del modelo se presentan frente a conjuntos de prueba del Open ASR Leaderboard, no frente a otros sistemas concretos.

| Modelo | Parametros | Contexto | WER medio (7 conjuntos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeedASR-v1-65M | 65,55 M | fragmentos de 30 s | 6,8986 % | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Modelo offline: no ofrece reconocimiento en streaming nativo.
- Entrada restringida a audio mono a 16 kHz con muestras en coma flotante; es necesario remuestrear el audio externo antes de llamar a la API.
- El CLI de WAV usa únicamente el primer canal, en línea con el frontend de evaluación.
- Audios menores de un segundo se rellenan; los mayores de 30 segundos se decodifican en piezas consecutivas sin solapamiento, lo que puede afectar a la continuidad en fronteras de fragmento.
- Las exportaciones ONNX no han sido evaluadas para paridad numérica en esta release.
- No se ha medido rendimiento en teléfono ni en NPU.
- Los resultados de benchmark son ejecuciones del autor; la verificación por mantenedores y la evaluación en conjuntos privados están pendientes.
- No se documentan sesgos conocidos, tasas de alucinación ni riesgos específicos de producción más allá de los anteriores.
- La licencia Apache 2.0 permite uso comercial, pero los componentes vendorizados de Icefall conservan sus avisos y su licencia Apache 2.0 original.
- El entorno de dependencias está fijado a Linux x86-64, Python 3.10, CUDA 12.4 y PyTorch 2.6.0; las wheels de k2 y kaldifeat deben coincidir con el ABI de PyTorch/CUDA, lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeedAudio261119/SpeedASR-v1-65M
- Commit del modelo usado en la reproducción: https://huggingface.co/SpeedAudio261119/SpeedASR-v1-65M/tree/a6f5cacea359929b52ae41b77f6f634441cf0546
- Commit del launcher del Open ASR Leaderboard: https://github.com/speedaudio/open_asr_leaderboard/commit/a338f5f55649d5eb634d4d48ba691599148e5939
- Revisión del Space de evaluación: https://huggingface.co/spaces/SpeedAudio/open-asr-leaderboard-speedasr/tree/a41b6616514f2d34b946d87f3e3ce42b2567ec1c
- Revisión del scorer: https://github.com/huggingface/open_asr_leaderboard/tree/4a113dd90c9ffd011d7d3d105da76980d511d029
- Bucket de resultados: https://huggingface.co/buckets/SpeedAudio/speedasr-open-asr-results
- Job H200 AMI-Cleaned: https://huggingface.co/jobs/SpeedAudio/6b02f87e130a00b5aa8051e5
- Job H200 GigaSpeech-Cleaned: https://huggingface.co/jobs/SpeedAudio/6b02f9578d268c0fbd21ee36
- Job H200 VoxPopuli-AA-Cleaned: https://huggingface.co/jobs/SpeedAudio/6b02fc518d268c0fbd21f1d0
- Job H200 Earnings22-Cleaned-AA: https://huggingface.co/jobs/SpeedAudio/6b02fcc98d268c0fbd21f20f
- Job H200 SPGISpeech: https://huggingface.co/jobs/SpeedAudio/6b02fd41130a00b5aa805a30
- Job H200 URGENT2024: https://huggingface.co/jobs/SpeedAudio/6b03053f8d268c0fbd21ff7b
- Job H200 Voice Arena Monsoon: https://huggingface.co/jobs/SpeedAudio/6b0305a68d268c0fbd220000
