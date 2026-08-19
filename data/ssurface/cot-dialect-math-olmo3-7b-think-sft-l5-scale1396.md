# ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1396

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `ssurface` sobre el modelo base `allenai/Olmo-3-7B-Think` de AI2 (Allen Institute for AI). Se trata de un punto concreto dentro de una serie de experimentos de ablación sobre el escalado de datos para el razonamiento matemático con cadenas de pensamiento (chain-of-thought). En concreto, el adaptador se ha entrenado con el denominado "dialecto L5 (extremo)" de MATH, destilado a partir de 1396 trazas de razonamiento, en lugar de usar el conjunto completo de datos.

El objetivo del experimento es evaluar cuántos datos necesita realmente el dialecto más comprimido (L5) para alcanzar un rendimiento competitivo. La curva de resultados muestra que la precisión se mantiene plana entre 250 y 1000 trazas (alrededor de 51-53 %) y cae notablemente a 45.6 % con 1396 trazas, lo que sugiere que este dialecto extremo no se beneficia de más datos y que el punto de 1396 es una anomalía fuera de la tendencia.

Este adaptador no es un modelo independiente: requiere cargar el modelo base Olmo-3-7B-Think y luego aplicar los pesos LoRA. Está pensado como material de investigación, no para despliegue en producción. Su licencia Apache 2.0 permite uso comercial, pero la propia documentación desaconseja su uso práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Olmo-3-7B-Think) + adaptador LoRA |
| Parámetros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, no se especifica) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 64K tokens (modelo base, según fuentes) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en bfloat16; el modelo base puede cuantizarse) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base `allenai/Olmo-3-7B-Think` es un transformer de 7B parámetros de la familia Olmo 3, entrenado por Allen AI con el conjunto de datos Dolma 3. La variante Think está optimizada para razonamiento y cadenas de pensamiento, con una ventana de contexto de 64K tokens.

El adaptador LoRA se entrenó mediante fine-tuning supervisado (SFT) por destilación, usando 1396 trazas de razonamiento del conjunto MATH-500 con el "dialecto L5" (extremo). Los hiperparámetros del adaptador son: r=16, alpha=32, dropout=0.05, 3 épocas, learning rate 2e-4 con coseno y warmup de 0.03, batch efectivo de 64. El entrenamiento se realizó en una sola GPU NVIDIA A100 de 80GB.

El objetivo del experimento es estudiar el efecto de la cantidad de datos en el rendimiento de un dialecto de CoT muy comprimido. La metodología es de un único seed y evaluación con 500 ejemplos, lo que implica un margen de error de ±4.4 puntos porcentuales al 95 % de confianza.

## Capacidades

- Razonamiento matemático: capaz de resolver problemas del dataset MATH-500 con respuestas en formato LaTeX (`\boxed{}`).
- Generación de cadenas de pensamiento: produce una sección `thinking...` seguida de la respuesta final.
- Instrucciones en inglés: diseñado para prompts que piden resolver un problema con el "nivel 5 (extremo)".
- Sin soporte de tool calling, visión, audio ni capacidades multimodales.
- No soporta agentes ni razonamiento multi-paso más allá del CoT estándar.

## Casos de uso

- Investigación sobre escalado de datos en razonamiento: el adaptador sirve para comparar cómo varía la precisión en función del número de trazas de entrenamiento en un dialecto extremo de CoT.
- Evaluación de dialectos de chain-of-thought: permite estudiar si dialectos más comprimidos necesitan menos datos para saturar su rendimiento.
- Benchmark de destilación de conocimiento: útil para analizar la relación entre cantidad de datos de destilación y calidad del adaptador.
- Experimentos de ablación en pipelines de SFT: se puede usar como punto de control en estudios sobre regularización o sobreajuste.
- Pruebas de robustez de evaluadores matemáticos: el adaptador se usa con un grader específico que reconoce `\boxed{}`, lo que permite testar sistemas de evaluación automática.
- Educación e investigación académica: como ejemplo de una curva de escalado de datos en modelos de lenguaje.

## Benchmarks y rendimiento

La model card reporta el siguiente resultado para el adaptador evaluado en MATH-500 (split test):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 | Accuracy (exact match) | 45.6 % |

Además, se incluye la curva de escalado completa del experimento (mismos datos de evaluación, n=500):

| Número de trazas | Precisión en MATH-500 |
|---:|---:|
| 250 | 51.0 % |
| 500 | 51.2 % |
| 1000 | 52.8 % |
| 1396 (este modelo) | 45.6 % |

El autor advierte que la diferencia entre 250 y 1000 trazas está dentro del ruido estadístico (±4.4 pp), pero el punto de 1396 queda claramente fuera de esa tendencia, lo que sugiere un sobreajuste o una saturación negativa del dialecto extremo.

## Requisitos de hardware

- Para inferencia completa (modelo base + adaptador) se requieren aproximadamente 14-16 GB de VRAM en bfloat16 (según el tamaño del modelo base). Con cuantización de 4 bits puede caber en GPUs de consumo como RTX 3090/4090.
- GPU recomendada: A100 80GB (usada en el entrenamiento) o cualquier GPU con 24 GB+ para inferencia sin cuantización.
- El adaptador LoRA en sí ocupa solo 0.2 GB, por lo que el consumo de VRAM está dominado por el modelo base.
- Despliegue: se puede usar con Hugging Face Transformers y la librería PEFT para cargar el adaptador. También es compatible con vLLM, llama.cpp, Ollama (si se fusionan los pesos), aunque no se han probado oficialmente.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros adaptadores de la misma serie (por ejemplo, el adaptador L3 o el adaptador completo con todos los datos) en la información proporcionada. La comparación directa solo es posible con los otros puntos de la curva de escalado del mismo experimento (ver sección de benchmarks), que muestran que este adaptador (1396 trazas) obtiene un rendimiento notablemente inferior a los de 250, 500 y 1000 trazas.

En términos de modelo base, Olmo-3-7B-Think compite con otros LLMs de 7B como Llama 3.1 8B o Mistral 7B, pero no se tienen datos de comparación con estos modelos en la información disponible.

## Limitaciones y advertencias

- Es un punto de ablación, no un modelo para producción. La propia model card advierte explícitamente que el adaptador completo de la serie con todos los datos es el que debe usarse.
- Entrenado únicamente con 1396 trazas y un único seed; los resultados tienen un margen de error de ±4.4 puntos porcentuales.
- Solo evalúa en inglés; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinación en problemas matemáticos complejos, como cualquier modelo de este tipo.
- El uso de un extractor de respuestas que no reconozca el formato `\boxed{}` puede dar resultados casi nulos (el autor menciona que un extractor `#### n` da 0 %).
- La licencia Apache 2.0 permite uso comercial, pero el autor no recomienda su uso en entornos reales.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-l5-scale1396)
- [Modelo base Olmo-3-7B-Think en Hugging Face](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Paper de Olmo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Ficha de Olmo 3 7B Think SFT en LLM Explorer](https://llm-explorer.com/model/allenai%2FOlmo-3-7B-Think-SFT,659GWIGO8KF4Xvodk096vl)
