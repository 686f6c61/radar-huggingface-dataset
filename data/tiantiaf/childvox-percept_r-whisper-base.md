# tiantiaf/childvox-percept_r-whisper-base

## Resumen

El modelo `tiantiaf/childvox-percept_r-whisper-base` es un clasificador de audio especializado en la detección de la producción del fonema /ɹ/ en el habla infantil. Se trata de un fine-tuning del modelo `openai/whisper-base` sobre el dataset PERCEPT-R, un corpus a gran escala de vocalizaciones de niños. El modelo distingue entre dos categorías: `Derhotic` (producción no estándar o inmadura del sonido) y `Rhotic` (producción madura y correcta). Está desarrollado por Tiantian Feng y colaboradores en el marco del proyecto ChildVox, presentado en el artículo "ChildVox: A Speech, Audio, and Large Audio-Language Model Benchmark in Understanding and Characterizing Sound across Childhood" (aceptado en EMNLP 2026).

La relevancia de este modelo radica en su aplicación para la investigación del desarrollo del habla en la infancia, permitiendo caracterizar de forma automática la madurez articulatoria de los niños. Al estar basado en whisper-base, es un modelo ligero y eficiente, adecuado para entornos con recursos limitados. La licencia es OpenRAIL, con restricciones explícitas de uso no comercial y no clínico. El modelo se distribuye en formato safetensors y se integra con la librería Transformers mediante un wrapper específico (`WhisperWrapper`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basada en openai/whisper-base) |
| Parametros totales | no disponible (basado en whisper-base, ~124M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2 segundos de audio (según instrucciones de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual (etiqueta del modelo) |
| Licencia | openrail |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `openai/whisper-base`, un transformer encoder-decoder originalmente diseñado para reconocimiento de voz. En este caso, se ha adaptado para una tarea de clasificación de audio: el encoder procesa la señal de audio (muestreada a 16 kHz, mono, con una duración máxima de 2 segundos) y la salida se proyecta a un espacio de dos clases (`Derhotic` y `Rhotic`). El fine-tuning se realizó sobre el dataset PERCEPT-R, que forma parte del benchmark ChildVox. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La implementación incluye un wrapper (`WhisperWrapper`) que permite cargar el modelo desde HuggingFace y extraer tanto logits como embeddings intermedios.

## Capacidades

- Clasificación binaria de audio: distingue entre producción `Rhotic` (madura) y `Derhotic` (inmadura) del fonema /ɹ/ en habla infantil.
- Extracción de embeddings: el modelo puede devolver representaciones intermedias (`return_feature=True`), útiles para análisis posteriores o tareas de representación.
- Procesamiento de audio de corta duración: optimizado para segmentos de hasta 2 segundos, típicos de lectura de palabras por niños.
- Multilingüe: aunque la tarea es específica del sonido /ɹ/, el modelo base es multilingüe, lo que podría permitir su aplicación en distintos idiomas (no verificado).
- Integración con Transformers: compatible con el pipeline `audio-classification` de HuggingFace.

## Casos de uso

- Investigación en desarrollo fonológico: el modelo permite automatizar la anotación de producciones de /ɹ/ en corpus de habla infantil, facilitando estudios longitudinales sobre la adquisición de este sonido.
- Análisis de intervenciones logopédicas: aunque no está permitido su uso clínico, puede emplearse en entornos de investigación para evaluar la eficacia de terapias del habla, siempre con supervisión experta.
- Caracterización de la madurez articulatoria: los embeddings extraídos pueden alimentar otros modelos para correlacionar la producción de /ɹ/ con hitos del desarrollo.
- Construcción de datasets etiquetados: sirve como herramienta de pre-etiquetado para ampliar corpus de habla infantil, reduciendo el esfuerzo manual de anotación.
- Evaluación de modelos de habla infantil: dentro del benchmark ChildVox, este modelo actúa como referencia para comparar el rendimiento de otros sistemas en la tarea de clasificación de /ɹ/.
- Educación y divulgación: en contextos no comerciales, puede utilizarse para demostrar técnicas de clasificación de audio en aplicaciones educativas sobre fonética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (arXiv:2605.29257) presenta evaluaciones dentro del benchmark ChildVox, pero no se incluyen métricas específicas (accuracy, F1) en la model card ni en los resultados de búsqueda. Por tanto, no es posible ofrecer una tabla comparativa con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al estar basado en whisper-base, se espera un consumo bajo (del orden de 1-2 GB en FP16), pero no se proporcionan datos oficiales.
- GPU recomendadas: no especificadas. Dado el tamaño reducido, debería ejecutarse en GPUs consumer como RTX 3060, RTX 4090 o incluso en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: probablemente sí, pero no confirmado por el autor.
- Opciones de despliegue: el modelo se integra con Transformers y puede servirse mediante vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay instrucciones oficiales al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. La colección ChildVox incluye otros modelos (por ejemplo, `tiantiaf/childvox-speechmaturity-whisper-large`), pero no se conocen sus especificaciones ni resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso restringido: el modelo no puede utilizarse en aplicaciones clínicas o de diagnóstico, vigilancia, ni con fines comerciales. Solo se permite su uso en investigación y educación.
- Datos sensibles: el habla infantil es información altamente sensible. Se debe obtener aprobación ética (IRB) y cumplir con la normativa de privacidad aplicable.
- Sesgos potenciales: al estar entrenado en un dataset específico (PERCEPT-R), puede no generalizar a otras poblaciones, acentos o condiciones de grabación.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir errores de clasificación en audio con ruido o habla no infantil.
- Limitaciones de contexto: la ventana de audio está limitada a 2 segundos; segmentos más largos deben truncarse, lo que puede perder información relevante.
- Sin garantías de rendimiento: no se han publicado métricas oficiales, por lo que el rendimiento real en producción es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiantiaf/childvox-percept_r-whisper-base
- Paper (arXiv): https://arxiv.org/abs/2605.29257
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Página del proyecto ChildVox: https://tiantiaf0627.github.io/childvox/
- Colección ChildVox en HuggingFace: https://huggingface.co/collections/tiantiaf/childvox
