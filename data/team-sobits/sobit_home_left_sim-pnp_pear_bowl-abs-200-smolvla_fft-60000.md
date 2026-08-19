# team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-60000

## Resumen

Este modelo es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido fine-tuneado por el equipo de SOBITS (Saitama University) sobre el modelo base `lerobot/smolvla_base` para ejecutar la tarea concreta de recoger una pera y colocarla sobre un cuenco, en un entorno simulado con un robot móvil manipulador. El entrenamiento se realizó con el framework LeRobot, usando un dataset de 200 episodios de demostración con 22 588 fotogramas a 10 FPS.

La relevancia de este modelo radica en que demuestra cómo un VLA de 450 millones de parámetros puede especializarse en una tarea de manipulación con un coste computacional reducido, siendo viable su despliegue en hardware de consumo. Al estar licenciado bajo Apache 2.0 y entrenado con herramientas open source, representa un punto de partida accesible para desarrolladores e investigadores que quieran experimentar con políticas de imitación en robótica sin necesidad de infraestructura de alto nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de control, no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un transformador de lenguaje para generar comandos de acción a partir de observaciones multimodales. En este caso, el modelo recibe como entrada el estado del robot (vector de 20 dimensiones) y dos imágenes de cámaras (cabeza y mano izquierda), y produce un vector de acción de 20 dimensiones que controla el robot móvil manipulador.

El entrenamiento se realizó mediante fine-tuning completo (FFT) del modelo base `lerobot/smolvla_base` sobre el dataset `team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200`, que contiene 200 episodios de la tarea de pick-and-place. Se usaron 60 000 pasos de entrenamiento con batch size 16, optimizador AdamW y learning rate 0.0001, con semilla 1000. No se menciona el uso de técnicas como RLHF o DPO; se trata de un aprendizaje por imitación supervisado estándar. El modelo se entrenó con LeRobot versión 0.6.0.

## Capacidades

- Ejecuta la tarea específica de recoger una pera y colocarla sobre un cuenco, en un entorno simulado con un robot móvil manipulador.
- Procesa observaciones multimodales: estado del robot (vector de 20 dimensiones) y dos cámaras RGB (cabeza y mano izquierda).
- Genera acciones de control de 20 dimensiones, adecuadas para un robot móvil con brazo.
- Especializado en manipulación de objetos pequeños (pick-and-place) con control de bajo nivel.
- No soporta tool calling, agentes conversacionales ni generación de texto; es un policy de control directo.
- Capacidades multilingües: no aplicable, ya que no procesa lenguaje natural en la entrada.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales o domésticos: el modelo puede controlar un robot móvil para recoger objetos y colocarlos en posiciones definidas, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas con pocos datos (200 episodios).
- Desarrollo de robots de asistencia en el hogar: la tarea de recoger y colocar objetos es fundamental en escenarios de ayuda a personas con movilidad reducida.
- Simulación y validación de políticas de control: al estar entrenado en simulación, puede usarse para probar algoritmos de control antes de transferirlos a robots reales.
- Fine-tuning para nuevas tareas: sobre la base de este modelo, se pueden adaptar pesos para otras tareas de manipulación con datasets pequeños.
- Benchmarking de VLA en hardware de consumo: permite evaluar el rendimiento de SmolVLA en GPUs de gama media, comparando latencia y precisión en tareas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450 millones de parámetros en FP16, se estima un consumo de aproximadamente 900 MB de VRAM, más overhead de activaciones, por lo que cabría en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super). Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4060, etc.).
- Sí cabe en GPU de consumo: las GPUs de gama media actuales pueden ejecutar la inferencia sin problemas.
- Opciones de despliegue: el modelo se usa principalmente a través de LeRobot, con el comando `lerobot-rollout`. No es compatible con vLLM, Ollama o TGI, ya que no es un LLM generativo.
- Latencia y throughput: no disponibles. Dependen de la GPU y de la resolución de las cámaras (480x640 y 400x640).

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se puede contextualizar frente a otros VLA:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este) | 450 M | No aplica | Apache-2.0 | HuggingFace |
| OpenVLA | 7 B | No aplica | MIT | HuggingFace |
| RT-2 (Google) | 55 B | No aplica | Propietaria | No público |

SmolVLA es significativamente más compacto que OpenVLA (450 M vs 7 B), lo que lo hace más adecuado para despliegue en hardware de consumo, aunque con menor capacidad de generalización a tareas diversas.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (recoger pera y colocarla en cuenco); no generaliza a otras tareas sin fine-tuning adicional.
- No se han proporcionado resultados de evaluación en robot real, por lo que el rendimiento en entornos físicos no está validado.
- El entrenamiento se realizó en simulación; puede haber discrepancia al transferir a un robot real (sim-to-real gap).
- No procesa lenguaje natural en la entrada; la tarea está fijada en el entrenamiento, no es configurable por texto.
- Los sesgos del modelo no se han documentado; al ser un policy de control, no presenta sesgos lingüísticos, pero puede verse afectado por la distribución del dataset (objetos, iluminación, posición de cámaras).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `lerobot/smolvla_base`.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-60000)
- [Dataset de entrenamiento](https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200)
- [Paper SmolVLA (arxiv 2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
