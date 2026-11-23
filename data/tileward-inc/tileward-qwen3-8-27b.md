# Tileward-Inc/Tileward-Qwen3.8-27B

## Resumen

Tileward-Qwen3.8-27B es una compresión del modelo Qwen3.8-27B desarrollada por Tileward-Inc. Se trata de una versión cuantizada del modelo base de Qwen que reduce el tamaño de los pesos un 64% (factor de compresión 2,8x), pasando de 55,6 GB a 20,1 GB en disco, manteniendo un rendimiento en MMLU (5-shot) de 82,4 puntos, ligeramente por encima de los 82,1 de la build NVFP4 de NVIDIA para el mismo modelo.

El modelo acepta entrada de texto e imagen (hereda las capacidades multimodales del base) y está pensado para despliegues donde el espacio en disco y la memoria de GPU son limitados. Según el autor, se mantiene a la par de la build NVFP4 de NVIDIA en MMLU-Redux y en tasa de acierto de tool calls, con una tasa de hechos inventados ligeramente inferior (3,8% frente a 4,7%).

Es relevante porque demuestra que técnicas de compresión propias pueden igualar o superar ligeramente a formatos de cuantización de hardware específico (NVFP4) con un archivo aún más pequeño. La licencia es Apache-2.0, aunque los pesos no se publican en Hugging Face: el modelo solo está disponible a través de la API alojada de Tileward, en despliegue en la nube del cliente o en modo air-gapped.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen3.8-27B) |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | compresión propietaria de Tileward (64% de reducción, 2,8x); comparable a NVFP4 de NVIDIA |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos no publicados en Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentación proporcionada. El modelo Tileward es una versión comprimida mediante técnicas propietarias de Tileward, que reducen el tamaño de los pesos un 64% respecto al original (de 55,6 GB a 20,1 GB), con un factor de compresión de 2,8x.

El autor indica que el modelo resultante ocupa 18,9 GiB al cargarse en GPU, frente a los 20,6 GiB de la build NVFP4 de NVIDIA. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación técnica concreta del método de compresión, más allá de los resultados comparativos publicados.

## Capacidades

- Generación de texto y razonamiento, con un rendimiento de 82,4 en MMLU (5-shot) según el autor.
- Entrada multimodal: acepta texto e imagen, según la model card.
- Modo "thinking" (razonamiento extendido), empleado en la evaluación MMLU-Redux con thinking activado.
- Tool calling / function calling: 240 de 240 tool calls correctas en la evaluación del autor.
- Generación de documentos con baja tasa de hechos inventados (3,8%).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en GPU de gama alta con memoria limitada: con 18,9 GiB cargados en tarjeta, el modelo cabe en una GPU de 24 GB (por ejemplo, RTX 4090) y deja margen para el contexto, lo que permite ejecutar un modelo de 27B en hardware de consumo profesional.
- Atención al cliente automatizada: el soporte de tool calling fiable (240/240 en la evaluación del autor) permite integrar el modelo en flujos de resolución de incidencias con llamadas a APIs internas.
- Generación de documentación técnica: la baja tasa de hechos inventados (3,8%) lo hace adecuado para redactar informes y fichas donde la fidelidad factual es crítica.
- Procesamiento de documentos con imágenes: al aceptar entrada de imagen, puede extraer y resumir información de capturas, diagramas o documentos escaneados.
- Razonamiento multi-paso en modo thinking: útil para tareas de análisis que requieren cadenas de razonamiento largas, como auditorías o revisión de código.
- Despliegue air-gapped: Tileward ofrece ejecución en modo aislado, adecuado para entornos con requisitos de confidencialidad que no pueden usar APIs públicas.
- Integración vía API compatible con OpenAI: el endpoint `https://api.tileward.com/v1` permite sustituir modelos OpenAI en pipelines existentes sin reescribir el código cliente.

## Benchmarks y rendimiento

| Benchmark | Tileward-Qwen3.8-27B | NVFP4 de NVIDIA | Qwen3.8-27B original |
|---|---|---|---|
| MMLU (5-shot) | 82,4 | 82,1 | no disponible |
| MMLU-Redux (5.700 preguntas, thinking on) | 89,4% | 89,4% | no disponible |
| Hechos inventados al escribir documentos (menor es mejor) | 3,8% | 4,7% | no disponible |
| Tool calls correctas (de 240) | 240 | 240 | no disponible |
| Concordancia con la siguiente palabra del original | 87,8% | 88,9% | referencia |
| Memoria cargada en GPU | 18,9 GiB | 20,6 GiB | no disponible |
| Tamaño en disco | 20,1 GB | 21,9 GB | 55,6 GB |

Los datos de MMLU (5-shot) proceden del model-index declarado por el autor y no están verificados. El resto de cifras provienen de la model card y de las evaluaciones publicadas en tileward.com/evals.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,9 GiB cargados en GPU según el autor, lo que deja margen en tarjetas de 24 GB para contexto y caché KV.
- GPU recomendadas: no especificadas por el autor; por el tamaño en memoria, encaja en RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM (RTX 4090, RTX 5090 si dispone de memoria suficiente).
- Opciones de despliegue: API alojada de Tileward, despliegue en la nube del cliente o air-gapped. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y los pesos no están publicados, por lo que el despliegue local con estas herramientas no está disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tileward-Qwen3.8-27B | 27B | no disponible | 82,4 | 20,1 GB | Apache-2.0 | API alojada, nube del cliente, air-gapped |
| Qwen3.8-27B-NVFP4 (NVIDIA) | 27B | no disponible | 82,1 | 21,9 GB | Apache-2.0 (base) | pesos publicados |
| Qwen3.8-27B (original) | 27B | no disponible | no disponible | 55,6 GB | Apache-2.0 | pesos publicados |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face: el modelo solo se puede usar mediante la API de Tileward, en la nube del cliente o en despliegue air-gapped, lo que limita la inspección y el uso local.
- El resultado de MMLU (82,4) está declarado por el autor y marcado como no verificado (`verified: false`).
- La concordancia con la siguiente palabra del original es inferior a la de la build NVFP4 de NVIDIA (87,8% frente a 88,9%), lo que puede traducirse en diferencias de estilo o fluidez en generaciones largas.
- No se dispone de información sobre sesgos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad para aplicaciones multilingües o de contexto largo.
- El método de compresión es propietario y no se detalla, por lo que no es posible auditar posibles degradaciones en tareas no cubiertas por los benchmarks publicados.
- Aunque la licencia es Apache-2.0, las condiciones de uso comercial a través de la API de Tileward dependen de los términos del servicio del proveedor.
- Riesgo de alucinación: el autor reporta un 3,8% de hechos inventados en la tarea evaluada, lo que sigue requiriendo verificación humana en producción.

## Enlaces

- [Tileward-Qwen3.8-27B en Hugging Face](https://huggingface.co/Tileward-Inc/Tileward-Qwen3.8-27B)
- [Modelo base Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Research: We made Qwen3.8-27B 8.5% smaller than NVIDIA's NVFP4 build, and beyond](https://tileward.com/research/a-smaller-qwen3-8-27b/)
- [Metodología de evaluación](https://tileward.com/evals/#compressed-model-27b)
- [Investigación de Tileward](https://tileward.com/research/)
- [Demo interactiva](https://demo.tileward.com)
- [Plataforma y API](https://app.tileward.com/?join=explore)
- [Sitio de Tileward](https://tileward.com)
