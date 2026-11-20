# tencent/EVIE-4.5B

## Resumen

EVIE-4.5B (Evidence-Vector-Informed Embedding) es un modelo de recuperación visual de documentos (visual document retrieval) desarrollado por Tencent. No es un modelo generativo: es un codificador bi-direccional construido sobre una columna vertebral Qwen3.5 que transforma consultas de texto e imágenes de páginas de documento en representaciones multi-vector mediante interacción tardía (late interaction) tipo ColBERT, puntuadas con MaxSim. Resuelve el problema de recuperar información en documentos con estructura visual compleja (tablas, gráficos, maquetación densa, tipografía pequeña) donde los embeddings densos de vector único pierden detalle.

El modelo cuenta con 4.544.510.464 parámetros (aproximadamente 4,5B) y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 9,1 GB. Es la variante "student" destilada del modelo insignia EVIE-8B, y su interés actual radica en que combina dos innovaciones prácticas: Prefix-MRL, que permite truncar en tiempo de ejecución la dimensión de los embeddings a {64, 128, 256, 512, 1024, 2048} sin mantener cabezas separadas, y HAC (Hierarchical Agglomerative Clustering), una compresión de tokens sin entrenamiento que reduce el índice a 32 vectores por página y unos 3,81 GiB por millón de páginas.

En el leaderboard ViDoRe V3 alcanza 66,02 en la métrica Mean (Task) con proyección simple Prefix-MRL, situándose justo por detrás de EVIE-8B (66,24 en la tabla del leaderboard y 66,75 citado en los highlights). Está integrado en la librería `colpali-engine` y evaluado sobre ViDoRe V1, V2, V3 y JinaVDR en 138 tareas multilingües.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language bi-direccional sobre backbone Qwen3.5; recuperación multi-vector con late interaction (ColBERT/MaxSim) |
| Parametros totales | 4.544.510.464 (~4,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (evaluado en 138 tareas multilingües según la model card, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `colpali-engine`) |

## Arquitectura y entrenamiento

EVIE-4.5B sigue el paradigma de recuperación multi-vector con interacción tardía. La consulta de texto y la imagen del documento se codifican por separado con una columna vertebral ColQwen3.5 (atención bi-direccional para la consulta, codificador visual para el documento), generando conjuntos de vectores por token. La relevancia se calcula con MaxSim: para cada token de la consulta se toma el máximo producto escalar contra los tokens del documento y se suman los resultados. Esto preserva detalle visual fino que un embedding denso de vector único colapsaría.

La innovación principal es Prefix-MRL: una única proyección lineal de 2048 dimensiones que admite truncamiento en tiempo de ejecución a {64, 128, 256, 512, 1024, 2048} sin checkpoints ni cabezas adicionales. El entrenamiento del student de 4,5B se realiza mediante ARD (Anchor-preserving Relation Distillation) desde el teacher EVIE-8B, con destilación de geometría topológica de relaciones entre tokens, calibración de márgenes con negativos duros y alineamiento con anclas, de modo que la precisión se mantiene incluso con prefijos de baja dimensión. Sobre el índice se aplica HAC, un algoritmo de compresión de tokens sin entrenamiento que agrupa los parches visuales en 32 o 64 centroides semánticos en el espacio conjunto de características y posición. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las referencias a ViDoRe y JinaVDR.

## Capacidades

- Recuperación visual de documentos (visual document retrieval): emparejamiento texto-imagen de página con puntuación MaxSim a nivel de token.
- Representación multi-vector con interacción tardía, adecuada para tablas, gráficos, maquetación compleja y tipografía pequeña.
- Embeddings elásticos por truncamiento de dimensión en inferencia (64 a 2048 dimensiones) con una sola proyección.
- Compresión de índice con HAC: reducción de aproximadamente 750 tokens a 32 vectores por página.
- Evaluación multilingüe en 138 tareas (ViDoRe V1, V2, V3 y JinaVDR) en cuatro familias de métricas (nDCG, Recall, MAP, MRR @1/5/10).
- Integración con `colpali-engine` y compatibilidad declarada con `sentence-transformers`.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Es un codificador de recuperación.

## Casos de uso

- Búsqueda empresarial sobre repositorios de PDF escaneados: indexación de páginas como imágenes y recuperación por consulta textual, aprovechando que el modelo evita depender de OCR y preserva la maquetación original.
- Recuperación en documentación financiera: localización de cifras en tablas y estados contables donde el detalle visual y la posición de las celdas son determinantes para la relevancia.
- Atención al cliente sobre manuales y catálogos técnicos: recuperación de la página exacta que contiene un diagrama, una especificación o un procedimiento, con el modelo como etapa de retrieval previa a un generador.
- Búsqueda científica y legal: localización de fragmentos en artículos con figuras, ecuaciones y referencias cruzadas, donde el texto plano extraído pierde estructura.
- Despliegue a gran escala con restricciones de almacenamiento: uso de HAC para mantener índices de millones de páginas en torno a 3,81 GiB por millón, viable en infraestructura modesta.
- Sistemas RAG multimodales: el modelo actúa como recuperador y entrega las páginas candidatas a un VLM generativo para la respuesta final.
- Ajuste del coste de recuperación por consulta: truncamiento de la dimensión de embedding a 64 o 128 para etapas de filtrado rápido y a 2048 para la reordenación final, sin cambiar de modelo.

## Benchmarks y rendimiento

Datos publicados en la model card (ViDoRe V3, métrica Mean Task):

| Modelo | Parámetros | Mean (Task) |
|---|---|---|
| tencent/EVIE-8B | 8,4B | 66,24 (tabla del leaderboard); 66,75 citado en highlights |
| tencent/EVIE-4.5B | ~4,5B | 66,02 |

No se han publicado en la información disponible resultados desglosados por tarea para MMLU, HumanEval, GSM8K ni benchmarks de generación, que no aplican a este tipo de modelo. Tampoco se detallan cifras por métrica (nDCG, Recall, MAP, MRR) para EVIE-4.5B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un codificador de ~4,5B en fp16 requiere del orden de 9-10 GB solo para pesos; el consumo real depende de la resolución de página y del número de parches procesados.
- GPU recomendadas: no especificadas por el autor. Por tamaño, caben en A100, H100, L40S y en GPUs de consumo con 16 GB o más en precisión reducida.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) y RTX 4080/A5000 (16 GB) en fp16 o cuantización; no confirmado por el autor.
- Opciones de despliegue: `colpali-engine` (librería oficial declarada) y `sentence-transformers`; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles.
- Almacenamiento del índice: 3,81 GiB por millón de páginas con HAC a 32 vectores por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ViDoRe V3 (Mean Task) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tencent/EVIE-4.5B | ~4,5B | no disponible | 66,02 | Apache 2.0 | Hugging Face, `colpali-engine` |
| tencent/EVIE-8B | 8,4B | no disponible | 66,24 | Apache 2.0 (según model card del ecosistema) | Hugging Face, `colpali-engine` |
| ColPali / ColQwen (familia base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face, `colpali-engine` |

La información disponible solo permite comparar con precisión dentro de la propia familia EVIE. La comparación con ColPali, ColQwen u otros recuperadores visuales de la literatura no está respaldada por datos en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto; solo genera embeddings de recuperación.
- Riesgo de sesgo y alucinación: no aplica alucinación generativa, pero la recuperación puede devolver páginas irrelevantes con alta puntuación en dominios alejados de la distribución de entrenamiento.
- Idiomas: la model card menciona 138 tareas multilingües, pero no publica el listado de idiomas soportados; conviene validar el rendimiento en el idioma objetivo antes de producción.
- Longitud de contexto y resolución máxima de imagen no documentadas en la información disponible.
- El rendimiento reportado (66,02) corresponde a la configuración con proyección Prefix-MRL; el truncamiento agresivo a 64 dimensiones puede degradar la precisión y debe calibrarse por caso de uso.
- HAC es una compresión con pérdida de granularidad: 32 vectores por página reducen el índice pero pueden penalizar la recuperación de detalles muy localizados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de entrenamiento (ViDoRe, JinaVDR) si se redistribuyen derivados.
- Dependencia de la librería `colpali-engine`; no se confirma compatibilidad con stacks de inferencia genéricos.
- El repositorio ocupa 9,1 GB, lo que implica requisitos de almacenamiento y transferencia considerables para despliegues en el borde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/EVIE-4.5B
- Modelo insignia EVIE-8B: https://huggingface.co/tencent/EVIE-8B
- Modelo base (preview): https://huggingface.co/tencent/EVIE-Preview-4.5B
- Repositorio GitHub: https://github.com/Tencent/EVIE
- Paper (arXiv): https://arxiv.org/abs/2610.11553
- Leaderboard ViDoRe: https://huggingface.co/spaces/vidore/vidore-leaderboard
- Ficha en Papers with Code: https://paperswithcode.co/paper/114151
- Dataset ViDoRe Benchmark: https://huggingface.co/datasets/vidore/vidore_benchmark
- Dataset ViDoRe Benchmark V2: https://huggingface.co/datasets/vidore/vidore_benchmark_v2
- Dataset JinaVDR: https://huggingface.co/datasets/jinaai/jina-vdr
- Backbone Qwen2.5-VL (referenciado en la model card): https://github.com/QwenLM/Qwen2.5-VL
