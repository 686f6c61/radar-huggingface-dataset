# Supernova11c/Supernova-teraillm-reranker-v1

## Resumen

Supernova TeraLLM Reranker V1 es un modelo de reranking experimental desarrollado por el proyecto Supernova, enfocado principalmente en el idioma nepalí. Se trata de un Transformer encoder de tipo cross-encoder que puntúa la relevancia de un documento con respecto a una consulta, destinado a integrarse en pipelines de búsqueda y recuperación de información. El modelo se presenta como una línea base de producción o un modelo de investigación, con una arquitectura relativamente ligera de 202,6 millones de parámetros.

La relevancia de este modelo radica en que aborda el nepalí, un idioma con escasos recursos en el ámbito del procesamiento del lenguaje natural y la recuperación de información. Frente a alternativas multilingües generalistas, este modelo pretende ofrecer una solución específica para búsqueda semántica y reranking en nepalí, aunque sus datos de entrenamiento son limitados (un corpus de 5.043 documentos). La arquitectura es un encoder Transformer de 16 capas con una ventana de contexto no especificada, y el checkpoint publicado ocupa aproximadamente 92 MB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder) con capa de clasificación para reranking |
| Parametros totales | 202.593.281 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el test de compatibilidad usa secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder de 16 capas con tamaño oculto de 1024, feed-forward de 4096 y atención multi-cabeza con dropout de 0.1. Tras el encoder, una cabeza de ranking compuesta por dos capas lineales (1024→512 y 512→1) con activación GELU y una salida sigmoide produce la puntuación de relevancia. El tokenizador es propio y tiene un vocabulario de únicamente 4 tokens, lo que indica que el modelo es un prototipo experimental con un espacio de tokens muy reducido.

El entrenamiento se realizó a partir del dataset nepalés Bharat-NanoMSMARCO (disponible en HuggingFace como carlfeynman/Bharat_NanoMSMARCO_ne), que contiene 5.043 documentos, 50 consultas y 50 juicios de relevancia. A partir de este material se construyeron 1.500 tripletas de entrenamiento (1.000 aleatorias y 500 con hard negatives), divididas en 1.350 para entrenamiento y 150 para validación. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado con tripletas de ranking. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Reranking de documentos: puntúa la relevancia de un par consulta-documento y reordena resultados de un recuperador de primera etapa.
- Búsqueda semántica en nepalí: está específicamente entrenado para consultas y documentos en nepalí.
- Integración en pipelines RAG: puede usarse como etapa de reranking tras la recuperación inicial.
- Puntuación de relevancia: genera una puntuación entre 0 y 1 (salida sigmoide) para cada par consulta-documento.
- Capacidades multilingües limitadas: aunque se declara soporte para inglés, el entrenamiento está centrado en nepalí.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Modo de razonamiento: no disponible; es un modelo de clasificación de pares, no generativo.

## Casos de uso

- Búsqueda semántica en nepalí: el modelo puede integrarse en un sistema de búsqueda para nepalés, donde un recuperador de primera etapa devuelve un conjunto de candidatos y Supernova V1 los reordena según relevancia.
- Recuperación aumentada por generación (RAG) en nepalés: en un pipeline RAG, el modelo puede seleccionar los pasajes más relevantes para alimentar a un LLM generativo, mejorando la calidad de las respuestas en contextos nepalíes.
- Investigación en recuperación de información multilingüe: sirve como modelo de referencia para estudiar el rendimiento de cross-encoders en idiomas con pocos recursos.
- Filtrado de resultados de motores de búsqueda: puede usarse para reordenar los resultados de un motor de búsqueda nepalí según la consulta del usuario.
- Sistemas de atención al cliente en nepalés: para clasificar documentos de soporte relevantes a una consulta de un usuario nepalí, reduciendo el tiempo de respuesta.
- Evaluación de relevancia de documentos en corpus nepalíes: el modelo puede puntuar automáticamente la relevancia de documentos en tareas de clasificación o etiquetado de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o MSMARCO) en la información disponible. La model card incluye un benchmark interno de tres ejemplos comparando Supernova V1 con Jina Reranker V3 en tres categorías: matiz histórico, lógica geográfica y extracción de jerga/intención. Los resultados se muestran a continuación:

| Categoría | Supernova V1 | Jina Reranker V3 |
|---|---|---|
| Matiz histórico | PASS | PASS |
| Lógica geográfica | PASS | PASS |
| Jerga / intención | FAIL | FAIL |
| Precisión por pares | 2/3 (66,67%) | 2/3 (66,67%) |

El margen medio positivo-negativo fue de +0,001901 para Supernova V1 y +0,140182 para Jina-v3, lo que indica que Jina produjo márgenes de separación mucho mayores en este experimento. La latencia media en CPU fue de 2,8418 segundos por ejemplo para Supernova frente a 29,4593 segundos para Jina-v3, aunque estas mediciones son específicas del entorno experimental y no son comparables directamente.

## Requisitos de hardware

- VRAM estimada: no disponible; el checkpoint pesa ~92 MB, por lo que es probable que quepa en GPU de consumo con al menos 4 GB de VRAM en FP16 (aunque el tamaño en memoria depende de la cuantización).
- GPU recomendadas: no se especifica ninguna; dado el tamaño del modelo, podría funcionar en una RTX 3060 o superior. No se requiere una GPU de datacenter para inferencia.
- Compatibilidad con GPU de consumo: sí, probablemente en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: PyTorch nativo, aunque podría adaptarse a vLLM o TGI si se convierte a formato compatible. No se mencionan cuantizaciones GGUF ni soporte para llama.cpp.
- Latencia y throughput: en el benchmark interno, la latencia media en CPU fue de 2,84 segundos por ejemplo, pero no se han medido en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supernova TeraLLM Reranker V1 | 202,6 M | no disponible | ne, en | Apache-2.0 | HuggingFace |
| Jina Reranker V3 | no disponible | no disponible | multilingüe | no disponible | HuggingFace |
| Otros rerankers (p. ej., BGE-Reranker) | no disponible | no disponible | multilingüe | no disponible | HuggingFace |

La comparación con Jina Reranker V3 se basa únicamente en el benchmark interno de 3 ejemplos, donde ambos modelos empatan en precisión (2/3), pero Jina muestra un margen de puntuación mucho mayor. No se dispone de datos públicos sobre Jina-v3 para verificar la comparación. No se han identificado otros modelos comparables con datos concretos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo en conjuntos de datos diversos; es probable que tenga sesgos derivados del pequeño corpus de entrenamiento (5.043 documentos).
- Riesgo de alucinación: al ser un reranker, no genera texto, por lo que el riesgo de alucinación no aplica directamente; sin embargo, la puntuación de relevancia puede ser poco fiable fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; el test de compatibilidad usa secuencias de 128 tokens, lo que sugiere que el modelo no maneja documentos largos.
- Vocabulario extremadamente reducido (4 tokens): el tokenizador tiene un vocabulario de solo 4 tokens, lo que indica que el modelo es un prototipo y no es utilizable en producción real sin un tokenizador adecuado.
- Limitaciones de idioma: aunque se declara multilingüe (ne, en), el entrenamiento se centra en nepalí; el rendimiento en inglés no está verificado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el dataset Bharat-NanoMSMARCO ne tiene licencia CC-BY-4.0, que exige atribución y puede tener condiciones adicionales.
- Advertencia de producción: el modelo se presenta como "experimental" y la comparación con Jina-v3 no demuestra superioridad; se requiere evaluación independiente a mayor escala antes de usar en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Supernova11c/Supernova-teraillm-reranker-v1)
- [Dataset Bharat-NanoMSMARCO nepalí](https://huggingface.co/datasets/carlfeynman/Bharat_NanoMSMARCO_ne)
- [Dataset Supernova TeraLLM (datasets de HuggingFace)](https://huggingface.co/datasets/Supernova11c/Supernova-teraillm)
- [Supernova TeraLLM Embedding V2 (modelo de embeddings del mismo proyecto)](https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V2)
- [Awesome Rerankers (lista de modelos de reranking en GitHub)](https://github.com/agentset-ai/awesome-rerankers)
- [Top 5 Reranking Models to Improve RAG Results (artículo en Machine Learning Mastery)](https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/)
- [Rerankers - librería unificada de reranking (GitHub)](https://github.com/AnswerDotAI/rerankers)
