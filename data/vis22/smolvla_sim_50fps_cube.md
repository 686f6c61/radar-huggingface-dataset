# vis22/smolvla_sim_50fps_cube

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Este checkpoint concreto, `vis22/smolvla_sim_50fps_cube`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset simulado `vis22/sim_50fps_v2_cube`, orientado a una única tarea de manipulación: coger un cubo y depositarlo en una papelera.

El modelo resuelve el problema de la política visomotora de extremo a extremo: consume el estado articular del robot y las imágenes de sus cámaras, y produce directamente el vector de acción a ejecutar. Con 450 millones de parámetros, se posiciona como una alternativa ligera a los VLA de mayor tamaño, priorizando la eficiencia computacional y la posibilidad de inferencia en tiempo real sobre GPUs de gama media.

Es relevante porque ejemplifica el flujo de trabajo actual de LeRobot: partir de un modelo base preentrenado y ajustarlo con pocos episodios (50 en este caso, 47.172 fotogramas a 50 FPS) para una tarea concreta. Su licencia Apache 2.0 y su formato safetensors lo hacen directamente reutilizable, aunque se trata de un artefacto de investigación sin evaluación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea se expresan en texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único modelo. El paper de referencia (arXiv:2506.01844) describe un diseño compacto orientado a reducir el coste computacional manteniendo un rendimiento competitivo, con despliegue viable en hardware de consumo. La información proporcionada no detalla la composición interna (encoder visual, backbone de lenguaje, cabeza de acciones) ni el número de tokens de preentrenamiento del modelo base.

Este checkpoint se ha obtenido por ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `vis22/sim_50fps_v2_cube`: 50 episodios, 47.172 fotogramas a 50 FPS, tarea "pick the cube and place it in the bin", robot `piper_mujoco` y cámaras `cam_global` y `cam_gripper`. La configuración de entrenamiento fue de 200.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se indica uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste por imitación.

## Capacidades

- Generación de acciones robóticas de 7 dimensiones a partir de observaciones multimodales (estado articular de 6 dimensiones más tres cámaras de 256x256).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto (`--task="pick the cube and place it in the bin"`).
- Política visomotora de extremo a extremo para manipulación (pick-and-place).
- Entrada multimodal con tres flujos visuales (`observation.images.camera1/2/3`) y estado propioceptivo (`observation.state`).
- Inferencia en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No se documentan tool calling, capacidades de agente, razonamiento multi-paso ni modo thinking; es un modelo de política, no un asistente conversacional.

## Casos de uso

- Manipulación pick-and-place en simulación: reproducir la tarea de coger un cubo y depositarlo en una papelera sobre el robot `piper_mujoco` con `lerobot-rollout`, usando exactamente las cámaras y claves de observación con las que se entrenó.
- Punto de partida para ajuste fino: reentrenar sobre un dataset propio con `lerobot-train --policy.path=lerobot/smolvla_base` y comparar contra este checkpoint como referencia de línea base.
- Validación de pipelines de imitación: servir como caso de prueba reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) antes de escalar a tareas reales.
- Investigación en VLA compactos: estudiar el comportamiento de un modelo de 450 M de parámetros entrenado con solo 50 episodios, útil para analizar sensibilidad al tamaño del dataset.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de políticas VLA en GPUs de consumo dentro de un entorno simulado controlado.
- Docencia y demostraciones: ilustrar el ciclo de vida de una política robótica en cursos o talleres con hardware asequible, dado el reducido tamaño del modelo (0,9 GB de repo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en precisión de 16 bits el peso ronda los 0,9 GB, por lo que la huella es reducida, pero no se confirma el consumo real en ejecución.
- GPU recomendadas: no disponibles en la información proporcionada. El paper describe despliegue en hardware de consumo, pero no se listan modelos concretos.
- Compatibilidad con GPU de consumo: plausible por tamaño, pero sin confirmación oficial en la documentación disponible.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución sobre robot; `lerobot-train` para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está a 50 FPS, lo que sugiere requisitos de inferencia en tiempo real, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/smolvla_sim_50fps_cube | 450 M | no disponible | Pick-and-place simulado (piper_mujoco) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | Modelo base VLA generalista | Apache 2.0 (según base) | Hugging Face |
| Otros VLA de mayor tamaño (p. ej. familias tipo OpenVLA o RT-2) | no disponible | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real incluso en el entorno simulado de entrenamiento.
- Entrenado con solo 50 episodios y una única tarea; es probable una generalización muy limitada a nuevas posiciones de objetos, iluminación, distracciones o variantes del robot.
- Dependencia estricta de las claves de observación: las cámaras deben coincidir con `observation.images.camera1/2/3` y el estado con una dimensión de 6; cambios en la configuración rompen la inferencia.
- Entrenado en simulación (`piper_mujoco`); no hay evidencia de transferencia a un robot físico.
- Riesgo de alucinación de acciones: como política de imitación, puede generar movimientos fuera de distribución ante entradas no vistas, con riesgo físico si se despliega en hardware real.
- Idiomas: no se documenta soporte multilingüe de las instrucciones; el texto de tarea usado es el del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación propia.
- Sesgos: no documentados; el dataset es sintético y de una sola tarea, por lo que los sesgos de distribución son los del propio simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/smolvla_sim_50fps_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/sim_50fps_v2_cube
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/sim_50fps_v2_cube
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
