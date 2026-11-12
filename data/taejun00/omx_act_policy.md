# Taejun00/omx_act_policy

## Resumen

`Taejun00/omx_act_policy` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos de acciones (*action chunks*) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para robótica de imitación, y está etiquetado con el pipeline `robotics`. El autor es el usuario Taejun00 y el checkpoint se ha entrenado sobre el dataset `Taejun00/record-data-new`.

El modelo resuelve el problema del control motor fino en tareas de manipulación robótica: en lugar de predecir una única acción por paso de control, ACT genera una secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad de la política. Es relevante para desarrolladores que trabajan con brazos robóticos de bajo coste (como el SO-100/OMX) y quieren reproducir flujos de entrenamiento y evaluación de LeRobot sin partir de cero.

El checkpoint tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en tiempo real en hardware modesto. La información pública disponible es escasa: no hay resultados de benchmarks, número de tokens de entrenamiento ni composición del dataset más allá del identificador del repositorio de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cabeza de predicción de chunks de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el contexto es la observación visual y el estado del robot por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT se apoya en un transformer encoder-decoder que recibe observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y predice una secuencia de acciones de longitud fija (el *chunk*). La innovación principal del método es la predicción conjunta de chunks, que suaviza la política y mitiga el problema de la varianza alta en el aprendizaje por imitación con datos teleoperados. El modelo se entrena con aprendizaje supervisado (behavior cloning) sobre demostraciones humanas; no se dispone de información sobre RLHF, DPO ni sobre el número de tokens o episodios utilizados.

El entrenamiento se ha realizado con LeRobot, cuyo comando `lerobot-train` configura la política con `--policy.type=act` y escribe checkpoints en `outputs/train/<repo_id>/checkpoints/`. El dataset de entrenamiento es `Taejun00/record-data-new`, pero no se detalla su composición, número de episodios ni tareas cubiertas. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado.
- Manipulación de brazos robóticos teleoperados, especialmente en configuraciones tipo SO-100/OMX.
- Ejecución de políticas entrenadas con LeRobot mediante `lerobot-record` y `--policy.path`.
- Evaluación reproducible con datasets prefijados `eval_` y número de episodios configurable.
- Integración con el ecosistema Hugging Face Hub para carga de checkpoints locales o remotos.
- No dispone de capacidades de lenguaje, tool calling, agentes, visión general o audio; es un modelo específico de robótica.

## Casos de uso

- Manipulación robótica de laboratorio: usar el checkpoint para tareas de pick-and-place con un brazo SO-100, aprovechando la predicción de chunks para movimientos más suaves y estables.
- Reproducción de experimentos de imitación: cargar el modelo con `lerobot-record` y comparar la tasa de éxito frente a políticas entrenadas desde cero con el mismo dataset.
- Base para fine-tuning: partir de este checkpoint de 51,7 M de parámetros y reentrenar con `lerobot-train` sobre nuevas demostraciones teleoperadas para adaptarlo a otra tarea.
- Evaluación en entornos simulados o reales: ejecutar 10 episodios de evaluación con el dataset `eval_` para medir la robustez de la política antes de desplegarla.
- Docencia y prototipado: servir como ejemplo completo de pipeline LeRobot (dataset, entrenamiento, checkpoint y evaluación) para cursos de robótica de imitación.
- Despliegue en hardware de bajo coste: al ocupar 0,2 GB y tener ~51,7 M de parámetros, puede ejecutarse en GPUs de consumo o incluso en CPU para inferencia por lotes pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (0,2 GB) y los 51,668 M de parámetros, la inferencia en FP32 requeriría aproximadamente 0,2 GB solo para pesos, más memoria para activaciones y buffers de observación.
- GPU recomendadas: no disponible; al ser un modelo pequeño, es plausible usar RTX 4090, RTX 3090 o GPUs de gama media, pero no hay datos oficiales.
- Cabe en GPU de consumo: sí, por tamaño (0,2 GB de pesos), aunque no se especifican requisitos mínimos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), carga desde Hugging Face Hub o checkpoint local; no se documentan vLLM, llama.cpp, Ollama ni TGI para este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taejun00/omx_act_policy | 51.668.614 | no disponible | no disponible | apache-2.0 | Hugging Face Hub |
| Políticas ACT genéricas de LeRobot | no disponible | no disponible | no disponible | apache-2.0 (típico) | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Hugging Face Hub / LeRobot |
| Políticas VQ-BeT | no disponible | no disponible | no disponible | no disponible | Hugging Face Hub / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al entrenarse con datos teleoperados de un único dataset, puede sobreajustarse a la distribución de demostraciones y generalizar mal a nuevas condiciones de iluminación, objetos o posiciones.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero la política puede generar acciones incorrectas o inseguras fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no soporta instrucciones en lenguaje natural ni capacidades multilingües.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero se recomienda revisar las condiciones del dataset `Taejun00/record-data-new` y de LeRobot.
- Caveats para producción: no hay benchmarks publicados, no se documenta el dataset de entrenamiento ni la tasa de éxito; es imprescindible evaluar en el entorno real antes de desplegar. El modelo está pensado para robótica de imitación y no debe usarse como modelo generativo general.

## Enlaces

- Hugging Face: https://huggingface.co/Taejun00/omx_act_policy
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Taejun00/record-data-new
