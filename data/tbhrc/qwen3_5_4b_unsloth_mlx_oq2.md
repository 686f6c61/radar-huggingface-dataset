# tbhrc/qwen3_5_4b_unsloth_mlx_oq2

## Resumen

Este modelo es una cuantización de precisión mixta de 2 bits del Qwen3.5-4B, realizada con la librería oQ y exportada en formato MLX safetensors. El autor, tbhrc, publica esta conversión para permitir ejecutar el modelo en hardware Apple Silicon con un consumo de memoria reducido (el repositorio ocupa 2,3 GB frente a los aproximadamente 9,1 GB de VRAM que requiere la versión base sin cuantizar según LLM Explorer).

Qwen3.5 es la nueva familia de modelos de Alibaba que incluye versiones Small de 0,8B, 2B, 4B y 9B, además de variantes más grandes (35B-A3B, 27B, 122B-A10B y 397B-A17B). Según la documentación de Unsloth, se trata de modelos multimodales híbridos de razonamiento que ofrecen el mejor rendimiento de su categoría por tamaño. Esta cuantización en particular reduce drásticamente el espacio en disco y la memoria necesaria, a costa de una pérdida de calidad esperable en cuantización de 2 bits.

La relevancia de este modelo radica en que permite probar la familia Qwen3.5 en entornos con recursos limitados, aunque el autor no ha publicado información sobre la licencia, los idiomas soportados ni benchmarks que permitan validar la calidad de la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal híbrido de razonamiento) |
| Parametros totales | 798.596.096 (según safetensors; el modelo original es de 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de 2 bits, group size 64, mixed-precision |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un modelo multimodal híbrido de razonamiento desarrollado por Alibaba. Según la documentación de Unsloth, la familia Qwen3.5 incluye modelos con capacidades de visión y razonamiento, y se describe como "multimodal hybrid reasoning LLMs" que ofrecen el mejor rendimiento de su tamaño.

La cuantización se ha realizado con la librería oQ (https://github.com/jundot/omlx), que implementa cuantización de precisión mixta. En este caso, se ha aplicado una cuantización de 2 bits con grupo de tamaño 64. El resultado se exporta en formato MLX safetensors, lo que permite su ejecución en dispositivos Apple Silicon mediante la librería MLX de Apple.

No se dispone de información sobre el dataset de entrenamiento del modelo base, ni sobre el proceso de cuantización en detalle (calibración, métricas de pérdida, etc.). El autor tampoco proporciona datos sobre el número de tokens de entrenamiento o si se aplicaron técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-4B es un modelo de razonamiento híbrido, capaz de alternar entre modos de pensamiento rápido y profundo según la tarea.
- Capacidades multimodales: la familia Qwen3.5 incluye soporte de visión, aunque no se especifica si esta cuantización conserva todas las capacidades multimodales del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada, aunque es una capacidad estándar en la familia Qwen.
- Soporte de agentes y multi-step reasoning: no disponible, pero el modelo base está diseñado para razonamiento en múltiples pasos.
- Capacidades multilingües: no disponibles (el autor no las ha especificado).

## Casos de uso

- Inferencia en Apple Silicon con memoria limitada: este modelo permite ejecutar Qwen3.5-4B en un MacBook con 8-16 GB de RAM unificado, gracias a la cuantización de 2 bits. Se puede cargar con MLX y usar para generación de texto local sin conexión.
- Prototipado rápido en entornos de desarrollo: por su tamaño reducido (2,3 GB en disco), es adecuado para probar la familia Qwen3.5 en pipelines de desarrollo sin necesidad de infraestructura GPU dedicada.
- Generación de texto en aplicaciones de escritorio: integrable en aplicaciones nativas de macOS que requieran generación de texto local con baja latencia, como asistentes personales o herramientas de redacción.
- Razonamiento en entornos con recursos restringidos: para tareas de razonamiento sencillas que no requieran la máxima calidad de generación, esta cuantización permite ejecutar el modelo en hardware modesto.
- Aprendizaje e investigación de técnicas de cuantización: el repositorio sirve como ejemplo de cómo aplicar oQ (mixed-precision quantization) a modelos Qwen3.5 para MLX, útil para investigadores que estudian técnicas de compresión.
- Evaluación comparativa de cuantizaciones: permite comparar la calidad de salida de una cuantización de 2 bits frente a las versiones sin cuantizar o con otros métodos de cuantización (por ejemplo, GGUF), para determinar si la pérdida de calidad es aceptable en un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica que permita comparar esta cuantización con el modelo base o con otras cuantizaciones. El autor tampoco ofrece mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,3 GB, por lo que se puede cargar en memoria unificada de Apple Silicon con 8 GB o más, pero no se proporciona el consumo exacto en inferencia.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con MLX. No se ha diseñado para GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: solo dispositivos Apple Silicon; no se puede ejecutar en GPUs de escritorio sin adaptar el formato (por ejemplo, convirtiendo a GGUF).
- Opciones de despliegue: MLX (Apple), posiblemente conversión a GGUF para llama.cpp, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| tbhrc/qwen3_5_4b_unsloth_mlx_oq2 | 798M (cuantizado) | 2 bits (oQ) | no disponible | MLX safetensors | no disponible |
| Christ9038/Qwen3.5-4B-unsloth-MLX-oQ2 | similar (no confirmado) | 2 bits (oQ) | no disponible | MLX safetensors | no disponible |
| unsloth/Qwen3-4B | 4B | sin cuantizar | no disponible | safetensors | Apache 2.0 (Qwen3) |

La comparativa directa es limitada. El modelo de tbhrc es prácticamente idéntico al de Christ9038 (mismo nombre y método de cuantización), aunque no se puede confirmar si son el mismo artefacto. Frente al Qwen3-4B de unsloth, la diferencia principal es que Qwen3 es la generación anterior de Alibaba, mientras que Qwen3.5 es la nueva familia con capacidades multimodales. La cuantización de 2 bits reduce el peso a aproximadamente un cuarto del tamaño original, pero la pérdida de calidad no está documentada.

## Limitaciones y advertencias

- Cuantización de 2 bits: la pérdida de calidad respecto al modelo original es significativa y esperable. Los modelos de 2 bits suelen degradar notablemente la fluidez y el razonamiento en comparación con cuantizaciones de 4 u 8 bits.
- Sin benchmarks publicados: no hay forma de evaluar la calidad real de esta cuantización. El autor no aporta métricas de pérdida ni resultados de tareas.
- Licencia no especificada: no se indica la licencia del modelo, lo que dificulta su uso en proyectos comerciales. Es necesario contactar con el autor o buscar información adicional.
- Idiomas no especificados: no se sabe qué idiomas soporta correctamente el modelo, aunque es probable que herede las capacidades multilingües de Qwen3.5 (principalmente chino e inglés).
- Fecha de creación: el modelo se creó en agosto de 2026, lo que sugiere que es muy reciente y que la familia Qwen3.5 puede no estar completamente estabilizada o documentada.
- Sin soporte de tool calling confirmado: no se ha confirmado si esta cuantización conserva las capacidades de tool calling y agentes del modelo base.
- Formato MLX propietario: el formato MLX safetensors no es compatible con vLLM, TGI ni llama.cpp sin conversión previa, lo que limita las opciones de despliegue en entornos de producción no-Apple.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq2
- Repositorio de oQ (librería de cuantización): https://github.com/jundot/omlx
- Documentación de Qwen3.5 de Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 de Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Modelo similar de Christ9038: https://huggingface.co/Christ9038/Qwen3.5-4B-unsloth-MLX-oQ2
- Modelo base Qwen3-4B de unsloth: https://huggingface.co/unsloth/Qwen3-4B
- Ficha de Qwen3.5-4B Base en LLM Explorer: https://llm-explorer.com/model/unsloth%2FQwen3.5-4B-Base,6Z4RzEnYvZHbfPT6nzuaGm
