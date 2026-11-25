# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_lerobot_default-steps30k-decay30k

## Resumen

Este repositorio contiene una política Vision-Language-Action (VLA) denominada `pi0`, desarrollada por el equipo `team-sobits` como un ajuste fino (fine-tuning) del modelo base `lerobot/pi0_base`, que a su vez es la implementación en LeRobot del modelo π₀ de Physical Intelligence. Se trata de una política de imitación entrenada para una tarea robótica concreta: lanzar una lata de tomate a una papelera, sobre un robot de tipo `mobile_manipulator` con dos cámaras (`head_camera` y `hand_left_camera`). El modelo consume observaciones multimodales (estado del robot de 20 dimensiones e imágenes de ambas cámaras) y produce un vector de acción de 20 dimensiones.

El modelo es relevante en el contexto de la robótica de manipulación porque demuestra el flujo completo de LeRobot para ajustar un modelo fundacional VLA a una tarea específica con datos de simulación (200 episodios, 48.141 fotogramas a 10 FPS). No obstante, se trata de un artefacto de investigación muy especializado: la política está entrenada únicamente para la tarea "Throw the tomato can into the trash bin" y no se han publicado resultados de evaluación en el repositorio.

El repositorio es pequeño (0,1 GB), lo que sugiere pesos en formato safetensors compatibles con la librería LeRobot. La licencia es Apache 2.0 y el modelo se distribuye sin datos de idiomas declarados, ya que su función no es el procesamiento de lenguaje general, sino la ejecución de una instrucción de tarea fija en un entorno robótico simulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀ (Pi0), implementación LeRobot adaptada de OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico; la tarea se especifica en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀ (Pi0), un modelo fundacional de robot de tipo Vision-Language-Action desarrollado por Physical Intelligence. La implementación utilizada aquí procede de LeRobot, que a su vez adapta el repositorio OpenPI. El modelo procesa observaciones visuales (imágenes de las cámaras de cabeza y mano izquierda) junto con el estado propioceptivo del robot (vector de 20 dimensiones) y genera acciones de control de 20 dimensiones. No se dispone de detalles sobre el número de parámetros, la composición del corpus de preentrenamiento ni si hubo etapas de RLHF o DPO en el modelo base.

El ajuste fino se realizó sobre el conjunto de datos `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48.141 fotogramas a 10 FPS, con la tarea única "Throw the tomato can into the trash bin". La configuración de entrenamiento reportada incluye 30.000 pasos, tamaño de lote de 20, optimizador AdamW, tasa de aprendizaje de 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. El nombre del repositorio indica un decaimiento de la tasa de aprendizaje a lo largo de 30.000 pasos (`steps30k-decay30k`). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación móvil: genera comandos de acción de 20 dimensiones para un robot `mobile_manipulator` a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente imágenes de una cámara de cabeza (3, 480, 640) y una cámara de mano izquierda (3, 400, 640).
- Ejecución de una instrucción de tarea en lenguaje natural: la política está condicionada por la tarea "Throw the tomato can into the trash bin".
- Aprendizaje por imitación: reproduce comportamientos aprendidos de 200 episodios de demostración en simulación.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto general, matemáticas ni procesamiento de audio.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida para reproducir el flujo de ajuste fino de π₀ con LeRobot sobre un dataset propio de 200 episodios y 48.141 fotogramas.
- Evaluación de políticas VLA en simulación: ejecutar la política con `lerobot-rollout` en un robot `mobile_manipulator` simulado para medir la tasa de éxito en la tarea de lanzar la lata a la papelera.
- Base para ajustes finos adicionales: al estar entrenada sobre `lerobot/pi0_base`, puede reutilizarse como inicialización para tareas de manipulación relacionadas con recogida y depósito de objetos.
- Docencia y formación en robótica: ilustra el ciclo completo de grabación de datos, entrenamiento con AdamW a 2,5e-05 y despliegue con LeRobot 0.6.1.
- Pruebas de integración de hardware: validar la configuración de cámaras (`head_camera`, `hand_left_camera`) y el puerto del robot antes de entrenar políticas propias.
- Referencia de configuración de entrenamiento: el repositorio documenta hiperparámetros concretos (30.000 pasos, lote 20, semilla 1000) útiles para comparar recetas de ajuste fino de π₀ en tareas de manipulación móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no documenta el número de parámetros ni el consumo de memoria.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU; el comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponible. El dataset se grabó a 10 FPS, pero no se reporta la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| team-sobits/...pi0_lerobot_default-steps30k-decay30k | VLA (π₀ ajustado) | no disponible | no disponible | Lanzar lata a papelera (simulación) | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | VLA (π₀ base) | no disponible | no disponible | Política generalista multi-tarea | no disponible en la información | Hugging Face |
| π₀ original (Physical Intelligence, OpenPI) | VLA | no disponible | no disponible | Política generalista multi-robot | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Throw the tomato can into the trash bin"; no se espera generalización a otras tareas sin un nuevo ajuste fino.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de rendimiento, por lo que se desconoce su fiabilidad real.
- Entrenamiento en simulación: el dataset es de simulación (`sim-pnp`), lo que puede provocar una brecha de realidad (sim-to-real gap) al desplegarse en un robot físico.
- Dependencia de hardware concreto: requiere un robot `mobile_manipulator` con cámaras `head_camera` y `hand_left_camera` y las dimensiones de observación y acción exactas (20 dimensiones cada una).
- Sesgos conocidos: no documentados; al ser un modelo robótico, los sesgos relevantes serían los del dataset de demostración, no reportados.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi0_base` y el π₀ original pueden tener condiciones adicionales no detalladas en esta información.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y no se documenta soporte multilingüe.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_lerobot_default-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
