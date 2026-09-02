# SupritiVijay/reasoning-distillation-models

## Resumen

Este repositorio contiene una colección de modelos de lenguaje pequeños (de 1B a 7B de parámetros) afinados mediante destilación de trazas de razonamiento generadas por diez modelos maestros de gran tamaño, entre ellos DeepSeek-V3, Qwen3-235B, GPT-OSS-120B, QwQ y EXAONE-4 32B. El objetivo es transferir capacidades de razonamiento complejo (matemáticas, ciencia, código e instrucciones) a modelos compactos que puedan ejecutarse en entornos con recursos limitados.

La colección se organiza en subcarpetas según el modelo base (Qwen2.5-1.5B, Qwen2.5-3B, Qwen2.5-7B y Llama-3.2-1B), el dominio de entrenamiento (math, science, if_chat, code), el número de trazas (1.5k, 4.5k, 9k, 18k, 54k, 72k, 90k) y la combinación de maestros (un solo padre o mezcla de varios). Todos los modelos comparten una ventana de contexto de 32.768 tokens y se entrenaron con pérdida solo sobre los tokens de asistente, en precisión bf16, durante 3 épocas.

La relevancia de este trabajo radica en que permite estudiar cómo la destilación de razonamiento afecta a la representación interna de los modelos pequeños, un tema abordado en el artículo asociado "Towards Understanding Distilled Reasoning Models: A Representational Approach" (arXiv:2503.03730). Además, ofrece una batería de variantes que aíslan el efecto del volumen de datos y de la mezcla de maestros, lo que resulta útil para investigación y para seleccionar configuraciones óptimas en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5 y Llama-3.2) |
| Parametros totales | 1B, 1.5B, 3B y 7B segun submodelo |
| Parametros activos | no aplica (modelos densos, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se publican cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los modelos se construyen a partir de las arquitecturas base Qwen2.5 (1.5B, 3B, 7B) y Llama-3.2 (1B), todas ellas transformers decoder-only densos. No se introduce ninguna innovacion arquitectonica nueva; el valor del repositorio reside en el proceso de destilacion: se generan trazas de razonamiento (cadenas de pensamiento) con diez modelos maestros distintos y se usan como datos de entrenamiento para los modelos pequeños, con una funcion de perdida que solo considera los tokens de asistente (completion-only loss).

El entrenamiento se realizo con 3 epocas, tasa de aprendizaje de 1e-4 con un 10% de warmup, longitud maxima de 32.768 tokens y precision bf16. Se emplearon 8 GPUs H100, con DeepSpeed ZeRO-2 para los modelos de 1.5B y ZeRO-3 con CPU offload para los de 7B. Los datos cubren cuatro dominios: matematicas, ciencia, instrucciones conversacionales (if_chat) y codigo. Se incluyen variantes que varian el numero de trazas (1.5k, 4.5k, 9k, 18k, 54k, 72k, 90k) y variantes que mezclan trazas de varios maestros en un mismo conjunto de entrenamiento, lo que permite aislar el efecto de la cantidad de datos y de la diversidad de maestros.

## Capacidades

- Generacion de texto y razonamiento paso a paso en ingles, con especial enfasis en tareas de matematicas, ciencia y codigo.
- Razonamiento encadenado (chain-of-thought) transferido desde los modelos maestros, incluyendo patrones de auto-reflexion y verificacion de calculos, segun el estudio representacional asociado.
- Generacion de codigo en multiples lenguajes, entrenada con trazas de codigo de hasta 90k ejemplos.
- Seguimiento de instrucciones conversacionales (dominio if_chat), orientado a tareas de dialogo y asistencia.
- No se indica soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre destilacion de razonamiento: el repositorio ofrece una matriz de variantes (dominio, cardinalidad, mezcla de maestros) ideal para estudiar como la destilacion afecta a las representaciones internas y a la capacidad de razonamiento de modelos pequeños.
- Generacion de codigo asistida en entornos con recursos limitados: los modelos de 1.5B y 3B pueden integrarse en editores o pipelines de autocompletado donde no se dispone de GPUs de gran tamano.
- Razonamiento matematico en aplicaciones educativas: los modelos afinados en el dominio math pueden resolver problemas paso a paso, utiles para tutoria o generacion de ejercicios.
- Clasificacion o extraccion de informacion cientifica: los modelos del dominio science pueden procesar textos cientificos y generar explicaciones, aunque su tamano limita la profundidad.
- Prototipado rapido de asistentes conversacionales: los modelos if_chat permiten construir demos de chatbots con razonamiento basico sin necesidad de APIs externas.
- Analisis comparativo de tecnicas de destilacion: al existir variantes con un solo maestro y con mezcla de maestros, se puede evaluar que estrategia produce mejores resultados para una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas como MMLU, HumanEval o GSM8K para ninguna de las variantes. El articulo asociado (arXiv:2503.03730) se centra en el analisis representacional mediante crosscoders, no en benchmarks de tareas. Por tanto, no es posible comparar numericamente el rendimiento de estos modelos con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos en bf16, sin cuantizacion):
  - Modelos de 1B: ~2 GB
  - Modelos de 1.5B: ~3 GB
  - Modelos de 3B: ~6 GB
  - Modelos de 7B: ~14 GB
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB para los modelos de 1.5B, 8 GB para los de 3B y 16 GB para los de 7B (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento se usaron 8x H100, pero para inferencia no se requiere ese nivel.
- Los modelos de 1B y 1.5B caben en GPUs consumer de gama baja e incluso en CPU con cuantizacion (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: al ser modelos estandar de HuggingFace, se pueden servir con vLLM, TGI, llama.cpp (si se convierten a GGUF) u Ollama (tras conversion). No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponible; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos destilados como DeepSeek-R1-Distill-Qwen-1.5B o Llama-3.1-8B-Instruct. Como referencia estructural, se puede comparar con los modelos base sin destilar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32k | Apache-2.0 | HuggingFace |
| Qwen2.5-3B-Instruct (base) | 3B | 32k | Apache-2.0 | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7B | 32k | Apache-2.0 | HuggingFace |
| Llama-3.2-1B-Instruct (base) | 1B | 128k | Llama 3.2 Community | HuggingFace |
| Este repositorio (variantes) | 1B-7B | 32k | Apache-2.0 | HuggingFace |

La diferencia principal es que los modelos de este repositorio han sido afinados con trazas de razonamiento de maestros potentes, lo que deberia mejorar su capacidad de razonamiento respecto a los base, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- No se publican resultados de benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- Los modelos solo soportan ingles; no hay capacidad multilingue declarada.
- Al ser modelos pequeños (1B-7B), su capacidad de razonamiento profundo y de manejo de contextos largos es limitada en comparacion con los maestros.
- Riesgo de alucinacion y de errores en razonamiento complejo, especialmente en dominios no cubiertos por los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero los modelos base (Qwen2.5 y Llama-3.2) tienen sus propias licencias; Llama-3.2 requiere aceptar los terminos de la licencia de Meta, que pueden imponer restricciones adicionales para uso comercial.
- El repositorio es una coleccion de cientos de submodelos; es necesario seleccionar la variante adecuada segun el dominio y el tamano, lo que puede resultar confuso.
- No se proporcionan pesos cuantizados ni guias de despliegue especificas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SupritiVijay/reasoning-distillation-models
- Articulo asociado (arXiv): https://arxiv.org/abs/2503.03730
- Version HTML del articulo: https://arxiv.org/html/2503.03730v1
- PDF del articulo: https://arxiv.org/pdf/2503.03730v1
- OpenReview del articulo: https://openreview.net/pdf?id=UYZCcnwgc4
