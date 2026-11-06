# TujiaNLP/tujia-xlsr53-ft

## Resumen

`tujia-xlsr53-ft` es un encoder de voz derivado de `facebook/wav2vec2-xlsr-53-espeak-cv-ft` y ajustado por TujiaNLP para el tujia (dialecto septentrional, código ISO `tji`), una lengua sino-tibetana hablada principalmente en la provincia de Hunan (China). No es un modelo ASR completo: es exclusivamente el extractor de características que consume el reconocedor de sílabas `tujia-ctc v0.2`, y por sí solo no produce transcripción alguna. Su relevancia radica en que el tujia es una lengua de bajos recursos con muy pocos recursos digitales, y este encoder permite construir un pipeline ASR funcional sobre una base multilingüe ya preentrenada.

El modelo conserva la arquitectura wav2vec2 de XLSR-53 (315.438.720 parámetros en fp32, unos 1,26 GB repartidos en 5 shards de safetensors) y mantiene la misma interfaz de salida que el modelo base: características de 1024 dimensiones a 50 Hz. El ajuste fino se realizó sobre aproximadamente 2,6 horas de habla leída en tujia, congelando 8 de las 12 capas del transformer y entrenando las 4 superiores junto con una cabeza CTC de 709 clases de sílabas con tono.

Es importante destacar que los pesos ajustados no son intercambiables con los del XLSR-53 original: la cabeza `tujia-ctc v0.2` fue entrenada contra estas características concretas, y sustituirlas por las del modelo base degrada sustancialmente el reconocimiento. La licencia es de solo uso en investigación, lo que restringe su aplicación comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder, 12 capas) |
| Parámetros totales | 315.438.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de voz; ventana de entrada no especificada en la información) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | tujia (`tji`, dialecto septentrional) |
| Licencia | research-use-only (pesos derivados); upstream Apache-2.0 |
| Formato de pesos | safetensors (5 shards, fp32, ~1,26 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder wav2vec2 de 12 capas transformer, heredado de `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, que a su vez deriva del preentrenamiento multilingüe XLSR-53 sobre 53 idiomas. La salida son representaciones por frame de 1024 dimensiones a una tasa de 50 Hz, con la misma interfaz que el modelo base, lo que facilita su integración en pipelines existentes de `transformers`.

El ajuste fino se llevó a cabo sobre aproximadamente 2,6 horas de habla leída en tujia, con una estrategia de congelación parcial: `freeze_layers = 8`, de modo que solo las 4 capas superiores del transformer fueron entrenables. El entrenamiento se realizó de forma conjunta con una cabeza CTC de 709 clases que modela sílabas con tono, aunque dicha cabeza no forma parte de este repositorio (aquí solo se distribuye el encoder). No se especifican en la información disponible detalles sobre el dataset (número de hablantes, composición, calidad de grabación) ni sobre el uso de técnicas de aumento de datos o regularización.

## Capacidades

- Extracción de características acústicas por frame (1024 dimensiones a 50 Hz) a partir de audio de voz.
- Especialización en tujia, dialecto septentrional, como extractor para el reconocedor `tujia-ctc v0.2`.
- Interfaz compatible con `Wav2Vec2Model` y `Wav2Vec2FeatureExtractor` de la librería `transformers`.
- No realiza transcripción por sí solo: carece de cabeza de decodificación en este repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales más allá del audio de entrada.
- Compatible con `endpoints_compatible` según los tags del repositorio.

## Casos de uso

- Construcción de un pipeline ASR para tujia: el encoder se integra como extractor de características en el reconocedor `tujia-ctc v0.2`, permitiendo transcribir audio de esta lengua de bajos recursos mediante el script `fetch_encoder.sh` que descarga y ubica los pesos en `models/tujia-xlsr53-ft`.
- Investigación en lenguas de bajos recursos: sirve como punto de partida para experimentos de ajuste fino con pocas horas de audio, dado que solo se entrenaron las 4 capas superiores sobre 2,6 horas de habla.
- Extracción de embeddings para análisis fonético: los vectores de 1024 dimensiones a 50 Hz pueden emplearse en tareas de alineamiento, segmentación o clustering de unidades acústicas en tujia.
- Evaluación de técnicas de congelación parcial: el modelo documenta explícitamente la estrategia `freeze_layers = 8`, lo que lo hace útil como referencia reproducible en estudios sobre transferencia desde modelos multilingües.
- Docencia y prototipado en NLP de lenguas minoritarias: permite montar una demo funcional de reconocimiento de sílabas en tujia con recursos mínimos.
- Integración en herramientas de preservación lingüística: al ser un componente del proyecto TujiaNLP, puede incorporarse en aplicaciones de documentación y archivo de habla tujia, siempre bajo uso de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 para los pesos; el consumo real depende del tamaño de lote y de la longitud del audio de entrada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp32; una RTX 3060 o superior es suficiente. Para procesamiento por lotes a gran escala se recomiendan A100 o H100.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660, RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (librería nativa), y potencialmente `vLLM` no aplica (no es un modelo generativo); `llama.cpp` y `Ollama` no son adecuados para wav2vec2. El despliegue estándar es mediante `transformers` con `Wav2Vec2Model.from_pretrained`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TujiaNLP/tujia-xlsr53-ft` | 315.438.720 | no disponible | tujia (tji) | research-use-only | Hugging Face |
| `facebook/wav2vec2-xlsr-53-espeak-cv-ft` | ~315 M (misma arquitectura) | no disponible | 53 idiomas (multilingüe) | Apache-2.0 | Hugging Face |
| `facebook/wav2vec2-large-xlsr-53` | ~315 M | no disponible | 53 idiomas | Apache-2.0 | Hugging Face |

La comparación con el modelo base XLSR-53 es la más directa: comparten arquitectura y número de parámetros, pero el ajuste fino especializa las 4 capas superiores en tujia a costa de posible degradación en otros idiomas. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR completo: no genera transcripciones por sí solo; requiere la cabeza `tujia-ctc v0.2`.
- Los pesos no son intercambiables con el XLSR-53 original; usar el modelo base con la cabeza `tujia-ctc v0.2` degrada sustancialmente el reconocimiento.
- Licencia `research-use-only`: no se permite uso comercial de los pesos ajustados. Los pesos upstream son Apache-2.0 y requieren atribución.
- No se conceden derechos sobre las grabaciones ni transcripciones de entrenamiento, que no se distribuyen.
- Entrenado sobre solo ~2,6 horas de habla leída, lo que limita la robustez ante acentos, ruido ambiental, habla espontánea o variantes dialectales distintas de la septentrional.
- Cobertura limitada a un único idioma (`tji`); no es multilingüe en la práctica pese a su origen en XLSR-53.
- Riesgo de sobreajuste al dominio de habla leída y a los hablantes del corpus de entrenamiento.
- No se documentan sesgos específicos ni evaluación de alucinación (no aplica al no ser generativo), pero la baja cobertura de datos implica posible degradación en condiciones no vistas.
- No se especifican requisitos de contexto de audio ni límites de duración de entrada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-xlsr53-ft
- Proyecto padre: https://github.com/ibaibing/TujiaNLP
- Página del modelo ASR: https://github.com/ibaibing/tujia-asr
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
