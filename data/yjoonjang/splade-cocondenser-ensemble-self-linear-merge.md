# yjoonjang/splade-cocondenser-ensemble-self-linear-merge

## Resumen

Este modelo es una demostración técnica de la funcionalidad de fusión de modelos (`SparseEncoder.merge`) incorporada en la librería Sentence Transformers. Combina mediante fusión lineal (pesos 0,5 y 0,5) dos checkpoints SPLADE de Naver: `splade-cocondenser-ensembledistil` y `splade-cocondenser-selfdistil`. El resultado es un codificador disperso que produce embeddings léxicos de 30.522 dimensiones (el vocabulario de BERT) para búsqueda semántica y recuperación de información.

La arquitectura subyacente es un transformer encoder basado en DistilBERT (~133 millones de parámetros), que genera representaciones dispersas en lugar de densas. Es relevante como ejemplo de cómo fusionar modelos SPLADE mediante la API nativa de Sentence Transformers, pero no es un modelo afinado para ninguna tarea específica. Su utilidad práctica es limitada fuera del ámbito de experimentación con fusión de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con cabeza de proyección dispersa SPLADE |
| Parametros totales | 132.986.228 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos base SPLADE cocondenser usan típicamente 256 tokens, pero no se especifica en este modelo) |
| Tipos de cuantizacion | safetensors en float16 (según el proceso de fusión documentado) |
| Idiomas soportados | no disponible (los modelos base SPLADE cocondenser están entrenados principalmente en inglés, pero no se confirma en la tarjeta) |
| Licencia | no disponible (los modelos base SPLADE cocondenser tienen licencia no comercial según la nota del autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de los pesos de dos checkpoints SPLADE cocondenser de Naver, con pesos iguales (0,5 y 0,5) y método `linear`. La fusión se realizó con la API `SparseEncoder.merge` de Sentence Transformers, que combina los tensores de los modelos base directamente, sin entrenamiento adicional. El resultado es un modelo intermedio que hereda la arquitectura SPLADE: un encoder transformer (DistilBERT) que proyecta cada token a una representación dispersa sobre el vocabulario de BERT, y agrega las activaciones para producir un vector disperso de 30.522 dimensiones.

Los modelos base son SPLADE cocondenser, que se entrenaron con un objetivo de condensación de representaciones dispersas y destilación, respectivamente. La fusión no introduce ninguna innovación arquitectónica; es un experimento de combinación de pesos para evaluar si el modelo resultante conserva las capacidades de recuperación de los originales. El proceso de creación está documentado en la tarjeta del modelo con el código de fusión.

## Capacidades

- Búsqueda semántica dispersa: produce embeddings léxicos de alta dimensionalidad que permiten recuperar documentos por coincidencia de términos expandidos.
- Recuperación de pasajes y documentos: útil para sistemas de retrieval en pipeline de RAG o búsqueda híbrida.
- Generación de embeddings de frases y párrafos mediante la API de Sentence Transformers (`SparseEncoder.encode`).
- Cálculo de similaridad entre textos con `model.similarity()`.
- Integración con el ecosistema de Sentence Transformers y Text Embeddings Inference.
- No es un modelo generativo: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica de documentos: el modelo puede indexar y recuperar pasajes relevantes en una colección de documentos, aprovechando la representación dispersa para consultas por similitud léxica expandida.
- Componente de retrieval en sistemas RAG: integrado en un pipeline de generación aumentada, puede seleccionar los pasajes más relevantes antes de pasarlos a un modelo generativo.
- Búsqueda híbrida (densa + dispersa): combinar los embeddings dispersos con embeddings densos de otro modelo para mejorar la precisión en búsqueda híbrida.
- Detección de duplicados y near-duplicates: comparar documentos mediante similaridad de embeddings dispersos para identificar contenidos redundantes.
- Clasificación de textos por similitud: agrupar o etiquetar textos según su cercanía semántica, por ejemplo en sistemas de organización documental.
- Experimentación con fusión de modelos: como ejemplo de referencia para evaluar cómo la fusión lineal de pesos afecta al rendimiento de los modelos SPLADE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye evaluaciones en MMLU, HumanEval, GSM8K ni otros conjuntos estándar, y al ser un modelo de embeddings dispersos, los benchmarks típicos de modelos generativos no aplican directamente. No se dispone de datos de rendimiento en tareas de retrieval (como BEIR o MS MARCO) para este modelo específico.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~133 millones de parámetros y el checkpoint en float16 ocupa aproximadamente 266 MB. La inferencia puede ejecutarse en CPU con memoria RAM suficiente (unos 0,5 GB de RAM para los pesos).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia rápida en batch.
- Despliegue en CPU: viable con latencia aceptable para volúmenes moderados de consultas (decenas de documentos por segundo).
- Opciones de despliegue: Sentence Transformers (API nativa), Text Embeddings Inference (TEI) para endpoints, o exportación a ONNX para inferencia optimizada en CPU/GPU.
- Latencia estimada: no disponible; depende del hardware y del tamaño de los documentos de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia |
|---|---|---|---|---|
| yjoonjang/splade-cocondenser-ensemble-self-linear-merge | 133M | no disponible | SPLADE disperso | no disponible (base no comercial) |
| naver/splade-cocondenser-ensembledistil | 133M | no disponible | SPLADE disperso | no comercial |
| naver/splade-cocondenser-selfdistil | 133M | no disponible | SPLADE disperso | no comercial |
| naver/splade-v3 | ~110M | no disponible | SPLADE disperso | no comercial |

La comparativa se limita a modelos de la familia SPLADE, ya que no hay datos de benchmarks para este modelo. La diferencia principal respecto a los base es que este es una fusión lineal de los dos, sin entrenamiento adicional.

## Limitaciones y advertencias

- Modelo de demostración: no está afinado para ninguna tarea específica; su rendimiento en retrieval real no está validado.
- Licencia no comercial: los modelos base SPLADE cocondenser tienen restricciones de uso comercial según su tarjeta de modelo; esto se hereda en este derivado.
- Idioma limitado: los modelos base están entrenados principalmente en inglés; no se garantiza rendimiento en otros idiomas.
- Contexto corto: la arquitectura SPLADE basada en DistilBERT tiene un límite de contexto de tokens de entrada (típicamente 256), lo que limita el procesamiento de documentos largos.
- Riesgo de alucinación: no aplica al ser un modelo de embeddings, no generativo.
- Sin garantías de producción: al ser un experimento de fusión, no se recomienda su uso en entornos productivos sin validación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yjoonjang/splade-cocondenser-ensemble-self-linear-merge
- Modelo base 1: https://huggingface.co/naver/splade-cocondenser-ensembledistil
- Modelo base 2: https://huggingface.co/naver/splade-cocondenser-selfdistil
- Repositorio SPLADE de Naver: https://github.com/naver/splade
- Librería Sentence Transformers: https://github.com/UKPLab/sentence-transformers
