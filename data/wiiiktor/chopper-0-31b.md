# wiiiktor/chopper-0.31B

## Resumen

Chopper 0.31B es un modelo de reranking y compresión de contexto desarrollado por wiiiktor, construido a partir del modelo base jhu-clsp/mmBERT-base. Resuelve un problema concreto en pipelines de RAG (retrieval-augmented generation): tras la fase de recuperación, el modelo lee los pasajes candidatos y, en una sola pasada forward, realiza dos tareas simultáneas: puntúa la relevancia de cada pasaje (como un reranker cross-encoder) y extrae las frases exactas que responden a la pregunta (denominadas "chops"), sin reescribirlas.

La propuesta diferencial es la compresión de contexto integrada: en lugar de limitarse a ordenar pasajes, recorta el texto a las oraciones relevantes, típicamente entre el 2 % y el 5 % del total. Esto reduce el consumo de tokens en la fase de generación y mitiga el problema de "lost in the middle" en modelos con ventanas de contexto grandes. El modelo tiene 0.31 mil millones de parámetros, licencia MIT y está empaquetado en safetensors, con un tamaño de repositorio de 0.6 GB.

El modelo se publica como una variante independiente de los mismos pesos que la carpeta `mmbert-base/` del repositorio principal `wiiiktor/chopper_mmbert`, para que las leaderboards puedan listarlo por tamaño. Según la model card, procesa 20 fragmentos (~2.400 tokens) en aproximadamente 50 ms en una RTX 3090.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (fine-tune de jhu-clsp/mmBERT-base) |
| Parámetros totales | 0.31B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; lista concreta no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de jhu-clsp/mmBERT-base, un encoder transformer multilingüe. Se emplea como cross-encoder: recibe pares (pregunta, pasaje) y produce una puntuación de relevancia por pasaje, calculada como la media de p(KEEP) de los 16 tokens más probables. En la misma pasada forward, el modelo identifica y extrae las oraciones exactas que responden a la pregunta, sin reescribirlas ni parafrasearlas.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Se menciona el dataset `wiiiktor/chopper_demo` como referencia de entrenamiento/demostración, y el repositorio de GitHub `wiiiktor/chopper_demo` contiene la receta de entrenamiento completa. La innovación técnica destacable es la doble salida en una sola pasada: scoring de relevancia y extracción extractiva de fragmentos, lo que evita una segunda etapa de compresión y reduce la latencia del pipeline.

## Capacidades

- Reranking de pasajes: asigna una puntuación de relevancia a cada pasaje recuperado, ordenándolos de mejor a peor.
- Compresión de contexto extractiva: extrae las frases exactas que responden a la pregunta (chops), típicamente el 2–5 % del texto original, sin reescritura.
- Procesamiento multilingüe: etiquetado como multilingüe, con evaluación en un holdout de reranking de 8 idiomas.
- Soporte para preguntas multi-hop: etiqueta `multi-hop` en la model card.
- Integración en pipelines RAG mediante la librería `chopper-rag` (métodos `run` y `rerank`).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; el modelo es exclusivamente de ranking y extracción.

## Casos de uso

- Reranking en pipelines RAG: tras la recuperación vectorial o híbrida, el modelo reordena los pasajes por relevancia antes de pasarlos al generador, mejorando la precisión de la respuesta final con un coste de ~50 ms por consulta de 20 fragmentos.
- Compresión de contexto para LLMs: en lugar de inyectar todos los pasajes recuperados en el prompt del generador, se envían solo las frases extraídas (2–5 % del texto), reduciendo el consumo de tokens y el coste por consulta en APIs de modelos grandes.
- Atención al cliente con base de conocimiento: el modelo localiza las oraciones exactas de la documentación interna que responden a la consulta del usuario, permitiendo respuestas fundamentadas y verificables con citas literales.
- Búsqueda documental legal o técnica: extracción de cláusulas o párrafos concretos de contratos o manuales extensos, manteniendo el texto original sin riesgo de paráfrasis incorrecta.
- Sistemas de preguntas y respuestas multi-hop: al soportar preguntas que requieren combinar información de varios pasajes, puede usarse para seleccionar y recortar evidencia de múltiples fuentes antes de la síntesis.
- Moderación o filtrado de contexto: descartar pasajes irrelevantes de un corpus recuperado antes de alimentar a un modelo generativo, reduciendo el riesgo de alucinación por contexto ruidoso.
- Evaluación de recuperadores: usar las puntuaciones de relevancia como métrica offline para comparar distintos retrievers o configuraciones de chunking en un pipeline RAG.

## Benchmarks y rendimiento

| Benchmark | Chopper 0.31B | bge-reranker-v2-m3 | Qwen3-Reranker-0.6B |
|---|---|---|---|
| nDCG@10, holdout de reranking en 8 idiomas (400 consultas) | 0.973 | 0.984 | 0.977 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0.31B parámetros en fp16 el peso ronda los 0.6 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: RTX 3090 según la model card (~50 ms por consulta con 20 fragmentos y ~2.400 tokens); cualquier GPU con al menos 2–4 GB de VRAM libre debería ser suficiente en fp16.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la model card documenta la librería `chopper-rag` (`pip install chopper-rag`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~50 ms por pregunta en RTX 3090 con 20 fragmentos (~2.400 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 (8 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chopper 0.31B | 0.31B | No disponible | 0.973 | MIT | Hugging Face |
| bge-reranker-v2-m3 | No disponible | No disponible | 0.984 | No disponible | Hugging Face |
| Qwen3-Reranker-0.6B | 0.6B | No disponible | 0.977 | No disponible | Hugging Face |

La diferencia clave frente a los rerankers puros es la capacidad de compresión extractiva en la misma pasada, que los modelos comparados no ofrecen según la información disponible.

## Limitaciones y advertencias

- El rendimiento en nDCG@10 (0.973) es ligeramente inferior al de bge-reranker-v2-m3 (0.984) en el holdout de 8 idiomas, por lo que en escenarios donde solo se requiere ranking puro puede no ser la mejor opción.
- La extracción es extractiva: no reescribe ni sintetiza, por lo que si la respuesta requiere paráfrasis o combinación de fragmentos, el paso de generación posterior sigue siendo necesario.
- No se detalla la longitud máxima de contexto soportada, lo que impide planificar con precisión el número de pasajes o su tamaño.
- No se especifica la lista concreta de idiomas soportados más allá de la etiqueta `multilingual` y la evaluación en 8 idiomas.
- Riesgo de alucinación: no aplica directamente al ser un modelo extractivo, pero la puntuación de relevancia puede fallar en dominios muy especializados no cubiertos en el entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base jhu-clsp/mmBERT-base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/wiiiktor/chopper-0.31B
- Repositorio principal (todas las variantes y resultados): https://huggingface.co/wiiiktor/chopper_mmbert
- GitHub (código, receta de entrenamiento y benchmarks): https://github.com/wiiiktor/chopper_demo
- Dataset de demostración: https://huggingface.co/datasets/wiiiktor/chopper_demo
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
