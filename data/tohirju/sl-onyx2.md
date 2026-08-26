# Tohirju/sl-onyx2

## Resumen

El modelo Tohirju/sl-onyx2 es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros publicado en Hugging Face por el usuario Tohirju. El repositorio está marcado con la etiqueta `qwen3_5_text`, lo que sugiere una posible base arquitectónica en la familia Qwen 3.5, aunque no se ha confirmado oficialmente. El modelo se distribuye en formato safetensors y su acceso está restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de poder descargarlo.

La información pública disponible es extremadamente limitada: no se especifican la arquitectura exacta, la longitud de contexto, los idiomas soportados, la licencia concreta (solo se indica "other") ni los datos de entrenamiento. El repositorio no presenta descargas ni valoraciones, y no se han publicado resultados de benchmarks ni documentación técnica adicional. A pesar de su tamaño considerable, la falta de transparencia y de métricas de rendimiento dificulta su evaluación objetiva para casos de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta sugiere posible base Qwen 3.5, sin confirmar) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (requiere aceptar condiciones en Hugging Face) |
| Formato de pesos | safetensors (según etiqueta) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La etiqueta `qwen3_5_text` podría indicar que se basa en la arquitectura de la serie Qwen 3.5, pero no hay confirmación oficial. Tampoco se dispone de datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO, etc.) o innovaciones técnicas específicas. El repositorio no incluye un modelo card detallado ni referencias a papers o documentación técnica.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Dado su tamaño (~9B parámetros) y la etiqueta de texto, es plausible que pueda realizar tareas de generación de texto, razonamiento básico y posiblemente generación de código, pero estas afirmaciones son especulativas y no están respaldadas por documentación oficial. No se ha confirmado soporte para tool calling, agentes, visión, audio u otras modalidades.

## Casos de uso

No se pueden determinar casos de uso concretos y realistas debido a la ausencia de información sobre capacidades, rendimiento y licencia. Cualquier aplicación práctica requeriría primero una evaluación empírica del modelo en tareas específicas, así como la verificación de los términos de uso. Se recomienda no considerar este modelo para entornos de producción sin una validación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. Tampoco se han comparado sus resultados con modelos similares.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Como referencia orientativa para un modelo de ~9B parámetros en formato safetensors, se estima:

- VRAM necesaria para inferencia en FP16: aproximadamente 18-20 GB (sin cuantización).
- Con cuantización INT8: alrededor de 10-12 GB; con INT4: 6-8 GB (valores estimados, no confirmados).
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM (RTX 3090/4090, A10G, A100) para FP16; GPUs de 12-16 GB podrían funcionar con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que el formato de pesos sea compatible (safetensors es compatible con la mayoría de frameworks).
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones genéricas basadas en el tamaño del modelo y no en datos oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (mismo tamaño y tarea) con los que se pueda establecer una comparación objetiva, dado que no hay información sobre el rendimiento de este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero al ser un modelo entrenado con datos no especificados, es probable que herede sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: no evaluado; se desconoce su fiabilidad factual.
- Limitaciones de contexto e idioma: no especificadas; se desconoce la longitud máxima de contexto y los idiomas soportados.
- Restricciones de licencia: la licencia "other" y el acceso restringido (gated) implican que el uso comercial y la redistribución pueden estar sujetos a condiciones particulares que deben revisarse antes de cualquier uso.
- Caveat para producción: la ausencia total de documentación, benchmarks y soporte comunitario hace que este modelo no sea recomendable para entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tohirju/sl-onyx2
- Otros modelos del mismo autor (sin relación confirmada): https://huggingface.co/Tohirju/sl-niobium, https://huggingface.co/Tohirju/sl-dolmen3

No se han encontrado papers, blogs, demos o repositorios adicionales relacionados con este modelo.
