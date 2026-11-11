# UT-IFML/dQwen3-1.7B-Base

## Resumen

dQwen3-1.7B-Base es un modelo de lenguaje de difusión enmascarada (masked diffusion language model) desarrollado por UT-IFML a partir de Qwen/Qwen3-1.7B. A diferencia de un modelo autorregresivo convencional, decodifica el texto de forma no secuencial: genera un lienzo completo de tokens y va fijando posiciones según un umbral de confianza. El backbone es de atención completa y todas sus capas se han hecho bidireccionales, lo que rompe la causalidad propia de los transformers decoder-only.

El modelo tiene 1.720.574.976 parámetros (1,72B) y se distribuye bajo licencia Apache 2.0 en formato safetensors con código personalizado. Es un modelo base, sin ajuste por instrucciones, entrenado sobre el checkpoint Qwen3-1.7B y orientado a experimentación en generación de texto y extracción de características.

Su relevancia es fundamentalmente metodológica: actúa como el modelo de control en la comparación emparejada del artículo "dQwen3.5: Hybrid-Attention Diffusion Language Models" (arXiv:2609.20751), frente al modelo híbrido dQwen3.5-2B-Base. Sirve para aislar el efecto de la atención híbrida frente a la atención completa dentro de la familia de modelos de difusión dQwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada (masked diffusion), atención completa, todas las capas bidireccionales |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el quickstart usa bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen3-1.7B y lo convierte en un modelo de difusión enmascarada: el backbone mantiene atención completa, pero cada capa pasa a ser bidireccional, de modo que la predicción de un token puede condicionarse en tokens situados a ambos lados de la secuencia. La generación no es autorregresiva token a token, sino que el método `generate` decodifica el lienzo completo de una vez y fija las posiciones cuya confianza supera un umbral (`conf_threshold=0.9`, el tau del artículo). Alternativamente admite decodificación por bloques de izquierda a derecha con `block_length=32` o un presupuesto fijo de pasos mediante `conf_threshold=None, steps_per_block=k`.

La confianza de una posición se calcula por defecto como la probabilidad top-1 (`conf_source="top1"`); existe también `conf_source="sampled"`, que lee la probabilidad del token muestreado y era el valor por defecto antes del 11 de noviembre de 2026. Ambos modos solo difieren cuando se muestrea con `temperature>0`; la salida greedy y todos los resultados del artículo no cambian. El checkpoint de 50B tokens empleado en el paper está disponible con `revision="step25000-swa"`. No se detallan en la información disponible la composición del dataset de entrenamiento, el número exacto de tokens vistos ni si hubo fases de RLHF o DPO (al ser un modelo base, no se espera ajuste por instrucciones).

## Capacidades

- Generación de texto no autorregresiva mediante difusión enmascarada, con decodificación de lienzo completo o por bloques.
- Relleno y generación condicionada por contexto bidireccional, al disponer de atención no causal en todas las capas.
- Extracción de características (tag `feature-extraction` en el repositorio).
- Generación de código en el arranque rápido (ejemplo con `def fibonacci(n):`), aunque sin garantías de calidad al no estar ajustado por instrucciones.
- Control de confianza en la decodificación: umbral configurable, orden de reenmascarado (`remask_order`) y presupuesto fijo de pasos.
- Soporte de parada mediante cadenas de parada (`stop_strings`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito según la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo sirve como línea base de control (atención completa) frente a la variante híbrida dQwen3.5-2B-Base, permitiendo aislar el efecto de la atención híbrida en tareas de generación.
- Reproducción de experimentos del artículo: cargando la revisión `step25000-swa` se puede replicar el checkpoint de 50B tokens usado en la comparación publicada.
- Generación de código asistida en entornos de investigación: el ejemplo del quickstart muestra completado de funciones Python; útil para estudiar decodificación paralela en tareas de código, no para producción sin ajuste previo.
- Estudio de estrategias de decodificación: los parámetros `conf_threshold`, `block_length`, `steps_per_block` y `remask_order` permiten analizar el compromiso entre calidad y número de pasos de decodificación.
- Extracción de representaciones bidireccionales: al tener todas las capas no causales, puede emplearse para obtener embeddings contextuales en tareas de clasificación o recuperación dentro de un pipeline de investigación.
- Experimentos de eficiencia de inferencia: la decodificación por lienzo completo permite medir el throughput frente a la decodificación autorregresiva en GPUs CUDA con `transformers>=5.13`.
- Evaluación comparativa de arquitecturas: útil en estudios que comparen atención completa frente a híbrida en modelos de difusión de escala ~2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1,72B parámetros × 2 bytes), más overhead de activaciones y del lienzo de decodificación; el repositorio ocupa 6,9 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que se requiere una GPU CUDA. Por tamaño, cabe en RTX 4090, RTX 3090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en bfloat16, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers>=5.13` con `trust_remote_code=True` (probado con `torch 2.7.1+cu128` y `flash-linear-attention 0.5.1`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la model card marca `inference: false` a nivel de pipeline estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dQwen3-1.7B-Base (este) | 1,72B | Atención completa (control) | No disponible | Apache 2.0 | Hugging Face |
| dQwen3.5-2B-Base | 1,88B | Híbrido | No disponible | No disponible en la información | Hugging Face |
| dQwen3.5-0.8B-Base | 0,75B | Híbrido | No disponible | No disponible en la información | Hugging Face |
| dQwen3.5-4B-Base | 4,21B | Híbrido | No disponible | No disponible en la información | Hugging Face |
| dQwen3.5-9B-Base | 8,95B | Híbrido | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada; la comparación publicada en el artículo no se detalla en la model card.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no debe esperarse que siga instrucciones ni que mantenga formato conversacional de forma fiable, pese a la etiqueta `conversational` del repositorio.
- Riesgo de alucinación y de texto incoherente en la decodificación por difusión, especialmente con umbrales de confianza bajos o presupuestos de pasos reducidos.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Dependencia de versiones concretas (`transformers>=5.13`, `torch 2.7.1+cu128`, `flash-linear-attention 0.5.1`) y de GPU CUDA; no se documenta soporte para CPU ni para otros backends.
- El campo `inference: false` en la model card sugiere que el pipeline estándar de Hugging Face no está soportado directamente; hay que usar el método `generate` propio del modelo.
- No se documentan sesgos conocidos, cobertura idiomática ni longitud de contexto, lo que dificulta evaluar su idoneidad en escenarios multilingües o de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-1.7B conviene verificar las condiciones del modelo base.
- El checkpoint por defecto puede diferir del usado en el artículo; para reproducir resultados hay que fijar `revision="step25000-swa"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UT-IFML/dQwen3-1.7B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Artículo (arXiv): https://arxiv.org/abs/2609.20751
- Código: https://github.com/AntonXue/dQwen
- dQwen3.5-0.8B-Base: https://huggingface.co/UT-IFML/dQwen3.5-0.8B-Base
- dQwen3.5-2B-Base: https://huggingface.co/UT-IFML/dQwen3.5-2B-Base
- dQwen3.5-4B-Base: https://huggingface.co/UT-IFML/dQwen3.5-4B-Base
- dQwen3.5-9B-Base: https://huggingface.co/UT-IFML/dQwen3.5-9B-Base
