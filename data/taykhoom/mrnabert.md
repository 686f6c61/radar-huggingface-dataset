# Taykhoom/mRNABERT

## Resumen

mRNABERT es un modelo de lenguaje especializado en secuencias de ARN mensajero (ARNm), desarrollado originalmente por el equipo de Ying Xiong y colaboradores, y publicado en Nature Communications en 2025. Este repositorio concreto, mantenido por Taykhoom, es un port minimalista del modelo original que incluye únicamente los pesos y el tokenizador, cargando el código desde `Taykhoom/MosaicBERT-updated` mediante `trust_remote_code=True`. El modelo se preentrenó sobre 18 millones de secuencias de ARNm curadas utilizando un objetivo de modelado de lenguaje enmascarado (MLM) combinado con aprendizaje contrastivo para integrar características semánticas de aminoácidos.

La arquitectura se basa en el encoder MosaicBERT con normalización post-LayerNorm, atención con ALiBi (sin embeddings posicionales), capas feed-forward con GeGLU y una técnica de "unpadding" que elimina el overhead del padding. Con aproximadamente 114 millones de parámetros y un vocabulario híbrido de 74 tokens (nucleótidos individuales y codones), el modelo está diseñado para tareas de representación y predicción sobre ARNm, como el diseño de secuencias para vacunas y terapias. Su relevancia actual radica en ser una herramienta fundacional de código abierto (licencia Apache 2.0) que democratiza el acceso a modelos de IA para biología molecular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MosaicBERT encoder (post-LN, ALiBi, GeGLU, unpadding) |
| Parametros totales | 114.038.090 (según safetensors; la model card indica ~114M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 10.000 tokens (límite práctico configurado; ALiBi crece dinámicamente; MLM usó 1.024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (vocabulario de nucleótidos y codones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MosaicBERT, un encoder Transformer con 12 capas, 12 cabezas de atención y dimensión de embedding de 768. La capa feed-forward tiene una dimensión oculta de 3.072 con activación GeGLU (proyección de compuerta sin sesgo de 6.144 valores). La codificación posicional se resuelve mediante ALiBi, que permite extrapolar a secuencias más largas que las vistas en entrenamiento sin añadir embeddings posicionales aprendidos. La normalización es post-LayerNorm con épsilon 1e-12. El mecanismo de atención empaqueta QKV y soporta tres backends: eager, SDPA (atención escalada por producto punto) y Flash Attention 2. La técnica de unpadding concatena los tokens de todas las secuencias del batch, eliminando el coste computacional del padding.

El vocabulario es híbrido: 5 tokens especiales (`[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]`), 5 nucleótidos individuales (`A`, `T`, `C`, `G`, `N`) para regiones UTR, y los 64 codones posibles (`AAA` a `GGG`) para regiones CDS. El preentrenamiento se realizó con MLM y aprendizaje contrastivo sobre 18 millones de secuencias de ARNm curadas, integrando características semánticas de aminoácidos. El checkpoint de partida proviene de `YYLY66/mRNABERT`. La verificación de paridad confirma que las 13 representaciones (embedding + 12 bloques) y los logits de MLM son bit-exactos respecto a la implementación original, con diferencias máximas absolutas de 0.00.

## Capacidades

- Generación de representaciones (embeddings) de secuencias de ARNm de longitud variable, con salida de 768 dimensiones por token.
- Modelado de lenguaje enmascarado (fill-mask) para predecir nucleótidos o codones en posiciones enmascaradas.
- Integración de características semánticas de aminoácidos mediante aprendizaje contrastivo, lo que permite capturar relaciones funcionales entre secuencias.
- Manejo de regiones UTR y CDS con tokenización híbrida: nucleótidos individuales para UTR y codones para CDS, mediante el método `batch_encode_with_cds()`.
- Soporte de backends de atención eficientes: SDPA (por defecto en PyTorch >= 2.0) y Flash Attention 2, que reducen el uso de memoria y aceleran la inferencia.
- Capacidad de extrapolación a secuencias largas gracias a ALiBi, aunque el límite práctico configurado es de 10.000 tokens.

## Casos de uso

- Diseño de secuencias de ARNm para vacunas y terapias génicas: el modelo puede generar o completar secuencias codificantes optimizadas, ayudando a diseñar ARNm con mayor estabilidad y eficiencia de traducción.
- Predicción de estabilidad y traducción de ARNm: los embeddings generados pueden alimentar modelos downstream para predecir la vida media del ARNm o la eficiencia de traducción, útiles en el desarrollo de fármacos.
- Clasificación de regiones funcionales: distinguir entre regiones UTR y CDS, o identificar secuencias codificantes frente a no codificantes, aprovechando la tokenización híbrida.
- Análisis de patrones de codones: estudiar la frecuencia y el contexto de codones sinónimos, lo que puede revelar sesgos de uso de codones asociados a la expresión génica.
- Generación de embeddings para modelos de aprendizaje automático: las representaciones de secuencia (media ponderada de los tokens) sirven como entrada para clasificadores, regresores o modelos de clustering en tareas de biología computacional.
- Búsqueda de similitud entre secuencias de ARNm: comparar embeddings de diferentes transcritos para agrupar genes con funciones relacionadas o identificar ortólogos.
- Análisis de regiones no traducidas (UTR): estudiar elementos reguladores en 5'UTR y 3'UTR que afectan a la estabilidad y traducción, utilizando la representación de nucleótidos individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en biología molecular y no en tareas de lenguaje general. La verificación de paridad confirma la exactitud de las representaciones frente a la implementación original, pero no se proporcionan métricas de rendimiento en tareas biológicas específicas.

## Requisitos de hardware

- El modelo tiene aproximadamente 114 millones de parámetros, lo que lo hace ligero en comparación con modelos de lenguaje grandes. En precisión FP32, los pesos ocupan unos 456 MB; en FP16, unos 228 MB.
- Se puede ejecutar en GPUs de consumo con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior. Para inferencia con Flash Attention 2 se recomienda una GPU compatible con Ampere o posterior (por ejemplo, RTX 30xx o RTX 40xx).
- La verificación de paridad se realizó en una NVIDIA H100 con PyTorch 2.7.1 y CUDA 12.9, lo que confirma compatibilidad con hardware de centro de datos.
- Opciones de despliegue: la librería `transformers` con `trust_remote_code=True` es la vía principal. Al ser un modelo BERT, puede servirse mediante Hugging Face Inference Endpoints o contenedores personalizados. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- La latencia y el throughput no están documentados, pero dado el tamaño reducido, se espera una inferencia rápida incluso en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mRNABERT (Taykhoom) | ~114M | 10.000 tokens (práctico) | 74 tokens (nucleótidos + codones) | Apache 2.0 | Hugging Face |
| mRNABERT original (YYLY66) | ~114M (según model card) | No especificado | 74 tokens | No especificada | Hugging Face |
| RNABERT (Taykhoom) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos. El port de Taykhoom añade mejoras sobre la implementación original de MosaicBERT, como la corrección de errores y el soporte de SDPA y Flash Attention 2, pero las capacidades funcionales son equivalentes.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en secuencias de ARNm; no es adecuado para procesamiento de lenguaje natural ni para otros tipos de datos biológicos (por ejemplo, ADN genómico o proteínas).
- La tokenización utiliza el alfabeto de ADN (T en lugar de U), lo que puede resultar confuso si se trabaja con secuencias de ARN convencionales. Es necesario convertir U a T antes de la codificación.
- Para un uso óptimo, se requiere un preprocesamiento CDS-aware: las regiones UTR deben estar separadas por espacios a nivel de nucleótido y las regiones CDS a nivel de codón. El método `batch_encode_with_cds()` facilita esta tarea, pero exige disponer de anotaciones CDS.
- El vocabulario es muy reducido (74 tokens), lo que limita la representación a nucleótidos y codones; no captura información de orden superior como estructuras secundarias o modificaciones epitranscriptómicas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos curados, puede heredar sesgos de la selección de secuencias (por ejemplo, sobrerrepresentación de ciertos organismos o condiciones).
- Existe riesgo de alucinación en la generación de secuencias: el modelo puede producir codones o combinaciones que no correspondan a ARNm biológicamente válidos. Se recomienda validación experimental o con herramientas externas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original (YYLY66) no especifica su licencia; se debe verificar si hay restricciones adicionales al utilizar el port en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/mRNABERT
- Modelo original (YYLY66): https://huggingface.co/YYLY66/mRNABERT
- Repositorio de código del modelo original: https://github.com/yyly6/mRNABERT
- Artículo científico en Nature Communications: https://www.nature.com/articles/s41467-025-65340-8
- Modelo relacionado RNABERT: https://huggingface.co/Taykhoom/RNABERT
