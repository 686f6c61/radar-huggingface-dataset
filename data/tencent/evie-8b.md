# tencent/EVIE-8B

## Resumen

EVIE-8B (Evidence-Vector-Informed Embedding) es un modelo de recuperación visual de documentos desarrollado por Tencent, construido sobre el backbone Qwen3.5 y publicado bajo licencia Apache 2.0. No es un modelo generativo al uso, sino un encoder multimodal de tipo late-interaction (familia ColBERT/ColPali) que produce representaciones multi-vector por token de 4096 dimensiones, tanto para consultas de texto como para imágenes de páginas de documento. Su propósito es resolver la búsqueda semántica sobre documentos escaneados, PDFs, tablas, gráficos y maquetación compleja sin necesidad de OCR previo.

El modelo cuenta con 8.409.476.336 parámetros (8,4B) y se distribuye en formato safetensors con un repositorio de 16,9 GB. Emplea atención bidireccional completa sobre secuencias multimodal visión-texto, lo que permite interacción cruzada entre los parches visuales y el contexto del prompt. La puntuación de relevancia se calcula mediante MaxSim sobre los embeddings por token, preservando la estructura espacial, la tipografía y las relaciones tabulares que se perderían en una compresión a vector único.

Su relevancia actual radica en que encabeza la clasificación ViDoRe V3 con 66,24 de media por tarea (66,75 nDCG@10 según la model card) y actúa como profesor de destilación para el modelo compacto EVIE-4.5B. Ha sido validado sobre 138 tareas de los conjuntos ViDoRe V1, V2, V3 y JinaVDR, con métricas nDCG, Recall, MAP y MRR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language encoder con late-interaction multi-vector (ColQwen3.5), atención bidireccional completa, backbone Qwen3.5 |
| Parametros totales | 8.409.476.336 (8,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería colpali-engine) |

## Arquitectura y entrenamiento

EVIE-8B se apoya en el backbone Qwen3.5 y lo adapta a un esquema de recuperación por late interaction. La consulta textual pasa por un encoder ColQwen3.5 con atención bidireccional y se proyecta a embeddings por token de 4096 dimensiones; la imagen del documento pasa por el encoder visual y se descompone en embeddings multi-vector de parches. La relevancia entre consulta y documento se calcula con MaxSim, sumando sobre cada token de consulta el máximo producto escalar contra los tokens del documento. Este diseño evita la pérdida de información que supone el pooling a un único vector y conserva detalles de maquetación, tipografía y estructura de tablas.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no disponible). Sí se documenta que el modelo se entrena sobre los conjuntos ViDoRe V1, V2, V3 y JinaVDR, y que ejerce como profesor de destilación para EVIE-4.5B mediante transferencia de relaciones topológicas y supervisión de márgenes con negativos duros (ARD, margin distillation). La innovación destacable es la combinación de representaciones de alta capacidad (4096D por token) con atención bidireccional multimodal y un esquema de destilación que permite trasladar parte de esa precisión a un modelo de 4,5B.

## Capacidades

- Recuperación visual de documentos (visual document retrieval) sobre imágenes de páginas, PDFs escaneados y capturas.
- Representación multi-vector por token con late interaction (MaxSim) en 4096 dimensiones.
- Codificación conjunta de consultas de texto e imágenes de documento en un mismo espacio de similitud.
- Preservación de estructura de tablas, gráficos, tipografía y disposición espacial sin OCR previo.
- Evaluación y uso dentro del ecosistema colpali-engine y sentence-transformers.
- No es un modelo generativo: no produce texto libre, ni soporta tool calling, function calling, agentes ni modos de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en archivos corporativos escaneados: indexar páginas de PDF como embeddings multi-vector y recuperar por consulta en lenguaje natural; el modelo es adecuado porque conserva la estructura visual que los pipelines OCR pierden.
- Recuperación sobre documentación técnica con tablas y diagramas: útil para localizar la página exacta de una especificación o un esquema, gracias a la representación por parches y a la puntuación MaxSim.
- Atención al cliente sobre base documental: recuperar fragmentos de manuales, contratos o facturas escaneadas para alimentar un sistema RAG; el modelo actúa como recuperador y se combina con un LLM generador aparte.
- Gestión documental y compliance: localizar cláusulas o formularios en expedientes digitalizados masivos sin depender de OCR, reduciendo errores en documentos con maquetación irregular.
- Investigación académica y análisis de literatura: indexar artículos en PDF y recuperar figuras, tablas o secciones relevantes por similitud visual-semántica.
- Fine-tuning y destilación: usar EVIE-8B como profesor para entrenar recuperadores más pequeños (como EVIE-4.5B) o para ajustar el modelo a un dominio vertical con datos propios.
- Construcción de índices multimodales: integrar el encoder en pipelines de sentence-transformers/colpali-engine para generar índices vectoriales multi-vector reutilizables en motores de búsqueda internos.

## Benchmarks y rendimiento

| Benchmark | Métrica | EVIE-8B | EVIE-4.5B | webAI-ColVec1.1-8b | VultronRetrieverPrime-Qwen3.5-8B |
|---|---|---|---|---|---|
| ViDoRe V3 (Mean Task) | Media | 66,24 | 65,70 | 64,95 | 64,26 |
| ViDoRe V3 | nDCG@10 | 66,75 | no disponible | no disponible | no disponible |

La model card indica además validación sobre 138 tareas (ViDoRe V1, V2, V3 y JinaVDR) con métricas nDCG, Recall, MAP y MRR @1/5/10, pero la información proporcionada solo incluye cifras completas de ViDoRe V3. Los resultados de ViDoRe V1 (nDCG@5) y ViDoRe V2 (nDCG@5) no están disponibles en el extracto recibido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 8,4B en fp16 requiere aproximadamente 17 GB solo para pesos, a los que hay que sumar el coste de los embeddings multi-vector por token (4096D), que es elevado en memoria de índice.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en A100 40/80 GB, H100 y L40S; en consumer, requiere GPUs de 24 GB o más (RTX 3090, RTX 4090) para fp16, con cuantización no documentada.
- Cabe en consumer GPU: previsiblemente en RTX 4090/3090 en fp16, aunque el coste de almacenamiento de embeddings multi-vector puede ser el factor limitante más que los pesos.
- Opciones de despliegue: colpali-engine (librería oficial declarada) y sentence-transformers; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Embed dim | ViDoRe V3 (Mean Task) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tencent/EVIE-8B | 8,4B | 4096D | 66,24 | Apache 2.0 | Hugging Face |
| tencent/EVIE-4.5B | 4,5B | no disponible (Prefix-MRL) | 65,70 | Apache 2.0 (según repositorio) | Hugging Face |
| webAI-ColVec1.1-8b | 8,4B | no disponible | 64,95 | no disponible | Hugging Face |
| VultronRetrieverPrime-Qwen3.5-8B | 8,4B | no disponible | 64,26 | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: no debe emplearse para producir respuestas, código o razonamiento; su función es exclusivamente la recuperación.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ViDoRe y JinaVDR, puede heredar sesgos de esos corpus.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos en la recuperación (documentos irrelevantes con alta puntuación MaxSim).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; no se puede asumir cobertura multilingüe sin verificación.
- Coste de almacenamiento: los embeddings multi-vector de 4096D por token implican índices mucho mayores que los de un modelo de vector único, lo que encarece el almacenamiento y la búsqueda a gran escala.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del backbone Qwen3.5 y de los datasets de entrenamiento antes de desplegar en producción.
- Cuantizaciones y formatos alternativos (GGUF, ONNX) no documentados; la integración está pensada para colpali-engine.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/EVIE-8B
- Modelo compacto EVIE-4.5B: https://huggingface.co/tencent/EVIE-4.5B
- Repositorio GitHub: https://github.com/Tencent/EVIE
- Paper arXiv: https://arxiv.org/abs/2610.11553
- Leaderboard ViDoRe: https://huggingface.co/spaces/vidore/vidore-leaderboard
- Papers with Code: https://paperswithcode.co/paper/114151
- Backbone Qwen2.5-VL / QwenLM: https://github.com/QwenLM/Qwen2.5-VL
