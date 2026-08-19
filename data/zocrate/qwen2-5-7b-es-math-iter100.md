# zocrate/Qwen2.5-7B-ES-math-iter100

## Resumen

`zocrate/Qwen2.5-7B-ES-math-iter100` es un fine-tuning del modelo base `Qwen/Qwen2.5-7B` (no instructivo) realizado con **Evolution Strategies** (ES), un método de optimización sin gradientes basado en poblaciones. El autor, `zocrate`, forma parte del proyecto [ES-capacity](https://github.com/Jaysen-Ma/ES-capacity) y utiliza el framework [es-at-scale](https://github.com/VsonicV/es-at-scale) (arXiv:2509.24372). El objetivo es mejorar el razonamiento matemático del modelo sin recurrir a retropropagación, mediante la evolución de los pesos completos (full-rank) con una población de 32 individuos y una sigma de 0.001.

Este checkpoint concreto es la **continuación a 100 iteraciones** del experimento de 50 iteraciones (`zocrate/Qwen2.5-7B-ES-math`). El propio autor advierte que el entrenamiento adicional no aportó ninguna mejora: la recompensa media de la población descendió de 0.664 a 0.645, los benchmarks internos se mantuvieron dentro del ruido y GPQA-diamond cayó 3 puntos. Por tanto, se recomienda usar el checkpoint de 50 iteraciones salvo que se quiera estudiar el efecto de alargar el entrenamiento.

Con 7.6 mil millones de parámetros y arquitectura transformer densa, el modelo hereda las capacidades lingüísticas del base, pero su especialización se centra en problemas matemáticos de nivel 3 a 5 del dataset MATH. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B base) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 7.6B parámetros, idéntico en arquitectura al `Qwen2.5-7B` original. El entrenamiento se realizó con **Evolution Strategies** de rango completo, es decir, sin calcular gradientes: se muestrean perturbaciones gaussianas alrededor de los pesos actuales, se evalúa la recompensa de cada individuo de la población y se actualizan los pesos según la dirección que maximiza la recompensa media. Los hiperparámetros fueron sigma = 0.001, alpha (tasa de aprendizaje) = sigma/2 = 0.0005, población de 32, batch size 256 y máximo de 2048 tokens por ejemplo. El dataset de entrenamiento fue `math_lvl3to5_8k`, que contiene problemas de los niveles 3 a 5 del benchmark MATH, el mismo conjunto usado por SimpleRL-Zoo.

Este checkpoint continúa el entrenamiento desde la iteración 50 hasta la 101 (50 iteraciones adicionales) sobre el checkpoint `zocrate/Qwen2.5-7B-ES-math`. El hardware utilizado fueron 8 GPUs RTX 4090 con 48 GB cada una (según la model card) y el tiempo total de continuación fue de 4.20 horas. No se aplicó RLHF ni DPO; la única señal de entrenamiento fue la recompensa definida por el entorno de evaluación matemática.

## Capacidades

- Razonamiento matemático en problemas de nivel 3 a 5 de MATH, incluyendo álgebra, geometría, teoría de números y combinatoria.
- Generación de texto autoregresivo estándar, heredada del modelo base Qwen2.5-7B.
- Resolución de problemas con formato de respuesta `qwen-boxed` (el modelo genera una solución y la encierra en un cuadro).
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modos de razonamiento especiales.
- Capacidades multilingües no confirmadas en la documentación; el base Qwen2.5-7B soporta varios idiomas, pero este fine-tuning no especifica su alcance.

## Casos de uso

- Investigación en optimización sin gradientes: el modelo sirve como caso de estudio para analizar cómo se comportan las Evolution Strategies en modelos de lenguaje de gran tamaño, especialmente en tareas de razonamiento matemático.
- Evaluación de la escalabilidad temporal de ES: al comparar los checkpoints de 50 y 100 iteraciones, se puede estudiar el punto de saturación y los efectos de sobre-entrenamiento en este tipo de métodos.
- Benchmark de referencia para otros métodos de fine-tuning matemático: puede usarse como baseline en experimentos que comparen ES con RLHF, DPO o fine-tuning supervisado.
- Generación de soluciones paso a paso para problemas de competición (AMC, AIME): aunque el rendimiento es modesto, puede producir razonamientos parcialmente correctos que sirvan como material de análisis.
- Pruebas de robustez ante perturbaciones de pesos: al ser un modelo entrenado con ES, puede utilizarse para estudiar la sensibilidad de las predicciones a cambios en los parámetros.
- Entrenamiento de modelos más pequeños mediante destilación: las soluciones generadas podrían usarse como datos sintéticos para entrenar modelos más ligeros en tareas matemáticas.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación interna (single-sample pass@1, con plantilla `qwen-boxed`) comparando el checkpoint de 50 iteraciones con el de 100. No se incluyen comparaciones con otros modelos.

| Benchmark | Después de 50 iteraciones | Después de 100 iteraciones | Diferencia |
|---|---|---|---|
| Recompensa media (population mean) | 0.664 | 0.645 | −0.019 |
| AIME | 6.67% | 6.67% | ±0.00 |
| AMC | 34.94% | 37.35% | +2.41 |
| MATH500 | 73.00% | 73.40% | +0.40 |
| Minerva | 37.87% | 37.87% | ±0.00 |
| OlympiadBench | 36.15% | 36.00% | −0.15 |
| GPQA-diamond | 31.8% | 28.8% | −3.03 |

El autor advierte que el harness de evaluación interno es distinto del usado en la suite pass@k del proyecto, y que variaciones de ±3 puntos en benchmarks medianos deben considerarse ruido. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware para inferencia en la documentación.
- Como referencia genérica para un modelo de 7.6B parámetros: en precisión fp16 se necesitan aproximadamente 15 GB de VRAM; con cuantización de 4 bits, alrededor de 4-5 GB.
- GPUs recomendadas según el tamaño: una RTX 4090 de 24 GB puede ejecutar el modelo en fp16 sin problemas; GPUs con 8-12 GB pueden usar cuantización de 8 o 4 bits.
- El entrenamiento se realizó en 8x RTX 4090 de 48 GB (según la model card), aunque este dato no afecta a la inferencia.
- Opciones de despliegue: al ser un checkpoint estándar de Qwen2, es compatible con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama`.
- No hay datos de latencia o throughput específicos en la documentación.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Sin embargo, se puede establecer una comparación interna:

| Modelo | Parámetros | Método | Contexto | Rendimiento MATH500 | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | 7.6B | Preentrenamiento | 32k (no confirmado aquí) | No disponible | Apache 2.0 |
| zocrate/Qwen2.5-7B-ES-math (iter50) | 7.6B | ES (50 iteraciones) | No disponible | 73.00% | Apache 2.0 |
| zocrate/Qwen2.5-7B-ES-math-iter100 | 7.6B | ES (100 iteraciones) | No disponible | 73.40% | Apache 2.0 |

No se han encontrado comparaciones con otros fine-tunings matemáticos como Qwen2.5-Math-7B o modelos similares en la información disponible.

## Limitaciones y advertencias

- El autor indica explícitamente que el entrenamiento adicional de 50 iteraciones no aportó ninguna mejora y que el checkpoint de 50 iteraciones es preferible.
- La recompensa media de la población descendió (0.664 → 0.645) y GPQA-diamond cayó 3 puntos, lo que sugiere una posible degradación por sobre-entrenamiento.
- No se realizó la suite completa de evaluación pass@k; solo se usaron evaluaciones internas de un solo sample.
- Al ser un modelo base (no instructivo), no está alineado para seguir instrucciones conversacionales ni para tareas generales de diálogo.
- El rendimiento en matemáticas es limitado en benchmarks de competición (AIME 6.67%), lo que indica que no es adecuado para problemas muy complejos.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-7B, puede heredar sesgos del preentrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no se recomienda para producción sin una evaluación adicional.
- No se especifican limitaciones de contexto o idioma en la documentación.

## Enlaces

- HuggingFace: [zocrate/Qwen2.5-7B-ES-math-iter100](https://huggingface.co/zocrate/Qwen2.5-7B-ES-math-iter100)
- Checkpoint de 50 iteraciones: [zocrate/Qwen2.5-7B-ES-math](https://huggingface.co/zocrate/Qwen2.5-7B-ES-math)
- Framework es-at-scale: [VsonicV/es-at-scale](https://github.com/VsonicV/es-at-scale)
- Proyecto ES-capacity: [Jaysen-Ma/ES-capacity](https://github.com/Jaysen-Ma/ES-capacity)
- Plantilla de evaluación qwen-boxed: [Jaysen-Ma/limit-of-RLVR](https://github.com/Jaysen-Ma/limit-of-RLVR)
- Paper asociado: arXiv:2509.24372 (no se proporciona enlace directo)
