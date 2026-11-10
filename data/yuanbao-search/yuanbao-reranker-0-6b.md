# Yuanbao-Search/Yuanbao-Reranker-0.6B

## Resumen

Yuanbao-Reranker-0.6B es un modelo de reranking de documentos desarrollado por Yuanbao-Search, construido sobre el backbone Qwen3-0.6B. Dado un par consulta-documento junto con una instrucción de tarea, el modelo emite una puntuación de relevancia fina en el rango [0, 1] normalizando la probabilidad sobre los tokens de decisión `yes` y `no`. Forma parte de una familia de tres tamanos (0.6B, 4B y 8B) orientada a pipelines de recuperación de información y RAG.

El modelo aborda el problema del reordenamiento de candidatos recuperados en sistemas de búsqueda y generación aumentada por recuperación, cubriendo escenarios en chino, multilingüe, inglés, documentos largos (hasta 8.192 tokens) y recuperación de código. Su relevancia actual radica en que un modelo de solo 0.6B parámetros alcanza un promedio de 70,96 en cinco paneles de evaluación (CMTEB-R, MMTEB-R, BEIR, MLDR y MTEB-Code), superando a referencias de mayor tamano como KaLM-Reranker-Large-R2 (69,73).

La arquitectura es un transformer decoder-only (Qwen3) con 28 capas, 595.776.512 parámetros reales en safetensors, pesos en BF16 y licencia Apache 2.0, lo que facilita su integración tanto en entornos de investigación como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 28 capas |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el resto de cuantizaciones no se documentan) |
| Idiomas soportados | Chino (zh), ingles (en), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-0.6B, un transformer decoder-only de 28 capas, y se especializa como reranker cross-encoder: recibe una secuencia estructurada con `<Instruct>`, `<Query>` y `<Document>`, y produce una probabilidad de relevancia calculada sobre los logits de los tokens `yes` y `no` en la posición del asistente. La longitud maxima de entrada es de 8.192 tokens.

El entrenamiento se basa en 2,75 millones de grupos de ranking con proporcion 1:3, construidos mediante síntesis guiada por tipo de consulta y con enfoque "answer-first". El pipeline de curación tiene tres etapas: verificación por modelo profesor, deduplicación semántica y asignación de cuotas por fuente y longitud. La minería de negativos se estratifica por dificultad (niveles Hard, Medium y Moderate) tras un filtrado del profesor con umbral Δ > 1. La optimización combina entropía cruzada pointwise sobre `yes`/`no` con un objetivo hinge pairwise unilateral acotado sobre pares positivo-negativo y negativo-negativo (destilación de preferencias con separación mínima acotada). Posteriormente se aplica un model merging layerwise Adaptive LERP, que no anade sobrecoste en inferencia.

## Capacidades

- Reranking de pares consulta-documento con puntuación de relevancia continua en [0, 1].
- Soporte de instrucciones de tarea explícitas mediante el campo `<Instruct>`, lo que permite adaptar el criterio de relevancia a distintos dominios.
- Recuperación de texto en chino, inglés y escenarios multilingües.
- Recuperación sobre documentos largos de hasta 8.192 tokens.
- Recuperación de código (evaluado en el panel MTEB-Code).
- Integración directa con Hugging Face Transformers y vLLM sin wrapper externo.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de generación abierta, tool calling, agentes, visión ni audio; el modelo está especializado en ranking.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperación inicial por embeddings, el modelo reordena los candidatos según relevancia real respecto a la consulta, mejorando la precisión del contexto entregado al LLM generador. Su contexto de 8.192 tokens permite incluir pasajes largos completos.
- Búsqueda web y motores de búsqueda internos: dado un par consulta-documento con una instrucción de tipo "recupera pasajes relevantes para esta consulta web", el modelo puntúa cada resultado y permite reordenar los diez primeros antes de presentarlos al usuario.
- Recuperación de código en asistentes de desarrollo: el soporte del panel MTEB-Code permite usar el modelo para localizar fragmentos de código relevantes en repositorios o documentación técnica a partir de una consulta en lenguaje natural.
- Atención al cliente con base de conocimiento: el modelo puede reordenar artículos de ayuda y FAQ multilingües antes de que un sistema de respuesta los utilice, mejorando la pertinencia de las respuestas en chino e inglés.
- Búsqueda multilingüe en catálogos y documentación: con soporte de escenarios multilingües, sirve para reordenar resultados cuando la consulta y los documentos están en idiomas distintos.
- Filtrado de candidatos en pipelines de anotación o datasets: el modelo puede puntuar pares consulta-documento para descartar coincidencias débiles antes de un proceso de etiquetado o entrenamiento.
- Despliegue en entornos con recursos limitados: con 0,6B parámetros y pesos BF16, cabe en GPUs de consumo y permite servir reranking de baja latencia en infraestructura modesta.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre cinco paneles (CMTEB-R, MMTEB-R, BEIR, MLDR y MTEB-Code):

| Modelo | Parametros | Promedio cinco paneles |
|---|---|---|
| Yuanbao-Reranker-0.6B | 0,6B | 70,96 |
| Yuanbao-Reranker-4B | 4B | 73,63 |
| Yuanbao-Reranker-8B | 8B | 74,21 |
| Qwen3-Reranker-0.6B | 0,6B | 67,32 (inferido de +3,64) |
| jina-reranker-v3.5 | no disponible | 68,18 (inferido de +2,78) |
| KaLM-Reranker-Large-R2 | 1B-4B activos | 69,73 |

No se han publicado en la informacion disponible resultados desglosados por panel (MMLU, HumanEval, GSM8K u otros), ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB para los pesos, mas memoria para activaciones y KV cache; en la practica, entre 2 y 4 GB según longitud de secuencia y tamano de batch.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; A100, H100 o L40S para servicio de alto throughput con batches grandes.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: Hugging Face Transformers (documentado en la model card), vLLM (soportado explicitamente), y el paquete `yuanbao-reranker`. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Promedio cinco paneles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yuanbao-Reranker-0.6B | 0,6B | 8.192 | 70,96 | Apache 2.0 | Hugging Face |
| Qwen3-Reranker-0.6B | 0,6B | no disponible | 67,32 (inferido) | no disponible | Hugging Face |
| jina-reranker-v3.5 | no disponible | no disponible | 68,18 (inferido) | no disponible | no disponible |
| KaLM-Reranker-Large-R2 | 1B-4B activos | no disponible | 69,73 | no disponible | no disponible |

Los valores de Qwen3-Reranker-0.6B, jina-reranker-v3.5 y KaLM-Reranker-Large-R2 se derivan de las diferencias reportadas en la model card (+3,64, +2,78 y la cifra directa 69,73 respectivamente); no se dispone de sus especificaciones completas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en ranking: no está disenado para generación de texto libre, razonamiento abierto ni tareas agénticas.
- Riesgo de alucinación limitado al formato de salida, pero la puntuación de relevancia puede ser erronea en dominios muy alejados de los datos de entrenamiento (texto web, código y documentos multilingües).
- La ventana de contexto está limitada a 8.192 tokens; documentos más largos deben truncarse o dividirse.
- El soporte lingüístico documentado se limita a chino, inglés y escenarios multilingües; no se detalla la cobertura por idioma.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-0.6B.
- El número de descargas y likes es muy bajo (2 descargas, 0 likes), lo que indica un modelo reciente con poca validación externa por parte de la comunidad.
- La model card no publica latencias, throughput ni resultados desglosados por benchmark, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-0.6B
- Modelo 4B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-4B
- Modelo 8B: https://huggingface.co/Yuanbao-Search/Yuanbao-Reranker-8B
- Repositorio GitHub: https://github.com/Yuanbao-Search/Yuanbao-Reranker
- Colección en Hugging Face: https://huggingface.co/collections/Yuanbao-Search/yuanbao-reranker-6aeda9e8d327ee5c9b20c9d6
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
