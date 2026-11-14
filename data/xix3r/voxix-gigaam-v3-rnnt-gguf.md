# xix3r/voxix-gigaam-v3-rnnt-gguf

## Resumen

Voxix GigaAM-v3 RNNT GGUF es una conversión al formato GGUF del modelo `ai-sage/GigaAM-v3` en su variante RNN-T, publicada por el usuario xix3r para su uso con el runtime `transcribe.cpp`. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado exclusivamente en ruso, construido sobre una arquitectura Conformer de 16 capas con decodificador RNN-T y un total de 221.883.426 parámetros. El modelo base fue desarrollado por ai-sage (equipo vinculado a Salute Developers) y esta conversión concreta empaqueta los pesos en cuantizaciones que van desde F32 (846 MB) hasta Q4_K_M (175 MB).

El modelo resuelve el problema de la transcripción offline de audio en ruso con un rendimiento muy superior al de alternativas generalistas como Whisper en dominios difíciles (habla natural, call centers, habla con características atípicas). La variante RNN-T emplea decodificación greedy y emite texto en minúsculas y sin puntuación, con un vocabulario de 33 caracteres. La relevancia actual radica en que permite desplegar ASR ruso de calidad en hardware modesto, incluyendo CPU y GPUs de consumo, gracias a las cuantizaciones GGUF y al soporte de backends Metal, Vulkan y CPU en `transcribe.cpp`.

La ficha se centra en la conversión GGUF y en las métricas publicadas por el autor de la conversión, complementadas con los datos de la model card original de GigaAM-v3. Cabe señalar que el repositorio tiene un volumen de descargas muy bajo (22) y ninguna validación comunitaria adicional más allá de la reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con decodificador RNN-T |
| Parametros totales | 221.883.426 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada, se documentan limitaciones con audios >25 s en el paquete upstream) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo base GigaAM-v3 es un modelo fundacional basado en Conformer con 220-240 millones de parámetros, preentrenado con el objetivo HuBERT-CTC sobre 700.000 horas de habla en ruso. La variante aquí empaquetada es la `rnnt`, es decir, un encoder Conformer de 16 capas afinado con un decodificador RNN-T. La conversión GGUF mantiene exactamente esa arquitectura y aplica decodificación greedy RNN-T en tiempo de inferencia.

El entrenamiento de GigaAM-v3 incorpora conjuntos de datos internos nuevos respecto a generaciones anteriores: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. Según la model card original, los modelos de la familia mejoran en promedio un 30 % en estos dominios nuevos manteniendo la calidad en benchmarks públicos. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de audio ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR). La innovación destacable de esta conversión es la disponibilidad de pesos GGUF con pérdida de calidad prácticamente nula entre cuantizaciones: el WER en FLEURS ru varía entre 8.07 % (Q6_K) y 8.12 % (Q5_K_M y Q4_K_M), frente al 8.08 % de referencia en F32.

## Capacidades

- Transcripción de voz a texto offline en ruso, con salida en minúsculas y sin puntuación (vocabulario de 33 caracteres).
- Decodificación RNN-T greedy sin modelo de lenguaje externo.
- Generación de timestamps a nivel de token (`timestamps: token`).
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan (GPUs AMD/Intel) a través de `transcribe.cpp`.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio generativo: es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas en ruso: el modelo procesa audio de 16 kHz mono y genera transcripciones con timestamps por token, lo que permite alinear el texto con el audio en herramientas de actas o subtitulado interno.
- Subtitulado offline de contenido audiovisual en ruso: al ejecutarse en CPU y GPUs de consumo con cuantizaciones de 175-260 MB, se puede integrar en pipelines de postproducción sin depender de servicios en la nube.
- Análisis de llamadas de call center: la model card original reporta un WER del 9.5 % en dominio callcenter para la variante RNN-T, muy por debajo de Whisper (23.9 %), lo que lo hace adecuado para minería de conversaciones y control de calidad.
- Aplicaciones de accesibilidad en ruso: transcripción local en dispositivos con recursos limitados (portátiles, mini-PC) gracias a la cuantización Q4_K_M de 175 MB y al backend CPU.
- Procesamiento de audio con ruido o música de fondo: el entrenamiento con habla natural y con música de fondo permite usar el modelo en grabaciones de campo, entrevistas callejeras o contenido multimedia no producido.
- Transcripción de habla con características atípicas: el modelo reporta un WER del 19.2 % en habla con trastornos (frente a 59.3 % de Whisper), lo que lo hace útil en aplicaciones clínicas o de accesibilidad.
- Integración en herramientas de línea de comandos y scripts: el binario `transcribe-cli` permite invocarlo desde pipelines shell o sistemas de gestión documental que necesiten indexar audio en ruso.

## Benchmarks y rendimiento

WER (%) en FLEURS ru (split de test completo, 775 utterances, decodificación greedy sin LM externo), medido por el autor de la conversión:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 846 MB | 8.08 % |
| F16 | 430 MB | 8.08 % |
| Q8_0 | 260 MB | 8.08 % |
| Q6_K | 217 MB | 8.07 % |
| Q5_K_M | 196 MB | 8.12 % |
| Q4_K_M | 175 MB | 8.12 % |

Comparativa de dominios publicada en la model card original de GigaAM-v3 (WER %):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3.0 | 2.6 | 5.7 | 12.0 |
| Golos Farfield | 4.5 | 3.9 | 12.2 | 16.7 |
| Natural Speech | 7.8 | 6.9 | 14.5 | 13.6 |
| Disordered Speech | 20.6 | 19.2 | 51.0 | 59.3 |
| Callcenter | 10.3 | 9.5 | 13.5 | 23.9 |
| **Promedio** | **9.2** | **8.4** | **19.4** | **25.1** |

Notas sobre las métricas: el autor de la conversión indica que el paquete original `gigaam` mide 9.46 % en el mismo manifiesto, y que la diferencia de 1.4 pp se debe a que el paquete upstream rechaza 5 utterances de más de 25 s (contabilizadas como errores de borrado del 100 %). En el subconjunto de 770 utterances que ambos decodifican, `transcribe.cpp` coincide exactamente con upstream. ai-sage no publica WER en FLEURS ru; la cifra es una medición del autor de la conversión.

Rendimiento en tiempo real (RTF, menor es mejor, medido por el autor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 110 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 25 |
| AMD Ryzen 4750U | CPU | 9 |

## Requisitos de hardware

- VRAM estimada: entre 175 MB (Q4_K_M) y 846 MB (F32) para los pesos; el consumo real de memoria es ligeramente superior por buffers de inferencia y audio.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD/Intel) es suficiente; no requiere GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU integrada o dedicada con al menos 1 GB de memoria disponible, e incluso en CPU.
- Opciones de despliegue: `transcribe.cpp` (compilado desde fuente, binario `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 110 en Metal (M4 Max), 27 en CPU (M4 Max), 25 en Vulkan (Ryzen 4750U) y 9 en CPU (Ryzen 4750U). Un RTF de 110 implica procesar audio unas 110 veces más rápido que tiempo real en ese hardware.
- Requisito de entrada: audio en WAV mono a 16 kHz; se recomienda convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER promedio (dominios GigaAM) | Licencia | Formato / despliegue |
|---|---|---:|---:|---|---|
| Voxix GigaAM-v3 RNNT GGUF (este) | 221.9 M | Ruso | 8.4 % (RNNT base) | MIT | GGUF / transcribe.cpp |
| GigaAM-v3 CTC (upstream) | 220-240 M | Ruso | 9.2 % | MIT | PyTorch / transformers |
| T-One + LM | no disponible | Ruso | 19.4 % | no disponible | no disponible |
| Whisper (large-v3) | no disponible en la información | Multilingüe | 25.1 % | MIT | múltiples (incluye GGUF vía otros runtimes) |

La comparativa se limita a los modelos incluidos en la model card original. Frente a Whisper, la variante RNN-T de GigaAM-v3 reduce el WER medio a menos de un tercio en los dominios evaluados, aunque Whisper cubre muchos más idiomas y ofrece puntuación y mayúsculas. Frente a la variante CTC del mismo modelo, la RNN-T obtiene un WER inferior (8.4 % vs 9.2 % de media). No se dispone de datos comparativos con otros modelos ASR rusos como Vosk o Silero en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso: no detecta idioma ni traduce, por lo que audio en otros idiomas producirá salidas incorrectas sin aviso.
- Salida sin puntuación ni mayúsculas: el vocabulario de 33 caracteres y el ajuste fino emiten texto en minúsculas; para texto con formato hay que usar las variantes `e2e_ctc` o `e2e_rnnt` del modelo base.
- Sin streaming: el modelo requiere el audio completo (o segmentos) y no admite decodificación incremental en tiempo real.
- Audios largos: el paquete upstream rechaza utterances de más de 25 s con el método estándar; se requiere `transcribe_longform` o segmentación previa. Esta limitación afecta a la comparación de métricas y puede afectar a pipelines que no segmenten.
- Riesgo de alucinación y errores en dominios no cubiertos: aunque el WER es bajo en los dominios evaluados, no hay garantías en acentos, jerga o audio de muy baja calidad no representados en el entrenamiento.
- Sesgos: no se documentan análisis de sesgo por género, edad, acento o condición del hablante más allá de la métrica agregada de "disordered speech".
- Licencia MIT: permite uso comercial, pero se hereda del modelo base; conviene revisar la model card de `ai-sage/GigaAM-v3` para términos completos y posibles restricciones adicionales de los datos de entrenamiento.
- Madurez del ecosistema: `transcribe.cpp` es un runtime específico que hay que compilar desde fuente; el repositorio tiene muy pocas descargas (22) y ninguna validación comunitaria independiente.
- Fecha de la conversión: el modelo fue portado desde el commit `c7f128b` del modelo base (fijado el 2026-05-12); cambios posteriores en upstream no están reflejados.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/xix3r/voxix-gigaam-v3-rnnt-gguf
- Modelo base GigaAM-v3: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base utilizado: https://huggingface.co/ai-sage/GigaAM-v3/commit/c7f128b
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-rnnt.md
- Descargas GGUF (referenciadas en la model card): https://huggingface.co/handy-computer/gigaam-v3-rnnt-gguf
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Repositorio GigaAM: https://github.com/salute-developers/GigaAM
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
