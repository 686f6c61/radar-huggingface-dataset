# Tohirju/uz-punctuation-restore

## Resumen

Tohirju/uz-punctuation-restore es un modelo de restauración de puntuación basado en fine-tuning de XLM-RoBERTa-base, publicado por el usuario Tohirju en Hugging Face. El modelo está diseñado para la tarea de token classification, específicamente para añadir signos de puntuación (coma, punto, signos de interrogación, etc.) a texto sin puntuar, lo que resulta especialmente útil como post-procesado de salidas de reconocimiento automático del habla (ASR).

Aunque el identificador del repositorio contiene el prefijo «uz» (que sugiere uzbeko), las etiquetas y el campo de idioma indican que está dirigido al idioma tajiko (código `tg`). El modelo se distribuye en formato ONNX cuantizado, lo que permite una inferencia eficiente en CPU y entornos de producción ligeros. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar las condiciones de uso en Hugging Face antes de poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (Transformer encoder) con cabeza de token classification |
| Parametros totales | no disponible (base: 278 millones aprox. para XLM-RoBERTa-base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (512 tokens para XLM-RoBERTa-base) |
| Tipos de cuantizacion | ONNX cuantizado (int8) |
| Idiomas soportados | Tajiko (`tg`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelo base en safetensors, pero el repo se distribuye en ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-base, un transformer encoder multilingue de Facebook AI entrenado en 100 idiomas con 2.5 TB de datos filtrados. Para esta tarea especifica, se realiza un fine-tuning sobre la cabeza de token classification, donde cada token del texto de entrada se clasifica con la etiqueta de puntuación que debe precederlo o seguirlo (por ejemplo, coma, punto, signo de interrogación, etc.). No se ha publicado informacion detallada sobre el dataset de entrenamiento, el numero de epocas o el proceso de ajuste (si se usó RLHF o DPO, no se menciona). El repositorio indica que el modelo se exporta a ONNX con cuantizacion, lo que sugiere un paso de optimizacion para despliegue en produccion con menor consumo de recursos.

## Capacidades

- Restauracion de puntuacion en texto plano en idioma tajiko.
- Clasificacion de tokens para asignar signos de puntuacion (coma, punto, interrogacion, etc.) a nivel de token.
- Post-procesado de salidas de ASR para generar texto legible y bien puntuado.
- Inferencia eficiente gracias al formato ONNX cuantizado.
- Integrable en pipelines de procesamiento de lenguaje natural (NLP) mediante librerias de ONNX Runtime.

No se menciona soporte para tool calling, agentes, vision, audio ni otras capacidades mas alla de la restauracion de puntuacion.

## Casos de uso

- Post-procesado de transcripciones ASR en tajiko: el modelo toma la salida bruta del reconocedor de voz y anade puntuacion para mejorar la legibilidad de subtitulos o actas.
- Normalizacion de texto para corpus de NLP: textos sin puntuacion (por ejemplo, de redes sociales o mensajes) pueden ser limpiados para entrenar otros modelos.
- Generacion de subtitulos para videos en tajiko: se puede integrar en un pipeline que recibe audio y genera subtitulos puntuados.
- Asistencia a traductores automaticos: el texto de entrada sin puntuacion se puede pre-procesar para mejorar la calidad de la traduccion.
- Preparacion de datos para sintesis de voz (TTS): un texto bien puntuado mejora la prosodia del audio generado.
- Mejora de la busqueda de texto: al puntuar documentos indexados, se facilita la segmentacion en frases y la recuperacion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repo: 1,4 GB en formato ONNX cuantizado.
- VRAM estimada para inferencia: no disponible, pero al ser un modelo de ~125M de parametros en ONNX int8, puede ejecutarse en CPU con uso de RAM moderado (aprox. 500-700 MB) y en GPUs de gama baja (VRAM minima de 2 GB).
- GPU recomendadas: cualquier GPU con soporte CUDA, como GTX 1050 Ti o superior; tambien funciona en CPU sin problema.
- Cabe en consumer GPU: si, en practicamente todas las GPUs modernas.
- Opciones de despliegue: ONNX Runtime, puede usarse con librerias como `onnxruntime`, `transformers` (cargando el modelo ONNX) o servicios como Triton Inference Server.
- Latencia y throughput: no disponibles, pero al ser cuantizado int8, la inferencia es rapida en CPU (tipicamente menos de 100 ms por frase corta en CPU moderna).

## Comparativa con modelos similares

| Modelo | Tamano | Idioma | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| Tohirju/uz-punctuation-restore | ~124M | tajiko (tg) | ONNX cuantizado | Apache-2.0 | Gated |
| Tohirju/tajik-punctuation-restore | ~124M | tajiko (tg) | no disponible | no disponible | no disponible |
| felflare/bert-restore-punctuation | ~110M | ingles | PyTorch | MIT | Abierto |

No se dispone de datos de rendimiento comparativo. La comparacion se limita a la disponibilidad y formato.

## Limitaciones y advertencias

- El modelo esta pensado para tajiko; no se garantiza que funcione correctamente en otros idiomas.
- Acceso restringido (gated) en Hugging Face: es necesario aceptar las condiciones de uso antes de descargar.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion de puntuacion: el modelo puede insertar signos incorrectos en textos ambiguos o con errores tipograficos.
- La cuantizacion ONNX puede introducir perdidas de precision en comparacion con el modelo original en float32.
- No se ofrece informacion sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos o cobertura de vocabulario.
- La fecha de creacion (2026-08-23) es inusual y puede indicar que el repositorio es reciente o que la informacion es incorrecta.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Tohirju/uz-punctuation-restore
- Modelo similar del mismo autor: https://huggingface.co/Tohirju/tajik-punctuation-restore
- Tema de GitHub sobre restauracion de puntuacion: https://github.com/topics/punctuation-restoration
- Ejemplo de otro modelo de restauracion de puntuacion: https://huggingface.co/felflare/bert-restore-punctuation
- Paper sobre restauracion de puntuacion en uzbeko (relacionado): https://dl.acm.org/doi/10.1145/3726122.3726139
