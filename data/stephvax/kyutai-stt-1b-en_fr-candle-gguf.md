# stephvax/kyutai-stt-1b-en_fr-candle-gguf

## Resumen

`stephvax/kyutai-stt-1b-en_fr-candle-gguf` es una cuantización GGUF de los pesos del modelo de lenguaje (LM) del sistema de transcripción de voz `kyutai/stt-1b-en_fr-candle`, desarrollado por Kyutai. El autor de esta variante es stephvax, que ha aplicado la regla de cuantización de candle para generar dos archivos GGUF (Q8_0 y Q4_K) que reemplazan únicamente el `model.safetensors` del repositorio original, manteniendo intactos el codec Mimi, el tokenizador y la configuración. El objetivo es reducir el tamaño del LM y acelerar la inferencia, especialmente en CPU, donde la versión f32 no alcanza tiempo real.

El modelo base es un sistema de reconocimiento de voz automático (ASR) streaming, bilingüe en inglés y francés, con una arquitectura decoder-only basada en Moshi y un codec neural Mimi. Tiene aproximadamente 989 millones de parámetros y está diseñado para transcribir audio en tiempo real con una latencia de 0,5 segundos, soportando batching para procesar cientos de conversaciones concurrentes en una sola GPU. Esta cuantización es relevante porque permite ejecutar el modelo en entornos con recursos limitados, como portátiles con Apple Silicon o GPUs de gama media, manteniendo una calidad de transcripción casi idéntica a la versión original en el caso de Q8_0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (basado en Moshi) con codec Mimi |
| Parametros totales | 989.253.632 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K (GGUF) |
| Idiomas soportados | Francés, inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (LM) + safetensors (codec Mimi) |

## Arquitectura y entrenamiento

El modelo original `kyutai/stt-1b-en_fr` es un sistema ASR streaming de Kyutai, basado en una arquitectura decoder-only que procesa audio comprimido por el codec neural Mimi. El LM genera texto directamente desde los tokens de audio, sin necesidad de un decodificador externo. El entrenamiento se realizó en dos etapas: una de preentrenamiento con 2,5 millones de horas de audio público, cuyas transcripciones sintéticas se obtuvieron con whisper-timestamped, y un ajuste posterior no especificado en detalle. El modelo soporta batching, lo que permite atender múltiples flujos de audio simultáneamente.

La cuantización aquí presentada sigue la regla estándar de candle: todos los tensores de rango 2 cuya última dimensión es múltiplo del tamaño de bloque se cuantizan, mientras que el resto se mantiene en F32. En total, 102 tensores se cuantizaron y 33 se conservaron en precisión completa. Los nombres de los tensores se preservan verbatim, lo que permite que el crate `moshi::lm::LmModel` de candle los cargue directamente. No se realizó ningún entrenamiento adicional, fine-tuning ni cambio de arquitectura; solo se alteró la representación numérica de los pesos.

## Capacidades

- Transcripción de voz en tiempo real (streaming) con latencia de 0,5 segundos.
- Reconocimiento bilingüe inglés-francés, sin necesidad de seleccionar idioma explícitamente.
- Soporte de batching para procesar cientos de conversaciones concurrentes en una sola GPU.
- Generación de texto a partir de audio comprimido por el codec Mimi.
- Compatible con el runtime de candle en Rust, tanto en Metal (GPU de Apple) como en CPU.
- Cuantización Q8_0 que mantiene la calidad de la versión f32 (WER prácticamente idéntico) con la mitad de peso y el doble de velocidad.

## Casos de uso

- Transcripción en vivo de reuniones y conferencias: el modelo puede transcribir audio en tiempo real con baja latencia, ideal para generar subtítulos o actas mientras se habla. Su capacidad de batching permite atender múltiples reuniones simultáneamente en un servidor con GPU.
- Subtitulado automático de vídeos: al ser streaming, puede procesar vídeo en directo o pregrabado, generando subtítulos en inglés o francés con una precisión comparable a la de modelos offline más grandes.
- Asistentes de voz interactivos: la baja latencia (0,5 s) permite conversaciones naturales, donde el usuario habla y el sistema transcribe mientras escucha, habilitando comandos de voz o respuestas generadas por un LLM.
- Atención al cliente automatizada: integrado en un sistema de call center, puede transcribir llamadas en tiempo real para análisis de sentimiento, búsqueda de información o generación de resúmenes, con soporte para múltiples llamadas concurrentes gracias al batching.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos, ejecutable en portátiles con Apple Silicon o GPUs modestas gracias a la cuantización Q8_0.
- Investigación y desarrollo de ASR: al ser un modelo abierto y cuantizado, sirve como punto de partida para experimentos de fine-tuning o para comparar métricas de WER en diferentes entornos de hardware.

## Benchmarks y rendimiento

Los datos de rendimiento se obtuvieron decodificando 200 utterances del conjunto de test de FLEURS `fr_fr` a través del pipeline de referencia en Rust/candle, en Apple M-series. Se comparan las tres variantes: f32 original, Q8_0 y Q4_K.

| Variante | Tamaño LM | WER | WER mediana | RTFx (Metal) | RTFx (CPU) |
|---|---:|---:|---:|---:|---:|
| f32 (upstream) | 1978 MB | 17,18 % | 10,8 % | 3,0x | 0,6x |
| Q8_0 | 1051 MB | 17,12 % | 10,5 % | 5,7x | 1,8x |
| Q4_K | 557 MB | 18,04 % | 11,9 % | 5,8x | 2,1x |

El WER global está influido por una cola de fallos duros: seis clips devuelven salida vacía (los mismos en las tres variantes), lo que se atribuye al modelo original, no a la cuantización. Excluyendo esos seis, el WER de Q8_0 baja a 15,46 %. La variante Q8_0 es la recomendada por el autor, ya que iguala al f32 dentro del ruido estadístico (−0,06 puntos) con un 47 % menos de peso y aproximadamente el doble de velocidad. Q4_K se publica solo por reproducibilidad, pues añade +0,92 puntos de WER sin ganancia de velocidad significativa.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 pesa 1051 MB y el Q4_K 557 MB, pero hay que sumar el codec Mimi (safetensors, tamaño no especificado) y los buffers de inferencia. En la práctica, una GPU con 4 GB de VRAM debería ser suficiente para Q8_0, y 2 GB para Q4_K, aunque no se han medido en GPUs NVIDIA.
- GPU recomendadas: el autor probó en Apple M-series (Metal y CPU). En GPUs NVIDIA, se puede ejecutar con candle usando CUDA, aunque no hay datos publicados. Una RTX 3060 o superior sería adecuada para Q8_0.
- En consumer GPU: sí, cabe en GPUs de gama media con 4-6 GB de VRAM.
- Opciones de despliegue: el formato GGUF está pensado para el runtime de candle en Rust (crate `moshi`). No es compatible con moshi.cpp ni con ggml runtimes, ya que usa un layout GGUF con nombres de tensores de candle. Se puede integrar en aplicaciones Rust mediante el crate `candle_transformers`.
- Latencia y throughput: en Apple M-series, Q8_0 alcanza un factor de tiempo real de 5,7x en Metal y 1,8x en CPU, lo que significa que procesa audio 5,7 veces más rápido que en tiempo real en GPU. En CPU, el f32 no llega a tiempo real (0,6x), mientras que Q8_0 sí lo supera.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos ASR de tamaño similar (por ejemplo, Whisper small o Whisper base) en la información proporcionada. El autor solo compara las variantes cuantizadas con el modelo original f32, cuyos resultados se muestran en la sección de benchmarks. Por tanto, no se puede establecer una comparativa objetiva con alternativas externas.

## Limitaciones y advertencias

- El modelo es bilingüe en/fr sin pin de idioma, por lo que en algunos clips puede transcribir en inglés o incluso en español, aunque no esté entrenado para ello. Esto puede ser un problema en aplicaciones monolingües.
- Seis clips del conjunto de test de FLEURS producen salida vacía, un fallo del modelo original que se mantiene en todas las cuantizaciones.
- La variante Q4_K degrada el WER en +0,92 puntos respecto a f32, por lo que no se recomienda su uso en producción.
- No es compatible con moshi.cpp ni con runtimes ggml; solo funciona con candle en Rust. Esto limita su integración en ecosistemas basados en Python o C++.
- Requiere los archivos adicionales del repositorio upstream (`config.json`, `tokenizer_en_fr_audio_8000.model`, `mimi-pytorch-e351c8d8@125.safetensors`), que no están incluidos en este repositorio.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución. El autor aclara que no se conceden derechos adicionales a los que otorga la licencia upstream.
- No se han publicado resultados de benchmarks en otros conjuntos de datos distintos de FLEURS fr_fr, ni en GPUs NVIDIA o AMD.

## Enlaces

- Repositorio de HuggingFace de esta cuantización: https://huggingface.co/stephvax/kyutai-stt-1b-en_fr-candle-gguf
- Modelo base en formato candle: https://huggingface.co/kyutai/stt-1b-en_fr-candle
- Modelo original de Kyutai: https://huggingface.co/kyutai/stt-1b-en_fr
- Página oficial de Kyutai STT: https://kyutai.org/next/stt/
- Repositorio de GitHub con el script de cuantización (mencionado en la model card): https://github.com/svax974/aicompanion/blob/main/the_ai_team/native/kyutai_stt_ffi/examples/quantize.rs
