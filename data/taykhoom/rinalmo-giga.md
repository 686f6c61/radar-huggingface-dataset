# Taykhoom/RiNALMo-giga

## Resumen

RiNALMo-giga es la variante más grande (650,9 millones de parámetros) de RiNALMo, un modelo de lenguaje de ARN (RNA) de propósito general desarrollado por Penić et al. y publicado en *Nature Communications* en 2025. El modelo se preentrena con el objetivo de modelado de lenguaje enmascarado (MLM, estilo BERT) sobre 36 millones de secuencias de ARN no codificante procedentes de múltiples bases de datos. Su propósito es generar representaciones vectoriales de secuencias de ARN que capturen información estructural y funcional, y que puedan transferirse a tareas posteriores como la predicción de estructura secundaria o la detección de sitios de empalme.

Este port a HuggingFace, realizado por Taykhoom, reproduce los pesos originales con verificación bit-exacta frente a la implementación de referencia en PyTorch puro. La arquitectura es un Transformer Pre-LN con FFN SwiGLU, 33 capas, dimensión de embedding de 1280 y codificación posicional RoPE, con una longitud de contexto práctica de unos 8192 tokens. Es el mayor modelo de ARN publicado hasta la fecha y alcanza resultados de vanguardia en varias tareas de biología computacional, incluyendo la generalización a familias de ARN no vistas durante el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN con FFN SwiGLU |
| Parametros totales | 650.902.849 (según safetensors; 650.901.793 según la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | ~8192 tokens (práctico; RoPE sin límite duro) |
| Tipos de cuantizacion | No especificados por el autor; compatible con cuantización estándar de HuggingFace (int8, int4, etc.) |
| Idiomas soportados | No aplica (modelo de secuencias de ARN, no de lenguaje natural) |
| Licencia | CC BY 4.0 (pesos); Apache 2.0 (código) |
| Formato de pesos | safetensors (con código personalizado en transformers) |

## Arquitectura y entrenamiento

RiNALMo-giga emplea una arquitectura Transformer Pre-LN con normalización LayerNorm (eps=1e-5) y FFN con activación SwiGLU de dimensión oculta 3413 (calculada como floor(2/3 × 4 × 1280)). La codificación posicional usa RoPE con base 10000 y modo no intercalado. El vocabulario consta de 22 tokens: tokens especiales (`<cls>`, `<pad>`, `<eos>`, `<unk>`, `<mask>`) y 17 símbolos IUPAC de bases nucleotídicas (A, C, G, T, I, R, Y, K, M, S, W, B, D, H, V, N y el hueco `-`). El tokenizador convierte U a T antes de codificar, ya que el modelo se entrenó con T.

El preentrenamiento utiliza MLM con una tasa de enmascarado del 15%, sobre 36 millones de secuencias de ARN no codificante. El checkpoint original proviene de Zenodo (rinalmo_giga_pretrained.pt). La implementación original usaba Flash Attention 2.3.2 durante el entrenamiento; este port expone los backends eager, SDPA y Flash Attention 2 a través de la interfaz de HuggingFace. Dos detalles técnicos notables: la residual de atención se toma de la entrada normalizada (esquema no estándar) y se aplica TokenDropout que reescala los embeddings por `(1 - mask_ratio_train) / (1 - mask_ratio_observed)` incluso en inferencia, consistente con el código de entrenamiento original.

## Capacidades

- Generación de embeddings de secuencias de ARN: tanto a nivel de token (dimensión 1280) como a nivel de secuencia mediante el token `[CLS]`.
- Modelado de lenguaje enmascarado: puede predecir bases enmascaradas en una secuencia, útil para completar regiones desconocidas o generar candidatos.
- Fine-tuning para tareas downstream: el modelo completo se puede ajustar para clasificación de secuencias, regresión o etiquetado de tokens.
- Soporte de secuencias con alfabeto IUPAC extendido (incluye bases ambiguas como R, Y, K, M, S, W, B, D, H, V, N y huecos).
- Atención no causal (bidireccional), adecuada para representaciones contextuales completas.
- Acceso a representaciones intermedias: se pueden extraer las 34 capas (embedding + 33 transformadores) para análisis o para entrenar cabezas específicas.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de biología, no de lenguaje general.

## Casos de uso

- Predicción de estructura secundaria de ARN: el modelo se puede fine-tunear para predecir pares de bases (p. ej., bucles, horquillas) a partir de la secuencia. Su capacidad de generalizar a familias de ARN no vistas lo hace especialmente útil para ARN poco caracterizados.
- Detección de sitios de empalme (splice sites): mediante fine-tuning con cabezas de clasificación por token, puede identificar posiciones de corte y empalme en transcritos, útil en anotación genómica.
- Clasificación de tipos de ARN no codificante: se puede entrenar un clasificador sobre los embeddings `[CLS]` para distinguir entre lncRNA, miRNA, snoRNA, etc., a partir de la secuencia.
- Anotación funcional de genomas: los embeddings generados por RiNALMo-giga pueden servir como características de entrada para modelos de predicción de función de elementos genómicos no anotados.
- Estudio de interacciones ARN-proteína: las representaciones de secuencia pueden combinarse con modelos de interacción para predecir sitios de unión, aprovechando la información estructural capturada durante el preentrenamiento.
- Generación de secuencias candidatas: usando el modo MLM, se pueden enmascarar regiones de una secuencia y muestrear bases probables, lo que permite explorar variantes para diseño experimental.
- Fine-tuning para tareas específicas de biología computacional: cualquier tarea que requiera representaciones de ARN (p. ej., predicción de modificación, localización subcelular) puede beneficiarse de los embeddings preentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo alcanza resultados de vanguardia en predicción de estructura secundaria y detección de sitios de empalme, y que generaliza a familias de ARN no vistas, pero no se proporcionan cifras concretas (p. ej., valores de accuracy, MCC o F1). El artículo original en *Nature Communications* (doi:10.1038/s41467-025-60872-5) contiene las evaluaciones detalladas, pero no están reproducidas en la documentación del port.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 2,6 GB (tamaño del repositorio). En FP16, ~1,3 GB; en int8, ~650 MB; en int4, ~325 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (p. ej., RTX 3050, RTX 3060, GTX 1660 Super). Para entrenamiento o fine-tuning con lotes grandes, se recomienda una GPU con 12 GB o más (RTX 3060 12GB, RTX 4070, A100, etc.).
- Cabe en GPUs de consumo: sí, en FP16 cabe en la mayoría de GPUs modernas de gama media (8 GB o más). En cuantización int8/int4 cabe incluso en GPUs con 4 GB.
- Opciones de despliegue: al ser un modelo de transformers con código personalizado, se puede servir con HuggingFace Inference Endpoints, vLLM (si se adapta), o mediante scripts Python con PyTorch. También se puede exportar a ONNX para inferencia en CPU/GPU.
- Latencia y throughput: no disponibles. Para una secuencia de 1000 tokens, se estima una latencia de decenas de milisegundos en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la información proporcionada. Sin embargo, se puede contextualizar cualitativamente:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RiNALMo-giga | 650,9 M | ~8192 | CC BY 4.0 | Mayor modelo de ARN, SOTA en estructura secundaria |
| RiNALMo-mega | 148,1 M | ~8192 | CC BY 4.0 | Variante media de la misma familia |
| RiNALMo-micro | 33,5 M | ~8192 | CC BY 4.0 | Variante pequeña para entornos con pocos recursos |
| DNABERT (ejemplo) | ~110 M | 512 | MIT | Modelo de ADN, no de ARN, con contexto corto |

No se han encontrado comparaciones directas con otros modelos de ARN (como RNA-MSM o RNABERT) en la información disponible. Se recomienda consultar el artículo original para una evaluación comparativa completa.

## Limitaciones y advertencias

- El modelo se preentrenó exclusivamente con ARN no codificante; su rendimiento en ARN codificante (ARNm) puede ser subóptimo.
- El vocabulario no incluye modificaciones postranscripcionales (p. ej., m6A, pseudouridina), por lo que no puede representar directamente estas variantes.
- La longitud de contexto práctica es de ~8192 tokens; aunque RoPE no impone un límite duro, secuencias más largas pueden degradar la calidad de las representaciones.
- El modelo puede presentar sesgos derivados de las bases de datos de entrenamiento, que pueden no ser representativas de toda la diversidad de ARN.
- Como todo modelo de lenguaje, puede generar predicciones plausibles pero incorrectas (alucinaciones) en tareas de generación de secuencias.
- La licencia CC BY 4.0 para los pesos permite uso comercial con atribución, pero es recomendable revisar los términos exactos antes de integrarlo en productos.
- El código personalizado de HuggingFace requiere `trust_remote_code=True`, lo que implica ejecutar código de terceros; se debe auditar antes de usar en entornos de producción.
- No es un modelo de lenguaje natural: no puede procesar texto, solo secuencias de ARN.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/RiNALMo-giga
- Colección RiNALMo en HuggingFace: https://huggingface.co/collections/Taykhoom/rinalmo-6a17c182db99be3f7a0d7bac
- Artículo original (Nature Communications): https://doi.org/10.1038/s41467-025-60872-5
- Repositorio GitHub original: https://github.com/lbcb-sci/RiNALMo
- Checkpoint original en Zenodo: https://zenodo.org/records/15043668
