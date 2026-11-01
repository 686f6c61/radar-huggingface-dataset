# Suyash44/full_insertion_box_darker_light_smolvla_50ksteps

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada `full_insertion_box_darker_light_smolvla_50ksteps`, un ajuste fino del modelo base `lerobot/smolvla_base` desarrollado por Hugging Face dentro del proyecto LeRobot. Se trata de un modelo compacto de robótica que aprende por imitación a partir de datos de demostraciones y produce acciones de control de un robot bimanual (tipo `bi_so_follower`) a partir de observaciones multimodales. El autor del ajuste es el usuario Suyash44 y la tarea concreta entrenada es "grasp the blue cylinder".

El modelo resuelve el problema de la generación de políticas de control robótico a partir de imágenes y estados articulares, sin necesidad de ingeniería de control manual. Con 450 millones de parámetros, se posiciona como una alternativa ligera que puede desplegarse en hardware de consumo, siguiendo la filosofía de SmolVLA descrita en el paper arXiv:2506.01844. El contexto de uso es la investigación en robótica y la experimentación con aprendizaje por imitación.

La relevancia actual radica en que los modelos VLA están pasando de los laboratorios a configuraciones reproducibles de bajo coste. Este checkpoint, entrenado durante 50.000 pasos sobre 80 episodios y 19.496 fotogramas, es un ejemplo de ajuste fino de dominio específico (una tarea de agarre concreta) sobre una base pública, con licencia Apache 2.0 y formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Tipo de robot | `bi_so_follower` |
| Cámaras de entrada | `front`, `left_wrist`, `right_wrist` |
| Entrada de estado | `observation.state` de forma `(12,)` |
| Entrada visual | 3 imágenes RGB de `(3, 480, 640)` |
| Salida | `action` de forma `(12,)` |
| Tamaño del repositorio | 13,2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual y un codificador de lenguaje con un módulo de generación de acciones, orientado a la ejecución de políticas robóticas en hardware de consumo. La model card no detalla la composición exacta de los bloques internos ni el número de tokens de entrenamiento del modelo base; únicamente referencia el paper arXiv:2506.01844 como descripción del método. La política consume tres flujos de imagen (cámara frontal y dos cámaras de muñeca) más un vector de estado articular de 12 dimensiones, y emite un vector de acción también de 12 dimensiones, lo que corresponde a un robot bimanual con seis grados de libertad por brazo.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `Riccardo11/full_insertion_box_darker_light`, compuesto por 80 episodios y 19.496 fotogramas a 30 FPS, con la tarea "grasp the blue cylinder". La configuración de entrenamiento fue de 50.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de acciones de control robótico de 12 dimensiones a partir de observaciones visuales y de estado.
- Fusión de tres vistas de cámara (frontal y dos de muñeca) para la percepción del entorno.
- Ejecución de la tarea específica de agarre de un cilindro azul ("grasp the blue cylinder").
- Control de un robot bimanual del tipo `bi_so_follower` con 12 grados de libertad.
- Despliegue en hardware de consumo, según la premisa de diseño de SmolVLA.
- Integración con el ecosistema LeRobot mediante el comando `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modo de razonamiento explícito.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como referencia reproducible de un ajuste fino de SmolVLA sobre un dataset público, útil para comparar hiperparámetros y curvas de entrenamiento.
- Automatización de una celda de pick-and-place: la política ejecuta el agarre de un cilindro azul sobre un robot bimanual, lo que permite montar una demostración de manipulación sin programar trayectorias manuales.
- Prototipado rápido en robótica de bajo coste: al caber en hardware de consumo, permite validar una política VLA en un banco de pruebas antes de invertir en GPUs de datacenter.
- Generación de datos sintéticos de evaluación: el modelo puede ejecutarse en bucle con `lerobot-rollout` para producir episodios que alimenten análisis de robustez frente a cambios de iluminación o posición.
- Docencia y formación: sirve para ilustrar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) con un caso concreto y acotado.
- Base para ajustes de dominio: al estar bajo Apache 2.0 y derivar de `lerobot/smolvla_base`, puede reentrenarse sobre nuevos datasets de tareas similares de manipulación.
- Benchmarking de infraestructura de inferencia robótica: permite medir latencia y throughput de una política VLA de 450 millones de parámetros en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de éxito por tarea sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors, la inferencia en precisión nativa requiere del orden de 1-2 GB solo para los pesos, más el coste de procesar tres imágenes de 480x640.
- GPU recomendadas: no disponibles en la documentación; la premisa de SmolVLA es el despliegue en hardware de consumo.
- Compatibilidad con GPU de consumo: plausible según el diseño de SmolVLA, pero no confirmada para este checkpoint concreto.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=Suyash44/full_insertion_box_darker_light_smolvla_50ksteps`; el entrenamiento se realiza con `lerobot-train` y `--policy.path=lerobot/smolvla_base`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`Suyash44/...smolvla_50ksteps`) | 450 M | no disponible | Agarre de cilindro azul, robot bimanual | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | Base VLA general para ajuste fino | no disponible en la información | Hugging Face |
| Políticas ACT de LeRobot | no disponible en la información | no disponible | Manipulación por imitación | no disponible en la información | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea ("grasp the blue cylinder") y un único tipo de robot (`bi_so_follower`); no generaliza a otras tareas sin reentrenamiento.
- No hay resultados de evaluación publicados, por lo que se desconoce la tasa de éxito real de la política.
- El dataset de entrenamiento es pequeño (80 episodios, 19.496 fotogramas), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos.
- No se documentan sesgos específicos, pero al derivar de un dataset acotado, la política puede fallar ante cambios de iluminación, distracciones o variaciones de la posición inicial.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben verificarse por separado antes de un despliegue en producción.
- No hay información sobre cuantizaciones ni sobre el comportamiento en precisión reducida.
- El repositorio ocupa 13,2 GB, lo que puede dificultar su descarga en entornos con ancho de banda limitado.
- No se documentan capacidades multilingües ni de razonamiento general; no debe emplearse como modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suyash44/full_insertion_box_darker_light_smolvla_50ksteps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/full_insertion_box_darker_light
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/full_insertion_box_darker_light
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
