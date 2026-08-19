# ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale500

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale500` es un adaptador LoRA entrenado sobre el modelo base `allenai/Olmo-3-7B-Think` mediante aprendizaje supervisado (SFT) por destilación. Su autor, `ssurface`, lo enmarca como un punto de una curva de escalado de datos: se entrena con únicamente 500 trazas de razonamiento matemático en el dialecto L5 (nivel extremo) para estudiar cuántos datos necesita ese dialecto comprimido para alcanzar un rendimiento aceptable.

El adaptador se centra exclusivamente en razonamiento matemático, respondiendo con cadenas de pensamiento (`thinking... response`) y respuestas en formato `\boxed{...}`. Aunque se publica como modelo de generación de texto, su propósito es experimental: evaluar la relación entre cantidad de datos de destilación y precisión en MATH-500. El modelo base aporta 7B parámetros y una ventana de contexto de 64K tokens, mientras que el adaptador LoRA añade una pequeña cantidad de parámetros entrenables.

La relevancia de este modelo radica en su contribución al estudio del escalado de datos en destilación de cadenas de pensamiento: los resultados indican que el dialecto L5 no necesita grandes volúmenes de trazas (el rendimiento se mantiene plano entre 250 y 1000 muestras), lo que tiene implicaciones prácticas para optimizar el coste de generación de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base: Olmo-3-7B-Think) |
| Parámetros totales | 7B (base) + adaptador LoRA (r=16, alpha=32, dropout=0.05) |
| Parámetros activos | 7B (el adaptador solo añade un pequeño conjunto de pesos) |
| Longitud de contexto | 64K tokens (según especificaciones de Olmo-3-7B-Think) |
| Tipos de cuantización | No disponible (adaptador en formato safetensors; el base puede cuantizarse con herramientas estándar) |
| Idiomas soportados | Inglés (único idioma en la card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en `allenai/Olmo-3-7B-Think`, un transformer autoregresivo de 7B parámetros entrenado por AI2 (Allen Institute) con un enfoque en razonamiento de cadena de pensamiento y largas ventanas de contexto (64K). Sobre esta base, se aplica un adaptador LoRA (r=16, alpha=32, dropout=0.05) que se entrena mediante SFT de destilación usando 500 trazas de demostración en el dialecto «L5» (nivel extremo) de MATH-500. El entrenamiento se realizó con el ecosistema HuggingFace `transformers` + `peft`, con 3 épocas, learning rate 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64 (16×4) en una sola GPU NVIDIA A100 de 80GB. El modelo responde con un formato de cadena de pensamiento (`thinking...` seguido de `response`) y emite respuestas en `\boxed{}`. No se reportan innovaciones técnicas adicionales más allá del diseño del dialecto de compresión.

## Capacidades

- Razonamiento matemático: resuelve problemas de nivel extremo (L5) del conjunto MATH-500 con una precisión del 51.2% (exact match).
- Generación de cadenas de pensamiento: produce razonamientos intermedios antes de la respuesta final, siguiendo el estilo `thinking...` del base.
- Destilación de conocimiento: el adaptador ha sido entrenado para imitar trazas de razonamiento de un modelo más potente (el dialecto L5 es una versión comprimida de trazas de alto nivel).
- Soporte de instrucción de texto: únicamente responde a problemas matemáticos con el prompt específico `Solve this using Level 5 (Extreme). Problem: {problema}`.
- No soporta tool calling, agentes, visión ni audio; es un modelo puramente de texto para tareas de matemáticas.

## Casos de uso

- Investigación sobre escalado de datos de entrenamiento: el modelo permite analizar cómo varía la precisión en MATH-500 al variar el número de trazas de destilación (250, 500, 1000, 1396). Es útil para diseñar políticas de generación de datos sintéticos en destilación de cadenas de pensamiento.
- Evaluación de dialectos de razonamiento comprimido: sirve como punto de referencia para comparar la eficiencia de distintos niveles de compresión de trazas (L1–L5) y decidir cuál es el equilibrio óptimo entre calidad y coste de generación.
- Estudio de la sensibilidad de la destilación a la cantidad de datos: el hecho de que la precisión se mantenga plana entre 250 y 1000 trazas sugiere que el dialecto L5 es robusto ante la escasez de datos, lo que puede orientar a equipos que buscan reducir costes de anotación.
- Benchmarking de adaptadores LoRA en matemáticas: como ejemplo de un adaptador ligero sobre un modelo base de 7B, puede utilizarse para comparar el rendimiento de diferentes configuraciones de LoRA (r, alpha, dropout) en tareas de razonamiento.
- Desarrollo de sistemas de evaluación de razonamiento matemático: el modelo puede emplearse como caso de prueba para validar graders LaTeX (como el que usa el autor, que extrae `\boxed{}`) y para depurar pipelines de evaluación de exact match.
- Investigación sobre la curva de datos en destilación: el conjunto de modelos publicados por el autor (con distintos tamaños de trazas) permite construir curvas de rendimiento y detectar puntos de saturación o regresión (como el descenso a 1396 trazas), útil para diseñar estrategias de recolección de datos.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado oficial (exact match, MATH-500, test split):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Mathematical Reasoning | MATH-500 (HuggingFaceH4/MATH-500) | test | Accuracy (exact match) | 51.2% |

Además, la model card incluye la curva de escalado de datos (single seed por punto, n=500 evaluaciones):

| Trazas | MATH-500 accuracy |
|---:|---:|
| 250 | 51.0% |
| 500 (este modelo) | 51.2% |
| 1000 | 52.8% |
| 1396 | 45.6% |

El autor indica que la variación entre 250 y 1000 trazas es ruido (el intervalo de confianza al 95% es ±4.4 pp), mientras que el punto de 1396 se desvía significativamente. No se reportan benchmarks adicionales (como MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el modelo base `Olmo-3-7B-Think` requiere aproximadamente 14.6 GB en bfloat16 (según LLM Explorer). El adaptador LoRA añade un coste despreciable, por lo que la inferencia cabe en GPUs de consumo como RTX 3090/4090 (24 GB) o en GPUs profesionales como A100 (80 GB, usada en el entrenamiento).
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento) o RTX 4090/3090 para inferencia local. Para producción con mayor concurrencia, se recomienda A100 o H100.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` (como se muestra en el README) o con `vLLM` (soporta adaptadores LoRA). También es posible cuantizar el modelo base (por ejemplo, con `bitsandbytes` o `llama.cpp`) para reducir VRAM, aunque el adaptador LoRA se aplica después.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 7B en bfloat16 en una A100 suele generar entre 40-60 tokens/s; en una RTX 4090, entre 20-30 tokens/s.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. Sin embargo, se puede comparar con su base (sin adaptador) y con otros adaptadores de la misma colección del autor (que no se han publicado aquí). La tabla siguiente resume las características conocidas:

| Modelo | Base | Parámetros | Contexto | MATH-500 acc. | Licencia |
|---|---|---|---|---|---|
| `cot-dialect-math-olmo3-7b-think-sft-l5-scale500` | Olmo-3-7B-Think | 7B + LoRA | 64K | 51.2% | Apache-2.0 |
| `allenai/Olmo-3-7B-Think` | - | 7B | 64K | no disponible | Apache-2.0 |
| `allenai/Olmo-3-7B-Think-SFT` | Olmo-3-7B-Think | 7B | 64K | no disponible | Apache-2.0 |

No se incluyen modelos como Llama-3-8B-Instruct o Mistral-7B porque no hay datos de comparación directa en MATH-500.

## Limitaciones y advertencias

- Es un punto de una ablación experimental, no un modelo para producción. El propio autor advierte que el adaptador con todos los datos (1396 trazas) es el que debe usarse en aplicaciones reales.
- Solo cubre razonamiento matemático en inglés; no soporta otros idiomas ni tareas generales.
- El rendimiento es sensible al formato de extracción: el autor señala que un extractor simple de `#### n` da resultados cercanos a 0%, por lo que se requiere un grader LaTeX que detecte `\boxed{}`.
- La evaluación se realizó con un solo seed y 500 ejemplos, lo que implica un margen de error de ±4.4 puntos porcentuales; la ordenación entre 250 y 1000 trazas no es estadísticamente significativa.
- Riesgo de alucinación y errores en problemas fuera del dominio de MATH-500, como cualquier modelo de lenguaje.
- No se proporcionan datos sobre sesgos o comportamientos de seguridad específicos; se asume que el modelo base hereda las limitaciones de Olmo-3-7B-Think.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale500)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Modelo base SFT: allenai/Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT)
- [Paper de Olmo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Ficha de Olmo 3 7B Think en LM Studio](https://lmstudio.ai/models/allenai/olmo-3-7b-think)
- [Detalles de VRAM y contexto en LLM Explorer](https://llm-explorer.com/model/allenai%2FOlmo-3-7B-Think,4vk8cBxWgmxWkydOyJ8TDX)
