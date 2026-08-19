# xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-detector-reward-v3

## Resumen

Este modelo es un checkpoint de investigación orientado a la generación de código seguro, desarrollado por el usuario xw1234gan. Se basa en el modelo Qwen/Qwen2.5-Coder-7B-Instruct y se ha entrenado mediante GRPO (Group Relative Policy Optimization) sobre el dataset SecCodePLT_Plus, con el objetivo de que el código generado cumpla tanto pruebas de capacidad funcional como requisitos de seguridad (ausencia de vulnerabilidades detectables). El nombre completo del repositorio indica que se trata de una variante "fixed mixed" con un parámetro alpha de 0.5 y un esquema de recompensa basado en un detector de vulnerabilidades de tipo ReaL.

El modelo tiene 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 15,2 GB. Es un checkpoint de tipo pi-theta, lo que significa que no es una política fusionada estáticamente: para reproducir el comportamiento evaluado es necesario mezclar sus logits con los de un ancla congelada (el modelo `xw1234gan/seccodeplt-qwen2.5-coder-7b-diff-sft-v2`) usando un factor alpha de 0,5. Esta característica lo convierte en una pieza de investigación más que en un modelo listo para producción directa.

La relevancia de este trabajo radica en que aborda un problema emergente: la seguridad del código generado por modelos de lenguaje. A diferencia de los fine-tunings convencionales, aquí se aplica un esquema de optimización por recompensa que combina la capacidad funcional (que el código pase pruebas) con la ausencia de vulnerabilidades detectadas por un analizador estático. Los resultados de evaluación muestran un equilibrio entre ambas dimensiones, aunque con limitaciones claras que se detallan más adelante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32K tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | No disponible (no se mencionan en la documentación) |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero no se detalla para este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención causal y mecanismos estándar de Qwen2.5. Sobre esta base se ha aplicado un entrenamiento de refuerzo mediante GRPO, una variante de PPO que optimiza la política directamente sobre un conjunto de recompensas. El dataset utilizado es `fengyao1909/SecCodePLT_Plus`, con una división oficial de 655 ejemplos para entrenamiento y 164 para evaluación. El entrenamiento se realizó con una semilla fija (seed 42) y empleó una pérdida de tokens estilo DAPO junto con muestreo dinámico.

La función de recompensa combina dos términos con pesos iguales: `0.5 * capability_test_fraction + 0.5 * max(0, 1 - 0.3 * detected_vulnerabilities)`. El primer término mide la fracción de pruebas de capacidad que supera el código generado; el segundo penaliza la presencia de vulnerabilidades detectadas por un analizador estático (ReaL), con un factor de 0,3. Esta formulación busca un equilibrio entre funcionalidad y seguridad. El checkpoint almacenado es la política entrenable pi-theta, no una fusión estática; para obtener la política evaluada hay que combinar sus logits con los del ancla congelada mediante `mixed_logits = 0.5 * pi_theta_logits + 0.5 * anchor_logits`.

## Capacidades

- Generación de código en lenguajes de programación soportados por el modelo base (Python, Java, C++, JavaScript, etc.), con especial énfasis en la producción de código que pase pruebas de capacidad.
- Detección y mitigación de vulnerabilidades de seguridad en el código generado, gracias al entrenamiento con recompensa basada en un detector estático.
- Cumplimiento de un formato de salida estructurado (el 99,39% de las salidas pasan la verificación de formato).
- Sintaxis válida en la gran mayoría de los casos (98,17% de tasa de éxito en verificación sintáctica).
- Capacidad de razonamiento y generación de texto heredada del modelo base Qwen2.5-Coder-7B-Instruct, aunque no se documentan detalles específicos para este checkpoint.
- Soporte de tool calling y function calling heredado del modelo base, aunque no se ha validado específicamente en este contexto.
- Capacidad de procesamiento multilingüe heredada, sin confirmación para este checkpoint concreto.

## Casos de uso

- Investigación en optimización de políticas para generación de código seguro: el checkpoint permite estudiar cómo la recompensa basada en detectores estáticos influye en el equilibrio entre funcionalidad y seguridad, comparando con otras variantes (por ejemplo, la versión v2 con recompensa real).
- Evaluación de esquemas de mezcla de logits: al ser un checkpoint pi-theta, se puede experimentar con diferentes valores de alpha para ajustar el comportamiento entre la política entrenada y el ancla congelada.
- Desarrollo de detectores de vulnerabilidades: el modelo puede servir como generador de código con vulnerabilidades controladas para entrenar o validar analizadores estáticos.
- Benchmarking de métodos de RL para código: los resultados de evaluación (joint pass 31,10%) proporcionan una referencia para comparar futuros enfoques de entrenamiento con GRPO.
- Generación de código con restricciones de seguridad en entornos de investigación: aunque no es un modelo de producción, puede usarse en laboratorios para explorar cómo la recompensa afecta a la generación de código seguro.
- Análisis de trade-offs entre capacidad y seguridad: los datos de capability pass (38,41%) y safety pass (62,20%) permiten estudiar la relación entre ambas métricas y ajustar los pesos de la función de recompensa.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluación, obtenidos con decodificación greedy sobre los 164 ejemplos de test oficiales:

| Metrica | Valor |
|---|---|
| Recompensa media | 0,585983 |
| Paso de formato de salida | 99,39% |
| Paso de sintaxis | 98,17% |
| Paso de capacidad | 38,41% |
| Paso de seguridad | 62,20% |
| Detector limpio | 60,37% |
| Puntuacion del detector | 0,782317 |
| Paso conjunto | 31,10% |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados corresponden a la política evaluada tras la mezcla de logits con el ancla congelada, no al checkpoint pi-theta aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7,6 B parámetros, en precisión FP16 se requieren aproximadamente 15 GB de VRAM; con cuantización int8 se reduce a unos 8 GB, y con int4 a unos 4-5 GB. Estas cifras son estimaciones generales basadas en el tamaño del modelo, no datos oficiales.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100). Para cuantización int8, una RTX 3080/3090 con 10-12 GB puede ser suficiente. No se dispone de recomendaciones específicas del autor.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, mediante llama.cpp u Ollama) es posible ejecutarlo en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TGI, llama.cpp, Ollama y otras herramientas estándar. No obstante, al ser un checkpoint pi-theta, el despliegue directo no reproduce la política evaluada; se requiere la mezcla de logits con el ancla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos de la misma categoría. El modelo base Qwen2.5-Coder-7B-Instruct es el punto de partida, y existe una variante anterior del mismo autor (`xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2`) que utiliza un esquema de recompensa diferente (real reward en lugar de detector reward). No se han encontrado datos de rendimiento de esa variante para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint de investigación de una sola semilla (seed 42), por lo que los resultados pueden no ser representativos de otras ejecuciones.
- La evaluación se realizó con un verificador de Python limitado por recursos; no constituye una garantía general de seguridad del código generado.
- El modelo no es una política fusionada: para obtener el comportamiento evaluado es imprescindible mezclar sus logits con el ancla congelada. Usarlo directamente producirá resultados no deseados.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-Coder-7B-Instruct, puede heredar sesgos del modelo base.
- Riesgo de alucinación en la generación de código: no se ha evaluado específicamente, pero es inherente a los modelos de lenguaje.
- La tasa de paso conjunto (31,10%) indica que en la mayoría de los casos el código generado no cumple simultáneamente los requisitos de capacidad y seguridad, por lo que no es adecuado para entornos de producción sin validación adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-detector-reward-v3
- Variante anterior (v2): https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2
- Colección Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-Coder-7B
- Página de despliegue en FriendliAI (para la variante v2): https://friendli.ai/models/xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2
