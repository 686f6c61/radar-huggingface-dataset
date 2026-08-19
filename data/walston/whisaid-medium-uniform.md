# walston/whisaid-medium-uniform

## Resumen

WhisAID Medium Uniform es un clasificador y codificador de acentos del mandarín desarrollado por Xintong Wang (walston) como parte del framework Joycent, un sistema de síntesis de voz con acento. El modelo se basa en Whisper Medium y ha sido entrenado con una pérdida adversarial de distribución uniforme de hablantes (uniform MSE, alpha 10) durante 10 épocas, publicándose el checkpoint correspondiente a la época 9. Su propósito principal es identificar el acento de un hablante en audio en chino mandarín y generar una representación vectorial (embedding) del acento que puede utilizarse en tareas posteriores como la síntesis de voz con acento controlado.

El modelo se distribuye como un checkpoint de Lightning en el repositorio de HuggingFace, y el código de integración se proporciona a través del proyecto WhisAID en GitHub, no mediante código remoto del Hub. Está diseñado para trabajar con la librería transformers y requiere la instalación del paquete fuente WhisAID. Su relevancia actual radica en que aborda un problema específico y poco cubierto: la clasificación y codificación de acentos en mandarín, un componente clave para sistemas de TTS y ASR que necesitan adaptarse a variaciones dialectales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Medium (encoder-decoder Transformer) |
| Parametros totales | no disponible (basado en Whisper Medium, ~769M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino mandarin) |
| Licencia | no disponible |
| Formato de pesos | Lightning checkpoint (PyTorch) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Whisper Medium, un transformer encoder-decoder originalmente diseñado para reconocimiento de voz. WhisAID adapta esta arquitectura para la tarea de clasificación de acentos, añadiendo una cabeza de clasificación sobre las representaciones del encoder y generando embeddings de acento a partir de las características internas. La configuración específica incluye 80 bins de Mel, 9 clases de acento y un entrenamiento con 336 hablantes.

El entrenamiento emplea una pérdida adversarial de distribución uniforme de hablantes (uniform MSE) con un factor alpha de 10, diseñada para que el modelo aprenda representaciones de acento independientes de la identidad del hablante. Se entrenó durante 10 épocas, y el checkpoint liberado corresponde a la época 9. No se han publicado detalles sobre el dataset completo, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificacion de acentos del mandarin en 9 clases distintas.
- Generacion de embeddings de acento (vectores de caracteristicas) a partir de audio.
- Procesamiento de audio en formato WAV mediante la pipeline de Whisper (load_audio, log_mel_spectrogram).
- Integracion con el framework Joycent para sintesis de voz con acento controlado.
- Soporte exclusivo para chino mandarin (zh).
- No incluye capacidades de generacion de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Sintesis de voz con acento controlado: el embedding de acento generado por WhisAID puede alimentar un sistema TTS como Joycent para producir habla con un acento regional especifico, util en doblaje, audiolibros o asistentes de voz personalizados.
- Clasificacion de acentos en corpus de audio: permite etiquetar automaticamente grandes conjuntos de grabaciones en mandarin segun su acento, facilitando la creacion de datasets balanceados para entrenar otros modelos de voz.
- Analisis sociolinguistico: investigadores pueden usar el modelo para estudiar la distribucion de acentos en diferentes regiones o grupos demograficos a partir de muestras de audio.
- Preprocesamiento en sistemas ASR: identificar el acento de un hablante antes de la transcripcion permite seleccionar un modelo ASR especializado o ajustar los parametros de decodificacion para mejorar la precision.
- Verificacion de hablante asistida por acento: el embedding de acento puede combinarse con otros biométricos de voz para mejorar sistemas de autenticacion en entornos multilingues o multi-dialectales.
- Desarrollo de agentes conversacionales regionalizados: un asistente de voz que adapte su pronunciacion o vocabulario segun el acento detectado del usuario, mejorando la experiencia en aplicaciones de atencion al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al basarse en Whisper Medium (~769M parametros), se estima un consumo de aproximadamente 2-3 GB en FP16, aunque no se ha confirmado oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16. Para entrenamiento o fine-tuning se recomienda una GPU con 8 GB o mas.
- Compatibilidad con GPU de consumo: si, es viable en GPUs consumer de gama media.
- Opciones de despliegue: el modelo se carga mediante transformers con configuracion personalizada de WhisAID. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisAID Medium Uniform | Whisper Medium | ~769M | no disponible | no disponible | HuggingFace |
| Whisper Medium (base) | Whisper Medium | ~769M | 30 s de audio | MIT | HuggingFace |
| ECAPA-TDNN (speaker verification) | TDNN | ~20M | no aplica | Apache 2.0 | HuggingFace |

WhisAID se diferencia de Whisper Medium en que esta especificamente entrenado para clasificacion de acentos, mientras que Whisper es un modelo ASR general. ECAPA-TDNN se centra en verificacion de hablante, no en acentos, y no esta disenado para mandarin especificamente.

## Limitaciones y advertencias

- Entrenado exclusivamente con 336 hablantes, lo que puede limitar la generalizacion a acentos o voces no representados en el conjunto de entrenamiento.
- Solo soporta chino mandarin; no es aplicable a otros idiomas o dialectos.
- La licencia no esta especificada, por lo que se desconoce si es apto para uso comercial.
- Requiere la instalacion del paquete WhisAID desde GitHub, lo que anade dependencias externas y posible fragilidad en entornos de produccion.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas de clasificacion de acentos no esta verificado.
- El checkpoint almacenado es de Lightning, lo que puede complicar la integracion con pipelines estandar de transformers sin el codigo auxiliar del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/walston/whisaid-medium-uniform
- Perfil del autor: https://huggingface.co/walston/models
- Repositorio GitHub de WhisAID: https://github.com/oshindow/Joycent-code/tree/main/whisAID
- Resumen de WhisAID en EmergentMind: https://api.emergentmind.com/topics/whisaid
