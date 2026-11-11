# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_adarms-steps30k-decay30k

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada `pi05`, desarrollada por el equipo `team-sobits` como un ajuste fino del modelo base `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ de Physical Intelligence dentro del ecosistema LeRobot. El modelo resuelve una tarea robótica concreta de manipulación móvil: introducir una lata de tomate en una papelera ("Throw the tomato can into the trash bin"), aprendida por imitación a partir de 200 episodios y 48.141 fotogramas capturados a 10 FPS en simulación.

El interés técnico del checkpoint reside en su configuración de entrenamiento: un ajuste fino de tipo LoRA sobre la torre de visión-lenguaje (`vlmlora`) combinado con cabezas de acción autorregresivas (`adarms`), entrenado durante 30.000 pasos con decaimiento a partir del paso 30.000, batch de 32, optimizador AdamW y tasa de aprendizaje de 2,5e-5, usando LeRobot 0.6.1. El resultado es un artefacto de 2,0 GB en formato `safetensors` que se ejecuta mediante el pipeline de robótica de LeRobot.

Se trata de un modelo de nicho, con 17 descargas y sin resultados de evaluación publicados, orientado a reproducir una política de manipulación sobre un robot de tipo `mobile_manipulator` con dos cámaras (cabeza y mano izquierda). Su relevancia es práctica para quien quiera inspeccionar el flujo completo de ajuste fino de π₀.₅ con LoRA en LeRobot sobre un dataset propio de simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (implementación LeRobot/OpenPI), ajuste fino con LoRA en la torre visión-lenguaje y cabezas de acción autorregresivas (`adarms`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repositorio de 2,0 GB) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `mobile_manipulator` |
| Cámaras | `head_camera` (3×480×640), `hand_left_camera` (3×400×640) |
| Entrada de estado | `observation.state` de forma `(20,)` |
| Salida de acción | `action` de forma `(20,)` |
| Biblioteca | `lerobot` 0.6.1 |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅, un VLA de Physical Intelligence diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y que evoluciona la arquitectura π₀ original. La implementación utilizada es la adaptada por LeRobot desde el repositorio OpenPI. Sobre esa base, este checkpoint aplica un ajuste fino con LoRA sobre la torre de visión-lenguaje (`vlmlora`) y cabezas de acción autorregresivas (`adarms`), de modo que solo una fracción de los pesos se actualiza durante el entrenamiento y el resto permanece congelado.

El entrenamiento se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48.141 fotogramas a 10 FPS, todos ellos correspondientes a la tarea "Throw the tomato can into the trash bin" en simulación. La configuración reportada es de 30.000 pasos de entrenamiento, batch de 32, optimizador AdamW, tasa de aprendizaje 2,5e-5 y semilla 1000, con un esquema de decaimiento a partir del paso 30.000 (`steps30k-decay30k`). No se documentan detalles sobre el volumen de datos de preentrenamiento del modelo base, la composición del corpus ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones a partir del estado del robot y de dos vistas de cámara.
- Ejecución de una tarea de pick-and-place específica: recoger una lata de tomate e introducirla en una papelera.
- Percepción visual multimodal con dos cámaras simultáneas (cabeza y mano izquierda), lo que permite coordinar aproximación, agarre y colocación.
- Política de imitación entrenada de extremo a extremo, sin planificación explícita ni módulos de control separados.
- Integración nativa con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Ajuste fino eficiente mediante LoRA, lo que permite adaptar el modelo base a nuevas tareas con un coste de entrenamiento reducido.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión está restringida a las dos cámaras del robot).

## Casos de uso

- Automatización de tareas de recogida y eliminación de residuos en entornos simulados: la política se ejecuta con `lerobot-rollout` sobre un `mobile_manipulator` y completa el ciclo de aproximación, agarre y depósito de la lata en la papelera, adecuada para validar pipelines de manipulación antes de trasladarlos a hardware real.
- Generación de datos sintéticos de manipulación: al ejecutarse en simulación a 10 FPS, permite generar trayectorias etiquetadas de forma automática para ampliar datasets de imitación con variaciones de posición y punto de vista.
- Base para ajuste fino con LoRA en nuevas tareas domésticas: el checkpoint sirve como punto de partida para entrenar variantes sobre otros objetos o contenedores reutilizando la receta `vlmlora` + `adarms` documentada.
- Evaluación comparativa de recetas de ajuste fino: al fijar hiperparámetros concretos (30k pasos, batch 32, lr 2,5e-5, semilla 1000), permite medir el efecto de cambios en la configuración sobre la tasa de éxito en la misma tarea.
- Docencia y formación en VLA: el repositorio incluye los comandos completos de ejecución y entrenamiento, lo que lo convierte en un ejemplo reproducible de flujo LeRobot de extremo a extremo para cursos de robótica e IA.
- Pruebas de integración de hardware: sirve para verificar la calibración de cámaras y la correspondencia de claves de observación (`head_camera`, `hand_left_camera`) antes de desplegar políticas más complejas en un robot físico.
- Investigación en generalización de políticas: al derivar de π₀.₅, cuyo objetivo declarado es generalizar a entornos nuevos, permite estudiar cómo se transfiere una política entrenada en simulación a condiciones de iluminación u oclusión distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que todavía no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,0 GB en `safetensors`, pero no se especifica el número de parámetros ni el consumo en memoria durante la ejecución.
- GPU recomendadas: no disponible. El comando de entrenamiento de referencia usa `--policy.device=cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si cabe en tarjetas RTX 4090, 3090 u otras.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (ejecución) y `lerobot-train` (entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset se capturó a 10 FPS y el ejemplo de ejecución usa `--duration=60`, pero no se reportan tiempos de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `team-sobits/...pi05_vlmlora_adarms-steps30k-decay30k` | VLA π₀.₅ ajustado con LoRA | no disponible | no disponible | Introducir lata en papelera (simulación) | Apache 2.0 | Hugging Face, 17 descargas |
| `lerobot/pi05_base` | VLA π₀.₅ base | no disponible | no disponible | Política general preentrenada | no disponible en la información | Hugging Face |
| π₀ (Physical Intelligence) | VLA predecesor | no disponible | no disponible | Manipulación general | no disponible en la información | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni en simulación ni en robot real, por lo que se desconoce la fiabilidad de la política.
- Especialización extrema: el modelo está entrenado para una única tarea ("Throw the tomato can into the trash bin") y un único tipo de robot (`mobile_manipulator`); no se espera que generalice a otros objetos, contenedores o morfologías sin reentrenamiento.
- Dependencia de la configuración de cámaras: las claves de observación y las resoluciones (`head_camera` 480×640, `hand_left_camera` 400×640) deben coincidir exactamente con las del entrenamiento; cualquier desviación invalida la inferencia.
- Entrenamiento en simulación: no se documenta ninguna validación de transferencia sim-to-real, que es un riesgo conocido en políticas de imitación.
- Sesgos conocidos: no disponibles. Al tratarse de un modelo de control robótico, los sesgos relevantes serían de distribución (posiciones, iluminación y objetos del dataset), no de sesgo lingüístico.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` y la arquitectura π₀.₅ de Physical Intelligence pueden tener condiciones adicionales no detalladas en esta información.
- Idiomas: no disponible; el modelo no procesa lenguaje natural de forma general, solo la instrucción de tarea asociada.
- Madurez: 17 descargas, 0 likes y actualización en noviembre de 2026; se trata de un artefacto de investigación sin señales de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_adarms-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuración de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
