# zils-ai/z3-mini-soup-preview

## Resumen

z3-mini-soup-preview es un checkpoint experimental publicado por zils-ai que aplica la técnica de *model soup* (promediado uniforme de pesos) sobre tres ajustes finos del modelo base Qwen3.5-4B. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de la familia z3-mini: es la primera iteración diaria del proceso automático de Zils, que promedia los cuerpos de distintos fine-tunes de decisión y solo los incorpora si la media mejora las puntuaciones individuales. El modelo resultante tiene 4.539.265.536 parámetros y se distribuye en formato safetensors con licencia Apache-2.0.

La relevancia de este checkpoint es metodológica: demuestra que el promediado de pesos entre fine-tunes independientes del mismo base puede superar a cada ingrediente por separado en una tarea concreta (clasificación y decisión sobre texto). El autor reporta una mejora de 1,6 a 4,6 puntos en su examen privado frente a los tres modelos de origen. Sin embargo, el propio autor advierte de que no ha pasado la puerta de release de Zils y de que el comportamiento en visión puede degradarse.

El modelo se presenta como *feature-extraction* en el pipeline de Hugging Face, pero funcionalmente está orientado a decisiones: comparte la capa de respuesta, el prompt y el runtime de d3-mini (z3-mini v1), por lo que se ejecuta con los mismos ficheros de runtime y la misma API `/v1/systemone`. La información pública sobre idiomas soportados, contexto y benchmarks estándar es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); pesos promediados de tres fine-tunes |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; repo de 9,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (runtime Python propio: `d3_runtime.py`, `d3_server.py`) |

## Arquitectura y entrenamiento

El modelo no se entrena: se construye por *model soup*. Los pesos de las ramas `language_model.*` y `visual.*` de tres fine-tunes de decisión sobre Qwen3.5-4B se promedian de forma uniforme en fp32 y se guardan en bf16. Los ingredientes son torchcast-decision-4b (commit `492bfb1`), pplx-decider-flash-v1.2 (commit `9ff7cf9`) y d3-mini, también conocido como z3-mini v1 (commit `df99bf4`), todos con licencia Apache-2.0. La capa de respuesta, el tokenizer, el prompt y el runtime son los de d3-mini, sin modificar; de hecho, la capa de respuesta es byte-idéntica a la de d3-mini. El hash del soup es `063e05dc12c15db265de911499582549e6acf02840dccc38dc1edb1482689cd6`.

No hay información pública sobre el número de tokens de entrenamiento de los ingredientes, la composición de sus datasets ni si emplearon RLHF o DPO. La innovación técnica aquí es el procedimiento de selección: Zils construye un soup diario y solo añade un modelo al promedio si la media resultante mejora la puntuación en su examen privado. Este checkpoint corresponde a la primera ronda diaria y todavía no ha superado la puerta de release (selecciones selladas, tirada de confirmación y suite de adaptadores).

## Capacidades

- Toma de decisiones sobre texto: clasificación y elección de respuesta en cinco categorías evaluadas (artes, lengua, razonamiento, recuperación y herramientas).
- Recuperación de información (*retrieval*) y uso de herramientas (*tools*), las dos categorías con mejor puntuación en el examen del autor (87,3 y 84,1 sobre 100).
- Generación de texto y razonamiento básico, heredados del base Qwen3.5-4B, aunque el razonamiento es la categoría más débil en el examen (50,7).
- Soporte de *tool calling* / *function calling*: no hay confirmación explícita en la información disponible, pero la categoría "Tools" del examen sugiere capacidades en ese ámbito.
- Capacidades multimodales parciales: los pesos `visual.*` se promedian, pero el autor advierte de que el examen es solo de texto y el comportamiento en imagen y cajas delimitadoras puede ser peor que el de cualquiera de los ingredientes.
- API de servicio propia (`/v1/systemone`) mediante los ficheros de runtime incluidos.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clasificación y enrutamiento de consultas: el modelo puede etiquetar tickets o peticiones entrantes en categorías predefinidas, aprovechando su buen resultado en "Language" (80,1) y "Retrieval" (87,3) del examen privado.
- Selección de herramienta en pipelines de agentes: dada una consulta y un catálogo de funciones, el modelo elige la herramienta adecuada; la categoría "Tools" (84,1) es la segunda mejor puntuada.
- Filtrado y ranking de documentos recuperados: con 87,3 en "Retrieval", es adecuado para decidir qué fragmentos de un RAG son relevantes antes de pasarlos a un modelo generador mayor.
- Moderación y decisión de contenido: clasificación binaria o multiclase de textos según políticas, usando la capa de respuesta de d3-mini y su prompt de decisión.
- Evaluación comparativa de fine-tunes: sirve como referencia práctica para equipos que quieran replicar el método de *model soup* sobre Qwen3.5-4B y medir si el promedio supera a los modelos individuales.
- Prototipado de servicios de decisión con API propia: al incluir `d3_server.py` y la API `/v1/systemone`, se puede desplegar un endpoint de decisión sin reescribir el runtime.
- Investigación sobre promediado de pesos: caso de estudio reproducible (commits e ingredientes documentados) para estudiar cuándo el *soup* mejora y cuándo degrada capacidades multimodales.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del examen privado de Zils (3.000 preguntas de decisión con etiquetas de datos reales, cinco categorías). El autor indica explícitamente que no son benchmarks públicos.

| Modelo | Puntuación (0–100) |
|---|---|
| z3-mini-soup-preview (este soup) | 74,3 |
| torchcast-decision-4b | 72,7 |
| pplx-decider-flash-v1.2 | 71,4 |
| d3-mini (z3-mini v1) | 69,7 |

| Categoría | Puntuación del soup |
|---|---|
| Arts | 76,9 |
| Language | 80,1 |
| Reasoning | 50,7 |
| Retrieval | 87,3 |
| Tools | 84,1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda un mínimo de 12–16 GB.
- Cuantización: no se documentan versiones GGUF ni cuantizadas; el repo solo incluye safetensors en bf16, por lo que no se puede confirmar su funcionamiento en GPUs de gama baja sin convertir los pesos.
- GPU recomendadas: no disponible en la información del autor. Por tamaño, cabría en una RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con margen ajustado; para despliegue en servidor, A100 o H100 con holgura.
- Despliegue: el autor indica que se ejecuta igual que d3-mini v3.1.0, con los ficheros `d3_runtime.py` y `d3_server.py` y la API `/v1/systemone`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación examen Zils | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| z3-mini-soup-preview | 4,54 B | no disponible | 74,3 | Apache-2.0 | Hugging Face (preview) |
| torchcast-decision-4b | ~4 B (base Qwen3.5-4B) | no disponible | 72,7 | Apache-2.0 | Hugging Face |
| pplx-decider-flash-v1.2 | ~4 B (base Qwen3.5-4B) | no disponible | 71,4 | Apache-2.0 | Hugging Face |
| d3-mini (z3-mini v1) | ~4 B (base Qwen3.5-4B) | no disponible | 69,7 | Apache-2.0 | Hugging Face |

Los cuatro modelos comparten base y familia, por lo que la comparación se limita al examen privado del autor; no hay datos públicos que permitan compararlos con alternativas de otros linajes.

## Limitaciones y advertencias

- Solo decisiones de texto: el examen no mide calidad en imagen, vídeo ni cajas delimitadoras; el comportamiento multimodal puede ser peor que el de cualquiera de los ingredientes.
- No es un release oficial: no ha pasado la puerta de release de Zils (selecciones selladas, tirada de confirmación y suite de adaptadores); los adaptadores entrenados sobre z3-mini v1 no tienen garantía de funcionar.
- Posible solapamiento con benchmarks públicos: los ingredientes son modelos de terceros y sus datos de entrenamiento pueden coincidir con evaluaciones públicas, lo que inflaría las puntuaciones.
- Razonamiento débil: 50,7 sobre 100 en la categoría de razonamiento del examen privado, muy por debajo del resto de categorías.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión con capa de respuesta fija, el riesgo se concentra en la clasificación errónea más que en la generación libre.
- Idiomas y contexto: sin datos publicados; no se puede garantizar cobertura multilingüe ni ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero se deben conservar los ficheros `LICENSE` y `NOTICE` de los tres ingredientes incluidos en el repo; no implica afiliación ni respaldo de Qwen, Alibaba Cloud, torchcast-ai, Perplexity o vllm-sr.
- Madurez: 14 descargas y 0 likes en el momento de la consulta; creado y actualizado el 31 de octubre de 2026, sin histórico de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zils-ai/z3-mini-soup-preview
- Ingrediente torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Ingrediente pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Ingrediente d3-mini (z3-mini v1): https://huggingface.co/vllm-sr/d3-mini
- Instrucciones de uso de d3-mini v3.1.0: https://huggingface.co/vllm-sr/d3-mini/blob/a475367de0d8133a3c1a2a0dc12303d89cfa2ab4/README.md
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
