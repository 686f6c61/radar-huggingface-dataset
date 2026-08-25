# Taykhoom/RNAErnie2

## Resumen

RNAErnie2 es un modelo de lenguaje especializado en secuencias de ARN, desarrollado por Taykhoom como una reimplementación y extensión del modelo RNAErnie original (Wang et al., 2024). Se basa en una arquitectura BERT estándar (Post-LN) entrenada desde cero con el objetivo de masked language modelling (MLM) sobre el corpus RNACentral v22, que contiene aproximadamente 31 millones de secuencias de ARN de longitud menor o igual a 2048 nucleótidos. El modelo está diseñado para tareas de representación y predicción de secuencias de ARN, como la generación de embeddings por token o por secuencia, y el relleno de posiciones enmascaradas.

La relevancia de RNAErnie2 radica en que sustituye el backbone original basado en PaddlePaddle por una implementación PyTorch estándar de BERT, lo que facilita su integración en el ecosistema Hugging Face y permite usar backends de atención modernos como SDPA y Flash Attention 2. Además, amplía la longitud de contexto de 512 a 2048 tokens y adopta un vocabulario nativo de ARN (con uracilo U en lugar de timina T), corrigiendo una limitación del modelo original. Con 87,2 millones de parámetros y una ventana de contexto de 2048 tokens, RNAErnie2 es un modelo compacto y eficiente para tareas de biología computacional que requieren procesar secuencias de ARN de longitud media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Post-LN BERT (BertForMaskedLM) |
| Parametros totales | 87.230.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no aplicable (modelo de secuencias biologicas, no idiomas humanos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RNAErnie2 sigue la arquitectura BERT base: 12 capas transformer, 12 cabezas de atención, dimensión de embedding de 768 y FFN oculto de 3072 con activación GELU. Usa codificación posicional absoluta aprendida, normalización Post-LN con epsilon 1e-5 y un vocabulario de 11 tokens: `[PAD]`, `[UNK]`, `[CLS]`, `[EOS]`, `[SEP]`, `[MASK]` y las bases A, U, C, G, N. El tokenizador convierte silenciosamente cualquier T de entrada en U, lo que garantiza consistencia con el alfabeto de ARN.

El entrenamiento se realizó con el objetivo de MLM sobre RNACentral v22, con aproximadamente 31 millones de secuencias de longitud menor o igual a 2048. Los pesos iniciales provienen del checkpoint público de RNAErnie (LLM-EDA/RNAErnie), con un único ajuste: el bias del decodificador de predicción (`cls.predictions.decoder.bias`) se almacena explícitamente, ya que en el guardado original estaba implícitamente atado a `cls.predictions.bias` y ausente del archivo. La implementación incluye una clase personalizada (`modeling_rnaernie2.py`) con soporte para atención eager, SDPA y Flash Attention 2. Se verificó la paridad de las representaciones ocultas y los logits de MLM con el `BertForMaskedLM` original, con una diferencia máxima absoluta inferior a 2e-5 en los 13 niveles de representación (embedding + 12 capas).

## Capacidades

- Generación de embeddings de secuencia y de token: produce representaciones de 768 dimensiones para cada posición y un embedding CLS para la secuencia completa.
- Relleno de posiciones enmascaradas (MLM): predice la base nucleotídica en posiciones `[MASK]`, útil para tareas de imputación o corrección de secuencias.
- Extracción de representaciones de capas intermedias: permite obtener embeddings de cualquier capa (por ejemplo, capa 6) para análisis de características jerárquicas.
- Soporte de atención eficiente: compatible con SDPA y Flash Attention 2 para acelerar la inferencia en GPU.
- Fine-tuning estándar de Hugging Face: se puede adaptar a tareas de clasificación de secuencias usando el embedding CLS como entrada a una cabeza de clasificación.
- Vocabulario nativo de ARN: maneja exclusivamente las bases A, U, C, G y N, con conversión automática de T a U.

## Casos de uso

- Clasificación de ARN no codificante (ncRNA): el embedding CLS puede alimentar un clasificador para distinguir tipos de ncRNA (miRNA, lncRNA, snoRNA, etc.), aprovechando el preentrenamiento en RNACentral que incluye anotaciones de tipo.
- Predicción de estructura secundaria de ARN: los embeddings por token pueden usarse como entrada a modelos de plegamiento (por ejemplo, predictores de pares de bases) para inferir la estructura secundaria a partir de la secuencia.
- Detección de sitios de unión a proteínas: las representaciones de contexto largo (2048 tokens) permiten modelar regiones flanqueantes extensas, mejorando la identificación de motivos de unión en ARN.
- Imputación de bases faltantes en secuencias: mediante MLM, el modelo puede predecir nucleótidos enmascarados en secuencias parcialmente degradadas o con errores de secuenciación.
- Análisis de variantes patogénicas: fine-tuning sobre datos de mutaciones asociadas a enfermedades para clasificar variantes de ARN como benignas o patogénicas, usando el contexto de 2048 nucleótidos.
- Generación de representaciones para búsqueda de similitud: los embeddings de secuencia pueden indexarse para recuperar ARN homólogos o funcionalmente relacionados en bases de datos grandes.
- Preentrenamiento de modelos downstream: las representaciones de capas intermedias pueden servir como características de entrada para modelos más complejos (por ejemplo, redes neuronales convolucionales o grafos) en tareas de biología estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas comparativas (como MMLU, HumanEval o tareas específicas de ARN) frente a otros modelos. Se recomienda consultar el artículo original de RNAErnie (Wang et al., 2024) para resultados en tareas downstream, aunque RNAErnie2 es una reimplementación con cambios de arquitectura y datos que pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87,2 millones de parámetros en fp32, el modelo ocupa aproximadamente 349 MB de memoria. En fp16 o bf16, unos 175 MB. Cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de consumo como NVIDIA RTX 3060, RTX 4090, o incluso GPUs integradas con suficiente memoria. Para entrenamiento o fine-tuning con lotes grandes, se recomienda una GPU con 8 GB o más.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que se puede ejecutar en GPU de gama baja e incluso en CPU para inferencia de secuencias cortas.
- Opciones de despliegue: al ser un modelo de Hugging Face con `trust_remote_code=True`, se puede usar con transformers estándar. También es compatible con vLLM, TGI y llama.cpp si se exporta a GGUF (aunque no se proporcionan cuantizaciones oficiales). Para producción, se recomienda usar SDPA o Flash Attention 2 para reducir la latencia.
- Latencia y throughput estimados: no disponible. Dado el tamaño, se espera una latencia de milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| RNAErnie2 (este) | 87,2 M | 2048 | BERT Post-LN | RNACentral v22 (~31M seqs) | Apache 2.0 |
| RNAErnie (original) | no disponible | 512 | ERNIE (PaddlePaddle) | RNACentral (nts<=512) | Apache 2.0 |
| DNABERT-2 | no disponible | no disponible | BERT | no disponible | no disponible |

La comparativa con DNABERT-2 no está disponible en la información proporcionada. RNAErnie2 mejora a RNAErnie original en longitud de contexto (2048 vs 512) y en la adopción de un vocabulario de ARN nativo (U en lugar de T), además de usar una implementación PyTorch estándar que facilita su uso en el ecosistema Hugging Face.

## Limitaciones y advertencias

- El pooler (`pooler.dense`) no se incluye en los pesos guardados; si se usa `add_pooling_layer=True` (por defecto), el pooler queda con pesos aleatorios. No se debe usar `pooler_output` sin fine-tuning previo.
- El modelo está entrenado exclusivamente para secuencias de ARN; no es adecuado para ADN o ARN con modificaciones químicas no estándar.
- La conversión automática de T a U puede ser problemática si se introducen secuencias de ADN por error, ya que el modelo no distingue entre ambas.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como todo modelo de lenguaje, puede generar predicciones incorrectas en regiones de baja cobertura del corpus.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la fuente de datos (RNACentral) para asegurar el cumplimiento de sus condiciones de uso.
- El modelo no soporta tareas de generación de secuencias de ARN de novo; su objetivo es representación y MLM, no generación autoregresiva.
- La verificación de paridad se realizó con PyTorch 2.7 / CUDA 12; versiones anteriores pueden presentar diferencias numéricas menores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Taykhoom/RNAErnie2)
- [RNAErnie original en Hugging Face](https://huggingface.co/LLM-EDA/RNAErnie)
- [RNAErnie (versión de Taykhoom)](https://huggingface.co/Taykhoom/RNAErnie)
- [Colección RNAErnie](https://huggingface.co/collections/Taykhoom/rnaernie-6a219927c11fdcccedb243db)
- [Repositorio oficial RNAErnie en GitHub](https://github.com/CatIIIIIIII/RNAErnie)
- [Artículo en Nature Machine Intelligence](https://www.nature.com/articles/s42256-024-00836-4)
- [Implementación de referencia BERT-updated](https://huggingface.co/Taykhoom/BERT-updated)
