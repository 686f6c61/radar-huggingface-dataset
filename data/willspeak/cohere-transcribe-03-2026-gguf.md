# willspeak/cohere-transcribe-03-2026-gguf

## Resumen

`willspeak/cohere-transcribe-03-2026-gguf` no es un modelo original, sino un espejo selectivo de ficheros GGUF del modelo `CohereLabs/cohere-transcribe-03-2026`, publicado por el usuario willspeak. El repositorio reproduce sin modificaciones tres cuantizaciones procedentes del repositorio `voconly-org/cohere-transcribe-03-2026-gguf`, correspondientes a la revisión `cc51c0639ef3855075837b1a260ec5e8164d934e` del modelo base. El propio autor declara explicitamente que no reclama autoria del entrenamiento ni de la cuantizacion, ni respaldo de los autores originales.

El modelo subyacente pesa 2.049.026.832 parametros (unos 2,05 mil millones), lo que lo situa en la gama de modelos de transcripcion de tamano medio, y se distribuye bajo licencia Apache 2.0. Por el nombre del modelo base, se trata de un sistema orientado a transcripcion de audio (ASR); sin embargo, la informacion proporcionada no incluye la model card original ni detalles de arquitectura, datos de entrenamiento o idiomas soportados.

Su relevancia practica es acotada pero concreta: permite ejecutar un modelo de transcripcion de ~2B parametros en formatos GGUF (Q5_K_M, Q8_0 y F16), lo que habilita despliegues en CPU, GPU de consumo y entornos locales donde no se quiere enviar audio a servicios en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 8,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.049.026.832 (aproximadamente 2,05 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, Q8_0, F16 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Detalle de los ficheros espejados:

| Fichero | Bytes | Tamano aproximado | SHA-256 |
|---|---:|---:|---|
| cohere-transcribe-03-2026-Q5_K_M.gguf | 1.770.270.208 | 1,65 GiB | `14d02f1ad6dd77b3a60f82639879012c3adb4fe25c50a5a47a2c4c661daf1558` |
| cohere-transcribe-03-2026-Q8_0.gguf | 2.410.655.232 | 2,25 GiB | `931916663432fd895423a4291a8400221802b288967ca2d435fc5e3141c9e71e` |
| cohere-transcribe-03-2026-F16.gguf | 4.106.644.992 | 3,82 GiB | `65ea095ba78ed938a613cc950da0599b29e16bb5a22a968d7b1fd99d71f13784` |

## Arquitectura y entrenamiento

No disponible. La informacion proporcionada no describe la arquitectura del modelo base `CohereLabs/cohere-transcribe-03-2026` (transformer encoder-decoder, encoder-only, CTC, atencion lineal u otra variante), ni el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o decodificacion especulativa.

Lo unico verificable es que el modelo base tiene 2.049.026.832 parametros y que el mirror no modifica los pesos: se trata de una conversion a GGUF del modelo original, con tres niveles de cuantizacion. El repositorio indica que la documentacion original y la del repositorio GGUF de origen se conservan como ficheros separados, sin verificar de forma independiente por parte del autor del espejo.

## Capacidades

- Transcripcion de audio a texto: es la funcion presumible del modelo base, segun su nombre y su categoria, aunque la informacion disponible no detalla el formato de entrada (audio crudo, mel-spectrograma, PCM 16 kHz) ni el de salida (texto plano, marcas de tiempo, segmentos).
- Generacion de texto: no confirmada por la documentacion disponible; no hay evidencia de que el modelo sea un modelo de lenguaje general.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas soportados en el repositorio.
- Capacidades especiales (modo thinking, vision, audio bidireccional): no disponible.
- Ejecucion local mediante GGUF: capacidad confirmada a nivel de formato, ya que se ofrecen cuantizaciones Q5_K_M, Q8_0 y F16 con sumas SHA-256 publicadas para verificar integridad.

## Casos de uso

- Transcripcion local de reuniones: con aproximadamente 2,25 GiB en Q8_0, el modelo puede ejecutarse en un portatil con GPU de gama media y transcribir audio sin enviarlo a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Subtitulado de video en pipelines automatizados: al ser un GGUF, puede integrarse en herramientas de linea de comandos o scripts de procesamiento por lotes para generar subtitulos a partir de pistas de audio.
- Analitica de llamadas de atencion al cliente: transcripcion de grabaciones para su posterior indexacion y busqueda, con la ventaja de que el procesamiento puede realizarse on-premise.
- Documentacion clinica dictada: la variante F16 o Q8_0 permite transcribir dictados medicos en una estacion de trabajo con GPU, manteniendo los datos dentro de la infraestructura del centro.
- Accesibilidad: generacion de transcripciones en directo o diferido para contenido audiovisual, usando la cuantizacion Q5_K_M en hardware modesto.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo historico de audio para construir un indice de texto consultable, aprovechando el reducido peso del modelo en Q5_K_M (~1,65 GiB).
- Prototipado e investigacion en ASR: por su licencia Apache 2.0 y su disponibilidad en GGUF, sirve como base para experimentos de comparacion de cuantizaciones o para medir el impacto de la cuantizacion en la calidad de transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER (word error rate), MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica util sobre el modelo base (los resultados obtenidos no guardan relacion con el modelo y no se han utilizado).

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8-2,5 GB en Q5_K_M, 2,5-3,5 GB en Q8_0 y 4,5-6 GB en F16, incluyendo margen para buffers y contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q5_K_M y Q8_0 (por ejemplo RTX 3060, RTX 4060, RTX 2070); F16 en GPUs con 8 GB o mas. En entornos de servidor, A100, H100 o L40S son sobredimensionadas para 2B parametros, pero permiten un alto grado de paralelismo por instancia.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de 8-12 GB e incluso en GPUs de 6 GB en las cuantizaciones mas pequenas.
- CPU y Apple Silicon: el formato GGUF permite ejecucion en CPU y en chips Apple con memoria unificada, aunque no se dispone de cifras de latencia publicadas.
- Opciones de despliegue: runtimes compatibles con GGUF (por ejemplo llama.cpp y sus derivados). No se ha confirmado soporte especifico en vLLM, TGI, Ollama u otros servidores de inferencia.
- Latencia y throughput: no disponibles. No se han publicado medidas de RTF (real-time factor), throughput ni latencia por segundo de audio.

## Comparativa con modelos similares

Solo se dispone de datos estructurales; no hay cifras de rendimiento publicadas para este modelo, por lo que la comparacion de calidad queda como no disponible.

| Modelo | Parametros | Contexto | Rendimiento (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cohere-transcribe-03-2026 (mirror GGUF de willspeak) | ~2,05 mil millones | no disponible | no disponible | Apache 2.0 | GGUF (Q5_K_M, Q8_0, F16) |
| OpenAI Whisper large-v3 | ~1,55 mil millones | ventana de 30 s de audio por segmento | no disponible en esta ficha | MIT | pesos originales y multiples conversiones GGUF |
| NVIDIA Canary-1B | ~1 mil millones | no disponible en esta ficha | no disponible en esta ficha | CC-BY-NC-4.0 | NeMo y otros formatos |

La comparacion con Whisper y Canary se incluye unicamente como referencia de categoria (transcripcion de audio en el rango de 1-2B parametros); no se dispone de datos que permitan afirmar cual de ellos transcribe mejor.

## Limitaciones y advertencias

- Es un espejo, no una publicacion original: el autor no reclama autoria del entrenamiento ni de la cuantizacion, y no hay respaldo de los autores del modelo base.
- Ausencia total de documentacion tecnica en el repositorio: no se indican arquitectura, idiomas, contexto, ni caracteristicas de entrada y salida del audio.
- Sin datos de calidad: no hay WER ni ninguna otra metrica publicada, por lo que no es posible estimar la precision de transcripcion antes de probarlo.
- Riesgo de alucinacion: en modelos ASR, este riesgo se manifiesta como texto inventado en segmentos con silencio, ruido o audio ininteligible; no hay informacion especifica sobre el comportamiento del modelo en estos casos.
- Idiomas no documentados: se desconoce si soporta unicamente ingles o un conjunto multilingue, lo que limita su uso en produccion para castellano sin una evaluacion previa.
- Licencia Apache 2.0: en principio permite uso comercial para los pesos del modelo base, pero deben revisarse los ficheros `LICENSE.txt` y `NOTICE.txt` incluidos en el repositorio, ya que el autor remite a ellos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento.
- Verificacion de integridad recomendable: el repositorio publica sumas SHA-256 para los tres ficheros, por lo que se recomienda comprobarlas antes de desplegar.
- Los resultados de la busqueda web realizada no contenian informacion tecnica relacionada con el modelo y no se han utilizado como fuente.

## Enlaces

- Repositorio del mirror GGUF: https://huggingface.co/willspeak/cohere-transcribe-03-2026-gguf
- Modelo original: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Origen de los GGUF: https://huggingface.co/voconly-org/cohere-transcribe-03-2026-gguf
- Revision del modelo base referenciada: `cc51c0639ef3855075837b1a260ec5e8164d934e`
- Papers, blogs, repositorios o demos adicionales: no disponibles
