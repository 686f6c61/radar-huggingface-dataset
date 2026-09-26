# Sounness/smolvla_lekiwi_98ep_20000

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) orientado al control robótico mediante imitación, diseñado para funcionar en hardware de consumo. El repositorio Sounness/smolvla_lekiwi_98ep_20000 es un ajuste fino supervisado del modelo base lerobot/smolvla_base, realizado por el usuario Sounness con la librería LeRobot 0.6.1 sobre un conjunto de datos propio de manipulación con un robot LeKiwi.

El modelo resuelve una tarea concreta: coger una pelota azul y depositarla en un contenedor rojo ("Pick blue ball", "Place blue ball in red container"). Consume como entrada el estado del robot (vector de 6 dimensiones) y tres cámaras RGB de 256x256 (`top`, `wrist`, `front`), y produce un vector de acción de 9 dimensiones.

Con 450.046.176 parámetros y un repositorio de 0,9 GB, es un ejemplo de política VLA ligera publicada bajo licencia Apache 2.0, útil como referencia reproducible de ajuste fino de bajo coste y como punto de partida para despliegues de robótica de escritorio. El autor no ha publicado resultados de evaluación ni métricas de éxito en el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de visión-lenguaje-acción (VLA); detalles internos en el artículo arXiv:2506.01844 |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica; consume una instrucción de tarea textual por episodio) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones en el repositorio) |
| Idiomas soportados | no disponible; las instrucciones de tarea del conjunto de datos están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |
| Tipo de robot | lekiwi_client |
| Cámaras | top, wrist, front (claves `observation.images.camera1/2/3`) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (9,) |
| Modelo base | lerobot/smolvla_base |
| Biblioteca | lerobot (versión de entrenamiento 0.6.1) |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción compacta que, según su model card, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La descripción completa del método se encuentra en el artículo arXiv:2506.01844, referenciado por el autor. En la información disponible no se detallan el backbone de visión-lenguaje concreto, el número de tokens de imagen, la composición del corpus de preentrenamiento ni si se aplicaron fases de RLHF o DPO.

Este checkpoint concreto es un ajuste fino por imitación (behavior cloning) sobre el conjunto de datos Sounness/lekiwi_pick_and_place_v2: 98 episodios, 61.845 fotogramas a 30 FPS, con dos instrucciones de tarea ("Pick blue ball" y "Place blue ball in red container"). La configuración de entrenamiento registrada es de 20.000 pasos, tamaño de lote 24, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, todo ello con LeRobot 0.6.1. No se documentan aumentos de datos, currículos de entrenamiento ni innovaciones técnicas adicionales en este repositorio.

## Capacidades

- Control visuomotor de un robot LeKiwi: genera vectores de acción de 9 dimensiones a partir de observaciones sensoriales.
- Fusión de tres cámaras RGB simultáneas (muñeca, frontal y superior) con resolución de 256x256 por cámara.
- Integración de propiocepción mediante `observation.state` de 6 dimensiones.
- Ejecución de tareas de manipulación guiadas por instrucción textual en inglés: recogida de un objeto y colocación en un contenedor.
- Ejecución de políticas en bucle cerrado sobre robot real a través del comando `lerobot-rollout`.
- Reentrenamiento y ajuste fino adicional mediante `lerobot-train` partiendo del mismo modelo base.
- No dispone de generación de texto, razonamiento simbólico, matemáticas, código, tool calling ni capacidades de agente multi-paso: es una política robótica, no un modelo de lenguaje conversacional.
- No se documentan capacidades multilingües, de visión general (captioning, VQA) ni de audio.

## Casos de uso

- Automatización de pick-and-place en robótica de escritorio: la política ejecuta la secuencia de coger una pelota azul y dejarla en un contenedor rojo, adecuada para demostrar flujos completos de percepción y actuación con un brazo LeKiwi.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de ajuste fino de un VLA de 450 M de parámetros sobre un conjunto de datos pequeño (98 episodios), útil para estudiar sensibilidad a hiperparámetros y número de pasos.
- Reproducción de experimentos con LeRobot: el repositorio documenta todos los ajustes de entrenamiento (pasos, lote, optimizador, tasa de aprendizaje, semilla), lo que permite repetir el entrenamiento y comparar resultados.
- Base para ajuste fino con nuevos objetos o contenedores: al partir de lerobot/smolvla_base, es viable reentrenar con un conjunto de datos propio que mantenga el mismo esquema de observaciones.
- Docencia y formación en robótica: el modelo permite ilustrar el ciclo completo de recogida de datos con LeKiwi, entrenamiento con LeRobot y despliegue en robot real sin necesidad de clústeres de GPU.
- Evaluación comparativa de políticas VLA ligeras: sirve como punto de comparación frente a otras políticas de LeRobot en tareas de manipulación con múltiples cámaras.
- Despliegue en hardware de consumo: al ocupar menos de 1 GB en safetensors, puede ejecutarse en equipos con GPU modesta acoplados al robot, sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una sección de evaluación vacía con la indicación explícita de que no se han proporcionado resultados de evaluación para esta política (ni tasa de éxito, ni número de intentos, ni condiciones de prueba en robot real).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para los pesos en precisión de 16 bits (el repositorio safetensors ocupa 0,9 GB para 450.046.176 parámetros), más el coste de las activaciones de tres cámaras de 256x256.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el modelo está pensado, según su model card, para hardware de consumo. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, de forma previsible en tarjetas de gama media con 4-6 GB o más, aunque no se aporta una lista verificada de modelos compatibles.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` para ejecución en robot y `lerobot-train` para entrenamiento o ajuste fino. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. El conjunto de datos se grabó a 30 FPS, pero no se especifica la frecuencia de inferencia alcanzable en el robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Sounness/smolvla_lekiwi_98ep_20000 | VLA ajustado para tarea pick-and-place con LeKiwi | 450.046.176 | estado (6,) + 3 cámaras 256x256 | Apache 2.0 | no disponible (sin evaluación publicada) |
| lerobot/smolvla_base | VLA base del que deriva este ajuste | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible |
| Otras políticas soportadas por LeRobot (por ejemplo ACT o pi0) | políticas de imitación para manipulación robótica | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: el modelo se ha entrenado únicamente con dos instrucciones de tarea ("Pick blue ball", "Place blue ball in red container") y no se ha evaluado su comportamiento fuera de ellas.
- Dependencia del montaje físico: las claves de observación (`observation.images.camera1/2/3`) y el tipo de robot (`lekiwi_client`) deben coincidir exactamente con los usados en el entrenamiento; un cambio de cámaras, calibración o robot invalida la política.
- Sin resultados de evaluación: el autor no publica tasa de éxito, número de intentos ni condiciones de prueba, por lo que no es posible estimar su fiabilidad en producción.
- Riesgo de sobreajuste: solo 98 episodios y 61.845 fotogramas para 20.000 pasos de entrenamiento con lote 24; no se documenta regularización ni validación sobre datos retenidos.
- Riesgo de fallo ante cambios de iluminación, posiciones de objeto, distractores o fondo, no cuantificado en la información disponible.
- Sesgos: no se documentan análisis de sesgo; al ser un modelo visuomotor, los sesgos relevantes serían de distribución visual y de configuración física, no lingüísticos.
- Idiomas: no se especifica soporte multilingüe; las instrucciones del conjunto de datos están en inglés, y no se garantiza el comportamiento con instrucciones en castellano u otros idiomas.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indique los cambios. Debe citarse también el método descrito en arXiv:2506.01844 y LeRobot según lo indicado por el autor.
- Advertencia de seguridad en robot real: al tratarse de una política que genera acciones directamente sobre hardware físico, es recomendable ejecutarla con límites de par, paradas de emergencia y espacio de trabajo despejado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sounness/smolvla_lekiwi_98ep_20000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Sounness/lekiwi_pick_and_place_v2
- Visualización del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sounness/lekiwi_pick_and_place_v2
- Artículo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
