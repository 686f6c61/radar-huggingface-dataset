# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-qfix-pi05_vlmlora-steps30k-decay30k

## Resumen

Este repositorio contiene un fine-tuning del modelo vision-lenguaje-acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado mediante LeRobot para una tarea concreta de manipulación robótica: lanzar una lata de tomate a una papelera. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha entrenado sobre un dataset propio de 200 episodios (48.141 fotogramas a 10 FPS) capturado en simulación con un robot de tipo `mobile_manipulator` equipado con dos cámaras (cabeza y mano izquierda).

π₀.₅ es la evolución de π₀ orientada a la generalización en entornos abiertos: recibe observaciones multimodales (imágenes y estado propioceptivo) y emite directamente un vector de acciones de 20 dimensiones. Este fine-tuning concreto emplea LoRA sobre el componente vision-lenguaje (sufijo `vlmlora`), con 30.000 pasos de entrenamiento y un decaimiento de learning rate a partir del paso 30.000, según la nomenclatura del identificador del repositorio.

Su relevancia es acotada: no es un modelo de propósito general, sino una política de imitación especializada en una única tarea y un único robot. Resulta útil como referencia para quienes trabajen con LeRobot y quieran reproducir el flujo completo de fine-tuning de π₀.₅ sobre datos propios, o como ejemplo de adaptación eficiente mediante LoRA de un VLA preentrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, transformer multimodal con adaptadores LoRA en el componente visión-lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación por paso, sin ventana de contexto textual declarada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no se documenta soporte lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA de Physical Intelligence que combina un backbone visión-lenguaje con un cabezal de acciones. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI del autor original. La política consume tres entradas: `observation.state` (vector de 20 dimensiones), `observation.images.head_camera` (3×480×640) y `observation.images.hand_left_camera` (3×400×640), y produce una acción de 20 dimensiones. El fine-tuning aplica LoRA sobre el componente visión-lenguaje (`vlmlora`), lo que reduce el coste de adaptación frente a un ajuste completo.

El entrenamiento se realizó sobre 200 episodios y 48.141 fotogramas a 10 FPS de la tarea "Throw the tomato can into the trash bin", con 30.000 pasos, batch de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. El identificador indica un decaimiento del learning rate a partir del paso 30.000. No se documentan detalles sobre el dataset de preentrenamiento de π₀.₅, la composición de datos, ni si hubo RLHF o DPO en la fase base.

## Capacidades

- Control robótico de manipulación móvil: genera comandos de acción de 20 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente dos flujos de cámara (cabeza y mano izquierda) con resoluciones distintas.
- Ejecución de una tarea específica de pick-and-place: recoger una lata de tomate y lanzarla a una papelera.
- Política de imitación entrenada por comportamiento clonado sobre demostraciones (200 episodios).
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y entrenable con `lerobot-train`.
- Adaptación eficiente mediante LoRA sobre el backbone visión-lenguaje.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües; se trata de una política robótica, no de un modelo conversacional.

## Casos de uso

- Automatización de tareas de recogida y descarte en entornos simulados: la política ejecuta la secuencia completa de agarre y lanzamiento de un objeto a un contenedor, útil para validar pipelines de manipulación antes del despliegue físico.
- Base para fine-tuning en tareas domésticas similares: al partir de `lerobot/pi05_base` y emplear LoRA, sirve como punto de partida para adaptar el modelo a otras tareas de manipulación con pocos datos.
- Evaluación de flujos de imitación en LeRobot: permite reproducir de extremo a extremo el ciclo de grabación de datos, entrenamiento y rollout documentado por Hugging Face.
- Investigación en generalización de políticas VLA: útil para estudiar cómo se comporta un modelo preentrenado en entornos abiertos al especializarse en una tarea concreta con 200 episodios.
- Benchmarking de adaptación LoRA en robótica: el identificador `vlmlora` permite comparar el rendimiento de LoRA frente a fine-tuning completo sobre el mismo dataset.
- Prototipado de robots móviles manipuladores con configuración de dos cámaras: la política está configurada para un robot `mobile_manipulator` con cámara de cabeza y de mano izquierda, un setup reproducible en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,9 GB en safetensors, lo que da una cota inferior del tamaño de los pesos, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible. La documentación de LeRobot emplea `--policy.device=cuda` en los ejemplos de entrenamiento, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π₀.₅ fine-tuned, LoRA) | VLA especializado en una tarea | no disponible | no disponible | Apache 2.0 | Hugging Face (14 descargas) |
| `lerobot/pi05_base` | VLA base preentrenado | no disponible | no disponible | no disponible en la información | Hugging Face |
| `team-sobits/...-pi05_vlmlora-steps30k-decay30k` (variante sin `qfix`) | VLA fine-tuned, misma tarea | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Throw the tomato can into the trash bin") y un único robot; no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento en simulación: el dataset procede de simulación (`sim-pnp`), por lo que el rendimiento en un robot físico puede degradarse por la brecha sim-to-real.
- Sin evaluación publicada: no hay tasas de éxito ni resultados de robustez, lo que impide validar su fiabilidad en producción.
- Dependencia del setup de hardware: las cámaras y sus nombres deben coincidir exactamente con las claves de observación del entrenamiento (`head_camera`, `hand_left_camera`) y con las resoluciones declaradas.
- Idiomas no documentados: no aplica como modelo lingüístico; no debe usarse para tareas de generación de texto.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones erróneas o inseguras en el robot ante situaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones propias que conviene verificar.
- Sesgos: no documentados; al entrenarse en un entorno simulado concreto, puede heredar sesgos de las condiciones de captura (iluminación, posiciones de objetos, distractores).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-qfix-pi05_vlmlora-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-qfix
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante sin `qfix`: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora-steps30k-decay30k
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-qfix
