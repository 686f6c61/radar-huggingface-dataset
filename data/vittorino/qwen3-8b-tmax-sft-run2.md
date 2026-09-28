# vittorino/qwen3-8b-tmax-sft-run2

## Resumen

`qwen3-8b-tmax-sft-run2` es un ajuste fino supervisado (SFT) completo del modelo base [Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B), desarrollado por el usuario de HuggingFace `vittorino`. El entrenamiento se realiza sobre el dataset [`vittorino/tmax-sft-cleaned`](https://huggingface.co/datasets/vittorino/tmax-sft-cleaned) en una única NVIDIA DGX Spark (GB10), empleando matmuls en FP8 (torchao tensorwise), `torch.compile` y checkpointing de gradiente adaptativo. El objetivo es producir una variante especializada de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.200 millones de parámetros con 32.768 tokens de contexto nativo.

El modelo se encuentra en entrenamiento activo en el momento de publicación de esta ficha (28 de septiembre de 2026, según los metadatos). Se suben snapshots cada 6 horas etiquetados como `h<hours>-step<optimizer step>`, y el modelo final se etiquetará como `final-step<N>`. Los snapshots intermedios corresponden a puntos intermedios del schedule de entrenamiento y no han sido evaluados. El entrenamiento en FP8 es experimental y el autor planea compararlo con una ejecución en BF16 de la misma receta.

La relevancia de este modelo radica en su carácter abierto (licencia Apache 2.0) y en la exploración de técnicas de entrenamiento en precisión reducida (FP8) sobre hardware de una sola GPU, lo que puede resultar de interés para investigadores que estudien eficiencia de entrenamiento y fine-tuning de modelos de 8B. Al estar basado en Qwen3-8B, hereda la arquitectura y el tokenizador del modelo original, si bien el ajuste supervisado puede modificar sus capacidades originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-8B) |
| Parámetros totales | ~8.200 millones (heredado de Qwen/Qwen3-8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no confirmado para este checkpoint. Extensible a 131.072 con YaRN en el modelo base |
| Tipos de cuantización | No disponible (el entrenamiento usó FP8 tensorwise; no se publican cuantizaciones de inferencia específicas) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B declara soporte para 119 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se espera safetensors dado que la librería declarada es `transformers`) |
| Librería | transformers |
| Modelo base | Qwen/Qwen3-8B |
| Dataset de entrenamiento | vittorino/tmax-sft-cleaned |
| Hardware de entrenamiento | 1x NVIDIA DGX Spark (GB10) |
| Fecha de publicación | 2026-09-28 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, atención con RoPE, QK-Norm y atención por consultas agrupadas (GQA). Qwen3 incorpora además un modo de razonamiento explícito ("thinking mode") que puede activarse o desactivarse. Este checkpoint no modifica la arquitectura del modelo base; el ajuste supervisado afecta únicamente a los pesos.

El entrenamiento consiste en un SFT completo sobre el dataset `vittorino/tmax-sft-cleaned`. Se ejecuta en una única NVIDIA DGX Spark (GB10) con matmuls en FP8 mediante `torchao` (esquema tensorwise), `torch.compile` y checkpointing de gradiente adaptativo. El autor indica que el uso de FP8 es experimental en este contexto y que se comparará con una ejecución en BF16 de la misma receta. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas posteriores como RLHF o DPO. El entrenamiento está en curso: se suben snapshots cada 6 horas con etiquetas `h<hours>-step<step>` y el modelo final llevará la etiqueta `final-step<N>`. Los snapshots intermedios no han sido evaluados.

## Capacidades

Al derivar de Qwen3-8B, el modelo hereda las capacidades del base, aunque el SFT sobre `tmax-sft-cleaned` puede haberlas especializado o alterado de forma no documentada:

- Generación de texto, razonamiento y respuesta a instrucciones en múltiples idiomas.
- Generación de código en diversos lenguajes de programación.
- Razonamiento matemático y resolución de problemas paso a paso.
- Modo de razonamiento explícito (thinking mode) heredado de Qwen3.
- Soporte de tool calling / function calling según el formato de Qwen3.
- Capacidades de agente y razonamiento multi-paso.
- Comprensión de contexto largo (hasta 32.768 tokens nativos en el base, extensible a 131.072 con YaRN).
- Capacidades multilingües (119 idiomas en el modelo base).

No se ha publicado una evaluación específica de este checkpoint que confirme que dichas capacidades se mantienen o mejoran tras el SFT.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un contexto de hasta 32.768 tokens, lo que permite mantener el historial completo de una interacción y documentación de soporte sin truncamientos frecuentes.
- Generación de código en producción: su soporte de tool calling y su capacidad de razonamiento permiten integrarlo en pipelines de CI/CD para generar tests, revisar parches o autocompletar funciones, siempre que el SFT no haya degradado la calidad en código.
- Sistemas RAG sobre documentación técnica: con 32.768 tokens de contexto, puede ingerir varios documentos largos y responder preguntas citando fragmentos, reduciendo la necesidad de chunking agresivo.
- Asistentes de razonamiento matemático: el modo thinking de Qwen3 permite obtener cadenas de razonamiento paso a paso para resolver problemas de nivel universitario o de análisis cuantitativo.
- Traducción y localización multilingüe: hereda el soporte de 119 idiomas del base, adecuado para traducir documentación técnica o contenido de producto, aunque la calidad depende de la presencia de esos idiomas en el dataset de SFT.
- Extracción estructurada de información: a partir de contratos, informes o artículos, el modelo puede generar JSON u otros formatos estructurados, combinando tool calling con contexto largo.
- Agentes autónomos multi-paso: puede encadenar llamadas a herramientas y razonamiento intermedio para tareas como reservas, consultas a APIs o automatización de flujos.
- Resumen de documentos extensos: su ventana de contexto permite resumir papers, informes financieros o expedientes sin perder el hilo global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los snapshots intermedios no han sido evaluados y que el modelo está en entrenamiento. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo denso de ~8.200 millones de parámetros): aproximadamente 16-18 GB en FP16/BF16 solo para los pesos, más overhead de activaciones y caché KV, lo que sitúa el total en torno a 20-24 GB para contextos moderados.
- En cuantización INT8: aproximadamente 8-10 GB de VRAM.
- En cuantización INT4: aproximadamente 5-6 GB de VRAM.
- GPU consumer: cabe en tarjetas con 24 GB como RTX 3090, RTX 4090 o RTX 5090 en FP16/BF16. En INT8 o INT4 puede ejecutarse en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) o incluso de 8-12 GB con cuantizaciones agresivas.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S, etc., para despliegues de mayor throughput o contexto extendido.
- El entrenamiento se realizó en una única NVIDIA DGX Spark (GB10), un dispositivo de escritorio con GPU GB10.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp, Ollama, SGLang. No se dispone de configuraciones oficiales ni de recetas de cuantización publicadas para este checkpoint.
- Latencia y throughput: no disponibles. Dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-8b-tmax-sft-run2 | ~8B | No confirmado (base 32k) | Apache 2.0 | HuggingFace (entrenamiento en curso) |
| Qwen/Qwen3-8B | 8.2B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128.000 tokens | Llama 3.1 Community License | HuggingFace / Meta |
| Mistral 7B v0.3 | 7.2B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Gemma 2 9B | 9B | 8.192 tokens | Gemma Terms of Use | HuggingFace |

No se dispone de datos de rendimiento comparativo (benchmarks) para `qwen3-8b-tmax-sft-run2`, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento en curso: el modelo no está finalizado a fecha de la información. Los snapshots intermedios (`h<hours>-step<step>`) corresponden a puntos intermedios del schedule y no han sido evaluados; su calidad puede ser inconsistente.
- FP8 experimental: el autor señala que el entrenamiento en FP8 es experimental y será comparado con una ejecución en BF16; pueden existir diferencias de estabilidad numérica o de calidad frente al resultado en BF16.
- Ausencia de evaluación: no hay benchmarks publicados, por lo que se desconoce el rendimiento real en tareas de razonamiento, código, matemáticas o multilingüe.
- Dataset desconocido: no se especifican el tamaño, la composición ni la procedencia de `vittorino/tmax-sft-cleaned`. Esto impide anticipar sesgos, dominios de especialización o posibles degradaciones.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha realizado una evaluación de fidelidad factual.
- Idiomas: aunque el modelo base Qwen3-8B soporta 119 idiomas, el SFT puede haber reducido el rendimiento en idiomas poco representados en el dataset de ajuste. No se especifica el soporte lingüístico de este checkpoint.
- Contexto: la longitud de contexto de 32.768 tokens es la del modelo base; no se confirma que el ajuste la mantenga ni que se haya entrenado con esa longitud.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos del dataset `vittorino/tmax-sft-cleaned` por si imponen restricciones adicionales.
- Producción: al tratarse de un checkpoint en progreso y sin evaluación, no se recomienda su uso en producción sin una validación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vittorino/qwen3-8b-tmax-sft-run2
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset vittorino/tmax-sft-cleaned: https://huggingface.co/datasets/vittorino/tmax-sft-cleaned
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
