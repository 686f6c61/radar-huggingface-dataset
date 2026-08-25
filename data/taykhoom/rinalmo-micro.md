# Taykhoom/RiNALMo-micro

## Resumen

RiNALMo-micro es un port minimalista a HuggingFace de la variante micro (33,5 millones de parámetros) de RiNALMo, un modelo de lenguaje para ARN (ácido ribonucleico) desarrollado por Penić et al. y publicado en Nature Communications en 2025. El modelo original fue preentrenado sobre 36 millones de secuencias de ARN no codificante mediante enmascaramiento de tokens (BERT-style), con el objetivo de capturar información estructural y funcional de las secuencias de ARN. Este port, creado por Taykhoom, reproduce bit-exact las representaciones del checkpoint original y expone la arquitectura a través de la API estándar de transformers, lo que facilita su uso en pipelines de bioinformática.

La relevancia actual de este modelo radica en que los modelos de lenguaje biológicos específicos de dominio están demostrando ser herramientas eficaces para tareas de predicción de estructura y función de ARN, un campo con aplicaciones directas en el diseño de fármacos, la edición genética y la comprensión de enfermedades. Al ser la variante más pequeña de la familia RiNALMo, micro ofrece un punto de entrada rápido y ligero para experimentación, mientras que las variantes mega (148,1 M) y giga (650,9 M) proporcionan representaciones más potentes a costa de mayor coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pre-LN Transformer con FFN SwiGLU |
| Parametros totales | 33.491.218 (según safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ~8192 tokens (práctico; RoPE sin límite duro) |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16; compatible con cuantización estándar de transformers) |
| Idiomas soportados | no aplica (vocabulario de nucleótidos ARN, 22 tokens) |
| Licencia | CC BY 4.0 (pesos), Apache 2.0 (código) |
| Formato de pesos | safetensors, compatible con transformers |

## Arquitectura y entrenamiento

RiNALMo-micro es un transformer Pre-LN de 12 capas con 20 cabezas de atención, dimensión de embedding de 480 y FFN oculto de 1280 dimensiones con activación SwiGLU. La codificación posicional usa RoPE (base=10000, no intercalada) y la normalización es LayerNorm con épsilon 1e-5. El vocabulario consta de 22 tokens: tokens especiales (`<cls>`, `<pad>`, `<eos>`, `<unk>`, `<mask>`) y 17 símbolos de nucleótidos que incluyen los estándar A, C, G, T, U (convertido a T) y códigos de ambigüedad IUPAC (R, Y, K, M, S, W, B, D, H, V, N) más el carácter `-` para huecos. El tokenizador convierte U a T antes de codificar, ya que el modelo fue entrenado con T.

El entrenamiento utilizó el objetivo de modelado de lenguaje enmascarado (MLM) con una tasa de enmascaramiento del 15%, sobre 36 millones de secuencias de ARN no codificante procedentes de múltiples bases de datos. El checkpoint original (`rinalmo_micro_pretrained.pt`) se obtuvo de Zenodo. Una particularidad técnica destacable es que el modelo emplea una variante no estándar de Pre-LN: la conexión residual de atención se toma de la entrada normalizada (`x = attn_ln(x); x = x + attn(x)`), mientras que el FFN usa Pre-LN estándar. Además, se aplica TokenDropout que reescala las embeddings por `(1 - mask_ratio_train) / (1 - mask_ratio_observed)` incluso en inferencia, consistente con el código de entrenamiento original. El port verifica paridad bit-exact (diferencia máxima absoluta = 0.00) en los 13 niveles de representación (embedding + 12 capas) frente a una referencia PyTorch pura.

## Capacidades

- Generación de embeddings de secuencias de ARN: produce representaciones por token (dimensión 480) y una representación CLS para la secuencia completa.
- Modelado de lenguaje enmascarado: puede predecir nucleótidos enmascarados en una secuencia, útil para tareas de imputación o corrección.
- Captura de información estructural: el paper original demuestra que las representaciones aprendidas generalizan bien a tareas de predicción de estructura secundaria de ARN.
- Extracción de representaciones de capas intermedias: permite obtener embeddings de cualquier capa (por ejemplo, capa 6) para análisis o fine-tuning.
- Compatibilidad con backends de atención acelerados: soporta eager, SDPA (PyTorch 2.0+) y Flash Attention 2 mediante el parámetro `attn_implementation`.
- Fine-tuning estándar de HuggingFace: se puede adaptar a tareas de clasificación de secuencias o de tokens usando el CLS o pooling sobre posiciones no padding.

## Casos de uso

- Predicción de estructura secundaria de ARN: el modelo puede fine-tuning en datasets como ArchiveII o RNAStrAlign para predecir pares de bases (bucles, horquillas, pseudonudos). Su capacidad de generalización a estructuras no vistas es el principal argumento del paper original.
- Clasificación de tipos de ARN no codificante: distinguir entre lncRNA, miRNA, snoRNA, etc., usando el embedding CLS como entrada a un clasificador lineal o MLP.
- Detección de sitios de unión a proteínas: fine-tuning sobre datos de interacción ARN-proteína (por ejemplo, RBPmap) para identificar regiones de unión en secuencias largas.
- Análisis de variantes patogénicas: evaluar el impacto de mutaciones puntuales en la representación del modelo (cambio en embeddings) para priorizar variantes en estudios de enfermedades genéticas.
- Imputación de secuencias incompletas: usar la cabeza MLM para rellenar huecos o corregir errores de secuenciación en datos de ARN.
- Generación de características para pipelines de aprendizaje automático: extraer embeddings de capas intermedias como features para modelos downstream (SVM, random forest) en tareas de anotación funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (Penić et al., Nature Communications 2025) reporta que RiNALMo alcanza rendimiento de última generación en múltiples tareas de predicción de estructura de ARN, pero los valores numéricos concretos no están incluidos en la documentación del port. Se recomienda consultar el artículo para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 33,5 millones de parámetros, el modelo ocupa aproximadamente 134 MB en fp32, 67 MB en bf16 y unos 17 MB en cuantización de 4 bits. Cabe holgadamente en cualquier GPU consumer (incluso en GPUs integradas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia en lote y fine-tuning ligero. Para fine-tuning completo, se recomienda al menos 8 GB de VRAM.
- Despliegue en CPU: viable para inferencia de secuencias cortas; el modelo es lo bastante pequeño para ejecutarse en CPU sin problemas de latencia apreciables.
- Opciones de despliegue: compatible con transformers estándar, vLLM (si se convierte a formato adecuado), llama.cpp (requiere conversión a GGUF, no incluida), y Ollama (no soportado nativamente para modelos de biología). El uso recomendado es mediante la API de transformers con `trust_remote_code=True`.
- Latencia y throughput: no se han publicado mediciones específicas. Dado el tamaño, se espera una latencia de milisegundos por secuencia en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RiNALMo-micro (este) | 33,5 M | ~8192 | CC BY 4.0 | HuggingFace |
| RiNALMo-mega | 148,1 M | ~8192 | CC BY 4.0 | HuggingFace |
| RiNALMo-giga | 650,9 M | ~8192 | CC BY 4.0 | HuggingFace |

Los tres modelos comparten arquitectura y vocabulario; la diferencia está en el número de capas y dimensiones. RiNALMo-micro es el más rápido y ligero, adecuado para prototipado y tareas con recursos limitados. RiNALMo-giga ofrece las representaciones más potentes según el paper, pero requiere más VRAM (aproximadamente 2,6 GB en fp32). No se dispone de comparativas con otros modelos de ARN como DNABERT-2 o Evo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado exclusivamente con secuencias de ARN no codificante, por lo que su rendimiento en ARN codificante (ARNm) o en secuencias con modificaciones epitranscriptómicas puede ser subóptimo.
- Riesgo de alucinación: como modelo de lenguaje enmascarado, las predicciones de nucleótidos enmascarados son probabilísticas y pueden no corresponder a la realidad biológica; no debe usarse para anotación clínica sin validación experimental.
- Limitaciones de contexto: aunque RoPE no impone un límite duro, la longitud práctica de ~8192 tokens puede ser insuficiente para ARN largos (por ejemplo, ARN mensajeros completos); se recomienda segmentar secuencias largas.
- Restricciones de licencia: la licencia CC BY 4.0 para los pesos permite uso comercial con atribución, pero el código del port está bajo Apache 2.0. Es obligatorio citar el paper original en publicaciones derivadas.
- Caveat de producción: el modelo requiere `trust_remote_code=True` en HuggingFace, lo que implica ejecutar código personalizado; se recomienda auditar el código antes de usarlo en entornos de producción.
- TokenDropout en inferencia: el reescalado de embeddings por TokenDropout puede afectar a la magnitud de las representaciones; los usuarios deben ser conscientes de esta particularidad al comparar embeddings entre modelos.

## Enlaces

- HuggingFace: https://huggingface.co/Taykhoom/RiNALMo-micro
- Colección RiNALMo: https://huggingface.co/collections/Taykhoom/rinalmo
- Paper original (Nature Communications): https://www.nature.com/articles/s41467-025-60872-5
- Repositorio GitHub original: https://github.com/lbcb-sci/RiNALMo
- Checkpoint original en Zenodo: https://zenodo.org/records/15043668
