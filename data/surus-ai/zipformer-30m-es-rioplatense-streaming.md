# surus-ai/zipformer-30m-es-rioplatense-streaming

## Resumen

zipformer-30m-es-rioplatense-streaming es un modelo de reconocimiento automático del habla (ASR) en streaming, desarrollado desde cero por SURUS (surus.lat) para español rioplatense. Se trata de un transducer Zipformer RNN-T de aproximadamente 30 millones de parámetros, pensado específicamente para agentes de voz conversacionales que necesitan ejecutarse en infraestructura propia (on-prem) por requisitos de soberanía del dato. El modelo se distribuye exclusivamente como artefactos ONNX (fp32 e int8) para servir en CPU y dispositivos de borde mediante sherpa-onnx.

La propuesta diferencial es la especialización dialectal: frente a checkpoints genéricos de español, este modelo se entrena con un sobremuestreo ×6 de clips argentinos sobre un corpus total de 524,5 horas. El resultado declarado es un WER del 3,28 % en fp32 y 5,67 % en int8 sobre un conjunto de evaluación rioplatense retenido (E3), frente al 13,08 % de su modelo profesor no streaming en el mismo arnés de evaluación.

Es relevante ahora porque demuestra que un modelo de 30 M parámetros puede alcanzar latencias de primer token de ~100 ms (p50) con RTF 0,083 en CPU de 4 hilos, con licencia Apache-2.0 y entrenamiento desde cero (sin pesos destilados), lo que habilita uso comercial sin las restricciones habituales de checkpoints ASR con licencias no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer RNN-T (transducer), encoder streaming causal |
| Parametros totales | ~30 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | configuracion de chunk/left-context en metadatos ONNX: chunk 16,32,64,-1 / left 64,128,256,-1 (causal); ventana de audio por chunk de 320 ms en la evaluacion de latencia |
| Tipos de cuantizacion | fp32 (torch y ONNX) e int8 (cuantizacion dinamica ONNX) |
| Idiomas soportados | es (español, con especializacion en rioplatense) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx), tokens.txt; checkpoint torch fp32 mencionado en metricas |

## Arquitectura y entrenamiento

El modelo sigue la receta icefall de Zipformer RNN-T con 2,2,3,4,3,2 capas, dimensión de encoder de 160 a 192 y decoder/joiner de 512. El encoder es causal y streaming, con configuraciones de chunk y left-context incrustadas en los metadatos ONNX. El vocabulario es BPE de 500 tokens (blk=0, sos=1, unk=2), distribuido en `tokens.txt`.

El entrenamiento se realizó desde cero (sin destilar pesos del profesor) sobre 524,5 horas de español (Common Voice ES más corpus de habla leída), con un sobremuestreo ×6 de 5.166 clips argentinos que representan el 7,9 % de la mezcla, y aumento de datos online estilo MegaASR (ruido MUSAN, RIR, variación de velocidad). Se ejecutaron 30 épocas en una única RTX 3090; el checkpoint campeón es el de la época 26, seleccionado porque épocas posteriores mostraban sobreajuste leve al dialecto. El programa completo consistió en un bucle autónomo de I+D de una semana con 6 ejecuciones de entrenamiento y un arnés de evaluación congelado de tres conjuntos con identidades fijas (normalizador, conjuntos e hashes de ítems).

## Capacidades

- Reconocimiento de voz en streaming con decodificación greedy sobre transducer RNN-T.
- Salida incremental (primer token parcial) con latencia p50 de 100 ms y p90 de 151 ms en la configuración evaluada.
- Funcionamiento causal con chunk de 320 ms y left-context configurable (64, 128, 256 o ilimitado según la variante incrustada).
- Especialización en español rioplatense (Argentina) con buen rendimiento en habla conversacional de esa variante.
- Reconocimiento de español general (Common Voice ES) con WER más alto que en el dominio dialectal.
- Ejecución en CPU y dispositivos de borde mediante sherpa-onnx, sin GPU.
- No dispone de tool calling, agentes, capacidades multimodales, visión ni audio más allá de la transcripción.

## Casos de uso

- Agentes de voz conversacionales on-prem: el modelo está diseñado para despliegues con requisitos de soberanía del dato; su encoder causal y su tamaño de 35,2 MiB int8 permiten ejecutarlo en servidores propios sin enviar audio a la nube, manteniendo RTF 0,083 en CPU de 4 hilos.
- Transcripción en tiempo real de llamadas de atención al cliente en Argentina: el sobremuestreo ×6 de clips rioplatenses y el WER del 3,28 % en el conjunto E3 lo hacen adecuado para dominios con acento rioplatense, donde los modelos genéricos de español rinden peor.
- Subtitulado en directo de reuniones o eventos: la decodificación streaming con chunk de 320 ms y la latencia de primer token de 100 ms permiten mostrar texto parcial mientras se habla, con corrección incremental.
- Asistentes de voz embebidos en dispositivos de borde: el tamaño de 35,2 MiB int8 y la carga del modelo en 3,5 s permiten integrarlo en hardware con recursos limitados mediante sherpa-onnx.
- Dictado por voz en aplicaciones de escritorio o móviles: la licencia Apache-2.0 y el entrenamiento desde cero permiten uso comercial sin las restricciones de checkpoints CC-BY-NC.
- Pipeline de transcripción por lotes en CPU: aunque el modelo es streaming, puede usarse para transcribir ficheros de audio de 16 kHz mono con decodificación greedy, aprovechando el bajo coste computacional (RTF 0,083) en nodos sin GPU.
- Preprocesado de audio para sistemas de análisis de conversaciones: la salida de transcripción puede alimentar pipelines de análisis de sentimiento o extracción de entidades en entornos donde el audio no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

| Conjunto de evaluacion | n | Modelo (torch fp32) | Modelo (ONNX int8) | Profesor (mismo arnes) |
|---|---|---|---|---|
| E3 Rioplatense (argentino retenido) | 573 | 3,28 % WER (172/5.238) | 5,67 % WER (297/5.238) | 13,08 % (685/5.238) |
| E1 Clean (CV-Spanish dev) | 500 | 15,18 % (756/4.980) | no disponible | 5,90 % (294/4.980) |
| E2 Degraded (CV-Spanish + ruido) | 500 | 20,24 % (1.008/4.980) | no disponible | 7,81 % (389/4.980) |

Descomposición del coste de exportación (E3, mismo arnés): torch fp32 (contexto completo) 3,28 % → ONNX fp32 streaming causal 5,71 % (299/5.238) → ONNX int8 5,67 % (297/5.238). La restricción streaming causal cuesta +2,43 pp; la cuantización dinámica int8 es prácticamente gratuita (−0,04 pp).

Latencia de streaming (int8, nodo CPU de 24 núcleos, 4 hilos, chunks de 320 ms, 64 clips E3): RTF 0,083 (objetivo < 0,3); primer token p50 100 ms / p90 151 ms (objetivo < 500 ms); carga del modelo 3,5 s.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU. No se publican requisitos de VRAM para GPU.
- GPU recomendadas: no disponible; el autor no documenta despliegue en GPU. El entrenamiento se realizó en una RTX 3090, pero la inferencia se distribuye en ONNX para CPU.
- Cabe en GPU consumer: no disponible como dato de inferencia; el tamaño int8 (35,2 MiB) es trivial para cualquier GPU, pero no hay cifras publicadas de rendimiento en GPU.
- Opciones de despliegue: sherpa-onnx (recomendado y documentado), con los artefactos `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` y `tokens.txt`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR transducer).
- Latencia y throughput: RTF 0,083 en CPU de 24 núcleos con 4 hilos y chunks de 320 ms; primer token p50 100 ms / p90 151 ms; carga del modelo 3,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER E3 rioplatense | Licencia | Formato |
|---|---|---|---|---|---|
| zipformer-30m-es-rioplatense-streaming (este) | ~30 M | Streaming causal, chunk 320 ms | 3,28 % (fp32) / 5,67 % (int8) | Apache-2.0 | ONNX |
| surus-ai/cohere-transcribe-spanish-MegaASR (profesor) | no disponible | No streaming (seq2seq) | 13,08 % | no disponible | no disponible |
| Alternativas genericas de ASR en español | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables en el mismo arnés de evaluación, por lo que la comparativa se limita al modelo profesor citado por el autor.

## Limitaciones y advertencias

- El rendimiento en español general es notablemente peor que en rioplatense: 15,18 % WER en E1 Clean y 20,24 % en E2 Degraded, frente al 3,28 % en E3. No es un modelo adecuado para español neutro o peninsular sin evaluación previa.
- La restricción streaming causal degrada el WER en +2,43 pp respecto al checkpoint fp32 de contexto completo (3,28 % → 5,71 % en ONNX fp32).
- La cuantización int8 añade una degradación adicional pequeña pero medible en E3 (5,71 % → 5,67 %, dentro del ruido según el autor, pero el WER absoluto sube respecto al fp32 torch).
- Riesgo de alucinación y errores en audio degradado: el WER del 20,24 % en E2 (con ruido) indica que el modelo es sensible a condiciones acústicas adversas.
- Sesgo dialectal: el sobremuestreo ×6 de clips argentinos puede penalizar otras variantes del español; no se documentan evaluaciones en español de España, México, Chile u otras regiones.
- Licencia Apache-2.0 permite uso comercial, pero el autor no documenta garantías ni soporte; el modelo es un artefacto de investigación publicado sin SLA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los artefactos pueden no estar completamente subidos o que las métricas de Hugging Face no reflejan el contenido real.
- No se documentan limitaciones de longitud de audio más allá de la configuración de chunk/left-context; no hay datos sobre rendimiento en audios muy largos o en dominios muy alejados del habla leída.

## Enlaces

- Hugging Face: https://huggingface.co/surus-ai/zipformer-30m-es-rioplatense-streaming
- SURUS: https://surus.lat
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Modelo profesor citado: https://huggingface.co/surus-ai/cohere-transcribe-spanish-MegaASR
- Repositorio del programa de I+D: surus-lat/speech (mencionado en la model card, sin URL directa disponible)
- icefall (receta de entrenamiento): no disponible en la informacion proporcionada
