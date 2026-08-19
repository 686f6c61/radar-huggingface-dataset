# xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-detector-reward-v3

## Resumen

Este modelo es un fine-tuning experimental de `Qwen/Qwen2.5-Coder-7B-Instruct` orientado a la generación de código seguro según el benchmark SecCodePLT+. Lo desarrolla el usuario xw1234gan como parte de una línea de investigación sobre optimización con GRPO (Group Relative Policy Optimization) sin regularización KL. El objetivo es que el modelo produzca código que cumpla especificaciones funcionales y, a la vez, minimice vulnerabilidades detectadas por un analizador estático.

Se trata de un checkpoint de investigación, no de un modelo listo para producción. La arquitectura base es un transformer decoder-only de 7.615 millones de parámetros (7,6B), con una ventana de contexto no especificada en la documentación. El entrenamiento se realizó sobre el dataset `fengyao1909/SecCodePLT_Plus` con 655 ejemplos de entrenamiento y una función de recompensa que combina la fracción de tests funcionales superados con una penalización por vulnerabilidades detectadas. La evaluación sobre 164 ejemplos de test muestra una tasa de cumplimiento conjunto (funcionalidad y seguridad) del 31,71%, lo que indica que el modelo aún tiene margen de mejora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer causal con atención completa y 7,6B parámetros. Sobre esta base se aplicó un fine-tuning con GRPO sin regularización KL, una variante de optimización por refuerzo que ajusta la política del modelo directamente a partir de una función de recompensa. En esta versión v3 se emplea la recompensa del detector de análisis de programas de ReaL, con pérdida de token estilo DAPO y muestreo dinámico. La función de recompensa es `0.5 * capability_test_fraction + 0.5 * max(0, 1 - 0.3 * detected_vulnerabilities)`, donde `capability_test_fraction` mide el porcentaje de tests funcionales superados y `detected_vulnerabilities` cuenta las vulnerabilidades encontradas por el detector.

El entrenamiento usó la semilla 42 y el split oficial de 655 ejemplos del dataset SecCodePLT_Plus. No se especifican detalles sobre el número de pasos, el tamaño de lote ni la duración del entrenamiento. La evaluación se realizó con decodificación greedy sobre los 164 ejemplos de test oficiales, utilizando el verificador de Python con límite de recursos del propio benchmark.

## Capacidades

- Generación de código en Python con formato estructurado (el 99,39% de las salidas cumplen el formato esperado).
- Cumplimiento de especificaciones funcionales: el 39,02% de las soluciones pasan los tests de capacidad.
- Generación de código con cierta resistencia a vulnerabilidades: el 63,41% de las salidas superan la comprobación de seguridad y el 61,59% no son marcadas como vulnerables por el detector.
- Sintaxis válida en el 98,78% de las respuestas.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, soporte multimodal o modos de pensamiento explícitos.

## Casos de uso

- Investigación en seguridad de código generado por IA: el modelo sirve como banco de pruebas para estudiar cómo la optimización por refuerzo afecta al equilibrio entre funcionalidad y seguridad en generación de código.
- Evaluación de técnicas de alineación: permite comparar el efecto de la regularización KL frente a su ausencia en el rendimiento sobre tareas de código seguro.
- Desarrollo de detectores de vulnerabilidades: las salidas del modelo pueden usarse para validar y mejorar analizadores estáticos como el detector de ReaL.
- Generación de código con verificación automática: en entornos controlados, puede integrarse en pipelines que ejecuten tests funcionales y análisis de vulnerabilidades de forma automática.
- Benchmarking de modelos de código: sirve como referencia para medir el progreso en tareas de cumplimiento de especificaciones de seguridad.
- Formación y educación: como ejemplo de fine-tuning con GRPO para estudiantes e investigadores interesados en RL aplicado a generación de código.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre los 164 ejemplos de test oficiales de SecCodePLT+:

| Metrica | Valor |
|---|---|
| Recompensa media | 0,600820 |
| Formato de salida correcto | 99,39% |
| Sintaxis valida | 98,78% |
| Tests de capacidad superados | 39,02% |
| Comprobacion de seguridad superada | 63,41% |
| Salidas sin vulnerabilidades detectadas | 61,59% |
| Puntuacion del detector | 0,798171 |
| Cumplimiento conjunto (funcionalidad y seguridad) | 31,71% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7,6B parámetros, en FP16 requiere aproximadamente 15 GB de VRAM (el repositorio pesa 15,2 GB). Con cuantización de 8 bits se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A100, H100). Con cuantización, cabe en GPUs consumer de 8 GB (RTX 3070/3080, RTX 4060 Ti) o incluso menos.
- Compatibilidad con el ecosistema transformers: al estar basado en Qwen2.5-Coder, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado explícitamente en la documentación.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 7B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. El modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` es la referencia más cercana, pero no se han reportado resultados de este fine-tuning frente a él en los benchmarks de SecCodePLT+. Tampoco hay datos sobre alternativas como CodeLlama-7B o DeepSeek-Coder-7B en este contexto específico. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint de investigación de una sola semilla: los resultados pueden no ser representativos de la variabilidad del entrenamiento.
- Evaluado con un verificador con límite de recursos: el rendimiento podría diferir en entornos de ejecución más permisivos o restrictivos.
- No es una garantía general de código seguro: el modelo puede generar vulnerabilidades no detectadas por el analizador utilizado.
- Licencia no disponible: se desconoce si el modelo puede usarse comercialmente o bajo qué términos.
- Idiomas no especificados: aunque el modelo base soporta múltiples idiomas, no se ha documentado el comportamiento de este fine-tuning en lenguas distintas del inglés.
- Riesgo de alucinación y sesgos heredados del modelo base: no se han realizado evaluaciones adicionales más allá del benchmark SecCodePLT+.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-detector-reward-v3
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Informe tecnico de Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v2
- Version v2 del mismo experimento en FriendliAI: https://friendli.ai/models/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-no-kl-real-reward-v2
