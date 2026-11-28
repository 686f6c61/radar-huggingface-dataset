# TypeWhisper/gigaam-v4-onnx

## Resumen

GigaAM-v4 RNN-T ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) GigaAM-v4 desarrollado por Sber (a través del repositorio salute-developers/GigaAM), publicada por el usuario TypeWhisper para su integración en el plugin GigaAM de su ecosistema. El modelo original es un sistema ASR de tipo RNN-T (transductor recurrente) que produce transcripciones con puntuación y mayúsculas, y que cubre ruso e inglés. Esta exportación concreta aplica cuantización dinámica int8 únicamente a las operaciones MatMul y Gemm del codificador, lo que reduce el peso del repositorio hasta unos 0,3 GB y permite ejecutar la inferencia solo con ONNX Runtime, sin dependencias de frameworks de deep learning pesados.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: es una conversión práctica de un checkpoint de Sber (v4_rnnt, commit e9bbf2e) pensada para ejecutarse en entornos ligeros. El modelo cubre ruso e inglés, emplea una arquitectura RNN-T con decodificación greedy integrada en el grafo de avance y se distribuye bajo licencia MIT, lo que facilita su uso comercial. El contexto de audio recomendado es de hasta unos 20 segundos por fragmento, con relleno de ceros para clips inferiores a 1 segundo.

Al estar orientado a ASR, su "ventana de contexto" no es de tokens de texto sino de audio: la longitud máxima práctica por inferencia ronda los 20 segundos, y el modelo no acepta entrada de idioma (no hay condicionamiento por language ID). Es una opción interesante para quien necesite transcripción bilingüe ruso-inglés en producción con un coste de hardware muy contenido y sin ataduras a PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (transductor recurrente) con codificador, decodificador y junta; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta ~20 s por fragmento (rellenar con ceros clips < 1 s) |
| Tipos de cuantizacion | int8 dinamica solo en MatMul y Gemm del codificador |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder int8, grafo de avance, vocabulario SentencePiece) |

## Arquitectura y entrenamiento

El modelo subyacente es GigaAM-v4 de Sber en su variante RNN-T, un transductor recurrente que combina un codificador acústico, un predictor/decodificador y una red de junta para alinear secuencias de audio con tokens de texto. La exportación separa el grafo en dos artefactos: un codificador (`v4_rnnt_encoder.int8.onnx`) con cuantización dinámica int8 aplicada exclusivamente a las operaciones MatMul y Gemm, y un grafo de avance (`v4_rnnt_advance.onnx`) que incorpora el bucle greedy del RNN-T y expone una salida adicional `token_frames` con forma `[steps, heads, batch]`. El vocabulario (`v4_rnnt_e2e_vocab.txt`) contiene las piezas SentencePiece con sus identificadores más el token `<blk>`.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sí se sabe que la exportación se generó con el script `export-gigaam-onnx.py` (de Don Yin, licencia MIT) a partir del checkpoint `v4_rnnt` de Sber en el commit `e9bbf2e773eedd217c6f0d3b89b9728c41332b7d`. La extracción de características requiere 64 log-mel a partir de audio mono de 16 kHz usando el extractor de características de GigaAM v3 (por ejemplo, `gigaam_v3.onnx` de onnx-asr). El modelo no tiene entrada de idioma, por lo que la selección de ruso o inglés no se controla mediante condicionamiento explícito.

## Capacidades

- Reconocimiento automático del habla (ASR) para ruso e inglés.
- Transcripción con puntuación y mayúsculas (el head 0 devuelve la transcripción punctuada y con casing).
- Decodificación greedy RNN-T integrada en el grafo de avance, sin necesidad de lógica externa de búsqueda.
- Salida con marcas temporales por token (`token_frames`), útil para alineación y subtitulado.
- Ejecución autónoma con ONNX Runtime, sin PyTorch ni dependencias de frameworks de entrenamiento.
- Inferencia sobre fragmentos de audio de hasta ~20 s; clips cortos (< 1 s) se rellenan con ceros.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- No dispone de modo thinking, visión ni audio generativo; la entrada es audio y la salida es texto.

## Casos de uso

- Transcripción bilingüe ruso-inglés en producción: el modelo cubre ambos idiomas y produce texto con puntuación y mayúsculas, adecuado para generar actas o transcripciones legibles sin postprocesado adicional.
- Subtitulado automático con marcas temporales: la salida `token_frames` permite alinear tokens con instantes de audio y construir subtítulos sincronizados.
- Integración en aplicaciones de escritorio o móviles ligeras: al ejecutarse solo con ONNX Runtime y ocupar ~0,3 GB, encaja en entornos donde no se quiere desplegar PyTorch.
- Procesamiento por lotes de audios cortos: fragmentos de hasta ~20 s permiten dividir reuniones o llamadas en segmentos y transcribirlos en paralelo con alto throughput (84× tiempo real en CPU M5 Pro).
- Atención al cliente y análisis de llamadas: transcripción de conversaciones en ruso o inglés para indexación, búsqueda y análisis posterior de contenido.
- Pipeline de accesibilidad: generación de transcripciones en tiempo casi real para vídeos o streams en ruso/inglés, con la ventaja del rendimiento en CPU sin GPU dedicada.
- Preprocesado para otros sistemas: conversión de audio a texto estructurado que alimente motores de búsqueda, resúmenes o sistemas de análisis de sentimiento.

## Benchmarks y rendimiento

Resultados publicados en el PR de TypeWhisper (typewhisper-benchmark#36), medidos con el corpus de benchmark de TypeWhisper y ejecutando la exportación tal como la usa el plugin:

| Metrica | Valor |
|---|---|
| WER ruso (suite core) | 3,59 % |
| WER ingles (suite core) | 5,72 % |
| Velocidad | 84× tiempo real en CPU M5 Pro |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa ~0,3 GB; la inferencia con ONNX Runtime es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; al ser ONNX Runtime, puede ejecutarse en CPU o en GPU compatibles con los execution providers de ONNX Runtime (CUDA, CoreML, DirectML, etc.).
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del artefacto int8.
- Opciones de despliegue: ONNX Runtime (principal), onnx-asr para el extractor de características, integración en el plugin GigaAM de TypeWhisper.
- Latencia y throughput: 84× tiempo real en CPU Apple M5 Pro según el benchmark del autor; no se dispone de cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GigaAM-v4 RNN-T ONNX (este) | no disponible | audio ~20 s | ru, en | MIT | ONNX int8 |
| Whisper (variantes) | no disponible en la informacion | audio 30 s | multilingue | MIT | safetensors, GGUF, ONNX |
| GigaAM-v4 original (Sber) | no disponible en la informacion | audio ~20 s | ru, en | MIT | checkpoint PyTorch |

No se dispone de datos de WER comparativos con Whisper u otros modelos ASR en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no es multilingüe general.
- No acepta entrada de idioma: la selección de idioma no se controla explícitamente, lo que puede afectar a audios con mezcla de idiomas.
- Longitud de audio limitada a ~20 s por fragmento; audios más largos requieren segmentación externa.
- Los clips inferiores a 1 s deben rellenarse con ceros, lo que puede degradar la calidad en audios muy cortos.
- Riesgo de errores en nombres propios, jerga, acentos marcados o audio con ruido; el WER de 3,59 % (ru) y 5,72 % (en) es sobre el corpus del autor y puede no generalizar.
- La cuantización int8 solo afecta a MatMul y Gemm del codificador; no se han publicado evaluaciones del impacto de la cuantización frente al modelo original en otros corpus.
- Al ser un artefacto de exportación de terceros (TypeWhisper), la responsabilidad de mantenimiento y actualización recae en el publicador, no en Sber.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base de Sber y del script de exportación de Don Yin.
- No apto para tareas de razonamiento, generación de código, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/TypeWhisper/gigaam-v4-onnx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio GigaAM de Sber: https://github.com/salute-developers/GigaAM
- onnx-asr (extractor de características): https://github.com/istupakov/onnx-asr
- Benchmark de TypeWhisper (PR #36): https://github.com/TypeWhisper/typewhisper-benchmark/pull/36
