# tory-labs/voin-qwen3-asr-1.7b-gguf

## Resumen

`tory-labs/voin-qwen3-asr-1.7b-gguf` es un repositorio espejo (mirror) que redistribuye un único archivo GGUF del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B, desarrollado originalmente por Alibaba Qwen. El contenido no ha sido modificado: se trata del fichero `Qwen3-ASR-1.7B-Q5_K_M.gguf` (1.517.290.464 bytes, SHA-256 `034c557f...0879d0`), convertido a GGUF por el usuario `handy-computer` y empaquetado aquí porque es el archivo que descarga la aplicación de escritorio voin (repositorio `su-record/voin`).

El interés del repositorio es, por tanto, de distribución más que técnico: ofrece una variante cuantizada Q5_K_M de un modelo ASR de algo más de 2.000 millones de parámetros en un fichero de unos 1,4 GiB, lo que lo hace utilizable en CPU y en GPU de consumo para transcripción local sin depender de servicios en la nube. La licencia Apache 2.0 del modelo original se mantiene.

La información publicada es muy escasa: la model card solo documenta el origen del fichero, su hash y la licencia. No hay datos sobre idiomas soportados, longitud de audio procesable, arquitectura interna ni resultados de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-ASR de Alibaba Qwen; no se detalla en la información proporcionada) |
| Parámetros totales | 2.038.078.608 (~2,04 B) según safetensors del modelo base; la nomenclatura comercial indica 1,7 B |
| Parámetros activos | No aplica / no disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q5_K_M (única variante incluida en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo original) |
| Formato de pesos | GGUF; el modelo base se distribuye en safetensors |
| Tamaño del fichero | 1.517.290.464 bytes (~1,41 GiB) |
| Tamaño del repositorio | 1,5 GB |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Conversión GGUF | handy-computer/Qwen3-ASR-1.7B-gguf (commit `3555bd238a85`) |
| Tipo de tarea | Reconocimiento automático del habla (ASR); etiqueta `conversational` |
| Fecha de creación del repo | 2026-10-17 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que Qwen3-ASR-1.7B es un modelo de reconocimiento del habla de la familia Qwen3 publicado por Alibaba Qwen y que este repositorio contiene una conversión a GGUF del mismo, sin modificaciones, realizada por un tercero. No se detallan en la documentación el tipo de codificador de audio, el decodificador de texto, la estrategia de atención ni el mecanismo de alineación audio-texto.

Tampoco hay datos sobre el entrenamiento: ni volumen de horas de audio, ni composición del corpus, ni si hubo etapas de ajuste supervisado o preferencias (RLHF/DPO). El recuento de parámetros del checkpoint base (2.038.078.608) supera la cifra nominal de 1,7 B del nombre comercial, lo que sugiere que el total incluye módulos adicionales al decodificador —previsiblemente el codificador de audio—, pero esta descomposición no se documenta. La única innovación verificable es la disponibilidad de una cuantización Q5_K_M que reduce el peso a ~5,5 bits por parámetro efectivo.

## Capacidades

- Transcripción de voz a texto: es la función principal del modelo, según su denominación ASR y la etiqueta `conversational`.
- Conversación por voz: la etiqueta `conversational` del repositorio sugiere uso en interacción hablada, aunque no se detalla el formato exacto de prompt ni el manejo de turnos.
- Ejecución local: el formato GGUF Q5_K_M permite inferencia offline en hardware modesto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, timestamps, diarización, puntuación automática): no disponibles.

## Casos de uso

- Transcripción de reuniones en local: el fichero de 1,4 GiB puede cargarse en un portátil sin GPU dedicada y procesar el audio de una reunión sin enviar datos a servicios externos, algo relevante por cumplimiento de RGPD.
- Subtitulado de vídeo: integrado en un pipeline de postproducción, el modelo genera el texto base que después se alinea y sincroniza con herramientas como ffmpeg o Subtitles Edit.
- Notas de voz dictadas: la aplicación voin lo utiliza como motor de dictado; el modelo se descarga desde este repositorio y se ejecuta en la máquina del usuario.
- Analítica de llamadas en atención al cliente: transcripción por lotes de grabaciones para extraer motivos de consulta y métricas de calidad, con la ventaja de que el coste marginal por hora de audio es cero una vez desplegado.
- Documentación clínica o legal dictada: transcripción asistida en entornos con requisitos de residencia de datos, siempre con revisión humana posterior.
- Accesibilidad: generación de transcripciones para vídeos formativos, pódcast o material docente, con despliegue en un servidor interno pequeño.
- Transcripción en el borde (edge): al caber en GPUs de 4 GB o en CPU, puede embeberse en dispositivos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado | Comparación |
|---|---|---|
| WER (conjuntos estándar) | No disponible | No disponible |
| MMLU / GSM8K / HumanEval | No aplica (modelo ASR) | No disponible |
| Throughput / latencia | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada: ~1,5-2,5 GB para el fichero Q5_K_M (1,41 GiB de pesos) más caché de atención y búferes de audio; la cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para procesamiento por lotes a gran escala, A100 o H100 aportan más paralelismo, aunque el modelo es demasiado pequeño para aprovecharlas individualmente.
- Cabe en GPU de consumo: sí, en prácticamente todas las dedicadas de los últimos años; también es viable en CPU con AVX2.
- Opciones de despliegue: llama.cpp y entornos derivados (Ollama, LM Studio) son los candidatos naturales para GGUF; la compatibilidad concreta con estos motores para un modelo ASR no está confirmada en la documentación. vLLM y TGI no soportan de forma estándar checkpoints GGUF de ASR. La vía de referencia es la propia aplicación voin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| voin-qwen3-asr-1.7b-gguf (este repo) | ~2,04 B | No disponible | Apache 2.0 | GGUF Q5_K_M | HuggingFace (mirror) |
| Qwen/Qwen3-ASR-1.7B (original) | ~2,04 B | No disponible | Apache 2.0 | Safetensors | HuggingFace |
| Whisper large-v3 (OpenAI) | ~1,55 B | Ventanas de 30 s | MIT | Safetensors, GGUF, etc. | HuggingFace, whisper.cpp |
| Whisper medium (OpenAI) | ~769 M | Ventanas de 30 s | MIT | Safetensors, GGUF, etc. | HuggingFace, whisper.cpp |

No se dispone de comparaciones de WER entre estos modelos en la información proporcionada, por lo que la tabla se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada en el repositorio sobre calidad de transcripción, comportamiento con acentos, ruido o audio largo.
- Idiomas no documentados: no se puede asumir cobertura del castellano ni de otras lenguas sin verificarlo empíricamente.
- Repositorio espejo sin mantenimiento declarado: el autor no es el desarrollador del modelo y no ofrece soporte; las actualizaciones dependen del repositorio original.
- Cuantización con pérdida: Q5_K_M introduce un error de cuantización respecto al modelo en safetensors; si se requiere máxima calidad, debe usarse el checkpoint original.
- Riesgo de alucinación específico de ASR: en silencios, ruido o solapamiento de voces los modelos de este tipo pueden generar texto no pronunciado; requiere detección de actividad de voz y revisión en dominios críticos.
- Sin datos sobre marcas de tiempo, diarización ni puntuación: si el caso de uso las necesita, habrá que añadir herramientas externas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar avisos de copyright y la cláusula de patentes; este repositorio incluye un fichero LICENSE con los términos del modelo original.
- Metadatos atípicos: la fecha de creación (2026-10-17) y la ausencia de descargas y valoraciones impiden validar el uso real en producción.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a la marca Tory Burch y al término político «tory»), por lo que no se han podido contrastar datos externos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tory-labs/voin-qwen3-asr-1.7b-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conversión GGUF de referencia: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/tree/3555bd238a8572bbace3ebf60d23b036dc0a5dbe
- Aplicación voin: https://github.com/su-record/voin
- Licencia del modelo: https://huggingface.co/tory-labs/voin-qwen3-asr-1.7b-gguf/blob/main/LICENSE
