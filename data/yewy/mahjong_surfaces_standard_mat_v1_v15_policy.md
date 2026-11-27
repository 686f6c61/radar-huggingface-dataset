# Yewy/mahjong_surfaces_standard_mat_v1_v15_policy

## Resumen

El modelo `Yewy/mahjong_surfaces_standard_mat_v1_v15_policy` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo desarrolla el usuario Yewy y se ha entrenado y publicado en Hugging Face mediante LeRobot, la librería de referencia de Hugging Face para robótica de imitación. El modelo está especializado en una tarea concreta: manipular superficies de mahjong sobre una alfombrilla estándar, empleando el robot LeKiwi con brazo SO101.

La relevancia de esta ficha es acotada pero clara: no se trata de un modelo de lenguaje generalista, sino de un checkpoint de política visomotora entrenado sobre un conjunto de datos específico (`Yewy/mahjong_surfaces_standard_mat_v1_v15_224`) con resolución de entrada de 224 píxeles. Su interés principal reside en servir como ejemplo reproducible de un pipeline completo de LeRobot: recogida de datos por teleoperación, entrenamiento con ACT y evaluación con `lerobot-record`.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, el modelo es ligero y está pensado para ejecutarse en hardware de consumo o en un puesto de trabajo con GPU modesta. La licencia Apache 2.0 facilita su reutilización y adaptación, aunque su alcance funcional está limitado estrictamente al dominio de la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política visomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un fragmento (chunk) de acciones futuras. Esta formulación reduce el error de compounding y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador visual con un transformer que modela la secuencia de acciones, y se entrena sobre datos de teleoperación.

El entrenamiento se ha realizado con LeRobot sobre el dataset `Yewy/mahjong_surfaces_standard_mat_v1_v15_224`, que contiene episodios de teleoperación del robot LeKiwi con brazo SO101 en la tarea de manipular superficies de mahjong sobre una alfombrilla estándar. La información disponible no detalla el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización adicionales. No se especifica si hubo RLHF, DPO u otros ajustes posteriores, algo por otra parte poco habitual en políticas de imitación.

## Capacidades

- Generación de acciones motoras para el robot LeKiwi con brazo SO101 en tareas de manipulación.
- Predicción de chunks de acciones, lo que permite movimientos más suaves y estables que la predicción paso a paso.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Ejecución de una tarea específica: manipulación de superficies de mahjong sobre alfombrilla estándar.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- **Reproducción de experimentos de imitación en robótica**: sirve como checkpoint de referencia para validar un pipeline de LeRobot con ACT, comparando resultados de entrenamiento y evaluación en una tarea concreta de manipulación.
- **Punto de partida para fine-tuning en tareas de mahjong**: el modelo puede adaptarse a variantes de la tarea (otras alfombrillas, otras fichas) partiendo de estos pesos y un dataset propio, reduciendo el tiempo de entrenamiento.
- **Evaluación de hardware LeKiwi/SO101**: permite probar la cadena completa de inferencia (`lerobot-record`) en un robot real y medir tasas de éxito antes de invertir en datasets más grandes.
- **Docencia y divulgación**: ejemplo didáctico de aprendizaje por imitación con ACT, útil para explicar conceptos como action chunking y teleoperación en cursos de robótica.
- **Benchmark interno de políticas**: al ser un checkpoint ligero (51,7 M de parámetros), puede usarse como línea base en comparaciones internas con otras políticas entrenadas sobre el mismo dataset.
- **Prototipado rápido en laboratorio**: su reducido tamaño (0,2 GB) permite iterar rápidamente en un puesto con GPU de consumo sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponible; por tamaño, una RTX 3060 o superior sería suficiente, aunque no hay confirmación del autor.
- ¿Cabe en consumer GPU?: sí, por el reducido número de parámetros, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte para `--policy.path` apuntando a un checkpoint local o del Hub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yewy/mahjong_surfaces_standard_mat_v1_v15_policy | 51.668.614 | no disponible | Manipulación de mahjong con LeKiwi/SO101 | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Varía según dataset | varía | Hugging Face |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación general | varía | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Alcance muy restringido**: el modelo está entrenado para una tarea concreta (superficies de mahjong sobre alfombrilla estándar) y un robot concreto (LeKiwi con SO101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- **Riesgo de sobreajuste al entorno de entrenamiento**: cambios en iluminación, posición de cámara o disposición de las fichas pueden degradar el rendimiento.
- **Sin datos de benchmarks**: no hay métricas publicadas de tasa de éxito, lo que impide evaluar su fiabilidad objetiva.
- **Sesgos**: no documentados; al ser una política visomotora, los sesgos provendrían de la distribución del dataset de teleoperación.
- **Alucinación**: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de distribución.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- **Documentación escasa**: la model card es mínima y no detalla hiperparámetros, número de episodios ni configuración de entrenamiento.
- **Caveat para producción**: no se recomienda su uso en entornos de producción sin una validación exhaustiva en el robot y entorno objetivo.

## Enlaces

- [Hugging Face: Yewy/mahjong_surfaces_standard_mat_v1_v15_policy](https://huggingface.co/Yewy/mahjong_surfaces_standard_mat_v1_v15_policy)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset: Yewy/mahjong_surfaces_standard_mat_v1_v15_224](https://huggingface.co/datasets/Yewy/mahjong_surfaces_standard_mat_v1_v15_224)
