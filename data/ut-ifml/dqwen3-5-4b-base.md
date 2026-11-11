# UT-IFML/dQwen3.5-4B-Base

## Resumen

dQwen3.5-4B-Base es un modelo de lenguaje de difusión enmascarada (masked diffusion language model) construido a partir de Qwen3.5-4B, desarrollado por UT-IFML (con autores del paper afiliados a instituciones académicas como UT Austin, según los nombres del equipo). A diferencia de un transformer autorregresivo convencional, el modelo decodifica secuencias completas de forma paralela mediante un proceso de difusión sobre tokens enmascarados, lo que permite generar "lienzos" (canvas) completos en varios pasos en lugar de token a token.

La innovación principal es su backbone híbrido: solo las capas de atención se han hecho bidireccionales, mientras que las capas Gated DeltaNet (atención lineal con estado recurrente) permanecen causales. Esto preserva la eficiencia de las capas lineales y aprovecha la atención bidireccional para el modelado global que requiere la difusión. El modelo tiene 4.205.751.296 parámetros totales, se distribuye en safetensors y requiere `transformers>=5.13` con `trust_remote_code=True` y `flash-linear-attention`.

Es relevante ahora porque explora una alternativa arquitectónica a la generación autorregresiva en la familia Qwen3.5, con decodificación paralela y control de confianza por posición, y porque ofrece una variante de checkpoint alineada con el paper (50B tokens, `revision="step25000-swa"`). Es un modelo base, sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención bidireccional + capas Gated DeltaNet causales; modelo de difusión enmascarada (masked diffusion) |
| Parametros totales | 4.205.751.296 (4,21B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en el quickstart) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y lo adapta a un esquema de difusión enmascarada. El backbone es híbrido: las capas de atención se convierten en bidireccionales, mientras que las capas Gated DeltaNet (atención lineal con decaimiento controlado por compuertas) se mantienen causales. La decodificación se realiza sobre un lienzo completo: `generate` propone todos los tokens a la vez y consolida las posiciones cuya confianza supera un umbral (`conf_threshold=0.9`, el tau del paper). La confianza se calcula por defecto como la probabilidad top-1 (`conf_source="top1"`); existe también `conf_source="sampled"`, que lee la probabilidad del token muestreado y solo difiere con `temperature>0`. Se puede forzar decodificación por bloques de izquierda a derecha (`block_length=32`) o un presupuesto fijo de pasos (`conf_threshold=None, steps_per_block=k`). Los nombres `tau=` y `order=` siguen funcionando como alias obsoletos de `conf_threshold=` y `remask_order=`.

En cuanto a entrenamiento, la model card indica que el checkpoint del paper corresponde a 50B tokens (`revision="step25000-swa"`), pero no detalla la composición del dataset, el uso de RLHF/DPO ni otras fases de alineación. Es un modelo base, sin instruction tuning. El paper asociado es "dQwen3.5: Hybrid-Attention Diffusion Language Models" (arXiv:2609.20751), con código en el repositorio `AntonXue/dQwen`.

## Capacidades

- Generación de texto mediante decodificación por difusión enmascarada, con consolidación paralela de posiciones de alta confianza.
- Generación de código: el quickstart oficial usa el prompt `def fibonacci(n):` y stop strings como `\ndef` y `\nclass`, lo que sugiere soporte para completado de código.
- Decodificación configurable: modo de lienzo completo, modo por bloques (`block_length=32`) o presupuesto fijo de pasos.
- Control de confianza por posición (`conf_source="top1"` o `"sampled"`), útil para ajustar precisión frente a velocidad.
- Modelo base: no incluye instruction tuning, por lo que no está optimizado para seguir instrucciones conversacionales de forma nativa.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Completado de código en IDE: el modelo puede recibir un prefijo como `def fibonacci(n):` y completar el cuerpo de la función; los stop strings documentados (`\ndef`, `\nclass`) permiten delimitar bloques y encadenar generaciones en un editor o plugin.
- Generación de código en pipelines de CI/CD: con decodificación por bloques (`block_length=32`) se puede generar código de forma incremental y determinista (greedy), lo que facilita la integración en herramientas de scaffolding o generación de tests.
- Investigación en modelos de difusión: sirve como base reproducible para estudiar decodificación paralela, umbrales de confianza y remasking, gracias a los parámetros expuestos (`conf_threshold`, `steps_per_block`, `remask_order`).
- Fine-tuning sobre tareas específicas: al ser un modelo base con licencia Apache 2.0, es adecuado como punto de partida para ajuste supervisado en dominios concretos (código, texto técnico) sin restricciones comerciales.
- Generación de texto con control de latencia: el modo de presupuesto fijo de pasos (`steps_per_block=k`) permite intercambiar calidad por número de pasos de difusión, útil en entornos con requisitos estrictos de tiempo.
- Experimentación con atención híbrida: permite comparar el comportamiento de capas bidireccionales frente a Gated DeltaNet causales en tareas de modelado de lenguaje, usando la familia dQwen3.5 (0.8B, 2B, 4B, 9B) y el control dQwen3-1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,21B parámetros en bfloat16 requiere aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y del lienzo de decodificación; en cuantización de 8 bits rondaría 4,2 GB y en 4 bits unos 2,1 GB (estimaciones genéricas, no verificadas para este modelo).
- GPU recomendadas: no disponibles en la información proporcionada. El quickstart exige una GPU CUDA y ha sido probado con `torch 2.7.1+cu128` y `flash-linear-attention 0.5.1`.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos en bfloat16, encajaría en GPUs de 12-16 GB o superiores, pero la dependencia de `flash-linear-attention` y del código personalizado puede limitar la compatibilidad.
- Opciones de despliegue: `transformers>=5.13` con `trust_remote_code=True` y `AutoModel`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La decodificación por difusión con `steps_per_block` permite ajustar el número de pasos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dQwen3.5-4B-Base | 4,21B | no disponible | Difusión enmascarada, backbone híbrido | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | Transformer autorregresivo | no disponible en esta ficha | Hugging Face |
| dQwen3.5-2B-Base | 1,88B | no disponible | Difusión enmascarada, backbone híbrido | Apache 2.0 | Hugging Face |
| dQwen3.5-9B-Base | 8,95B | no disponible | Difusión enmascarada, backbone híbrido | Apache 2.0 | Hugging Face |
| dQwen3-1.7B-Base | 1,72B | no disponible | Difusión, atención completa (control) | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no está diseñado para seguir instrucciones ni para conversación directa sin ajuste adicional.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de Qwen3.5-4B, podría heredar sesgos del corpus original, pero no hay datos publicados.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados y longitud de contexto no especificados; no se debe asumir cobertura multilingüe ni ventanas largas.
- La decodificación por difusión requiere código personalizado (`trust_remote_code=True`) y `flash-linear-attention`, lo que añade dependencias y puede complicar el despliegue en producción.
- El comportamiento de `conf_source="sampled"` cambió el 2026-11-11; los resultados con muestreo pueden diferir de los anteriores a esa fecha. Los resultados greedy y los del paper no se ven afectados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y del código `AntonXue/dQwen`.
- No hay datos de benchmarks ni de latencia/throughput, por lo que la idoneidad en producción debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- Paper: https://arxiv.org/abs/2609.20751
- Código: https://github.com/AntonXue/dQwen
- dQwen3.5-0.8B-Base: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- dQwen3.5-2B-Base: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- dQwen3.5-9B-Base: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
- dQwen3-1.7B-Base: https://huggingface.co/UT-IFML/dQwen3-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
