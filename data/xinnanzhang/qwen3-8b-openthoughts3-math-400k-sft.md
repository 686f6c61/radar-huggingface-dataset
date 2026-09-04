# XinnanZhang/Qwen3-8B-openthoughts3-math-400k-sft

## Resumen

`Qwen3-8B-openthoughts3-math-400k-sft` es un checkpoint de fine-tuning supervisado (SFT) del modelo `Qwen/Qwen3-8B`, desarrollado por XinnanZhang. Se entrenó sobre el dataset `XinnanZhang/openthoughts3-math-50k8`, que contiene 50 000 prompts de matemáticas con 8 muestras cada uno, lo que da 400 000 ejemplos de entrenamiento. El propósito declarado del autor es servir como inicialización de estudiante para experimentos de destilación on-policy, no como un modelo de producción.

El modelo tiene 8 190 735 360 parámetros y la arquitectura base de Qwen3-8B. Es importante destacar que el propio autor advierte que este checkpoint rinde por debajo del modelo base sin ajustar. En la evaluación de referencia, el modelo base `Qwen/Qwen3-8B` obtiene una puntuación media de 67.06, mientras que este SFT alcanza solo 52.94, es decir, 14.1 puntos porcentuales menos. La causa se atribuye a la calidad del dataset de entrenamiento: solo el 29.4% de las respuestas objetivo cierran correctamente la etiqueta de pensamiento (``) y emiten la respuesta en formato `\boxed{}`. El 70.6% restante alcanza un límite de generación de 16 000 tokens y el modelo se entrena para emitir el token de fin de secuencia en mitad de un razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8 190 735 360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó una cutoff length de 20 000 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B`, un Transformer decoder-only que incorpora el modo de razonamiento (thinking mode) de la familia Qwen3. El fine-tuning se realizó con LLaMA-Factory, usando los hiperparámetros oficiales del proyecto OpenThinker3: learning rate 8e-5, batch global 512, una sola época, cutoff length 20 000 tokens, empaquetado `neat_packing` (con batch por dispositivo de 1 y acumulación de gradientes), liger kernel, FlashAttention-2 y precisión bf16.

El dataset de entrenamiento consta de 400 000 ejemplos combinando 50 000 prompts con 8 muestras cada uno. La característica más relevante del proceso es la baja calidad de una parte sustancial de los objetivos: el 70.6% de las respuestas de referencia superan el límite de 16 000 tokens y quedan truncadas en mitad del razonamiento. Al añadir el token `<|im_end|>` del template de chat a una respuesta incompleta, el modelo aprende a emitir el fin de secuencia antes de cerrar el pensamiento, lo que degrada significativamente su capacidad de razonamiento. Esta problemática proviene del dataset upstream OpenThoughts3-1.2M math, donde la tasa de completitud es similar (aproximadamente 30%).

## Capacidades

- Generación de texto con razonamiento matemático en inglés, en modo de pensamiento (thinking mode).
- Emisión de respuestas en formato `\boxed{}` cuando el razonamiento se completa correctamente.
- Herencia de las capacidades básicas del modelo base Qwen3-8B, aunque con una degradación documentada en la finalización de respuestas largas.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio en la model card.
- Capacidad multilingüe: solo se indica inglés en los datos del modelo. No hay pruebas de rendimiento en otros idiomas.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint está diseñado para usarse como inicialización de un modelo estudiante en experimentos de destilación. Los investigadores pueden reproducir los experimentos partiendo de estos pesos y comparar resultados con el modelo base.
- Estudio del impacto de la calidad del dataset en el fine-tuning: permite cuantificar cómo un dataset con un 70.6% de respuestas truncadas degrada el rendimiento de un modelo de 8 000 millones de parámetros. Es un caso útil para análisis de datos y curriculums de entrenamiento.
- Reproducción de pipelines de entrenamiento: la model card incluye la configuración exacta de entrenamiento (LLaMA-Factory, hiperparámetros). Se puede usar como referencia para reproducir el SFT en otros entornos.
- Análisis de completitud de razonamiento: sirve para investigar cómo los límites de generación y los tokens de fin de secuencia afectan a la estructura de las respuestas en modelos de razonamiento.
- Verificación de compatibilidad de versiones de transformers: permite comprobar cómo la carga del checkpoint se ve afectada por el manejo de `rope_theta` en versiones antiguas de transformers, tal como se documenta en la model card.
- No se recomienda su uso en aplicaciones de producción, ya que el propio autor indica que el modelo rinde por debajo del base. En un entorno real, es preferible usar `Qwen/Qwen3-8B` sin ajustar.

## Benchmarks y rendimiento

La model card presenta resultados de evaluación en AIME24, AIME25, AIME26 y AMC23. El método de evaluación es mean@8 y pass@8 con 8 muestras por prompt, 16 384 tokens de respuesta máxima, temperatura 0.6, top_p 0.95, top_k 20 y modo de pensamiento activado.

| Dataset | mean@8 | pass@8 |
|---|---|---|
| AIME24 | 46.25 | 70.60 |
| AIME25 | 37.08 | 53.34 |
| AIME26 | 46.25 | 62.62 |
| AMC23 | 82.19 | 93.61 |
| **Promedio** | **52.94** | **70.04** |

Para referencia, el modelo base `Qwen/Qwen3-8B` sin ajustar obtiene una puntuación de 67.06 en el promedio de mean@8 en la misma evaluación. Esto sitúa al checkpoint SFT 14.1 puntos porcentuales por debajo del modelo base. En términos de pass@8 promedio, el valor del base es 80.76, lo que deja al SFT 10.72 puntos porcentuales por debajo.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. El repositorio contiene 16.4 GB de pesos, lo que sugiere que en bf16 se necesitan al menos 16 GB de memoria para los pesos.
- GPU recomendadas: no se especifican en la información disponible.
- Compatibilidad con GPU consumer: no hay datos oficiales. Dado el tamaño de los pesos, una GPU de 24 GB podría alojar el modelo en bf16, pero no ha sido validado por el autor.
- Opciones de despliegue: no se documentan específicamente. Al tratarse de un checkpoint en formato safetensors, es compatible con frameworks estándar como vLLM, llama.cpp u Ollama, siempre que se tenga en cuenta la advertencia sobre `rope_theta` y la versión de transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La única comparativa disponible en la información proporcionada es frente al modelo base `Qwen/Qwen3-8B`. No se han encontrado otros modelos comparables en la model card.

| Modelo | Parametros | Contexto | Mean@8 promedio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-8B (base) | 8.19B | No disponible | 67.06 | Apache-2.0 | Hugging Face |
| Qwen3-8B-openthoughts3-math-400k-sft | 8.19B | No disponible | 52.94 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El checkpoint rinde por debajo de su modelo base. No debe considerarse una mejora sobre `Qwen/Qwen3-8B`.
- La causa principal es la baja calidad del dataset: el 70.6% de los objetivos de entrenamiento están truncados en mitad del razonamiento, lo que lleva al modelo a emitir fin de secuencia antes de completar el pensamiento. Esto produce respuestas incoherentes o incompletas en matemáticas.
- Riesgo de alucinación y de razonamiento truncado es alto, especialmente en problemas largos que requieren más de 16 000 tokens de razonamiento.
- Limitación lingüística: el fine-tuning se ha realizado únicamente en inglés. No hay datos de rendimiento en otros idiomas.
- Advertencia crítica con versiones de transformers: el checkpoint fue guardado con transformers 5.2.0, que anida `rope_theta` bajo `rope_parameters`. En versiones anteriores (por ejemplo, 4.55.2), el modelo carga con `rope_theta=10000` en lugar de `1000000`, lo que hace que las generaciones colapsen en texto incoherente sin ningún error visible. El `config.json` incluye `rope_theta` tanto plano como anidado con el valor `1000000`, pero si se re-guarda el modelo, es necesario verificar que la clave plana se conserve.
- La licencia Apache-2.0 permite uso comercial, pero la degradación del rendimiento hace que el modelo no sea apto para producción.

## Enlaces

- HuggingFace: https://huggingface.co/XinnanZhang/Qwen3-8B-openthoughts3-math-400k-sft
- Dataset de entrenamiento: https://huggingface.co/datasets/XinnanZhang/openthoughts3-math-50k8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
