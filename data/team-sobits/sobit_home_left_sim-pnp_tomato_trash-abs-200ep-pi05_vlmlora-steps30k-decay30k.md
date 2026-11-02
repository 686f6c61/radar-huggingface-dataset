# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora-steps30k-decay30k

## Resumen

El modelo `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora-steps30k-decay30k` es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05) de Physical Intelligence en la librería LeRobot de Hugging Face. No es un modelo de lenguaje generativo al uso: su salida es un vector de acción de 20 dimensiones para un robot manipulador móvil, condicionado por el estado del robot y dos cámaras (cabeza y mano izquierda). Resuelve una tarea concreta de manipulación doméstica simulada: lanzar una lata de tomate a una papelera.

El ajuste fino lo firma el equipo `team-sobits` y se ha entrenado sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48.141 fotogramas a 10 FPS. El entrenamiento consistió en 30.000 pasos con batch size 32, optimizador AdamW y learning rate 2,5e-05, con un esquema de decaimiento también de 30.000 pasos según el nombre del repositorio; se empleó LeRobot 0.6.1 y la variante de ajuste se etiqueta como `vlmlora`, lo que sugiere adaptación tipo LoRA sobre el componente visión-lenguaje.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de una política VLA de código abierto para una tarea de manipulación concreta, con licencia Apache 2.0, pesos en safetensors y un tamaño de repositorio de 1,9 GB. No se han publicado resultados de evaluación ni métricas de éxito, por lo que su utilidad práctica debe validarse empíricamente en el robot objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se define en inglés: "Throw the tomato can into the trash bin") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | mobile_manipulator |
| Cámaras de entrada | head_camera (3, 480, 640), hand_left_camera (3, 400, 640) |
| Estado de observación | observation.state, vector (20,) |
| Salida de acción | action, vector (20,) |
| Dataset de entrenamiento | team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep (200 episodios, 48.141 frames, 10 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 1,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅ (Pi05), un modelo de visión-lenguaje-acción de Physical Intelligence que evoluciona π₀ con el objetivo de generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación disponible en este repositorio proviene de LeRobot, que a su vez adapta el código abierto de OpenPI. El modelo consume dos flujos visuales (cámara de cabeza a 480x640 y cámara de mano izquierda a 400x640) junto con un vector de estado proprioceptivo de 20 dimensiones, y produce directamente un vector de acción de 20 dimensiones. El sufijo `vlmlora` del nombre indica que el ajuste fino se aplicó mediante LoRA sobre el componente visión-lenguaje, manteniendo el resto de la política congelado o parcialmente congelado.

El entrenamiento es de imitación supervisada sobre 200 episodios (48.141 fotogramas a 10 FPS) de una única tarea: "Throw the tomato can into the trash bin", en un entorno simulado (`sim` en el nombre del dataset) y con acciones en espacio absoluto (`abs`). Se ejecutaron 30.000 pasos con batch size 32, AdamW y learning rate 2,5e-05, con un esquema de decaimiento de 30.000 pasos. No se documenta en la model card el número de tokens de entrenamiento del modelo base, la composición completa de su dataset original ni si hubo etapas de RLHF o DPO; esos detalles corresponden al modelo base `lerobot/pi05_base` y no se reproducen aquí.

## Capacidades

- Generación de acciones de manipulación: produce un vector de 20 dimensiones para un manipulador móvil a partir de observaciones multimodales.
- Condicionamiento por lenguaje: acepta una instrucción de tarea en texto ("Throw the tomato can into the trash bin") que guía la política.
- Percepción visual multi-cámara: integra simultáneamente cámara de cabeza y cámara de mano izquierda con resoluciones distintas.
- Fusión de estado proprioceptivo y visión: combina `observation.state` (20,) con las dos imágenes para producir la acción.
- Ejecución en bucle cerrado: pensada para despliegue continuo mediante `lerobot-rollout` con `--duration` configurable.
- Ajuste fino reproducible: el flujo de entrenamiento con `lerobot-train` está documentado y es replicable.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, matemáticas, audio ni modos de "thinking"; no son aplicables a este tipo de modelo.

## Casos de uso

- Manipulación doméstica simulada: ejecutar la tarea de arrojar una lata a una papelera en un entorno simulado con un manipulador móvil, usando las dos cámaras y el estado del robot como entradas; es el caso para el que fue entrenado y el único validado por el dataset.
- Base para ajuste fino en tareas similares: partir de estos pesos o del base `lerobot/pi05_base` y reentrenar con `lerobot-train` sobre un dataset propio de recogida y depósito de objetos, aprovechando el pipeline de LeRobot 0.6.1.
- Evaluación de pipelines de imitación: usar la política como referencia para medir latencia, estabilidad y tasa de éxito de un stack LeRobot completo antes de invertir en datos reales.
- Pruebas de integración hardware-software: validar la cadena de cámaras, calibración y puerto del robot con `lerobot-rollout` antes de desplegar políticas más costosas.
- Generación de datos sintéticos complementarios: emplear rollouts de la política en simulación para aumentar la diversidad del dataset de entrenamiento de un modelo posterior.
- Docencia y reproducción de experimentos VLA: servir como ejemplo mínimo (1,9 GB, Apache 2.0) para ilustrar el flujo completo de ajuste fino de π₀.₅ con LoRA en LeRobot.
- Comparación de estrategias de ajuste: contrastar el esquema `vlmlora` con ajuste completo sobre el mismo dataset para estudiar el compromiso entre coste y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 1,9 GB en safetensors, lo que da una cota inferior orientativa del peso en memoria, pero no se especifica el número de parámetros ni el pico de memoria en ejecución.
- GPU recomendadas: no disponible. La model card solo menciona `--policy.device=cuda` para entrenamiento, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de VRAM ni de latencia que permitan determinarlo.
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento, ambos de la librería LeRobot (versión 0.6.1 en el entrenamiento). No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, lo que sugiere una frecuencia de control del orden de 10 Hz, pero no se confirma la tasa de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Este modelo (pi05 vlmlora, fine-tune) | VLA, política de manipulación | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes | Ajustado a una única tarea simulada; sin evaluación publicada |
| lerobot/pi05_base | VLA base π₀.₅ | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face (modelo base citado) | Punto de partida del ajuste fino; generalista |
| π₀ (Pi0) de Physical Intelligence | VLA predecesor | no disponible | no disponible | no disponible en la información proporcionada | Repositorio OpenPI citado por el autor | π₀.₅ se presenta como evolución para generalizar a entornos nuevos |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) para ninguno de los tres, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no puede afirmarse que la política funcione de forma fiable.
- Entrenada en simulación: el dataset es `sim`; el salto a un robot real (sim-to-real) no está documentado y puede degradar el rendimiento por diferencias de iluminación, calibración y dinámica.
- Tarea única y estrecha: solo se ha entrenado para "Throw the tomato can into the trash bin"; no se espera generalización a otras tareas sin reentrenamiento.
- Dependencia de configuración exacta: las cámaras deben llamarse `head_camera` y `hand_left_camera` y respetar las resoluciones de entrenamiento; cualquier cambio invalida las observaciones.
- Sesgos: no documentados. Al entrenarse con 200 episodios de un único operador y entorno, es probable un sesgo hacia posiciones, iluminación y objetos de ese dataset, pero el autor no lo reporta.
- Riesgo de alucinación: en el sentido de acciones incorrectas o inseguras ante situaciones fuera de distribución; no hay análisis de fallos ni mecanismos de seguridad descritos.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés y no hay evidencia de funcionamiento con instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ deben verificarse por separado, ya que su licencia no se detalla en la información disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; repositorio creado el 2026-10-31 y actualizado el 2026-11-02, sin señales de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
