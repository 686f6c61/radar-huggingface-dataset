# tencent/EVIE-4.5B

## Resumen

EVIE-4.5B es un modelo de recuperación de documentos visuales (visual document retrieval) desarrollado por Tencent. Su nombre completo, Evidence-Vector-Informed Embedding, refleja su objetivo: generar representaciones vectoriales de páginas de documentos que conserven la evidencia visual necesaria para una recuperación precisa. El modelo se basa en el backbone Qwen3.5-4B y utiliza un paradigma de interacción tardía multi-vector (late-interaction multi-vector), inspirado en ColBERT, que puntúa la relevancia entre consulta y documento mediante MaxSim. Con 4.544.510.464 parámetros, EVIE-4.5B es la versión ligera del modelo insignia EVIE-8B, del que ha sido destilado mediante una receta de destilación por relaciones (ARD).

El modelo resuelve el problema de la recuperación de información en documentos visuales complejos, como páginas escaneadas, PDFs con tablas, gráficos o tipografía pequeña, donde los modelos densos de un solo vector pierden detalles finos. EVIE-4.5B alcanza el primer puesto en el benchmark ViDoRe V3 con una puntuación nDCG@10 de 66.02, y en ViDoRe V1+V2 con 92.07 y 73.38 respectivamente. Su relevancia actual radica en que ofrece una precisión de nivel superior con un tamaño reducido, soporta representaciones elásticas de 64 a 2048 dimensiones mediante Prefix-MRL y compresión de tokens HAC que reduce el almacenamiento del índice a 3.81 GiB por millón de páginas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ColQwen3.5 (late-interaction multi-vector) sobre backbone Qwen3.5-4B |
| Parametros totales | 4.544.510.464 (4.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EVIE-4.5B sigue el paradigma de interacción tardía multi-vector. A diferencia de los modelos densos que comprimen una página en un único vector, EVIE genera representaciones token-level tanto para la consulta de texto como para la imagen del documento. La puntuación de relevancia se calcula mediante MaxSim: S(Q, D) = Σ_i max_j (q_i · d_j), donde cada token de la consulta se compara con el token del documento más similar. Esta arquitectura permite preservar detalles visuales finos como tablas complejas, estructuras de layout, gráficos y tipografía pequeña.

El modelo introduce dos innovaciones técnicas destacables. La primera es Prefix-MRL (Matryoshka Representation Learning con prefijo), una proyección lineal única de 2048 dimensiones que puede truncarse en tiempo de ejecución a 64, 128, 256, 512, 1024 o 2048 dimensiones sin necesidad de mantener múltiples cabezas ni checkpoints separados. La segunda es HAC (Hierarchical Agglomerative Clustering), un algoritmo de compresión de tokens sin entrenamiento que agrupa los parches visuales en 32 o 64 centroides semánticos en un espacio conjunto de características y posición, reduciendo el número de tokens de aproximadamente 750 a 32 vectores por página. Esto reduce el tamaño del índice a 3.81 GiB por millón de páginas.

El entrenamiento se realizó sobre los datasets vidore/vidore_benchmark, vidore/vidore_benchmark_v2 y jinaai/jina-vdr. EVIE-4.5B fue destilado del modelo teacher EVIE-8B mediante la receta ARD (Anchor-preserving Relation Distillation), que utiliza la topología geométrica de las relaciones entre tokens, calibración de márgenes con ejemplos negativos difíciles y alineación que preserva las anclas. Esta técnica permite mantener una alta precisión de recuperación incluso con dimensiones de representación reducidas.

## Capacidades

- Recuperación de documentos visuales: dado un texto de consulta, recupera páginas de documentos relevantes a partir de su contenido visual, sin necesidad de OCR.
- Interacción tardía multi-vector: conserva información visual de alta resolución, incluyendo tablas, gráficos, layout y texto pequeño.
- Representaciones elásticas Prefix-MRL: permite truncar la dimensión de embedding en tiempo de ejecución entre 64 y 2048 dimensiones sin modelos separados.
- Compresión de tokens HAC: reduce el número de vectores por página de ~750 a 32 o 64, reduciendo el almacenamiento del índice a 3.81 GiB por millón de páginas.
- Evaluación multilingüe: el modelo fue evaluado en 138 tareas multilingües en los benchmarks ViDoRe V1, V2, V3 y JinaVDR, con cuatro familias de métricas (nDCG, Recall, MAP, MRR @1/5/10).
- Integración con la librería colpali-engine: diseñado para usarse con la librería oficial de HuggingFace para modelos ColPali/ColQwen.
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un modelo de recuperación puro.

## Casos de uso

- Búsqueda semántica en archivos de documentos escaneados: permite buscar en colecciones de documentos digitalizados sin necesidad de OCR, ya que el modelo trabaja directamente sobre la imagen de la página. Es adecuado para archivos históricos, bibliotecas digitales y repositorios de documentos antiguos.
- Recuperación aumentada por generación (RAG) para documentos visuales: puede integrarse en pipelines de RAG para inyectar páginas de documentos visuales en un LLM, proporcionando contexto visual relevante para preguntas sobre informes, manuales o documentos técnicos.
- Búsqueda en informes financieros y legales: la capacidad de preservar tablas y layout permite recuperar páginas específicas de informes anuales, contratos o expedientes legales donde la información está estructurada en tablas o gráficos.
- Indexación de presentaciones y slides: puede indexar diapositivas de presentaciones y recuperar las páginas relevantes a partir de consultas de texto, útil para buscadores internos de conocimiento corporativo.
- Recuperación de facturas, recibos y formularios: en entornos empresariales, permite localizar documentos administrativos específicos por su contenido visual, como números de factura, fechas o importes.
- Búsqueda en documentación de producto y manuales técnicos: puede recuperar páginas de manuales de usuario o guías técnicas que contengan diagramas, esquemas o instrucciones visuales, facilitando la asistencia técnica y el soporte al cliente.
- Creación de índices de bajo coste para grandes volúmenes de documentos: gracias a la compresión HAC, el modelo permite construir índices de 1 millón de páginas en aproximadamente 3.81 GiB, lo que lo hace adecuado para despliegues con limitaciones de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks más allá de la tabla del README del autor, que se reproduce a continuación:

| Benchmark | EVIE-4.5B | EVIE-8B |
|---|---|---|
| ViDoRe V1 (nDCG@5) | 92.07 | 92.18 |
| ViDoRe V2 (nDCG@5) | 73.38 | 74.23 |
| ViDoRe V3 (nDCG@10) | 66.02 | 66.75 |

El README indica que EVIE-4.5B con Prefix-MRL de proyección única obtiene 66.02 en ViDoRe V3, mientras que el modelo insignia EVIE-8B alcanza 66.75. Ambos modelos ocupan las posiciones primera y segunda del leaderboard de ViDoRe V3. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) porque se trata de un modelo de recuperación, no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.5B parámetros en precisión FP16/BF16, el modelo requiere aproximadamente 9 GB de VRAM. Con cuantización INT8, alrededor de 5 GB, y con INT4, aproximadamente 3 GB. Estas son estimaciones orientativas basadas en el tamaño de los pesos; la información del autor no proporciona datos de consumo de VRAM.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente para inferencia en FP16. Para despliegues con mayor concurrencia se recomiendan A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo como RTX 3060 12 GB o RTX 4070 Ti con cuantización INT8 o INT4.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería colpali-engine, que se integra con sentence-transformers y transformers. También puede desplegarse en entornos de inferencia como vLLM o TGI, aunque la documentación del autor no especifica configuraciones concretas para estos frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de embedding | ViDoRe V1 | ViDoRe V2 | ViDoRe V3 | Licencia |
|---|---|---|---|---|---|---|
| EVIE-4.5B | 4.54B | 64-2048D (Prefix-MRL) | 92.07 | 73.38 | 66.02 | Apache 2.0 |
| EVIE-8B | 8.41B | 4096D | 92.18 | 74.23 | 66.75 | Apache 2.0 |
| EVIE-Preview-4.5B | 4.5B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

EVIE-4.5B es la versión ligera destilada del modelo insignia EVIE-8B. Su rendimiento es muy cercano al del teacher en ViDoRe V1 (92.07 frente a 92.18) y V3 (66.02 frente a 66.75), con la ventaja de un tamaño casi la mitad y la flexibilidad de representaciones truncables. El modelo base EVIE-Preview-4.5B es el punto de partida del finetuning, pero no se han publicado sus resultados completos en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible. Como modelo entrenado con datos de dominio público, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: al ser un modelo de recuperación, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede recuperar documentos irrelevantes si la consulta es ambigua o si la representación del documento no captura correctamente la información buscada.
- Limitaciones de contexto o idioma: los idiomas soportados no están documentados en la ficha de HuggingFace. El README menciona una evaluación en 138 tareas multilingües, pero no especifica qué idiomas se cubren. La longitud de contexto tampoco está documentada.
- Restricciones de licencia: el modelo se distribuye bajo licencia Apache 2.0, que permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveats para producción: el modelo requiere la librería colpali-engine para su uso, que puede tener dependencias específicas. La compresión HAC reduce el número de vectores por página, pero la precisión puede degradarse si se utilizan 32 vectores en lugar de 64. El índice de 3.81 GiB por millón de páginas es un valor orientativo que puede variar según la resolución de las imágenes.
- El modelo no es un LLM: no puede generar texto, responder preguntas abiertas ni realizar razonamiento conversacional. Su función exclusiva es la recuperación de documentos visuales.

## Enlaces

- HuggingFace: https://huggingface.co/tencent/EVIE-4.5B
- GitHub del proyecto: https://github.com/Tencent/EVIE
- GitHub del modelo base: https://github.com/Tencent/EVIE-Preview-4.5B
- Modelo base en HuggingFace: https://huggingface.co/tencent/EVIE-Preview-4.5B
- Modelo teacher EVIE-8B: https://huggingface.co/tencent/EVIE-8B
- Web de Tencent: https://www.tencent.com/
