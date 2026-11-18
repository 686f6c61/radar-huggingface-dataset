# warlockzero/Qwen3-ASR-0.6B-int8

## Resumen

Qwen3-ASR-0.6B-int8 es una compilación cuantizada a 8 bits del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, publicado por Qwen (Alibaba) y adaptado por el usuario warlockzero. El modelo original resuelve la transcripción de audio a texto en once idiomas y esta pensado para despliegues donde el espacio de VRAM es limitado. Esta variante concreta aplica cuantización de bitsandbytes (`load_in_8bit`) sobre el checkpoint en fp16 para reducir el peso en disco de 1492 MB a 945 MB y el consumo de VRAM de aproximadamente 1,6 GB a 0,97 GB en pico.

La motivacion declarada por el autor es practica: en un portatil con RTX 4060 Laptop de 8 GB de VRAM bajo Windows, el checkpoint fp16 no cargaba de forma fiable por la gestion de memoria commit del driver WDDM, mientras que la version int8 si cabe con holgura. El modelo conserva la arquitectura, el vocabulario y el comportamiento del original, y solo cambia la precision de los pesos.

Es relevante ahora porque demuestra un patron de despliegue realista para ASR en hardware de consumo: un modelo de menos de 800 millones de parametros que transcribe audio de mas de 10 segundos en 3,2-4,6 segundos en una RTX 3090, con una huella de memoria inferior a 1,1 GB. No obstante, es una adaptacion de terceros con cero descargas y cero likes en el momento de la consulta, y no sustituye al checkpoint oficial para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para reconocimiento automatico del habla (familia Qwen3-ASR); detalles internos no disponibles |
| Parametros totales | 782.918.144 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (bitsandbytes `load_in_8bit`); el modelo base en fp16 |
| Idiomas soportados | en, zh, ar, es, fr, de, ja, ko, ru, hi, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-0.6B: se sabe que es un modelo de la familia Qwen3-ASR orientado a `automatic-speech-recognition`, con 782.918.144 parametros reales segun los safetensors, y que se carga mediante `AutoModelForMultimodalLM` y `AutoProcessor` de transformers. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni el encoder de audio empleado.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. Esta variante int8 no reentrena nada: es una conversion post-entrenamiento con bitsandbytes que cuantiza los pesos a 8 bits. La unica innovacion tecnica documentada es la propia cuantizacion y su verificacion: el autor confirma que una muestra de audio en ingles de 10,44 segundos se transcribe de forma identica en dos ejecuciones consecutivas y tras un ciclo completo de guardado y recarga.

## Capacidades

- Transcripcion de voz a texto (`apply_transcription_request` + `generate`) en once idiomas: ingles, chino, arabe, espanol, frances, aleman, japones, coreano, ruso, hindi y bengali.
- Salida en formato de transcripcion limpia mediante `decode(..., return_format="transcription_only")`.
- Procesamiento de audio mono o multicanal (el ejemplo de uso promedia canales para obtener mono).
- Generacion determinista con `do_sample=False`, adecuada para transcripcion reproducible.
- No soporta traduccion: el autor indica explicitamente que es solo transcripcion, igual que el modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla de la propia entrada de voz.
- No se documenta modo de razonamiento (thinking mode) ni capacidades multimodales adicionales.

## Casos de uso

- Transcripcion de reuniones y notas de voz en portatiles con GPU de 8 GB: el modelo ocupa 0,97 GB de VRAM en pico (1,07 GB), por lo que convive con otras aplicaciones en una RTX 4060 Laptop sin agotar la memoria.
- Subtitulado de contenido audiovisual en varios idiomas: al cubrir en, zh, ar, es, fr, de, ja, ko, ru, hi y bn, un mismo pipeline puede generar subtitulos para audiencias internacionales sin cambiar de modelo.
- Prototipado rapido de interfaces de voz: la carga mediante `AutoProcessor` y `AutoModelForMultimodalLM` con `apply_transcription_request` permite integrar ASR en un script de Python en pocas lineas.
- Procesamiento por lotes en una sola GPU: con una huella inferior a 1,1 GB, se pueden ejecutar varias instancias o combinar con otros modelos pequenos en la misma tarjeta.
- Investigacion y evaluacion de cuantizacion: sirve como caso de estudio de como afecta int8 a la fidelidad de transcripcion, dado que el autor verifico salidas identicas frente a la referencia.
- Despliegue en entornos con limitaciones de disco: los 945 MB de pesos frente a los 1492 MB del fp16 reducen el tamano de imagen de contenedor y el tiempo de descarga en pipelines de CI.
- Transcripcion de audio de hasta decenas de segundos en GPUs de gama alta: en una RTX 3090, 10,4 segundos de audio se procesan en 3,2-4,6 segundos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni WER sobre LibriSpeech/Common Voice, ni comparaciones numericas con otros modelos ASR). Los unicos datos de rendimiento son medidas de despliegue del autor:

| Metrica | fp16 (base) | int8 (este repo) |
|---|---|---|
| Pesos en disco | 1492 MB | 945 MB |
| VRAM asignada | ~1,6 GB | 0,97 GB (pico 1,07 GB) |
| Tiempo de carga (RTX 3090) | no disponible | 87 s (primera ejecucion, incluye descarga) |
| Inferencia, audio de 10,4 s | no disponible | 3,2-4,6 s |

## Requisitos de hardware

- VRAM estimada: 0,97 GB asignados y 1,07 GB en pico para la version int8, medido en una RTX 3090.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor la valida en RTX 3090 y RTX 4060 Laptop (8 GB).
- Cabe en GPU de consumo: si, en tarjetas con al menos 2 GB de VRAM libre; el caso documentado es una RTX 4060 Laptop de 8 GB.
- CPU: no soportada para esta compilacion int8, porque los kernels de 8 bits de bitsandbytes requieren CUDA. Para CPU hay que usar el modelo base en fp16.
- Dependencias: `bitsandbytes`, `accelerate`, `transformers` y una GPU CUDA.
- Opciones de despliegue: carga directa con transformers y `BitsAndBytesConfig`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: 3,2-4,6 segundos para 10,4 segundos de audio en RTX 3090; no hay datos de throughput agregado ni de otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/Qwen3-ASR-0.6B-int8 | 782.918.144 | no disponible | 11 | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-ASR-0.6B-hf (base fp16) | no disponible | no disponible | 11 | apache-2.0 (segun el repo derivado) | Hugging Face, checkpoint oficial |
| Whisper small (referencia de categoria) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones de otros modelos ASR. La unica comparacion solida es frente al checkpoint base: misma arquitectura y mismos idiomas, con menor huella de memoria a cambio de requerir CUDA y de ser una adaptacion no oficial.

## Limitaciones y advertencias

- Solo transcripcion: no traduce, a diferencia de variantes multilingues de traduccion speech-to-text.
- Sin soporte de CPU en esta compilacion int8; los kernels de bitsandbytes requieren CUDA.
- Es una adaptacion de terceros (warlockzero), no un checkpoint oficial de Qwen; con 0 descargas y 0 likes no hay evidencia de uso en produccion por parte de la comunidad.
- No se han publicado benchmarks de calidad (WER) ni evaluaciones por idioma; la verificacion se limita a una muestra de audio en ingles de 10,44 segundos.
- Riesgo de alucinacion y de errores de transcripcion inherente a los modelos ASR, no cuantificado en la informacion disponible.
- Sesgos por idioma y dominio no documentados; el rendimiento en espanol, arabe, hindi o bengali no esta medido.
- Longitud de contexto de audio no especificada, lo que impide planificar la transcripcion de audios largos sin segmentacion previa.
- Licencia apache-2.0 en el repo derivado, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base oficial antes de desplegar.
- La cuantizacion int8 puede degradar la precision en casos limite; el autor solo confirma paridad en una muestra concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/warlockzero/Qwen3-ASR-0.6B-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
