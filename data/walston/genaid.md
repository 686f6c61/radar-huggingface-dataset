# walston/GenAID

## Resumen

GenAID es un codificador de acentos chinos desarrollado por el usuario walston, basado en el modelo `facebook/wav2vec2-large-xlsr-53`. Genera un embedding de acento de 64 dimensiones diseñado para reducir la información del hablante, permitiendo clasificar nueve acentos regionales del chino: norte, sichuan, cantón, sur, henan, shanghái, wuhan, tianjin y singapur. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para tareas de clasificación de audio y extracción de características. Con 315,5 millones de parámetros, de los cuales 311,3 millones se actualizan durante el entrenamiento, resulta relativamente ligero en comparación con otros modelos de audio grandes. Su relevancia radica en ofrecer una representación compacta y robusta del acento para aplicaciones de procesamiento de voz en chino, como sistemas de reconocimiento multilingüe o análisis sociolingüístico. La arquitectura incluye un clasificador adversarial de hablante que se utiliza solo durante el entrenamiento para forzar el desenredo de la identidad del hablante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 XLSR-53 Large con cabezas de clasificación de acento y desenredo de hablante |
| Parametros totales | 315.530.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio de duración variable, típicamente hasta 10 segundos) |
| Tipos de cuantizacion | No especificados (cuantización estándar posible con herramientas como ONNX o bitsandbytes) |
| Idiomas soportados | Chino (zh) - nueve acentos regionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GenAID utiliza como base el extractor de características y el encoder de wav2vec2-large-xlsr-53. El extractor de características (7 capas convolucionales) está congelado (4,2 millones de parámetros), mientras que la proyección y los 24 bloques transformer del encoder se actualizan durante el entrenamiento (311,2 millones). Tras el encoder, se aplica un pooling temporal consciente de la máscara de atención, seguido de un cuello de botella de información de dos capas lineales con GELU que reduce la representación a 64 dimensiones. Este embedding es la salida principal para tareas de acento. Un clasificador lineal de 64 a 9 produce las probabilidades de acento. Durante el entrenamiento se incluye un clasificador adversarial de hablante (64 a 336) que se optimiza para predecir una distribución uniforme de hablantes, forzando al cuello de botella a descartar información de identidad del hablante. Este clasificador no se usa en inferencia. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el procedimiento exacto (si se usó fine-tuning supervisado o algún método de alineación).

## Capacidades

- Clasificación de acentos chinos en nueve categorías: norte, sichuan, cantón, sur, henan, shanghái, wuhan, tianjin y singapur.
- Extracción de embeddings de acento de 64 dimensiones, diseñados para ser invariantes a la identidad del hablante (desenredo de hablante).
- Procesamiento de audio de 16 kHz, compatible con señales de voz de duración variable (típicamente hasta 10 segundos).
- Integración con la librería transformers de HuggingFace mediante AutoFeatureExtractor y AutoModel, con código personalizado (`trust_remote_code=True`).
- Salida dual: embedding de acento y logits de clasificación, lo que permite tanto tareas de clasificación como de representación.
- Soporte para inferencia en GPU con `torch.inference_mode()`.

## Casos de uso

- Sistemas de reconocimiento de voz multilingües: el embedding de acento puede usarse como característica adicional para adaptar modelos ASR a diferentes acentos del chino, mejorando la precisión en hablantes de regiones específicas.
- Análisis sociolingüístico: investigadores pueden utilizar el modelo para estudiar la distribución de acentos en corpus de audio, por ejemplo, en estudios de variación dialectal o migración.
- Atención al cliente automatizada: en centros de llamadas que atienden a clientes de distintas regiones de China, el modelo puede clasificar el acento del hablante para enrutar la llamada a un agente o sistema especializado en ese acento.
- Verificación de hablante con desenredo de acento: el embedding de 64 dimensiones, al ser invariante al hablante, puede combinarse con otros embeddings de verificación de hablante para separar la información de acento de la identidad, mejorando la robustez en sistemas biométricos.
- Mejora de asistentes de voz: asistentes integrados en dispositivos domésticos pueden usar la clasificación de acento para ajustar el modelo de lenguaje o el reconocimiento a la variante regional del usuario.
- Anotación automática de corpus de voz: el modelo puede etiquetar automáticamente grandes conjuntos de datos de audio con su acento, facilitando la creación de datasets etiquetados para entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall o comparaciones con otros modelos en tareas estándar de clasificación de acentos.

## Requisitos de hardware

- Tamaño del modelo: 315,5 millones de parámetros, aproximadamente 1,26 GB en fp32, 0,63 GB en fp16 y 0,32 GB en int8.
- VRAM estimada para inferencia: con un batch de 1 y audio de 10 segundos, se estima un uso de VRAM de 1 a 2 GB en fp16, por lo que es compatible con GPUs de consumo como NVIDIA RTX 3060, RTX 4060 o superiores.
- Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM, aunque el entrenamiento completo requeriría más memoria.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir mediante una API personalizada con FastAPI y torch, o exportar a ONNX o TensorRT para optimización. No se recomienda vLLM porque está orientado a texto, no a audio.
- Latencia: no se dispone de datos medidos, pero para un audio de 10 segundos, la inferencia en una GPU moderna debería ser inferior a 100 ms.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de clasificación de acentos chinos en la documentación proporcionada. Existen otros modelos como Whisper (que clasifica idiomas pero no acentos específicos) o modelos específicos de acento, pero no hay datos públicos de comparación con GenAID. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta acentos chinos (nueve variantes) y no está entrenado para otros idiomas o acentos.
- La clasificación de acentos puede tener errores en hablantes con acentos mixtos o no nativos.
- El desenredo de hablante se logra mediante un clasificador adversarial entrenado con una distribución uniforme de hablantes; en la práctica, el embedding puede retener algo de información del hablante, aunque se espera que sea mínima.
- El modelo requiere código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del autor; se recomienda revisar el código antes de usarlo en entornos de producción.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar posibles sesgos geográficos o demográficos.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en casos de uso específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walston/GenAID
- Modelo base: facebook/wav2vec2-large-xlsr-53 (https://huggingface.co/facebook/wav2vec2-large-xlsr-53)

No se han encontrado papers, repositorios adicionales o demos asociados a este modelo.
