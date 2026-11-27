# steampunque/GLM-Z1-9B-0414-MP-GGUF

## Resumen

GLM-Z1-9B-0414-MP-GGUF es una cuantización GGUF de precisión mixta por capas del modelo GLM-Z1-9B-0414, desarrollado originalmente por THUDM (Zhipu AI / Z.ai). El modelo base es un transformer de 9.463.193.600 parámetros (aproximadamente 9,46 mil millones) entrenado con RL para razonamiento, con un modo "thinking" explícito que genera cadenas de razonamiento antes de la respuesta final. Esta versión GGUF la publica el usuario steampunque bajo licencia MIT.

La contribución principal de esta ficha no es el modelo en sí, sino la estrategia de cuantización híbrida por capas (denominada Q4_E_H), que asigna distintos niveles de cuantización K-quant (desde Q4_K hasta Q6_K) a cada capa según su sensibilidad, con embeddings y tensores de salida en Q6_K y la dimensión FFN rellenada a múltiplos de 256 para permitir cuantización K. El resultado ocupa aproximadamente 6,2e9 bytes (un tamaño cercano a Q4_K_M) manteniendo una perplejidad de 15,2 frente a 14,9 del Q4_K_M estándar, es decir, una degradación mínima.

El modelo es relevante para quienes quieren ejecutar un modelo de razonamiento de ~9B en hardware de consumo (por ejemplo, una RTX 4070 de 12 GB) con decodificación especulativa mediante un draft model Qwen3 0.6B, alcanzando según el autor unas 101 tokens por segundo frente a 68 sin draft en ese hardware. La información disponible sobre el modelo base (idiomas, contexto, benchmarks oficiales) es limitada en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-4, familia GLM-Z1); cuantización GGUF por capas |
| Parametros totales | 9.463.193.600 (~9,46B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor prueba con 32k NKV) |
| Tipos de cuantizacion | Q4_E_H (híbrida por capas: Q4_K, Q5_K, Q6_K, Q8_0, F16, F32 según capa; embeddings y salida en Q6_K) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo GLM-Z1-9B-0414.Q4_E_H.gguf, ~6,2e9 B) |

## Arquitectura y entrenamiento

El modelo base GLM-Z1-9B-0414 es un transformer de la familia GLM-4/Z1 de THUDM, entrenado con refuerzo (RL) para razonamiento, según indica el autor de la cuantización ("This is a RL trained thinking model"). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso concreto de RLHF/DPO más allá de la mención al entrenamiento con RL.

La innovación técnica de esta publicación es la cuantización híbrida por capas: cada una de las 40 capas recibe un tipo K-quant distinto (por ejemplo, la capa 0 en Q6_K_886, las capas 2-7 en Q4_K_654, las capas 24-35 en Q5_K_665, la capa 39 en Q6_K_886), con el objetivo de minimizar la pérdida de entropía manteniendo un tamaño similar a Q4_K_M. La dimensión FFN se rellena a múltiplos de 256 (de 13696 a 13824 y de 27392/27648 a múltiplos pares) para permitir el uso de K-quants. Además, el autor documenta que el modelo se puede acelerar con decodificación especulativa usando Qwen3 0.6B como draft model si el motor de inferencia soporta traducción dinámica de vocabulario entre draft y target.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" (el modelo genera cadena de razonamiento antes de responder).
- Razonamiento matemático: el autor publica benchmarks de matemáticas en su space de Hugging Face.
- Generación de código: el autor advierte explícitamente que el modelo es "extremadamente débil" en problemas de generación de código.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking facilita cadenas de razonamiento.
- Decodificación especulativa compatible con Qwen3 0.6B como draft model (requiere soporte de traducción dinámica de vocabulario).

## Casos de uso

- Razonamiento matemático en local: ejecutar el modelo en una GPU de consumo para resolver problemas de matemáticas paso a paso, aprovechando el modo thinking y el tamaño reducido de la cuantización (~6,2e9 B).
- Asistente conversacional con razonamiento: desplegar en llama.cpp u Ollama para conversaciones multi-turno donde se requiera explicar el razonamiento antes de la respuesta.
- Inferencia de bajo coste en hardware limitado: al caber en 12 GB de VRAM (RTX 4070) con capas y contexto en GPU, es adecuado para prototipos y demos en estaciones de trabajo modestas.
- Aceleración con decodificación especulativa: usar Qwen3 0.6B como draft model en motores que soporten traducción de vocabulario para aumentar el throughput (según el autor, de 68 a 101 tps en una RTX 4070).
- Evaluación de estrategias de cuantización: servir como caso de estudio de cuantización híbrida por capas para investigadores que comparen Q4_K_M frente a Q4_E_H (perplejidad 14,9 frente a 15,2).
- Fine-tuning o experimentación con modelos de razonamiento pequeños: por su licencia MIT y tamaño contenido, es útil como base para experimentos académicos de razonamiento.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita su integración en productos comerciales, aunque conviene revisar la licencia del modelo base.

## Benchmarks y rendimiento

El autor no publica una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí publica una comparación de perplejidad entre cuantizaciones y datos de rendimiento de inferencia:

| Metrica | Q4_K_M | Q4_E_H |
|---|---|---|
| Tamano (bytes) | 6,2e9 | 6,2e9 |
| Perplejidad (PPL) | 14,9 | 15,2 |

Rendimiento de inferencia en llama.cpp sobre RTX 4070 (12 GB VRAM), capas y contexto en GPU, 32k NKV:

| Cuantizacion | QKV | ND | NKV | Gen tps | Comentario |
|---|---|---|---|---|---|
| Q4_E_H | F16 | 0 | 32k | 68 | Sin draft |
| Q4_E_H | F16 | 4 | 32k | 101 | Spec 4 (draft Qwen3 0.6B) |

Los benchmarks de matemáticas del autor están disponibles en https://huggingface.co/spaces/steampunque/benchlm. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa ~6,2e9 B (~6,2 GB en disco); con contexto y overhead de llama.cpp, cabe en 12 GB de VRAM con capas y contexto en GPU (probado por el autor en RTX 4070).
- GPU recomendadas: RTX 4070 (12 GB) validada por el autor; GPUs con 12 GB o más de VRAM en general; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o superiores (RTX 4070, 4070 Ti, 4080, 4090, etc.).
- Opciones de despliegue: llama.cpp (probado por el autor), Ollama, y cualquier motor compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: 68 tps sin draft y 101 tps con decodificación especulativa (draft Qwen3 0.6B, 4 tokens) en RTX 4070 con 32k de contexto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-9B-0414-MP-GGUF (esta ficha) | ~9,46B | No disponible | MIT | GGUF Q4_E_H | Cuantización híbrida por capas, PPL 15,2 |
| GLM-Z1-9B-0414 (base, THUDM) | ~9,46B | No disponible | No disponible en esta ficha | safetensors | Modelo original sin cuantizar |
| Qwen3 0.6B | ~0,6B | No disponible | No disponible en esta ficha | No disponible | Usado como draft model para decodificación especulativa |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de razonamiento de tamaño similar (por ejemplo, Qwen3-8B o DeepSeek-R1-Distill), por lo que la comparativa de rendimiento queda como "no disponible".

## Limitaciones y advertencias

- Rendimiento en código: el autor advierte explícitamente que el modelo es "extremadamente débil" en generación de código; no debe usarse como asistente de programación sin validación.
- Perplejidad ligeramente superior al Q4_K_M estándar (15,2 frente a 14,9), aunque la diferencia es pequeña.
- La información sobre idiomas soportados no está disponible; no se garantiza un buen rendimiento en castellano.
- La longitud de contexto oficial del modelo base no se detalla en la información proporcionada; el autor prueba con 32k NKV.
- Riesgo de alucinación inherente a los modelos de razonamiento entrenados con RL; el modo thinking no elimina errores factuales.
- La licencia MIT aplica a esta cuantización, pero conviene verificar la licencia del modelo base THUDM/GLM-Z1-9B-0414 antes de uso comercial.
- La decodificación especulativa con Qwen3 0.6B requiere que el motor de inferencia soporte traducción dinámica de vocabulario entre draft y target; no todos los motores lo hacen.
- El repositorio se actualizó el 25/11/2026 con un cambio en el campo `tokenizer.ggml.clean_spaces = False` y una plantilla de chat distinta; verificar compatibilidad con versiones antiguas de llama.cpp.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/steampunque/GLM-Z1-9B-0414-MP-GGUF
- Modelo base: https://huggingface.co/THUDM/GLM-Z1-9B-0414
- Archivo GGUF directo: https://huggingface.co/steampunque/GLM-Z1-9B-0414-MP-GGUF/resolve/main/GLM-Z1-9B-0414.Q4_E_H.gguf
- Benchmarks de matemáticas del autor: https://huggingface.co/spaces/steampunque/benchlm
- Hilo de discusión sobre cuantización híbrida por capas en llama.cpp: https://github.com/ggml-org/llama.cpp/discussions/13040
