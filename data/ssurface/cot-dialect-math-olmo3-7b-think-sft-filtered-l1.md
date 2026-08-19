# ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l1

## Resumen

Este modelo es un adaptador LoRA (PEFT) diseñado para modificar el comportamiento del modelo base `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros de AI2. El adaptador, desarrollado por el usuario `ssurface`, está especializado en razonamiento matemático y aplica un "dialecto" de cadena de pensamiento (chain-of-thought) de nivel L1, es decir, una explicación verbal completa y natural, en lugar de formas comprimidas o simbólicas. El objetivo es mejorar la precisión en problemas de matemáticas del dataset MATH-500 mediante un ajuste fino supervisado (SFT) sobre un corpus filtrado de problemas reexpresados por un modelo profesor.

La relevancia de este modelo radica en su enfoque experimental: explora cómo la forma del razonamiento (verbose frente a comprimido) afecta al rendimiento en tareas matemáticas. Al ser un adaptador LoRA, es ligero (0.2 GB) y se puede cargar sobre el modelo base sin necesidad de reentrenar los pesos completos. Está pensado para investigadores interesados en la compresión de cadenas de pensamiento y en la evaluación de dialectos de razonamiento, más que para uso en producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (adaptador LoRA con r=16; el modelo base tiene 7B) |
| Parametros activos | No disponible (el adaptador añade un número reducido de parámetros, no cuantificado) |
| Longitud de contexto | No disponible (máxima secuencia de entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32, dropout=0.05) que se aplica al modelo base `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7B parámetros (los detalles arquitectónicos del modelo base no se proporcionan en la ficha). El entrenamiento consistió en un ajuste fino supervisado (SFT) por destilación, utilizando un corpus de problemas de entrenamiento de MATH reexpresados a nivel L1 (explicación verbal completa) por un modelo profesor. El corpus fue filtrado (versión "filtered") y mantiene las reglas de notación del dialecto GSM8K, cambiando solo la convención de respuesta a `\boxed{}`.

Los hiperparámetros de entrenamiento incluyen 3 épocas, tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%, batch efectivo de 64 (16 x 4 acumulación de gradientes), secuencia máxima de 1024 tokens, precisión bf16 y una GPU NVIDIA A100 de 80 GB. La pérdida se calcula únicamente sobre la parte de la respuesta (completion), con longitudes de prompt precalculadas para evitar que el prior de tool-calling del modelo base se filtre en las cadenas de razonamiento.

## Capacidades

- Generación de texto con razonamiento matemático en inglés, siguiendo un formato de cadena de pensamiento verbose (nivel L1).
- Resolución de problemas matemáticos del estilo MATH (respuestas en `\boxed{}`).
- Soporte de un prompt específico: `Solve this using Level 1 (Verbose). Problem: {your problem}`.
- No se documentan capacidades de tool calling, agentes, visión, audio o multilingüismo más allá del inglés.
- El adaptador está especializado exclusivamente en problemas matemáticos; no se ha evaluado en otras tareas.

## Casos de uso

- Evaluación de dialectos de razonamiento: permite comparar el rendimiento de un modelo cuando se le pide razonar de forma verbal completa frente a otras variantes comprimidas (L3, L5) en el marco del proyecto de compresión de cadenas de pensamiento.
- Investigación en destilación de cadenas de pensamiento: sirve como referencia para estudiar cómo el nivel de detalle del razonamiento afecta a la precisión en tareas matemáticas.
- Tutoría matemática asistida: dado el prompt verbose, puede generar explicaciones paso a paso de problemas matemáticos, útil para sistemas educativos que requieran razonamiento explícito.
- Benchmarking de adaptadores LoRA: al ser un adaptador ligero, puede integrarse en pipelines de evaluación rápida de modelos base de 7B en tareas de razonamiento matemático.
- Generación de datos sintéticos: puede utilizarse para crear ejemplos de razonamiento verbal detallado a partir de problemas matemáticos, alimentando otros modelos o conjuntos de entrenamiento.
- Pruebas de robustez del grader LaTeX: el modelo produce respuestas en formato `\boxed{}`, lo que permite validar sistemas de corrección automática que normalizan expresiones equivalentes.

## Benchmarks y rendimiento

El autor declara un único resultado en el dataset MATH-500 (test, n=500), con decodificación greedy, sin ejemplos previos ni self-consistency:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 55.2% |

No se han publicado comparaciones con el modelo base sin adaptador ni con otros modelos en la información disponible. El autor advierte que la diferencia de unos pocos puntos puede estar dentro del ruido estadístico (intervalo de confianza del 95% de aproximadamente ±4.4 puntos para n=500).

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (0.2 GB) y no requiere recursos significativos.
- El modelo base `allenai/Olmo-3-7B-Think` (7B parámetros) necesita VRAM para inferencia en bf16; los requisitos exactos no se especifican en la ficha, pero para un modelo de este tamaño se estima un mínimo de 14-16 GB en precisión completa (no cuantizado). Se recomienda consultar la documentación del modelo base para detalles precisos.
- No se proporcionan datos de latencia ni throughput.
- Para despliegue, el adaptador se carga mediante `transformers` + `peft` (como se muestra en el ejemplo de uso). No se mencionan otros frameworks como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de la misma categoría en la documentación proporcionada. El autor no incluye resultados de modelos base ni de otras variantes de dialecto en la model card.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de estilo word problem; no se recomienda su uso fuera de este dominio.
- La precisión disminuye a medida que aumenta la dificultad del problema, especialmente en los niveles comprimidos (aunque este adaptador usa el nivel verbose).
- El resultado de 55.2% proviene de una única semilla; el autor indica que diferencias de un par de puntos pueden deberse al azar.
- El corpus de entrenamiento está filtrado, pero no se detalla el criterio de filtrado ni su posible sesgo.
- Aunque la licencia es Apache 2.0, el adaptador depende del modelo base `allenai/Olmo-3-7B-Think`, cuya licencia debe verificarse por separado.
- El prompt de uso es específico y no se ha validado su comportamiento con otros formatos de instrucción.

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-filtered-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
