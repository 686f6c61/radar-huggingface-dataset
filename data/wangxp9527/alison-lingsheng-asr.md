# wangxp9527/alison-lingsheng-asr

## Resumen

alison-lingsheng-asr (Alison Workspace 中文精准识别模型包 v1) no es un modelo único, sino un paquete de pesos ONNX preparados para la función de reconocimiento preciso de chino de la aplicación macOS Alison Workspace. Lo publica el usuario wangxp9527 y su espejo principal vive en ModelScope (xixiaxc/alison-lingsheng-asr); ocupa 0,8 GB y se distribuye bajo Apache 2.0.

Todos los modelos subyacentes son de Alibaba Tongyi Lab (equipos FunASR, FunAudioLLM y 3D-Speaker) y se publicaron originalmente en ModelScope: Paraformer-large en versión streaming y contextual, SenseVoice-Small, FSMN-VAD, CT-Transformer para puntuación y CAM++ para embeddings de hablante. Este repositorio solo hace conversión de formato (exportación a ONNX), cuantización int8 y un retoque en el grafo del decodificador de Paraformer; no hay reentrenamiento.

La relevancia práctica está en que permite transcripción de mandarín y de dialectos chinos (incluido el cantonés) en CPU mediante ONNX Runtime 1.19.2, sin GPU, con dos modos: uno de precisión con hotwords y otro orientado a dialectos. Sirve como referencia para quien necesite un pipeline ASR chino completo (VAD + ASR + puntuación + diarización) ya empaquetado en ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de modelos ASR no autorregresivos sobre ONNX: Paraformer-large (streaming y offline contextual), SenseVoice-Small, más FSMN-VAD, CT-Transformer (puntuación) y CAM++ (embedding de hablante) |
| Parametros totales | no disponible (el repositorio no publica recuentos de parámetros; solo distribuye pesos ya cuantizados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es audio segmentado por FSMN-VAD y no se documenta límite de duración |
| Tipos de cuantizacion | int8 en los encoders/decoders de Paraformer; int8 dinámica per-channel en las MatMul de SenseVoice-Small; precisión mixta en la tabla de embeddings de CT-Transformer (caracteres chinos y símbolos sin cuantizar, filas de palabras en inglés a int8, 283 MB → 88 MB) |
| Idiomas soportados | chino mandarín (zh) y cantonés/dialectos (yue); no se declara ningún otro idioma |
| Licencia | Apache 2.0; SenseVoice-Small se distribuye además bajo FunASR Model License 1.1, que exige atribución al autor y conservación del nombre original del modelo |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, model.onnx), tokens.json, am.mvn, hotword_eb.bin y vad_fsmn.bin (binario propio que lee el motor C++) |
| Tamano del repositorio | 0,8 GB (836.578.780 bytes sumando todos los ficheros) |
| Tamano por modo | mandarín ≈ 595 MB (594.997.689 bytes); dialecto ≈ 589 MB (588.840.496 bytes) |
| Version del modelo | v1 |

## Arquitectura y entrenamiento

El paquete combina modelos ASR no autorregresivos (NAT). Paraformer-large, del equipo FunASR, genera la secuencia de tokens en una sola pasada, lo que reduce la latencia frente a decodificadores autorregresivos. En el modo mandarín se usa en dos variantes: una streaming (`v1/common/online/encoder.onnx`, 166.350.528 bytes, más `decoder.onnx` de 58.293.022 bytes) para borradores en tiempo real y una contextual offline (`v1/mandarin/encoder.onnx` 161.965.688 bytes, `decoder.onnx` 60.051.317 bytes y `hotword_eb.bin` 25.616.400 bytes) que admite hotwords. En el modo dialecto la fase final la cubre SenseVoice-Small (`v1/dialect/model.onnx`, 241.217.824 bytes), también no autorregresivo.

El resto de la cadena aporta segmentación, puntuación y diarización: FSMN-VAD (`vad_fsmn.bin`, 1.715.656 bytes) corta el audio, CT-Transformer (`punc/model.onnx`, 88.286.455 bytes, vocabulario de 272.727 entradas) inserta puntuación y CAM++ (`speaker/campplus.onnx`, 28.293.345 bytes) extrae embeddings de hablante. No se documentan horas de entrenamiento ni composición del dataset, y no hay RLHF ni DPO porque no es un modelo generativo.

Las innovaciones de este repositorio son de ingeniería, no de entrenamiento: exportación a ONNX, cuantización int8, conversión de los pesos de VAD a un binario que el motor C++ lee directamente, reducción de la tabla de embeddings de puntuación mediante cuantización selectiva y una corrección en los grafos del decodificador de Paraformer por la que la anchura de la máscara de atención se toma de la dimensión de longitud del tensor de entrada (los pesos no cambian). Esa corrección permite inferencia por lotes con relleno. El autor mantiene los nombres originales de los modelos y publica sumas SHA-256 para cada fichero.

## Capacidades

- Reconocimiento de voz en chino mandarín en dos fases: borrador en streaming y frase final de mayor precisión.
- Reconocimiento con refuerzo de dialectos y cantonés mediante SenseVoice-Small.
- Soporte de hotwords en el modo mandarín (`hotword_eb.bin`), útil para nombres propios y terminología de dominio.
- Segmentación automática de audio con FSMN-VAD.
- Puntuación automática del texto reconocido con CT-Transformer.
- Extracción de embeddings de hablante con CAM++ (base para diarización).
- Inferencia por lotes con relleno tras la corrección del grafo del decodificador.
- Ejecución íntegra en CPU con ONNX Runtime 1.19.2, sin GPU.
- No incluye tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni traducción: es exclusivamente un pipeline ASR.

## Casos de uso

- Dictado en tiempo real en macOS: la app Alison Workspace usa el borrador streaming para mostrar texto mientras se habla y sustituye cada frase por la versión final de Paraformer-large contextual.
- Transcripción de reuniones con hablantes múltiples: la combinación de FSMN-VAD, CAM++ y CT-Transformer permite segmentar, atribuir turnos y entregar un acta puntuada sin intervención manual.
- Subtitulado de vídeo en chino: el procesado por lotes (habilitado por la corrección de la máscara de atención) permite transcribir horas de audio con relleno y varias pistas en paralelo.
- Reconocimiento con vocabulario específico: el modo mandarín admite hotwords, de modo que en entornos médicos, jurídicos o técnicos se pueden sesgar las transcripciones hacia términos concretos sin reentrenar.
- Transcripción de audio en cantonés o dialectos: el modo dialecto sustituye la fase final por SenseVoice-Small, más robusto en variedades no estándar.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con pesos int8, un modo completo ocupa unos 590 MB y no requiere acelerador, lo que abarata el escalado horizontal.
- Indexado y búsqueda de archivos de audio: la transcripción puntuada puede alimentar un índice de texto para localizar fragmentos por palabra clave.
- Accesibilidad: generación de subtítulos en directo para personas con discapacidad auditiva en entornos de habla china.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye cifras de WER/CER, ni comparaciones con otros sistemas, ni resultados de evaluación. Los únicos datos verificables que se publican son tamaños de fichero y sumas SHA-256.

| Componente | Fichero | Bytes | SHA-256 (prefijo) |
|---|---|---:|---|
| Paraformer-large streaming | v1/common/online/encoder.onnx | 166.350.528 | dd4121cf… |
| Paraformer-large streaming | v1/common/online/decoder.onnx | 58.293.022 | 617de445… |
| Paraformer-large contextual | v1/mandarin/encoder.onnx | 161.965.688 | 9e58531c… |
| Paraformer-large contextual | v1/mandarin/decoder.onnx | 60.051.317 | 32eee318… |
| Hotwords | v1/mandarin/hotword_eb.bin | 25.616.400 | b2e34bd7… |
| SenseVoice-Small | v1/dialect/model.onnx | 241.217.824 | c84c1b8b… |
| Puntuación (CT-Transformer) | v1/common/punc/model.onnx | 88.286.455 | ae68ca42… |
| Hablante (CAM++) | v1/common/speaker/campplus.onnx | 28.293.345 | 26806668… |
| VAD (FSMN) | v1/common/vad/vad_fsmn.bin | 1.715.656 | bdd7bd67… |

## Requisitos de hardware

- Inferencia en CPU: el motor de referencia es ONNX Runtime 1.19.2 sobre CPU, sin requisitos de GPU.
- VRAM: no aplica. No se requiere memoria de vídeo.
- RAM estimada: unos 590 MB solo para los pesos de un modo completo; sumando runtime, buffers de audio y cuantización de activaciones, se recomienda reservar al menos 2 GB de memoria libre. En inferencia por lotes el consumo crece con el tamaño del lote y la duración del audio.
- GPU recomendadas: no aplica; el paquete no está validado con aceleración por GPU en la información disponible. Los execution providers de ONNX Runtime (CoreML, DirectML, CUDA/TensorRT) podrían usarse en teoría, pero no se documentan ni se han validado aquí.
- Compatibilidad consumer: total. Cabe en cualquier ordenador de sobremesa o portátil actual, incluidos equipos con CPU x86-64 y Apple Silicon, al ser un paquete de menos de 1 GB y ejecución en CPU.
- Almacenamiento: 0,8 GB para el repositorio completo; ≈ 595 MB si solo se necesita el modo mandarín y ≈ 589 MB si solo se necesita el modo dialecto.
- Opciones de despliegue: ONNX Runtime (referencia), FunASR y ModelScope como origen de los modelos base; la app verifica la suma SHA-256 de cada fichero y descarta los que no coinciden.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF, latencia por frase ni velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Decodificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paraformer-large (modo mandarín de este paquete) | no disponible | zh | no autorregresiva, con hotwords en la variante contextual | Apache 2.0 | ModelScope; ONNX en este repositorio |
| SenseVoice-Small (modo dialecto de este paquete) | no disponible | zh, yue | no autorregresiva | Apache 2.0 y FunASR Model License 1.1 | ModelScope; ONNX en este repositorio |
| Whisper large-v3 (referencia externa, no incluida en el repositorio) | 1.550 M | 99 | autorregresiva seq2seq | MIT | OpenAI y Hugging Face |

No existen benchmarks comparativos publicados en la información disponible; la comparación se limita a características declaradas y a la licencia. La ventaja diferencial del paquete frente a alternativas genéricas es su naturaleza no autorregresiva y su empaquetado ONNX int8 para CPU, no un rendimiento medido.

## Limitaciones y advertencias

- No es un modelo autónomo: los ficheros están organizados para el motor interno de la app Alison Workspace y, según el propio autor, no están preparados para usarse por separado. Reutilizarlos exige respetar la estructura de directorios `v1/` y los nombres de fichero.
- Cobertura lingüística limitada a zh y yue; no se declara inglés ni ninguna otra lengua, y en modo dialecto no se admite el uso de hotwords.
- No se publican cifras de WER/CER, por lo que el riesgo de sustituciones, omisiones e inserciones no puede cuantificarse. Cabe esperar degradación con ruido de fondo, voces solapadas, acentos marcados y vocabulario muy específico.
- La cuantización int8 reduce tamaño y coste de cómputo, pero puede introducir pérdida de precisión respecto a los pesos originales en coma flotante; la magnitud de esa pérdida no se documenta.
- La tabla de embeddings de la puntuación usa precisión mixta (caracteres chinos y símbolos sin cuantizar, palabras en inglés a int8), lo que puede afectar a textos con contenido abundante en inglés o caracteres latinos.
- Licencia: Apache 2.0 con la salvedad de SenseVoice-Small, distribuido además bajo FunASR Model License 1.1, que obliga a citar autoría y conservar el nombre original del modelo. Conviene revisar ese texto antes de un uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa, issues ni discusiones.
- Las marcas temporales del repositorio (creación y actualización el 24 de septiembre de 2026) son posteriores a la fecha habitual de publicación; conviene tratarlas con cautela.
- Este repositorio es un espejo de respaldo: la aplicación descarga primero desde ModelScope, de modo que la versión aquí publicada puede quedar desincronizada.
- No se documentan marcas de tiempo por palabra, alineación forzada, traducción, resumen ni ninguna capacidad generativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wangxp9527/alison-lingsheng-asr
- Espejo principal en ModelScope: https://www.modelscope.cn/models/xixiaxc/alison-lingsheng-asr
- FunASR Model License 1.1: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Paraformer-large streaming (ONNX, modelo base): https://www.modelscope.cn/models/iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-online-onnx
- Paraformer-large Contextual (modelo base): https://www.modelscope.cn/models/iic/speech_paraformer-large-contextual_asr_nat-zh-cn-16k-common-vocab8404
- SenseVoice-Small (modelo base): https://www.modelscope.cn/models/iic/SenseVoiceSmall
- SenseVoiceSmall ONNX (modelo base): https://www.modelscope.cn/models/iic/SenseVoiceSmall-onnx
- FSMN-VAD (modelo base): https://www.modelscope.cn/models/iic/speech_fsmn_vad_zh-cn-16k-common-onnx
- CT-Transformer de puntuación en chino (modelo base): https://www.modelscope.cn/models/iic/punc_ct-transformer_zh-cn-common-vocab272727-onnx
- CAM++ de verificación de hablante (modelo base): https://www.modelscope.cn/models/iic/speech_campplus_sv_zh-cn_16k-common
