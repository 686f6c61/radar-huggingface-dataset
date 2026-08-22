# xidrug/qwen3.5-9b-kh-trade-logistics-merged-v1

## Resumen

Este modelo es una adaptación del modelo base Qwen/Qwen3.5-9B, especializado mediante QLoRA para el dominio de comercio y logística entre China y Kazajistán (中哈贸易物流). El autor, xidrug, ha publicado los pesos completos fusionados en formato bf16, tras un entrenamiento de ajuste fino supervisado (SFT) con 99.450 muestras de entrenamiento y 5.525 de validación. El modelo está diseñado para responder preguntas en chino sobre temas de comercio internacional, logística y aduanas, y se recomienda su uso combinado con sistemas de recuperación aumentada (RAG) para obtener información dinámica y actualizada.

La relevancia de este modelo radica en su enfoque vertical y especializado: en lugar de ser un modelo generalista, está optimizado para un dominio concreto con un vocabulario y contexto específicos. Aunque el modelo base Qwen3.5-9B es multimodal y de propósito general, esta adaptación se centra exclusivamente en texto y en tareas de preguntas y respuestas sobre comercio y logística. La licencia Apache-2.0 facilita su uso comercial, aunque se deben respetar las condiciones de la base y de las fuentes de datos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B base) |
| Parámetros totales | Aproximadamente 9.4B |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (heredado del modelo base) |
| Tipos de cuantización | bf16 (pesos fusionados), 4-bit NF4 (durante entrenamiento), compatible con cuantización posterior |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen3.5-9B, que es un modelo de lenguaje grande con atención completa, entrenado sobre un corpus masivo de datos multilingües y multimodales. La adaptación se realizó mediante QLoRA (Quantized Low-Rank Adaptation), una técnica de ajuste fino eficiente en parámetros que entrena adaptadores de bajo rango sobre un modelo base cuantizado a 4-bit NF4. Los adaptadores se entrenaron con supervisión (SFT) y posteriormente se fusionaron con los pesos originales para producir el modelo final en bf16.

El conjunto de entrenamiento consistió en 99.450 muestras, con 5.525 muestras de validación y 5.526 de test independiente. El proceso alcanzó una pérdida final de entrenamiento de 0.464494. La evaluación sobre una muestra estratificada de 86 ejemplos mostró una F1 a nivel de carácter del 83.46% y una F1 ROUGE-L del 82.81%. No se menciona el uso de RLHF o DPO; se trata de un ajuste fino supervisado clásico.

## Capacidades

- Generación de texto en chino especializado en comercio y logística internacional, incluyendo terminología de aduanas, transporte transfronterizo, incoterms y procedimientos logísticos.
- Preguntas y respuestas de dominio específico, con conocimiento de los procesos de importación/exportación entre China y Kazajstán.
- Integración con sistemas RAG: el modelo está diseñado para trabajar junto a un sistema de recuperación de información, generando respuestas basadas en los documentos recuperados.
- Soporte de conversaciones multi-turno (no se especifica si hay función de pensamiento o razonamiento extendido).
- Limitación crítica: la extracción de JSON en formato estricto falla por completo (0% de JSON válidos en el test), por lo que no es fiable para salidas estructuradas.
- No se menciona soporte de tool calling o function calling en la adaptación, aunque el modelo base podría tenerlo.

## Casos de uso

- Atención al cliente en logística internacional: el modelo puede resolver consultas frecuentes sobre trámites aduaneros, documentación y tiempos de tránsito, integrado en un chat con recuperación de documentos actualizados.
- Asistente interno para agentes de comercio exterior: permite a los agentes consultar procedimientos, normativas y tarifas de transporte entre China y Kazajstán, mejorando la eficiencia en la preparación de envíos.
- Soporte de decisiones en logística: análisis de rutas, comparación de opciones de transporte y cálculo de costes aproximados, siempre con datos estáticos y complementado con RAG para datos en tiempo real.
- Formación de personal en comercio transfronterizo: herramienta educativa para empleados que necesitan aprender la terminología y los procesos del sector.
- Integración en sistemas de gestión de pedidos: automatización de respuestas sobre estados de envío y documentación, combinando el modelo con bases de datos de seguimiento.
- Investigación de mercado y análisis de rutas: generación de informes descriptivos sobre corredores logísticos, puertos y ferrocarriles, basados en conocimiento estático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es el proporcionado por el autor:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 0.464494 |
| F1 a nivel de carácter (muestra de 86 ejemplos) | 83.46% |
| F1 ROUGE-L (muestra de 86 ejemplos) | 82.81% |
| Proporción de JSON válidos en test | 0.00% |

Estos resultados son específicos del dominio y no comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada: para inferencia en bf16, se necesitan aproximadamente 19 GB de VRAM (9.4B parámetros × 2 bytes). Con cuantización a 4-bit, se reduce a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) para ejecutar en bf16 sin problemas. Para 4-bit, una RTX 3080 (10-12 GB) o similar es suficiente.
- En consumer GPU: sí, cabe en GPU de 24 GB con cuantización, y en GPU de 16 GB con 4-bit.
- Opciones de despliegue: es compatible con transformers, vLLM, llama.cpp y Ollama (mediante conversión a GGUF). Se recomienda usar la plantilla `qwen3_5_nothink` en LLaMA-Factory.
- Latencia y throughput: no disponible, pero por el tamaño se espera una generación de ~20-30 tokens/s en una GPU de 24 GB con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.4B | No disponible | Generalista | Apache-2.0 |
| Qwen3.5-9B-kh-trade-logistics (este modelo) | 9.4B | No disponible | Comercio y logística China-Kazajstán | Apache-2.0 |
| Qwen2.5-9B-Instruct | 9.4B | No disponible | Generalista | Apache-2.0 |

La comparativa con otros modelos de la misma categoría (9B) es limitada porque la mayoría son generalistas. Este modelo se distingue por su enfoque en un dominio vertical concreto, lo que puede ofrecer mayor precisión en ese ámbito, pero menor versatilidad fuera de él. No se han publicado comparativas formales con otros modelos de comercio.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para chino; no es útil para otros idiomas.
- Los datos dinámicos (aranceles, tipos de cambio, precios, estado de puertos, tiempos de tránsito) no están actualizados y deben consultarse en fuentes externas. El modelo no debe utilizarse para decisiones basadas en información en tiempo real sin verificación.
- La generación de JSON es extremadamente deficiente (0% de salidas válidas en el test). No se debe usar para tareas que requieran salida estructurada sin un sistema de validación o restricción de decodificación.
- No se han documentado sesgos específicos, pero al ser un modelo de dominio, puede heredar sesgos del corpus de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que se deben cumplir las condiciones de la base y de las fuentes de datos originales (no especificadas).
- Al estar basado en un modelo no publicado oficialmente (Qwen3.5-9B), es recomendable verificar la estabilidad del modelo base y la compatibilidad con el ecosistema.

## Enlaces

- HuggingFace: https://huggingface.co/xidrug/qwen3.5-9b-kh-trade-logistics-merged-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto (según el autor): disponible en el GitHub del proyecto, pero no se proporciona URL en la información disponible.
- Documentación de Qwen3.5: https://huggingface.co/docs/transformers/model_doc/qwen3_5
