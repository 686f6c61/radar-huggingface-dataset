# ValantisAndreas/heva-baselines

## Resumen

HEVA baselines es un conjunto de seis modelos de clasificación derivados de google-bert/bert-base-multilingual-cased, publicados por ValantisAndreas como parte del trabajo *HEVA: A Dataset, Toolkit and Benchmark for Heritage Value Extraction*. El repositorio no contiene un modelo único, sino dos tareas con tres semillas de entrenamiento cada una: T1, clasificación multi-etiqueta de valores culturales sobre el Cultural Value Framework (ocho valores), y T2, extracción de fragmentos de texto que expresan dichos valores mediante etiquetado BIO con 17 etiquetas.

El modelo resuelve un problema de procesamiento de lenguaje natural aplicado al patrimonio cultural: identificar qué valores (estéticos, históricos, sociales, simbólicos, etc.) expresa un texto sobre un bien patrimonial. Se apoya en mBERT, un transformer encoder de 12 capas y 178 millones de parámetros con vocabulario multilingüe, afinado sobre un corpus de patrimonio cultural en inglés, neerlandés y chino.

Su relevancia es metodológica: sirve como línea base reproducible y con varianza entre semillas reportada para el benchmark HEVA, no como modelo de propósito general. El rendimiento es modesto (micro-F1 de 0,747 en T1 y F1 de solapamiento de 0,551 en T2), y el propio autor advierte de un sesgo fuerte hacia la colección Yazd en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingual, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 178 millones (mBERT base); cabezas de clasificación específicas por tarea |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de mBERT) |
| Tipos de cuantizacion | No especificados en la información disponible; al ser safetensors en fp32/fp16, admite cuantización estándar con herramientas de Hugging Face (no documentada por el autor) |
| Idiomas soportados | Inglés (en), neerlandés (nl), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tareas | T1: clasificación multi-etiqueta (8 valores); T2: etiquetado token a token con 17 etiquetas BIO |
| Semillas entrenadas | 3 por tarea (13, 14, 15) |
| Tamaño del repositorio | 4,3 GB |

## Arquitectura y entrenamiento

Cada checkpoint es un mBERT base afinado con una cabeza de clasificación. Para T1 se usa `AutoModelForSequenceClassification` con activación sigmoide y umbral de 0,5 por etiqueta, lo que produce predicciones multi-etiqueta sobre los ocho valores del Cultural Value Framework. Para T2 se usa `AutoModelForTokenClassification` con 17 etiquetas BIO; la predicción de cada palabra se toma del primer subword que la compone, un criterio de alineación subword-palabra explícito en la model card.

El entrenamiento se realizó con tres semillas (13, 14 y 15) sobre una única partición de datos, y los resultados se reportan como media ± desviación estándar en el conjunto de test. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste con RLHF o DPO (poco probable en un encoder de clasificación). La innovación principal no es arquitectónica sino de evaluación: la publicación de la varianza entre semillas y de los seis checkpoints permite reproducir el benchmark y medir la sensibilidad al inicializado.

## Capacidades

- Clasificación multi-etiqueta de valores culturales (T1): asigna una o varias de las ocho categorías del Cultural Value Framework a un texto, con umbral de probabilidad configurable.
- Extracción de fragmentos de valor (T2): etiqueta cada token con BIO para localizar las expresiones textuales que materializan un valor patrimonial.
- Procesamiento multilingüe limitado a inglés, neerlandés y chino, heredado del vocabulario de mBERT.
- Entrada de hasta 512 tokens por documento.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni capacidades de agente.
- No es un modelo generativo: no produce texto libre, solo etiquetas y probabilidades.

## Casos de uso

- Catalogación de patrimonio documental: procesar descripciones de monumentos o colecciones museísticas para asignar automáticamente valores culturales (histórico, estético, social) y enriquecer metadatos de catálogo sin intervención manual.
- Filtrado y triaje en archivos digitales: clasificar grandes volúmenes de textos patrimoniales en neerlandés, inglés o chino para priorizar qué documentos requieren revisión humana según los valores detectados.
- Investigación en humanidades digitales: usar los seis checkpoints como línea base reproducible en estudios comparativos de análisis de valores, aprovechando la varianza entre semillas reportada.
- Análisis de discurso institucional: evaluar cómo organismos de patrimonio comunican valores en informes y notas de prensa, detectando qué marcos axiológicos predominan.
- Extracción de citas justificativas: emplear T2 para localizar los fragmentos concretos de un texto que sustentan una clasificación de valor, facilitando la trazabilidad en auditorías de contenido.
- Enseñanza y formación: construir ejercicios o demostraciones sobre el Cultural Value Framework usando las predicciones del modelo como punto de partida para la anotación manual.
- Integración en pipelines de curación de datos: como componente de preetiquetado en flujos de anotación activa, donde el modelo propone etiquetas y los anotadores las corrigen.

## Benchmarks y rendimiento

Resultados en el conjunto de test, media ± desviación estándar sobre tres semillas, según la model card:

| Tarea | Métrica | Resultado |
|---|---|---|
| T1 (clasificación de valores) | Micro-F1 | 0,747 ± 0,010 |
| T1 (clasificación de valores) | Macro-F1 | 0,727 ± 0,010 |
| T2 (extracción de fragmentos) | Exact span micro-F1 | 0,285 ± 0,016 |
| T2 (extracción de fragmentos) | Overlap span F1 | 0,551 ± 0,024 |
| T2 (extracción de fragmentos) | Token F1 | 0,542 ± 0,002 |

El autor reporta además que, excluyendo la colección Yazd, el micro-F1 de T1 cae a 0,67, lo que evidencia la dependencia del dominio de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp32 para un checkpoint individual (178 M de parámetros); alrededor de 0,4 GB en fp16 y menos de 0,3 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para un solo checkpoint, pero permiten servir los seis en paralelo.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también funciona en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` o `AutoModelForTokenClassification` y carga por subcarpeta; exportación a ONNX Runtime para inferencia optimizada; TorchServe o un endpoint de Inferentia para servicio HTTP. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (cientos de documentos por segundo en lotes), pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEVA baselines (este) | 178 M | 512 | Clasificación de valores y extracción de fragmentos | Apache 2.0 | Hugging Face, 6 checkpoints |
| google-bert/bert-base-multilingual-cased | 178 M | 512 | Modelo base sin afinar | Apache 2.0 | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 | Modelo base multilingüe | MIT | Hugging Face |
| Modelos específicos de clasificación patrimonial | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con mBERT sin afinar: HEVA baselines añade cabezas de clasificación y extracción específicas del dominio patrimonial, pero hereda sus límites de contexto y su tokenizador. No se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: los datos de entrenamiento están dominados por la colección Yazd; el micro-F1 de T1 cae de 0,747 a 0,67 al excluirla, lo que indica escasa generalización a otras colecciones patrimoniales.
- Extracción de fragmentos débil: el F1 exacto de T2 es de solo 0,285, y el autor señala un rendimiento especialmente bajo en valores poco frecuentes; no es fiable para extracción automática sin revisión humana.
- Cobertura lingüística limitada a inglés, neerlandés y chino; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Ventana de 512 tokens: los documentos largos requieren truncamiento o segmentación, con posible pérdida de contexto.
- No es un modelo generativo: no puede redactar resúmenes ni justificar sus predicciones en lenguaje natural.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación multi-etiqueta según el umbral elegido (0,5 por defecto).
- Aviso del tokenizador: al cargarlo puede aparecer una advertencia sobre un patrón regex; el autor afirma que no afecta a las codificaciones, pero conviene verificarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no obstante, la calidad limitada del modelo desaconseja su uso directo en producción sin validación en el dominio objetivo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ValantisAndreas/heva-baselines
- Repositorio del toolkit HEVA (código, tareas y resultados): https://github.com/zzbn12345/HEVA_toolkit
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
