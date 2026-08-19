# teckedd/gha-dondo-w2v-bert-twi-v2

## Resumen

`teckedd/gha-dondo-w2v-bert-twi-v2` es un modelo de reconocimiento automático de voz (ASR) desarrollado por Edward Kwabena Twumasi (teckedd) en el contexto del proyecto Ghana Health AI / Serendepify. Se trata de un fine-tune del modelo base `KhayaAI/w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en`, que pertenece a la familia DONDO de modelos ASR open source para lenguas africanas construidos sobre el encoder auto-supervisado w2v-BERT 2.0. El modelo está diseñado específicamente para transcribir habla en twi (asante twi) y akan (ak) en el ámbito de conversaciones de salud comunitarias en Ghana.

La arquitectura combina el encoder w2v-BERT 2.0 con un cabezal de clasificación CTC (Connectionist Temporal Classification) y un mecanismo de condicionamiento por idioma, que requiere anteponer el identificador de lengua `2` a las características acústicas antes de la decodificación para asante twi. Con 605,7 millones de parámetros y un tamaño de repo de 2,4 GB, el modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors, con soporte para la librería transformers de HuggingFace.

La relevancia de este checkpoint radica en su enfoque en lenguas de bajos recursos como el twi y el akan, donde los sistemas ASR comerciales suelen ofrecer un rendimiento deficiente. El modelo forma parte del pipeline de ASR/TTS/chat del producto ghanahealth.serendepify.com, y se presenta como un candidato a promoción en producción frente a alternativas como Whisper, con un WER de validación de 0,2743 (greedy CTC) frente al 0,3044 de Whisper v6 con beam=5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 (encoder) + cabezal CTC |
| Parametros totales | 605.766.551 (0,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors original) |
| Idiomas soportados | tw (twi), ak (akan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el encoder w2v-BERT 2.0, una arquitectura auto-supervisada que aprende representaciones de habla a partir de audio sin etiquetar, y se ha afinado con un objetivo de CTC para la transcripción fonética. El proceso de fine-tune sigue el esquema de condicionamiento por idioma del proyecto DONDO, que consiste en anteponer un identificador de lengua a las características acústicas de entrada antes de la decodificación; para asante twi, el identificador es `2`.

El entrenamiento se realizó con una mezcla de tres conjuntos de datos: `google/WaxalNLP` (subconjunto `aka_asr`, n=10107), `fsicoli/common_voice_22_0` (subconjunto `tw`, n=201) y un conjunto local de grabaciones del proyecto Ghana Health AI Recorder (n=32). Se usó una tasa de aprendizaje de `5e-05` y un máximo de 2500 pasos de optimización. La decodificación se realizó con greedy CTC (argmax) sin modelo de lenguaje, lo que explica el WER relativamente alto pero competitivo para un idioma de bajos recursos.

## Capacidades

- Reconocimiento automático de voz (ASR) para twi (asante twi) y akan, con transcripción a nivel de caracteres (CTC).
- Condicionamiento por idioma: el modelo permite especificar el idioma de entrada mediante un prefijo numérico en las características acústicas, lo que facilita el uso en sistemas multilingües.
- Integración directa con la librería transformers de HuggingFace mediante pipeline de ASR.
- Especializado en vocabulario y contextos de salud comunitaria, aunque no se limita a ello.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de transcripción de audio.

## Casos de uso

- Transcripción de consultas de salud en twi/akan: el modelo puede transcribir conversaciones entre pacientes y personal sanitario comunitario en Ghana, donde el twi es la lengua vehicular. Su WER de 0,2743 (greedy) es aceptable para generar notas clínicas preliminares.
- Asistente de voz para el producto Ghana Health AI: integrado en el pipeline ASR/TTS/chat de ghanahealth.serendepify.com, permite a los usuarios dictar síntomas o preguntas en twi y recibir respuestas de orientación de salud.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos con w2v-BERT 2.0 en lenguas ghanesas, comparando estrategias de fine-tuning con CTC frente a otros métodos.
- Archivado y documentación de entrevistas de campo en salud pública: transcripción de grabaciones de encuestas o entrevistas comunitarias en twi para su análisis posterior.
- Accesibilidad en aplicaciones móviles de salud: integración en apps de telemedicina que necesitan entrada de voz en idiomas locales sin depender de APIs de nube comerciales.
- Evaluación de modelos ASR en entornos de producción: el checkpoint se puede utilizar como referencia para medir el rendimiento de modelos más grandes (p. ej., Whisper) en twi, tal como se hace en la promoción gate del proyecto.

## Benchmarks y rendimiento

El autor declara los siguientes resultados de validación sobre el conjunto `google/WaxalNLP` (subconjunto `aka_asr`), con decodificación greedy CTC sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| VAL_WER (greedy) | 0,2743 |
| VAL_CER (greedy) | 0,0902 |

Como referencia de comparación, el proyecto menciona que Whisper v6 (beam=5) obtiene un WER de 0,3044 en la misma tarea de validación, lo que sitúa a este modelo por delante en rendimiento para twi.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 605,7 millones de parámetros y un tamaño de repo de 2,4 GB en safetensors. En fp32 la inferencia requiere aproximadamente 2,4 GB de VRAM; con cuantización fp16 o int8 se puede reducir a ~1,2 GB o ~0,6 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100) es suficiente para inferencia en lote o en tiempo real.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio (6 GB o más) sin problemas.
- Opciones de despliegue: se puede servir con la librería `transformers` (pipeline de ASR), o mediante frameworks como `vLLM` (aunque no es óptimo para modelos de audio) o `TGI` (no recomendado). Para producción ligera, se puede exportar a formato ONNX o TensorRT para aceleración en CPU/GPU.
- Latencia y throughput: no se han publicado datos específicos; la latencia dependerá del hardware y del tamaño de las grabaciones. En una GPU consumer (p. ej., RTX 3060), se espera un throughput de decenas de segundos de audio por segundo de cómputo, típico de modelos w2v-BERT 2.0 de 0,6B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (twi) | Licencia | Formato |
|---|---|---|---|---|---|
| `teckedd/gha-dondo-w2v-bert-twi-v2` (este) | 605,7 M | No disponible | 0,2743 (greedy) | Apache-2.0 | safetensors |
| `teckedd/gha-dondo-w2v-bert-twi-v1` | 0,6 B | No disponible | No publicado | Apache-2.0 | safetensors |
| Whisper v6 (referencia) | No disponible | No disponible | 0,3044 (beam=5) | No disponible | No disponible |

La comparación con Whisper v6 es la única referencia directa disponible, y muestra que este modelo supera al sistema comercial en el idioma twi, lo que refuerza su valor para aplicaciones de bajo recurso. No se dispone de datos de otros modelos DONDO para comparar dentro de la familia.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card indica explícitamente que el modelo no debe usarse para diagnóstico clínico ni decisiones médicas autónomas; solo apoya orientación de salud comunitaria.
- Rendimiento limitado: el WER de 0,2743 (greedy) es relativamente alto para producción en entornos ruidosos; la falta de un modelo de lenguaje en la decodificación probablemente contribuye a errores en palabras poco frecuentes.
- Datos de entrenamiento limitados: el conjunto de datos es muy pequeño (10.340 muestras en total), lo que puede provocar sobreajuste a los dominios específicos (salud) y baja generalización a otros registros del twi.
- Cobertura de idiomas restringida: solo twi y akan; aunque la tarjeta menciona conversaciones en inglés, no hay evidencia de soporte real para inglés en los datos de entrenamiento.
- Sin información sobre cuantizaciones: no se publican versiones GGUF o cuantizadas, lo que puede limitar el despliegue en entornos muy restringidos.
- Sin evaluación humana: los benchmarks son solo métricas automáticas (WER/CER) y no incluyen evaluaciones de calidad perceptiva o A/B con hablantes nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teckedd/gha-dondo-w2v-bert-twi-v2
- Versión anterior v1: https://huggingface.co/teckedd/gha-dondo-w2v-bert-twi-v1
- Paper DONDO (arXiv): https://arxiv.org/html/2607.21540
- Modelo base: https://huggingface.co/KhayaAI/w2v-bert-ada_ewe_fat_fra_gaa_nzi_twi_en
- Producto: https://ghanahealth.serendepify.com
