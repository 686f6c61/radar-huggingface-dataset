# WPS-Qingqiu/OmniAlign

## Resumen

OmniAlign es un modelo de codificación multilingüe especializado en alineación de secuencias, tanto a nivel de palabras como de oraciones, entre pares de idiomas. Desarrollado por WPS-Qingqiu, el equipo de investigación de Kingsoft Office, el modelo se construye sobre el encoder multilingüe `gte-multilingual-mlm-base` de Alibaba y ha sido entrenado mediante un pipeline de cuatro etapas (preentrenamiento, no supervisado, supervisado y destilación) para reforzar progresivamente sus representaciones contextuales. Con 305 millones de parámetros y una ventana de contexto de 8192 tokens, está pensado para tareas como la alineación de segmentos paralelos en corpus bilingües y la detección de correspondencias palabra a palabra, lo que lo hace relevante para la construcción y validación de datos de traducción, la minería de textos multilingües y el desarrollo de herramientas de aprendizaje de idiomas.

El modelo se distribuye bajo licencia Apache 2.0 y su código de inferencia, junto con ejemplos ejecutables, está disponible en un repositorio de GitHub separado. Aunque el repositorio de HuggingFace solo contiene los pesos y la configuración, el enfoque técnico combina embeddings contextuales de tokens con embeddings de oraciones en un espacio vectorial compartido, y aplica un algoritmo de programación dinámica en dos fases para la alineación de oraciones: primero fija anclas aproximadas uno a uno y después busca todas las alineaciones válidas bajo esas restricciones. Este diseño permite manejar pares de idiomas como chino-inglés, español-inglés, alemán-inglés, francés-inglés, italiano-inglés, ruso-inglés, japonés-inglés, portugués-inglés, rumano-inglés y otros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (GTE, variante de Alibaba-NLP/gte-multilingual-mlm-base) |
| Parametros totales | 305.368.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe: chino (zh), inglés (en), alemán (de), francés (fr), español (es), italiano (it), ruso (ru), japonés (ja), portugués (pt), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un encoder Transformer basado en `gte-multilingual-mlm-base` de Alibaba, que a su vez es una variante de la arquitectura GTE (General Text Embeddings). Su funcionamiento se apoya en dos representaciones complementarias: embeddings contextuales de palabras para alineación a nivel de subpalabras y embeddings de oraciones para la comparación semántica entre secuencias. El entrenamiento se realiza en cuatro etapas secuenciales: preentrenamiento, fase no supervisada, fase supervisada y destilación. Este enfoque progresivo refuerza tanto la calidad de los embeddings de palabras como los de oraciones, y el checkpoint final es el resultado de la etapa de destilación. No se ha especificado el número exacto de tokens de entrenamiento ni la composición detallada del corpus, pero la optimización se centra en pares como chino-inglés, español-inglés, italiano-inglés, alemán-inglés, francés-inglés, ruso-inglés y alemán-francés, entre otros.

La innovación principal reside en el algoritmo de alineación de oraciones: primero identifica anclas uno a uno mediante similitud coseno y programación dinámica, y luego busca todas las alineaciones válidas bajo esas restricciones. Este enfoque permite manejar correspondencias n-m (varias oraciones en un idioma contra varias en otro) con mayor precisión que los métodos puramente basados en embeddings.

## Capacidades
- Alineación de palabras: infiere similitud entre tokens mediante embeddings contextuales y produce correspondencias subpalabra a subpalabra.
- Alineación de oraciones: codifica oraciones de dos idiomas en un espacio vectorial compartido y las empareja con un algoritmo de programación dinámica en dos fases (anclas + búsqueda completa).
- Extracción de características: funciona como un modelo de embeddings multilingüe estándar, útil para tareas de búsqueda semántica y similitud entre textos.
- Multilingüe: optimizado para diez idiomas, con especial énfasis en pares con inglés y chino, así como combinaciones europeas como alemán-francés.
- No es generativo: no genera texto, no soporta tool calling ni agentes; su salida son vectores de características o alineaciones.

## Casos de uso
- Construcción de corpus paralelos: alinear automáticamente oraciones de documentos bilingües (por ejemplo, memorias de traducción o páginas web multilingües) para crear conjuntos de entrenamiento para modelos de traducción automática.
- Validación de traducciones: comparar una traducción con su original para detectar desalineaciones, omisiones o adiciones de contenido, útil en control de calidad de traducciones profesionales.
- Minería de textos multilingües: extraer pares de oraciones equivalentes de grandes colecciones de texto en varios idiomas para alimentar sistemas de recuperación de información multilingüe o bases de conocimiento.
- Aprendizaje de idiomas asistido por ordenador: generar ejercicios de emparejamiento de frases o palabras entre idiomas, o crear tarjetas de vocabulario con correspondencias precisas.
- Análisis de corpus de traducción: estudiar la estructura de alineación de documentos bilingües para investigaciones en lingüística computacional o para mejorar sistemas de memoria de traducción.
- Preprocesamiento de datos para modelos de traducción neuronal: alinear manualmente o corregir corpus antes de entrenar un modelo de traducción, mejorando la calidad de los datos de entrada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks completos en la información disponible. El README del modelo muestra una tabla de evaluación de alineación de palabras (AER, menor es mejor) que compara varios métodos (FastAlign, GIZA++, SimAlign, AwesomeAlign, AccAlign, WSPAlign) en pares como zh-en, de-en, fr-en, ro-en, ja-en, es-en, pt-en, ru-en e it-en, pero los valores de OmniAlign no están especificados de manera explícita y la tabla se corta. Por tanto, no se puede presentar una tabla de resultados verificada. Se recomienda consultar el repositorio GitHub para datos actualizados.

## Requisitos de hardware
- VRAM estimada para inferencia: con 305 millones de parámetros, en fp16 el modelo ocupa aproximadamente 0,6 GB; en fp32, unos 1,2 GB. Por tanto, cabe en GPUs con al menos 2 GB de VRAM, incluso en tarjetas de gama baja.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM es suficiente; también puede ejecutarse en CPU con memoria RAM suficiente (≈1,5 GB).
- Compatible con GPU de consumo: sí, funciona en tarjetas como NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.
- Opciones de despliegue: el modelo se usa a través de la librería `transformers` y `sentence_transformers`; no es compatible con vLLM ni TGI porque no es generativo. Se puede ejecutar con `text-embeddings-inference` (según el tag), aunque no hay documentación explícita.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares
No se dispone de información sobre modelos directamente comparables que ofrezcan alineación de palabras y oraciones con las mismas características. Los métodos clásicos como SimAlign, AwesomeAlign o AccAlign son herramientas de alineación basadas en embeddings, pero no se presentan como modelos independientes con pesos públicos. El modelo base `gte-multilingual-mlm-base` es un encoder de embeddings multilingüe, pero no está especializado en alineación. Por tanto, se indica que no hay comparación directa disponible en la documentación actual.

## Limitaciones y advertencias
- El modelo está optimizado para los pares de idiomas mencionados; su rendimiento en otros pares no está garantizado y puede ser significativamente inferior.
- No es un modelo generativo, por lo que no puede producir texto; solo genera embeddings o alineaciones.
- La ventana de contexto está limitada a 8192 tokens; para documentos más largos se requiere segmentación previa.
- El repositorio de HuggingFace solo contiene los pesos y la configuración; el código de inferencia está en GitHub y es necesario para ejecutar el modelo correctamente.
- No se han publicado análisis de sesgos o robustez para este modelo; como modelo de embeddings, podría reflejar sesgos presentes en los datos de entrenamiento de su base.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar la procedencia de los datos de entrenamiento en el repositorio GitHub.
- No hay información sobre el rendimiento en tareas fuera de la alineación (por ejemplo, búsqueda semántica genérica), aunque puede utilizarse como encoder de embeddings.

## Enlaces
- HuggingFace: https://huggingface.co/WPS-Qingqiu/OmniAlign
- GitHub (código de inferencia y ejemplos): https://github.com/MilkDargon/OmniAlign
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-mlm-base
