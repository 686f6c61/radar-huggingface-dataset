# tryambientai/granite-speech-4.1-2b-nar-gguf

## Resumen

Granite-Speech-4.1-2B-NAR es un modelo de reconocimiento automatico del habla (ASR) no autorregresivo desarrollado por IBM, empaquetado en formato GGUF por el usuario tryambientai para su uso con la libreria transcribe.cpp. A diferencia de los modelos ASR autorregresivos tradicionales, este modelo formula la transcripcion como una tarea de edicion condicional de una hipotesis CTC: en lugar de generar tokens uno a uno, edita una hipotesis inicial en una sola pasada forward utilizando un LLM bidireccional (el mask causal se desactiva). El resultado es una precision competitiva con una latencia de inferencia notablemente menor.

La arquitectura combina un encoder de audio Conformer, compartido con la familia autorregresiva Granite-Speech, con un proyector MLP-con-atencion y el LLM Granite-4.0-1b actuando como editor bidireccional. El modelo totaliza 2.254.656.316 parametros y esta disenado para transcripcion offline multilingue en cinco idiomas: ingles, frances, aleman, espanol y portugues. No soporta traduccion, deteccion de idioma ni marcas de tiempo, y no funciona en modo streaming.

Esta ficha documenta la conversion GGUF publicada por tryambientai, que reproduce el modelo base de IBM (ibm-granite/granite-speech-4.1-2b-nar) en seis niveles de cuantizacion, con pesos que van desde 1,45 GB (Q4_K_M) hasta 4,21 GB (F16). La licencia Apache-2.0 y la posibilidad de ejecutar en CPU y GPU consumer lo hacen especialmente atractivo para despliegues locales de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de audio) + proyector MLP-con-atencion + Granite-4.0-1b como editor bidireccional (NLE, no autorregresivo) |
| Parametros totales | 2.254.656.316 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en), frances (fr), aleman (de), espanol (es), portugues (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NLE (Non-autoregressive LLM-based Editing) descrita en el paper arXiv:2603.08397. El pipeline consta de tres componentes: un encoder de audio Conformer que procesa la senal de entrada, un proyector MLP-con-atencion que alinea las representaciones acusticas con el espacio del LLM, y el modelo de lenguaje Granite-4.0-1b configurado como editor bidireccional. La innovacion clave es la desactivacion del mask causal en el LLM, lo que permite que cada posicion atienda a toda la secuencia. Una unica pasada forward produce logits sobre la transcripcion completa, y la decodificacion CTC genera el texto final sin bucle token a token.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card upstream indica que el modelo esta disenado para transcripcion offline y que el modo streaming no esta soportado. La conversion GGUF fue validada contra la referencia de Transformers en el commit c53af2c de transcribe.cpp, partiendo del commit 99a4df9 del modelo base (fijado el 2026-05-24).

## Capacidades

- Transcripcion de voz a texto (ASR) offline en una sola pasada forward, sin bucle autorregresivo.
- Soporte multilingue para ingles, frances, aleman, espanol y portugues.
- Entrada de audio en formato WAV mono a 16 kHz.
- Edicion bidireccional de hipotesis CTC mediante LLM, lo que permite correccion contextual de la transcripcion.
- Inferencia en CPU y GPU (Metal en Apple Silicon, Vulkan en AMD, CPU nativa).
- No soporta traduccion automatica (translate: false).
- No soporta deteccion de idioma (lang_detect: false).
- No soporta marcas de tiempo (timestamps: none).
- No soporta streaming (streaming: false).
- No soporta tool calling ni function calling (no es un modelo de proposito general).
- No dispone de vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo procesa archivos WAV de 16 kHz mono y genera transcripciones en cinco idiomas, adecuado para actas internas o resumenes posteriores en entornos donde no se puede enviar audio a la nube.
- Subtitulado offline de contenido audiovisual: con un WER de 1,29% en LibriSpeech test-clean, es viable para generar subtitulos en ingles y otros cuatro idiomas en pipelines de postproduccion, aunque sin marcas de tiempo habria que alinearlas externamente.
- Procesamiento por lotes en servidores sin GPU: la cuantizacion Q4_K_M (1,45 GB) permite ejecutar la transcripcion en CPU con un factor de tiempo real (RTF) de 1,5 en un Ryzen 4750U, lo que posibilita procesar archivos en segundo plano en hardware modesto.
- Transcripcion en dispositivos Apple Silicon: con Metal, el modelo alcanza un RTF de 56 en un M4 Max, lo que permite transcribir audio en tiempo real o mas rapido en portatiles de Apple, ideal para aplicaciones de dictado local.
- Analisis de llamadas de atencion al cliente: la transcripcion multilingue (especialmente espanol y portugues) permite convertir grabaciones en texto para analisis de sentimiento o extraccion de entidades en centros de contacto de Iberia y Latinoamerica.
- Investigacion en ASR: la arquitectura NAR con edicion LLM es un caso de estudio para investigadores que quieran comparar latencia y precision frente a modelos autorregresivos, con la ventaja de que los pesos GGUF permiten experimentacion en hardware asequible.
- Integracion en aplicaciones de escritorio: gracias a transcribe.cpp y a los binarios CLI, se puede embeber la transcripcion en herramientas de escritorio sin dependencias de Python ni servicios externos.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| WER LibriSpeech test-clean (%) | 1,29 | 1,29 | 1,29 | 1,29 | 1,25 | 1,35 |

| Plataforma | Backend | RTF (M4 Max) | RTF (M4) | RTF (Ryzen 4750U) |
|---|---|---|---|---|
| Apple Silicon | Metal | 56 | 18 | No aplica |
| CPU | CPU | 5 | 4 | 1,5 |
| AMD | Vulkan | No disponible | No disponible | 3,65 |

El WER se midio sobre la particion completa de LibriSpeech test-clean (2620 utterances) con el normalizador de texto de Whisper (`EnglishTextNormalizer`). La linea base BF16 de referencia en Transformers (MPS) fue de 1,28%, coincidente con el 1,29% de la model card upstream dentro del ruido de muestreo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en Q4_K_M, 1,7 GB en Q5_K_M, 1,9 GB en Q6_K, 2,4 GB en Q8_0 y 4,3 GB en BF16/F16 (los tamanos de archivo GGUF son una aproximacion cercana al uso de memoria).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; para BF16 se recomienda al menos 6 GB. Funciona con Apple Silicon (Metal), GPUs AMD (Vulkan) y GPUs NVIDIA.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer de los ultimos 10 anos puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M. Las cuantizaciones BF16/F16 requieren GPUs con 4-6 GB o mas.
- Opciones de despliegue: transcribe.cpp (unica libreria soportada oficialmente para estos GGUF). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: RTF de 56 en M4 Max con Metal, 18 en M4, 5 en CPU de M4 Max, 4 en CPU de M4, 3,65 en Vulkan sobre Ryzen 4750U y 1,5 en CPU de Ryzen 4750U. Un RTF superior a 1 indica procesamiento mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-Speech-4.1-2B-NAR (este) | 2,25 B | No disponible | 1,29% (BF16) | Apache-2.0 | GGUF en HF |
| Granite-Speech-4.1-2B (AR) | No disponible | No disponible | No disponible (superior segun model card) | Apache-2.0 | HF |
| Granite-Speech-4.1-2B-Plus | No disponible | No disponible | No disponible | Apache-2.0 | HF |
| Whisper large-v3 | 1,55 B | 30 s de audio | ~1,8-2,0% (referencia publica) | MIT | Multiples formatos |

La comparativa se limita a la familia Granite-Speech porque la informacion proporcionada no incluye datos de otros modelos ASR. La model card upstream indica que el modelo autorregresivo granite-speech-4.1-2b ofrece mayor precision a costa de mayor latencia, y que granite-speech-4.1-2b-plus anade informacion de hablante y tiempos por palabra. Whisper large-v3 se incluye como referencia de la categoria, aunque sus cifras exactas no se han verificado en la informacion disponible.

## Limitaciones y advertencias

- Solo realiza transcripcion (ASR): no traduce, no detecta idioma automaticamente y no genera marcas de tiempo.
- No soporta streaming: requiere el archivo de audio completo en formato WAV mono a 16 kHz.
- El modelo base es no autorregresivo, lo que puede producir errores de edicion en pasajes con ruido o acentos no representados en el entrenamiento; el WER en dominios distintos a LibriSpeech no se ha publicado.
- Riesgo de alucinacion: como todo modelo de lenguaje, el editor bidireccional podria generar texto plausible no presente en el audio, especialmente en segmentos con silencio o ruido.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse principalmente con datos en ingles, el rendimiento en frances, aleman, espanol y portugues podria ser inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la model card upstream para terminos adicionales.
- La conversion GGUF es de un tercero (tryambientai) y no ha sido validada por IBM; la validacion numerica se realizo contra Transformers en un commit concreto.
- Solo es compatible con transcribe.cpp; no se garantiza su funcionamiento con otras herramientas de inferencia GGUF.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria extensa.

## Enlaces

- Repositorio Hugging Face de la conversion GGUF: https://huggingface.co/tryambientai/granite-speech-4.1-2b-nar-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Modelo autorregresivo Granite-Speech-4.1-2B: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Modelo Granite-Speech-4.1-2B-Plus: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-nar.md
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/c53af2c
- Commit del modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/commit/99a4df9
- Paper NLE: https://arxiv.org/abs/2603.08397
- Paper adicional citado: https://arxiv.org/abs/2505.08699
- Paper adicional citado: https://arxiv.org/abs/2603.11243
- Paper adicional citado: https://arxiv.org/abs/2604.12398
- Paper adicional citado: https://arxiv.org/abs/2604.22817
- Paper adicional citado: https://arxiv.org/abs/2604.11269
