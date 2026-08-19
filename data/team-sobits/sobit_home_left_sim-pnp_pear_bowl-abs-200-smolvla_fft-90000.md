# team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-90000

## Resumen

Este modelo es un fine-tuning del VLA (Vision-Language-Action) SmolVLA, desarrollado por el equipo Team SOBITS de la Universidad de Soka (Japón), para controlar su robot móvil manipulador SOBIT HOME. La tarea concreta consiste en recoger una pera y colocarla sobre un cuenco, operando con datos simulados. El modelo se ha entrenado mediante aprendizaje por imitación con el framework LeRobot, partiendo del checkpoint base `lerobot/smolvla_base`.

SmolVLA es una arquitectura compacta de visión-lenguaje-acción presentada en el paper arXiv:2506.01844, diseñada para ofrecer rendimiento competitivo con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este checkpoint concreto tiene 450 millones de parámetros y ha sido fine-tuneado con full fine-tuning durante 90.000 pasos sobre un dataset de 200 episodios simulados. Es relevante porque demuestra la viabilidad de entrenar políticas robóticas específicas sobre un modelo base eficiente sin necesidad de infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje generativo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje compacto y un modulo de prediccion de acciones. Su diseño prioriza la eficiencia computacional para poder ejecutarse en GPU de consumo, manteniendo un rendimiento competitivo frente a modelos mucho mas grandes como OpenVLA (7B parametros). La arquitectura exacta (numero de capas, dimensiones ocultas, tipo de atencion) no se detalla en la informacion disponible, pero se remite al paper arXiv:2506.01844.

El entrenamiento de este checkpoint ha consistido en un full fine-tuning (FFT) del modelo base `lerobot/smolvla_base` durante 90.000 pasos, con batch size 16, optimizador AdamW, learning rate 0.0001 y seed 1000. El dataset de entrenamiento, `team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200`, contiene 200 episodios y 22.588 frames a 10 FPS, con la tarea unica "Pick up the pear and place it over the bowl". Las observaciones incluyen el estado del robot (vector de 20 dimensiones) y dos camaras: una camara de cabeza (480x640) y una camara de mano izquierda (400x640). La salida es un vector de accion de 20 dimensiones. No se menciona el uso de RLHF, DPO ni tecnicas adicionales de post-entrenamiento.

## Capacidades

- Control robotico de manipulacion movil: el modelo genera acciones de 20 dimensiones para controlar un robot movil manipulador (SOBIT HOME) con base de 4 ruedas con direccion independiente, elevacion y dos brazos.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de camara (cabeza y mano izquierda) junto con el estado propioceptivo del robot.
- Aprendizaje por imitacion: la politica imita demostraciones simuladas de la tarea de recoger y colocar objetos.
- Ejecucion en tiempo real: disenado para inferencia a 10 FPS (frecuencia del dataset), compatible con el pipeline de rollout de LeRobot.
- No soporta tool calling, generacion de texto, razonamiento general ni capacidades de vision fuera del contexto robotico de la tarea entrenada.

## Casos de uso

- Manipulacion pick-and-place en entornos domesticos: el modelo puede ejecutar la tarea de recoger una pera y colocarla sobre un cuenco, un escenario representativo de tareas de preparacion de alimentos en cocinas robotizadas. Su ventana de accion de 20 dimensiones permite controlar tanto la base movil como el brazo y la pinza.
- Evaluacion de politicas VLA en simulacion: sirve como punto de partida para investigar la transferencia sim-to-real, comparando el rendimiento de SmolVLA frente a otros modelos en tareas de manipulacion con datos simulados.
- Benchmark de aprendizaje por imitacion: el dataset asociado (200 episodios, 22.588 frames) y el checkpoint permiten reproducir experimentos de fine-tuning sobre SmolVLA, facilitando la comparacion de hiperparametros y estrategias de entrenamiento.
- Desarrollo de robots de asistencia personal: el SOBIT HOME es un robot disenado para apoyar la calidad de vida de personas, y este modelo aporta una politica funcional para tareas de recogida y colocacion de objetos en el hogar.
- Investigacion en modelos VLA compactos: al tener solo 450M parametros, este modelo es un caso de estudio para determinar el rendimiento minimo necesario de un VLA en tareas de manipulacion, frente a alternativas de 7B parametros.
- Integracion en pipelines de LeRobot: cualquier usuario con un robot movil manipulador compatible puede cargar este checkpoint con el comando `lerobot-rollout` y ejecutar la tarea sin necesidad de entrenar desde cero, siempre que disponga de las camaras y la configuracion de robot adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de tasas de exito en robot real ni en simulacion, ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no se proporciona un dato oficial. Con 450M parametros, en FP16 el checkpoint ocupa aproximadamente 900 MB, por lo que una GPU con 4-6 GB de VRAM deberia ser suficiente para inferencia, considerando ademas el procesamiento de dos imagenes simultaneas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070). SmolVLA esta disenado especificamente para hardware de consumo, por lo que no se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: si, es el objetivo principal del diseno de SmolVLA.
- Opciones de despliegue: el modelo se integra con el framework LeRobot, que proporciona los comandos `lerobot-rollout` y `lerobot-train`. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo sino una politica robotica.
- Latencia y throughput: no se proporcionan datos medidos. El dataset se grabo a 10 FPS, lo que sugiere que la inferencia debe completarse en menos de 100 ms por paso para mantener la frecuencia de control, algo plausible en una GPU consumer con este tamano de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA fine-tuned) | 450M | no disponible | Pick-and-place especifico | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Base general (sin tarea especifica) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulacion general | MIT (modelo), datos restringidos | Hugging Face |

La comparacion con OpenVLA muestra la principal ventaja de SmolVLA: con aproximadamente 16 veces menos parametros, ofrece un rendimiento competitivo en tareas de manipulacion con un coste de inferencia mucho menor. Sin embargo, OpenVLA es un modelo generalista entrenado en multiples tareas y datasets, mientras que este checkpoint esta especializado en una unica tarea. No se dispone de datos de benchmarks comparativos entre ambos en esta tarea concreta.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo sabe ejecutar la tarea "Pick up the pear and place it over the bowl". No generaliza a otros objetos, posiciones o tareas sin un nuevo fine-tuning.
- Datos simulados: el entrenamiento se realizo con datos de simulacion (el nombre del dataset incluye "sim"), por lo que el rendimiento en robot real puede degradarse debido a la brecha sim-to-real (diferencias de iluminacion, texturas, dinamica del robot).
- Sin evaluacion publicada: no hay resultados de tasas de exito en robot real ni en simulacion, por lo que el rendimiento real es desconocido.
- Dependencia de la configuracion del robot: las observaciones incluyen dos camaras especificas (head_camera y hand_left_camera) y un vector de estado de 20 dimensiones. Cualquier cambio en la configuracion del robot (posicion de camaras, numero de articulaciones) invalida el modelo.
- Riesgo de alucinacion en acciones: como todo modelo de aprendizaje por imitacion, puede ejecutar acciones erroneas si la distribucion de observaciones se aleja del dataset de entrenamiento.
- Sesgos del dataset: los 200 episodios simulados pueden no cubrir la variabilidad del mundo real (condiciones de iluminacion, posiciones de la pera, obstaculos).
- Licencia Apache 2.0: permite uso comercial y modificacion, pero los datos de entrenamiento (dataset `team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200`) pueden tener restricciones adicionales no detalladas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-90000
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_pear_bowl-abs-200
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Organizacion Team SOBITS en Hugging Face: https://huggingface.co/team-sobits/models
- Repositorio GitHub de Team SOBITS: https://github.com/TeamSOBITS/sobit_home
