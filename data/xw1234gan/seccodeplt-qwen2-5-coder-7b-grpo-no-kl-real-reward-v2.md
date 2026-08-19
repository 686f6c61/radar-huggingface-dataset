# xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-reward-v2

## Resumen

El modelo `xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-reward-v2` es un checkpoint de investigación derivado de `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollado por el autor `xw1234gan` como parte de un experimento de optimización con GRPO (Group Relative Policy Optimization) sin regularización KL, orientado a la generación de código seguro según el benchmark SecCodePLT+. Este modelo aborda el problema de alinear modelos de lenguaje con requisitos de seguridad en generación de código, utilizando una recompensa basada en pruebas unitarias de seguridad (ReaL safety-unit-test) y una pérdida de tokens estilo DAPO con muestreo dinámico.

La versión v2 corrige la alineación de etiquetas causales respecto a iteraciones anteriores y se entrena sobre el split oficial de 655 ejemplos del dataset `fengyao1909/SecCodePLT_Plus`, con semilla 42. La evaluación se realiza con decodificación greedy sobre los 164 ejemplos de test oficiales, obteniendo una tasa de cumplimiento conjunto (joint pass) del 30,49 %. El modelo tiene 7.615.616.512 parámetros (7,6 B) y se distribuye en formato safetensors, con un tamaño de repositorio de 15,2 GB. Es un modelo denso, no MoE, y su licencia no está especificada.

Este checkpoint es relevante para la comunidad de seguridad de código porque explora una metodología de entrenamiento con recompensa real basada en verificación, en lugar de depender únicamente de preferencias humanas o recompensas aproximadas. Sin embargo, el autor advierte que se trata de un experimento de una sola semilla y que los resultados no constituyen una garantía general de código seguro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de `Qwen/Qwen2.5-Coder-7B-Instruct`, un modelo de 7,6 B parámetros especializado en generación de código. Sobre esta base se aplica un entrenamiento de refuerzo con GRPO sin regularización KL, una variante de PPO que optimiza directamente la recompensa sin añadir un término de divergencia KL con el modelo de referencia. La recompensa utilizada es la oficial del benchmark SecCodePLT+, basada en pruebas unitarias de seguridad (ReaL safety-unit-test), que verifica tanto la capacidad funcional como la seguridad del código generado.

El entrenamiento incorpora una pérdida de tokens estilo DAPO (Dynamic Adaptive Policy Optimization) y muestreo dinámico, con el objetivo de mejorar la eficiencia de la optimización. Se utilizó el split de entrenamiento oficial de 655 ejemplos del dataset `fengyao1909/SecCodePLT_Plus`, con semilla 42. La evaluación se realizó con decodificación greedy sobre los 164 ejemplos de test oficiales. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset más allá del nombre, ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y código, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Generación de código con enfoque en seguridad, optimizada para cumplir requisitos de seguridad definidos por el benchmark SecCodePLT+.
- Capacidad de producir código que pase verificadores de seguridad basados en pruebas unitarias (safety unit tests).
- Soporte de formato de salida estructurado, con una tasa de formato correcto del 98,17 % en la evaluación.
- No se menciona soporte explícito de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio en la información proporcionada.

## Casos de uso

- Evaluación de modelos de generación de código seguro: el modelo puede utilizarse como referencia en investigaciones que comparen metodologías de alineación de seguridad, gracias a su diseño experimental con recompensa real y sin regularización KL.
- Generación de código con verificación de seguridad en entornos de investigación: permite probar pipelines de generación de código donde se requiere que el resultado pase pruebas unitarias de seguridad, como en el benchmark SecCodePLT+.
- Estudio de técnicas de optimización con GRPO: al ser un checkpoint de una sola semilla, sirve para analizar el impacto de la pérdida DAPO y el muestreo dinámico en la convergencia de la recompensa.
- Desarrollo de herramientas de análisis de vulnerabilidades: el modelo puede generar código candidato que posteriormente se somete a análisis estático o dinámico, aunque su tasa de cumplimiento conjunto es limitada (30,49 %).
- Comparación de estrategias de regularización en RL: al no usar KL, permite estudiar cómo afecta la ausencia de regularización a la estabilidad y al rendimiento final en tareas de seguridad.
- Reproducción de experimentos académicos: investigadores pueden replicar el entrenamiento y la evaluación descritos en la model card para validar o extender los resultados.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluación sobre los 164 ejemplos de test oficiales de SecCodePLT+, con decodificación greedy:

| Metrica | Valor |
|---|---|
| Mean reward | 0,496886 |
| Output format pass | 98,17 % |
| Syntax pass | 97,56 % |
| Capability pass | 37,80 % |
| Safety pass | 62,80 % |
| Joint pass | 30,49 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, GPU recomendadas o latencia en la información proporcionada.
- Al tratarse de un fine-tuning de Qwen2.5-Coder-7B-Instruct, los requisitos de inferencia son similares a los de ese modelo base, pero no se confirma oficialmente.
- El tamaño del repositorio (15,2 GB en safetensors) sugiere que la inferencia en FP16 requiere al menos 16 GB de VRAM, aunque esta es una estimación no confirmada.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.) en la información disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. El modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` es la referencia natural, pero no se aportan datos de rendimiento comparativo. Tampoco se conocen otros checkpoints del mismo autor con configuraciones alternativas (por ejemplo, con regularización KL) que permitan una comparación directa.

## Limitaciones y advertencias

- Checkpoint de investigación de una sola semilla: los resultados pueden no ser representativos de la variabilidad del entrenamiento.
- Evaluado con un verificador de Python limitado en recursos del benchmark, lo que puede no reflejar la seguridad real en entornos de producción.
- No constituye una garantía general de código seguro; la tasa de cumplimiento conjunto es solo del 30,49 %.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o restricciones de redistribución.
- No se dispone de información sobre sesgos del modelo, riesgos de alucinación o limitaciones de idioma más allá de las heredadas del modelo base.
- El modelo no ha sido probado en tareas fuera del ámbito de SecCodePLT+, por lo que su rendimiento en otros dominios de generación de código es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-reward-v2)
- [Dataset SecCodePLT_Plus](https://huggingface.co/datasets/fengyao1909/SecCodePLT_Plus)
- [Modelo base Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
