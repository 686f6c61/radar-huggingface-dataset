# UT-IFML/dQwen3.5-9B-Base

## Resumen

dQwen3.5-9B-Base es un modelo de lenguaje de difusión enmascarada (masked diffusion language model) construido a partir de Qwen3.5-9B, desarrollado por UT-IFML. A diferencia de los modelos autorregresivos convencionales, genera texto mediante un proceso de decodificación iterativa sobre un lienzo completo de tokens, comprometiendo posiciones cuando la confianza supera un umbral. El modelo es una versión base, sin ajuste por instrucciones.

La innovación principal reside en su esqueleto híbrido: solo las capas de atención se han convertido en bidireccionales, mientras que las capas Gated DeltaNet permanecen causales. Esto preserva parte de la eficiencia del modelo original de Qwen3.5 mientras habilita la difusión bidireccional en las capas de atención. Con 8.953.803.264 parámetros, se posiciona como la variante de mayor tamaño de la familia dQwen3.5, que incluye también versiones de 0,75B, 1,88B y 4,21B, además de un control dQwen3-1.7B con atención completa.

El modelo resulta relevante para investigadores interesados en alternativas a la generación autorregresiva, especialmente en escenarios donde la decodificación paralela o el refinamiento iterativo aportan ventajas. Su licencia Apache 2.0 y su integración con transformers facilitan la experimentación, aunque requiere GPU CUDA y versiones recientes de librerías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención bidireccional y capas Gated DeltaNet causales; modelo de difusión enmascarada |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión enmascarada sobre un esqueleto híbrido derivado de Qwen3.5-9B. La modificación clave consiste en hacer bidireccionales únicamente las capas de atención, manteniendo causales las capas Gated DeltaNet. Esta combinación busca equilibrar la capacidad de modelado global de la atención bidireccional con la eficiencia de las capas de estado recurrente. El proceso de generación decodifica todo el lienzo de tokens simultáneamente, comprometiendo posiciones cuya confianza supera un umbral configurable (por defecto 0,9, el tau del artículo), con opciones de decodificación por bloques de izquierda a derecha o con un presupuesto fijo de pasos.

El checkpoint principal corresponde a un entrenamiento de 50.000 millones de tokens, disponible bajo la revisión `step25000-swa`. No se dispone de información detallada sobre la composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO; al ser un modelo base, es previsible que no incluya ajuste por preferencias, aunque este extremo no se confirma en la información proporcionada. La decodificación utiliza la probabilidad top-1 como medida de confianza (`conf_source="top1"`), con una alternativa basada en la probabilidad del token muestreado (`conf_source="sampled"`).

## Capacidades

- Generación de texto mediante difusión enmascarada con decodificación paralela del lienzo completo.
- Decodificación por bloques de izquierda a derecha (`block_length=32`) o con presupuesto fijo de pasos (`steps_per_block=k`).
- Control de confianza mediante umbral configurable (`conf_threshold`) y orden de reenmascaramiento (`remask_order`).
- Generación de código, como se ilustra en el ejemplo de quickstart con funciones Python.
- Al ser un modelo base, no incluye ajuste por instrucciones ni modo de conversación nativo.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo sirve como banco de pruebas para comparar decodificación autorregresiva frente a difusión enmascarada con esqueletos híbridos, gracias a su control dQwen3-1.7B con atención completa.
- Generación de código asistida por refinamiento iterativo: el ejemplo de quickstart con `def fibonacci(n):` demuestra su uso para completar funciones, aprovechando la decodificación por bloques para producir código coherente.
- Experimentación con decodificación paralela de baja latencia: al comprometer múltiples posiciones por paso, puede explorarse en escenarios donde el throughput importa más que la generación token a token.
- Ajuste fino posterior para tareas específicas: al ser un modelo base con licencia Apache 2.0, es adecuado como punto de partida para fine-tuning supervisado en dominios concretos.
- Estudio de eficiencia de atención híbrida: la combinación de atención bidireccional y Gated DeltaNet causal permite investigar el equilibrio entre calidad y coste computacional en modelos de difusión.
- Reproducción de resultados académicos: la revisión `step25000-swa` permite replicar los experimentos del artículo dQwen3.5 con el checkpoint exacto utilizado.
- Evaluación comparativa de familias de modelos: la disponibilidad de variantes de 0,75B a 8,95B facilita estudios de escalado en difusión enmascarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere GPU CUDA; el modelo no está pensado para inferencia en CPU según la model card (`inference: false` en metadatos).
- El quickstart especifica `torch 2.7.1+cu128`, `transformers>=5.13` y `flash-linear-attention 0.5.1`.
- VRAM estimada: no disponible de forma explícita; con 8,95B parámetros en bfloat16, los pesos ocupan aproximadamente 17,9 GB, a lo que hay que sumar memoria para activaciones y el lienzo de decodificación.
- GPU recomendadas: no disponible; por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, A100, H100), aunque no se confirma en la información.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere al menos 24 GB de VRAM en bfloat16.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `AutoModel`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dQwen3.5-9B-Base | 8,95B | No disponible | Difusión enmascarada híbrida | Apache 2.0 | Hugging Face |
| dQwen3.5-4B-Base | 4,21B | No disponible | Difusión enmascarada híbrida | Apache 2.0 | Hugging Face |
| dQwen3.5-2B-Base | 1,88B | No disponible | Difusión enmascarada híbrida | Apache 2.0 | Hugging Face |
| dQwen3-1.7B-Base | 1,72B | No disponible | Difusión con atención completa (control) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | No disponible | No disponible | Autorregresivo | No disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni mantener conversaciones de forma nativa.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-9B, podría heredar sesgos del modelo original, pero no se detalla.
- Idiomas soportados no especificados, lo que limita la planificación de despliegues multilingües.
- Longitud de contexto no documentada, lo que impide garantizar ventanas largas en producción.
- Requiere `trust_remote_code=True` y versiones específicas de transformers y flash-linear-attention, lo que añade complejidad de integración.
- La API de generación incluye parámetros con nombres obsoletos (`tau=`, `order=`) que siguen funcionando pero están deprecados.
- El comportamiento con muestreo (`temperature>0`) difiere según `conf_source`; la salida codiciosa y los resultados del artículo no se ven afectados, pero conviene verificar configuraciones personalizadas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base los resultados en producción requerirán ajuste y evaluación adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
- Artículo: https://arxiv.org/abs/2609.20751
- Código: https://github.com/AntonXue/dQwen
- dQwen3.5-0.8B-Base: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- dQwen3.5-2B-Base: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- dQwen3.5-4B-Base: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- dQwen3-1.7B-Base: https://huggingface.co/UT-IFML/dQwen3-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
