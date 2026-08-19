# vivekkopthsd/minilm-l6-v2-taxfinance-lora

## Resumen

El modelo `vivekkopthsd/minilm-l6-v2-taxfinance-lora` es un codificador de recuperación densa (dense retrieval) afinado mediante LoRA a partir de `sentence-transformers/all-MiniLM-L6-v2`, especializado en preguntas y respuestas sobre el impuesto sobre la renta indio y documentos financieros genéricos. Su objetivo es mapear una pregunta de un contribuyente al pasaje legal o documento financiero exacto que la responde, actuando como unidad de recuperación en un pipeline RAG.

Con solo 22,7 millones de parámetros totales y 675.840 parámetros entrenables (2,89 % del modelo), es extremadamente compacto y rápido de ejecutar, pensado para desplegarse en hardware modesto. La ventana de contexto es de 256 tokens, suficiente para secciones de estatutos y documentos tipo FAQ. El modelo se distribuye bajo licencia Apache-2.0 y está entrenado exclusivamente en inglés.

La relevancia actual radica en su enfoque de eficiencia paramétrica: demuestra que un ajuste fino con LoRA sobre un modelo base pequeño puede mejorar significativamente la recuperación en un dominio específico (fiscal y financiero) con un coste de entrenamiento mínimo, lo que lo convierte en una opción atractiva para proyectos RAG con presupuesto limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2) con adaptadores LoRA en query/key/value/dense |
| Parametros totales | 22.713.216 |
| Parametros activos | 675.840 (entrenables, 2,89 % del total) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `all-MiniLM-L6-v2`, un transformer encoder de 6 capas con una dimensión de embedding de 384. Sobre este se aplica un ajuste fino con LoRA (r=16, α=32, dropout 0.05) en las proyecciones query, key, value y dense. La función de pérdida es `MultipleNegativesRankingLoss`, un objetivo contrastivo estándar para recuperación densa: para cada par (consulta, documento positivo) en un lote, el positivo se trata como la respuesta correcta y todos los demás documentos del lote actúan como negativos in-batch.

El entrenamiento se realizó sobre dos conjuntos de datos: `ligaments-dev/indian-income-tax-qa` (6.800 pares pregunta-respuesta de estatutos del impuesto sobre la renta indio) y `AIR-Bench/qa_finance_en` (1.585 textos financieros usados como pares autosupervisados). Se empleó AdamW con weight decay 0.01, learning rate 2e-4, batch size 32, scheduler coseno con 10 % de warmup, y selección de épocas mediante el método del codo sobre el conjunto de validación (se eligieron aproximadamente 4-5 de 15 épocas). Se usaron tres semillas (42, 123, 456) para evaluar la estabilidad.

## Capacidades

- Recuperación densa de pasajes legales y financieros: mapea consultas en lenguaje natural a secciones de estatutos fiscales indios o documentos financieros.
- Generación de embeddings de 384 dimensiones normalizados, listos para similitud coseno.
- Búsqueda semántica y clustering de textos cortos (hasta 256 tokens).
- Integración en pipelines RAG como componente de recuperación.
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (TEI) para despliegue en endpoints.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo de embeddings.

## Casos de uso

- Asistente fiscal para contribuyentes indios: el modelo puede recuperar la sección exacta de la ley del impuesto sobre la renta que responde a una pregunta concreta (por ejemplo, deducciones por alquiler de vivienda), integrándose en un chatbot o sistema de consulta.
- Búsqueda semántica en bases de documentos financieros: permite indexar informes, políticas o artículos financieros y recuperar los pasajes relevantes mediante consultas en lenguaje natural.
- Pipeline RAG para atención al cliente en banca o seguros: dado un corpus de preguntas frecuentes y normativa, el modelo selecciona los fragmentos más pertinentes antes de pasarlos a un LLM generativo.
- Clasificación y agrupación de textos legales: al generar embeddings, se pueden agrupar cláusulas o secciones por similitud temática.
- Filtrado de documentos en entornos con recursos limitados: al ser un modelo de 22M parámetros, puede ejecutarse en CPU o GPUs de gama baja, ideal para despliegues edge o en contenedores pequeños.
- Evaluación de recuperación en dominios específicos: sirve como punto de partida para medir el impacto de un ajuste fino LoRA frente al modelo base en tareas de retrieval fiscal.

## Benchmarks y rendimiento

Los resultados se midieron sobre un conjunto de prueba retenido de 839 consultas, evaluadas contra el corpus completo combinado de impuestos y finanzas (100 % no visto durante el entrenamiento). Se reportan como media ± desviación estándar sobre 3 semillas de entrenamiento.

| Metrica | LoRA afinado | Baseline zero-shot | Δ |
|---|---|---|---|
| nDCG@10 | 0.592 ± 0.001 | 0.447 | +0.145 |
| MRR@10 | 0.484 ± 0.002 | 0.361 | +0.123 |
| MAP@100 | 0.488 ± 0.002 | 0.373 | +0.115 |
| Recall@1 | 0.327 ± 0.002 | 0.250 | +0.076 |
| Recall@5 | 0.685 ± 0.001 | 0.496 | +0.189 |
| Recall@10 | 0.948 ± 0.002 | 0.735 | +0.212 |
| Accuracy@1 | 0.327 ± 0.002 | 0.250 | +0.076 |

El ajuste fino produce una mejora relativa del +32 % en nDCG@10 sobre el modelo base sin entrenar, con una estabilidad alta entre semillas (desviación estándar ≤ 0.002). No se han publicado comparaciones con otros modelos de embedding en el mismo dominio.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 22,7M parámetros (~90 MB en fp32), la inferencia cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU con memoria RAM estándar.
- GPU recomendadas: cualquier GPU moderna, incluidas las de consumo como NVIDIA GTX 1650, RTX 3060 o superiores. También funciona en CPU sin problemas para volúmenes moderados.
- Compatible con despliegue en consumer GPU: sí, sin restricciones.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TEI) para endpoints de producción, y cualquier framework que soporte modelos ONNX o safetensors. No se menciona compatibilidad con vLLM u Ollama, que están orientados a LLMs generativos.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de milisegundos por lote en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vivekkopthsd/minilm-l6-v2-taxfinance-lora` | 22,7M | 256 tokens | Fiscal/financiero (EN) | Apache-2.0 | HuggingFace |
| `sentence-transformers/all-MiniLM-L6-v2` (base) | 22,7M | 256 tokens | General (EN) | Apache-2.0 | HuggingFace |
| `sentence-transformers/all-MiniLM-L12-v2` | 33,4M | 256 tokens | General (EN) | Apache-2.0 | HuggingFace |

La comparación directa con el modelo base muestra una mejora sustancial en recuperación fiscal (nDCG@10 de 0.592 frente a 0.447). No se dispone de datos comparativos con otros modelos de embedding especializados en finanzas o derecho.

## Limitaciones y advertencias

- Solo inglés: el modelo base tiene capacidad multilingüe limitada; la calidad de recuperación se degrada notablemente con entradas en hindi o hinglish (mezcla de hindi e inglés).
- Dominio específico: entrenado exclusivamente en impuestos indios y finanzas genéricas; no se garantiza generalización a otros dominios legales o técnicos.
- Contexto corto: el límite de 256 tokens es adecuado para secciones de estatutos y documentos tipo FAQ, pero no para pasajes largos.
- El subconjunto financiero usa pares autosupervisados (texto a texto), por lo que las métricas agregadas deben interpretarse junto con el rendimiento solo en impuestos.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero puede recuperar pasajes irrelevantes si la consulta está fuera del dominio entrenado.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF o int8, lo que puede limitar su uso en entornos con restricciones de memoria muy estrictas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/vivekkopthsd/minilm-l6-v2-taxfinance-lora)
- [Modelo base all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Dataset indian-income-tax-qa](https://huggingface.co/datasets/ligaments-dev/indian-income-tax-qa)
- [Dataset AIR-Bench/qa_finance_en](https://huggingface.co/datasets/AIR-Bench/qa_finance_en)
