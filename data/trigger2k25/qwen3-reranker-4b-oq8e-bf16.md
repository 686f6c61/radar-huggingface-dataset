# trigger2k25/Qwen3-Reranker-4B-oQ8e-bf16

## Resumen

Qwen3-Reranker-4B-oQ8e-bf16 es una cuantización de 8 bits del modelo Qwen/Qwen3-Reranker-4B, publicada por el usuario trigger2k25. No se trata de un modelo nuevo ni de un ajuste fino: es una conversión de pesos orientada a Apple Silicon mediante la librería MLX y el formato de cuantización oQ8e de oMLX 0.7.3rc1. El modelo hereda la funcionalidad del reranker original de Qwen: puntuar la relevancia de un documento respecto a una consulta, no generar texto libre.

El modelo base pertenece a la familia Qwen3 y emplea una arquitectura de tipo causal decoder (Qwen3ForCausalLM) con 4.021.784.576 parámetros. El reranking se realiza mediante el recetario de logits "yes"/"no" sobre la última posición del contexto, con una plantilla de chat que incluye instrucción, consulta y documento. La ventana de contexto práctica del ejemplo de uso es de 8.192 tokens, incluyendo la plantilla.

Su relevancia es acotada pero específica: permite ejecutar un reranker de 4B en Macs con Apple Silicon usando MLX, con pesos cuantizados a 8 bits y tensores auxiliares en BF16, en un repositorio de 4,3 GB. Es una alternativa local para pipelines de búsqueda y RAG que necesiten reordenar candidatos sin depender de GPUs NVIDIA ni de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder causal) |
| Parámetros totales | 4.021.784.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el ejemplo de uso del autor; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | oQ8e: 8 bits afín con cuantización ponderada por matriz de importancia, group size 64; tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 651 tensores BF16 y 253 tensores U32 empaquetados |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-Reranker-4B: un transformer decoder causal de 4B parámetros. La cuantización no altera la topología, solo la representación numérica de los pesos. El checkpoint distribuido contiene 651 tensores BF16 (de los cuales 506 son escalas y sesgos de cuantización y 145 son otros tensores) y 253 tensores U32 que almacenan los pesos cuantizados empaquetados. `config.json` declara `torch_dtype: "bfloat16"`, coherente con los tensores flotantes almacenados.

El proceso de cuantización oQ8e se aplicó a 252 módulos con calibración sobre 128 muestras de 512 tokens del dataset `oqe_code_multilingual` incluido en oMLX. El autor indica que no hay entradas de imatrix ausentes ni desajustadas. No se incluye MTP (multi-token prediction), decisión justificada porque el reranking solo requiere los logits de "yes" y "no". No se ha realizado ningún entrenamiento adicional ni evaluación de equivalencia frente al modelo original.

## Capacidades

- Puntuación de relevancia consulta-documento mediante el logit de "yes" frente a "no" en la última posición del contexto.
- Reranking de listas de candidatos recuperados por un sistema de búsqueda previo (retrieval de primera etapa).
- Soporte de instrucciones de tarea mediante el campo `<Instruct>`, lo que permite adaptar el criterio de relevancia (por ejemplo, búsqueda web, soporte técnico o preguntas factuales).
- Procesamiento de pares con hasta 8.192 tokens incluyendo la plantilla en el ejemplo del autor.
- Ejecución en Apple Silicon mediante MLX LM.
- No es un modelo de chat, no genera texto y no produce embeddings; es exclusivamente un reranker.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial densa o léxica, el modelo reordena los pasajes candidatos puntuando cada par consulta-documento con el logit "yes". Es adecuado porque está diseñado específicamente para esta tarea y cabe en memoria unificada de un Mac.
- Búsqueda documental interna: en un corpus de manuales o normativa, se usa como segunda etapa para priorizar los fragmentos que responden realmente a la consulta del empleado, con instrucciones adaptadas al dominio.
- Asistentes de atención al cliente con base de conocimiento: se reordenan artículos candidatos antes de pasarlos al modelo generador, reduciendo el contexto irrelevante y el coste de tokens.
- Evaluación de calidad de recuperación: sirve para medir y comparar la calidad de distintos retrievers sobre un conjunto de consultas y documentos de referencia.
- Filtrado de resultados en motores de búsqueda verticales: reordenación de resultados de un buscador de productos, artículos o documentación técnica según relevancia semántica frente a la consulta.
- Prototipado local en Mac: desarrolladores que trabajan en Apple Silicon pueden validar la lógica de reranking y el ajuste de instrucciones sin acceso a GPUs dedicadas, antes de desplegar el modelo original en servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba de humo con MLX LM 0.32.3.dev8: el pasaje "Paris is the capital of France." obtuvo una puntuación de aproximadamente 0,928409 frente a la consulta "What is the capital of France?", y el pasaje no relacionado sobre Júpiter obtuvo 0,000045. El autor advierte explícitamente que no es un benchmark y que no se ha realizado evaluación de equivalencia frente al modelo original.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 4,3 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, más el espacio de trabajo para activaciones y tokens de contexto.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No está pensado para CUDA.
- Cabe en consumer GPU: en el ecosistema Apple, sí en equipos con 8 GB o más de memoria unificada, aunque 16 GB o más es recomendable para contextos largos. En GPUs NVIDIA no se garantiza compatibilidad con este formato de cuantización.
- Despliegue: MLX LM (`mlx-lm`) en Python. El autor indica que los pesos MLX pueden usarse en servidores que soporten esta cuantización y el reranking de Qwen3, sin garantizar compatibilidad con todas las versiones.
- Latencia y throughput: no disponibles. El modelo procesa un documento por llamada en el ejemplo proporcionado; el rendimiento dependerá del hardware y de la longitud de los pares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Reranker-4B-oQ8e-bf16 (esta ficha) | 4,02B | 8.192 tokens en el ejemplo | safetensors MLX, oQ8e + BF16 | Apache 2.0 | HuggingFace, 24 descargas |
| Qwen/Qwen3-Reranker-4B (original) | 4,02B | no disponible en la información proporcionada | safetensors | Apache 2.0 | HuggingFace |
| Otros rerankers de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta cuantización y el modelo original ni con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación de equivalencia frente al modelo original; la cuantización de 8 bits puede degradar la calidad del ranking en casos límite.
- No es un modelo de propósito general: no genera texto, no responde preguntas y no produce embeddings.
- Las puntuaciones son relevancias del modelo, no probabilidades calibradas de corrección factual.
- El truncado a 8.192 tokens puede descartar información relevante en documentos largos; hay que evaluar el truncado sobre el corpus propio.
- El autor no afirma que BF16 sea más rápido o preciso que una build oQ8 en FP16.
- Compatibilidad limitada al ecosistema MLX y Apple Silicon; no se garantiza su uso en vLLM, TGI, llama.cpp u otros servidores.
- Sesgos y riesgos de alucinación: no documentados en la información proporcionada; se remite a la model card del modelo original.
- Licencia Apache 2.0 permite uso comercial, pero esta distribución es una derivada no oficial de Qwen y debe atribuirse correctamente.
- Repositorio con muy poca tracción (24 descargas, 0 likes) y sin mantenimiento documentado más allá de la fecha de actualización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/trigger2k25/Qwen3-Reranker-4B-oQ8e-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Documentación de cuantización oQ de oMLX: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
