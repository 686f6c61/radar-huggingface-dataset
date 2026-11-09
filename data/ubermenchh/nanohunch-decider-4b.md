# ubermenchh/nanohunch-decider-4b

## Resumen

`ubermenchh/nanohunch-decider-4b` es un adaptador LoRA de investigación para `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario ubermenchh bajo licencia Apache-2.0. El adaptador no genera texto: lee un estado textual y una pregunta tipada (elección entre opciones, sí/no o puntuación numérica) y devuelve una distribución de probabilidad sobre las etiquetas de respuesta, extraída directamente de los logits de los tokens de etiqueta (A, B, C) en el último token. Está entrenado en MLX sobre un Mac con Apple Silicon y distribuido en formato nativo de MLX (`adapter.npz`), no en PEFT.

El modelo base es un transformer denso de 4.000 millones de parámetros de la familia Qwen3, con contexto nativo de 262.144 tokens (dato del modelo base, no verificado en la información proporcionada para este adaptador). El adaptador añade LoRA de rango 16 y alpha 32 sobre las siete proyecciones de las 36 capas del modelo, con temperaturas de calibración ajustadas por tipo de pregunta.

La relevancia del artefacto es acotada y explícita: el propio autor lo describe como "un artefacto de investigación de un experimento pequeño, no un modelo de producción". Su interés técnico reside en el enfoque de calibración por tipo de pregunta y en la evaluación sobre OpenDecisions, no en capacidades generales de generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA; inferencia en MLX |
| Parámetros totales | 4B (modelo base Qwen3-4B-Instruct-2507) + adaptador LoRA rango 16 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información del adaptador (el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens) |
| Tipos de cuantización | No disponible; pesos del adaptador en `adapter.npz` (float, MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter.npz` (MLX, no PEFT) + `config.json` con forma LoRA y temperaturas |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros. La intervención LoRA cubre las siete proyecciones de las 36 capas del modelo base, con rango 16 y alpha 32. La particularidad del diseño es que no se usa decodificación generativa: el prompt presenta una pregunta tipada con opciones etiquetadas A, B y C, y la predicción se lee de los logits de esos tokens de etiqueta en la última posición. Antes del softmax, los logits se dividen por una temperatura específica del tipo de pregunta (`temp_by_type` en `config.json`), ajustada sobre preguntas de validación del conjunto decider en las que el profesor mostraba menor confianza (probabilidad inferior a 0,8).

Los datos de entrenamiento son 4.000 preguntas de decisión escritas por un profesor, procedentes de `github.com/Mapika/decider` (Apache-2.0, commit `91b6fa9`), descartando aquellas en las que el profesor no estaba de acuerdo, más 810 preguntas públicas de BoolQ, ARC-Challenge y CommonsenseQA como replay. El entrenamiento consistió en una pasada de 150 pasos con 32 preguntas por paso, tasa de aprendizaje 1e-4 con warmup y decaimiento coseno, y barajado del orden de opciones en cada paso, con semilla 0. OpenDecisions no se usó ni para entrenar ni para ajustar temperaturas. El autor advierte que la receta de temperatura por tipo se eligió tras observar una puntuación de OpenDecisions, por lo que su ganancia es optimista.

## Capacidades

- Clasificación de decisión sobre estado textual: elección entre opciones (choice), respuesta sí/no y puntuación numérica (score).
- Salida de distribuciones de probabilidad calibradas por tipo de pregunta, no texto libre.
- Lectura de logits de etiquetas en el último token, con opciones etiquetadas A, B, C.
- Ajuste de calibración mediante temperaturas por tipo de pregunta.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas para el adaptador.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutamiento de decisiones binarias en pipelines: dado un estado textual y una pregunta sí/no, el adaptador devuelve una probabilidad calibrada que puede usarse como umbral en un sistema de control, sin necesidad de parsear texto generado.
- Clasificación de opciones en experimentos de investigación: para evaluar calibración de modelos pequeños en tareas de elección múltiple con preguntas tipadas y opciones etiquetadas.
- Replay y comparación de recetas de ajuste: sirve como referencia reproducible (semilla 0, hiperparámetros documentados) para estudiar el efecto de LoRA y temperaturas por tipo en modelos de 4B.
- Análisis de calibración en dominios acotados: útil para medir la fiabilidad de probabilidades en preguntas de sentido común o lectura (BoolQ, ARC-Challenge, CommonsenseQA) cuando el formato de entrada encaja con el prompt de `data.py`.
- Investigación sobre "System One" y decisiones rápidas: el repositorio nanohunch lo enmarca en un experimento de decisión de un solo paso, comparable contra `decider-2b` y réplicas abiertas.
- Prototipado en Apple Silicon: al estar en MLX, permite cargar y ejecutar el adaptador en un Mac sin GPU dedicada, útil para iteración rápida en investigación.

## Benchmarks y rendimiento

Resultados sobre OpenDecisions (2.352 preguntas reservadas, `score.py` del propio dataset):

| Modelo | Capability | Intelligence | Calibration | choice | yes/no | score |
|---|---|---|---|---|---|---|
| Qwen3-4B-Base, sin entrenamiento | 53,1 | 26,3 | 80,0 | 55,4 % | 68,9 % | 40,8 % |
| Qwen3-4B-Instruct-2507, sin entrenamiento | 35,4 | 31,0 | 39,8 | 62,4 % | 69,6 % | 45,7 % |
| Este adaptador, temperatura por tipo | 56,7 | 42,8 | 70,7 | 68,3 % | 74,4 % | 57,1 % |
| Este adaptador, una sola temperatura | 54,8 | 42,7 | 66,9 | 68,3 % | 74,4 % | 57,1 % |
| Misma receta, semilla 1, temperatura por tipo | 54,1 | 40,3 | 67,8 | 67,3 % | 73,0 % | 53,9 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base es de 4B parámetros, por lo que en fp16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no especificadas por el autor. El adaptador está entrenado y pensado para MLX en Apple Silicon.
- Cabe en GPU de consumo: previsiblemente sí para el modelo base en cuantizaciones de 4-8 bits, pero no hay datos publicados para este adaptador.
- Opciones de despliegue: MLX con `model.py` y `od.py` del repositorio nanohunch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `adapter.npz` no es PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OpenDecisions (score) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanohunch-decider-4b (este) | 4B + LoRA r16 | No disponible | 57,1 % | Apache-2.0 | Hugging Face, formato MLX |
| Qwen3-4B-Instruct-2507 sin entrenar | 4B | 262.144 (modelo base) | 45,7 % | Apache-2.0 | Hugging Face |
| Qwen3-4B-Base sin entrenar | 4B | 262.144 (modelo base) | 40,8 % | Apache-2.0 | Hugging Face |
| decider-2b (modelo entrenado de 2B) | 2B | No disponible | No disponible | No disponible | Referenciado en el repositorio nanohunch |
| Fine-tunes del leaderboard de OpenDecisions para 4B | 4B | No disponible | 67,7 y 77,1 | No disponible | Leaderboard de OpenDecisions |

## Limitaciones y advertencias

- La ganancia de capability (56,7 frente a 53,1 del base sin entrenar) está dentro del ruido declarado por OpenDecisions (2 puntos); las dos semillas difieren en 2,6 puntos. Solo la mejora sobre Instruct sin entrenar (3 a 11 puntos) se considera sólida según el autor.
- La calibración (70,7) sigue por debajo del modelo base sin entrenar (80,0).
- La receta de temperatura por tipo se eligió tras ver una puntuación de OpenDecisions, por lo que su ganancia es optimista.
- Está muy por debajo de los fine-tunes del leaderboard de OpenDecisions para modelos de 4B (67,7 y 77,1).
- Una pasada por pregunta y opciones en el orden dado; no se ha probado con otros formatos de pregunta.
- Es un artefacto de investigación, no un modelo de producción, según el propio autor.
- Riesgo de alucinación y sesgos: no documentados específicamente para el adaptador; hereda los del modelo base Qwen3-4B-Instruct-2507.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la ausencia de evaluación en producción y el formato MLX limitan su aplicabilidad directa.
- El adaptador no es PEFT y requiere el código de nanohunch para cargarse; no es plug-and-play con el ecosistema estándar de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/ubermenchh/nanohunch-decider-4b
- Repositorio nanohunch: https://github.com/ubermenchh/nanohunch
- Documento de diseño: https://github.com/ubermenchh/nanohunch/tree/main/docs/design/2026-09-23-nanohunch
- Dataset decider (profesor): https://github.com/Mapika/decider
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
