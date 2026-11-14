# zeta0707/act_omx_picknplace_20261114_131025

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `zeta0707/act_omx_picknplace_20261114_131025`, es una política entrenada con LeRobot 0.5.2 sobre un robot `omx_follower` para la tarea "pick and place lean desk", con dos cámaras (front y top) como entrada visual y un vector de estado de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y ocupa 0.2 GB en el repositorio, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. Es un modelo de robótica, no un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones (imágenes + estado propioceptivo) a comandos de acción de 6 grados de libertad.

La relevancia de esta ficha es doble: por un lado, documenta una política ACT concreta y sus parámetros de entrenamiento; por otro, sirve como referencia de cómo LeRobot empaqueta y distribuye políticas de imitación listas para desplegar en robots reales. El dataset de entrenamiento es muy reducido (3 episodios, 1176 fotogramas a 30 FPS), lo que condiciona fuertemente su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de robótica; ventana de observación definida por el chunking de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | omx_follower |
| Cámaras de entrada | front, top (3, 480, 640) |
| Dimensión de estado | (6,) |
| Dimensión de acción | (6,) |
| Tarea entrenada | "pick and place lean desk" |
| Pasos de entrenamiento | 8000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 5e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esto mitiga el problema de compounding error típico de las políticas paso a paso y permite un control más suave. La arquitectura combina un encoder visual (procesa las imágenes de las cámaras `front` y `top` a 480x640) con un decoder que genera las acciones de 6 dimensiones, condicionado por el estado propioceptivo del robot y la tarea.

El entrenamiento se realizó con LeRobot 0.5.2 durante 8000 pasos, batch size 8, optimizador AdamW y learning rate 5e-05, con semilla 1000. El dataset `zeta0707/picknplace_20261114_131025` contiene únicamente 3 episodios y 1176 fotogramas a 30 FPS de la tarea "pick and place lean desk". No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro sobre demostraciones teleoperadas. No se especifica el número de tokens ni la composición del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `omx_follower`.
- Percepción visual multimodal: consume dos flujos de imagen (cámara frontal y cenital) a 480x640.
- Aprendizaje por imitación: reproduce la tarea "pick and place lean desk" a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones: reduce el error acumulado frente a políticas paso a paso.
- Integración con LeRobot: ejecutable mediante `lerobot-rollout` y entrenable con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.

## Casos de uso

- Recogida y colocación de objetos en escritorio: la política está entrenada específicamente para la tarea "pick and place lean desk" y puede ejecutarse en bucle con `lerobot-rollout` durante un tiempo determinado (`--duration=60`).
- Prototipado rápido de manipulación con LeRobot: sirve como plantilla para entrenar políticas ACT propias con `lerobot-train` y el dataset correspondiente.
- Validación de hardware `omx_follower`: permite comprobar el funcionamiento de un robot de este tipo y de sus cámaras antes de invertir en datasets mayores.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del número de episodios y de la configuración de entrenamiento en el éxito de la tarea.
- Demostraciones educativas: ejemplo mínimo de pipeline completo (dataset, entrenamiento, rollout) en LeRobot.
- Benchmark interno de referencia: política base contra la que comparar variantes con más datos o distintas arquitecturas.
- No es adecuada para tareas distintas a la entrenada ni para entornos con objetos, iluminación o posiciones muy diferentes a los del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con suficiente memoria para procesar dos imágenes de 480x640 a 30 FPS; una RTX 3060 o superior es suficiente en la práctica, aunque no se documenta oficialmente.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; el cuello de botella real es el procesamiento visual a 30 FPS.
- Opciones de despliegue: LeRobot (`lerobot-rollout`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la frecuencia de control del robot (30 FPS en el dataset).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeta0707/act_omx_picknplace_20261114_131025 | 51.668.614 | no aplica | pick and place lean desk | apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | variable | no aplica | tareas de manipulación diversas | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | manipulación | variable | Hugging Face |
| Políticas VQ-BeT (LeRobot) | variable | no aplica | manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 3 episodios y 1176 fotogramas, lo que limita severamente la generalización a nuevas posiciones, objetos o condiciones de iluminación.
- Sin resultados de evaluación publicados: no se conoce la tasa de éxito real de la política.
- Específica de hardware: entrenada para un robot `omx_follower` con cámaras `front` y `top`; no es portable a otras configuraciones sin reentrenamiento.
- Tarea única: solo reproduce "pick and place lean desk"; no es un modelo generalista.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse como un LLM.
- Riesgo de sobreajuste a las demostraciones: con tan pocos episodios, es probable que la política dependa de posiciones y apariencias concretas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan sesgos ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es el fallo físico en la manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeta0707/act_omx_picknplace_20261114_131025
- Dataset de entrenamiento: https://huggingface.co/datasets/zeta0707/picknplace_20261114_131025
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zeta0707/picknplace_20261114_131025
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
