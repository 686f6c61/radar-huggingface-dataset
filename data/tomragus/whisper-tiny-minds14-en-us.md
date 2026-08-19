# tomragus/whisper-tiny-minds14-en-US

## Resumen

`whisper-tiny-minds14-en-US` es un modelo de reconocimiento automático de voz (ASR) desarrollado por el usuario `tomragus` como un ajuste fino (_fine-tuning_) del modelo base `openai/whisper-tiny` sobre el dataset `PolyAI/minds14`. Este modelo está diseñado para transcribir audio en inglés de Estados Unidos, aunque los metadatos no confirman explícitamente los idiomas soportados. Se trata de un modelo pequeño, con 37.760.640 parámetros, lo que lo hace adecuado para entornos con recursos limitados, como dispositivos periféricos o aplicaciones en tiempo real.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: al partir de Whisper Tiny, ofrece una alternativa ligera para tareas de transcripción en inglés, con un rendimiento medido por una tasa de error de palabra (WER) de 0,3359 sobre el conjunto de evaluación de Minds14. Es un ejemplo de cómo un ajuste fino con un dataset específico puede adaptar un modelo base a un dominio concreto, aunque su cobertura lingüística y robustez son limitadas.

Publicado bajo licencia Apache 2.0, el modelo está disponible en Hugging Face y es compatible con la librería `transformers`, lo que facilita su integración en pipelines de ASR existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (inferido: inglés de EE.UU.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-tiny`, que emplea una arquitectura de transformer encoder-decoder diseñada originalmente para ASR. El proceso de entrenamiento se realizó sobre el dataset `PolyAI/minds14`, un corpus multilingüe de consultas de atención al cliente, aunque el nombre del modelo sugiere que se seleccionaron muestras en inglés de EE.UU. (no confirmado en los metadatos). Se utilizó el `Trainer` de Hugging Face con los siguientes hiperparámetros: tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 8 para evaluación, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, programador de tasa de aprendizaje lineal con 50 pasos de calentamiento, y un total de 500 pasos de entrenamiento. Se empleó entrenamiento de precisión mixta (Native AMP). No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Transcripción de audio a texto en inglés (probablemente variante de EE.UU.), aunque no hay confirmación oficial de los idiomas exactos.
- Reconocimiento de voz automático para audio de corta duración (típico de Whisper Tiny, que procesa ventanas de hasta 30 segundos, aunque este dato no está en los metadatos).
- Compatible con la librería `transformers` y el pipeline `automatic-speech-recognition`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio más allá del ASR.

## Casos de uso

- Transcripción de consultas de atención al cliente: el modelo puede convertir grabaciones de llamadas o mensajes de voz en texto para su análisis posterior, aprovechando su entrenamiento en el dataset Minds14 que contiene este tipo de interacciones.
- Subtitulado automático de vídeos cortos: gracias a su pequeño tamaño, puede ejecutarse en tiempo real en aplicaciones de edición o streaming, generando subtítulos en inglés.
- Asistentes de voz embebidos: integrable en dispositivos IoT o asistentes personales para transcribir comandos de voz en inglés, con bajo consumo de recursos.
- Análisis de sentimiento en audio: combinado con un modelo de NLP, permite extraer opiniones de llamadas de soporte transcritas.
- Archivado y búsqueda de contenido de audio: convierte podcasts o entrevistas en texto indexable, facilitando la búsqueda por palabras clave.
- Prototipado rápido de sistemas ASR: al ser un modelo ligero y con licencia permisiva, sirve como punto de partida para experimentos o para validar pipelines antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

Según los datos declarados por el autor en la model card, el modelo alcanza los siguientes resultados en el conjunto de evaluación de `PolyAI/minds14`:

| Metrica | Valor |
|---|---|
| Loss | 0.5880 |
| WER (ortográfico) | 0.3418 |
| WER | 0.3359 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo con solo 37,7 millones de parámetros, la inferencia puede ejecutarse en CPU con un uso de memoria inferior a 1 GB (estimación basada en el tamaño del repositorio de 0.2 GB).
- Es viable en GPUs de consumo como la NVIDIA GTX 1050 Ti o superiores, con una VRAM mínima de 2 GB (suficiente para el modelo en precisión FP32).
- Para despliegue en producción, se puede servir con `transformers` mediante pipelines, o con herramientas como `vLLM` o `TGI` (aunque estas suelen orientarse a modelos de lenguaje, también soportan ASR si se configuran adecuadamente).
- La latencia estimada es de decenas de milisegundos por segundo de audio en GPU, y de unos pocos cientos de milisegundos en CPU, aunque no hay datos oficiales.
- Al ser un modelo pequeño, es adecuado para dispositivos periféricos o navegadores mediante `transformers.js` (no confirmado, pero plausible por el tamaño).

## Comparativa con modelos similares

No se dispone de información comparativa en los metadatos o la model card. Como referencia, el modelo base `openai/whisper-tiny` tiene la misma arquitectura y número de parámetros, pero sin el ajuste fino sobre Minds14; su WER en el mismo dataset no se ha publicado aquí. Otros modelos ASR pequeños como `facebook/wav2vec2-base` (95M parámetros) o `google/pegasus` no son directamente comparables por diferencias de arquitectura y entrenamiento. Por tanto, la comparativa se limita a señalar que este modelo es un ajuste fino de Whisper Tiny, con rendimiento específico para el dominio de Minds14.

## Limitaciones y advertencias

- El modelo está entrenado únicamente sobre el dataset Minds14, que contiene consultas de atención al cliente; puede tener un rendimiento degradado en otros dominios o acentos.
- La cobertura de idiomas no está confirmada; el nombre sugiere inglés de EE.UU., pero no hay garantía de soporte para otras variantes.
- Al ser un modelo Tiny, su capacidad de generalización es limitada; es probable que presente errores en audio con ruido de fondo, habla rápida o vocabulario especializado.
- No se han documentado sesgos específicos, pero al entrenarse sobre un corpus de atención al cliente, podría reflejar sesgos presentes en ese tipo de interacciones.
- Riesgo de alucinación: como todo modelo de ASR, puede generar texto no presente en el audio, especialmente en segmentos ambiguos o con baja calidad de audio.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el caso de uso concreto antes de producción.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card, lo que puede dificultar su adopción inmediata.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tomragus/whisper-tiny-minds14-en-US)
- [Dataset PolyAI/minds14](https://huggingface.co/datasets/PolyAI/minds14)
- [Modelo base openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)
