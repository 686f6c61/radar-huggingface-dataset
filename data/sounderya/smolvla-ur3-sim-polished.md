# Sounderya/smolvla-ur3-sim-polished

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto, de aproximadamente 450 millones de parametros, desarrollado por Hugging Face y descrito en el articulo "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robot Learning" (arXiv:2506.01844). Su objetivo es reducir el coste computacional de los modelos VLA para permitir su despliegue en hardware de consumo, sin renunciar a un rendimiento competitivo en tareas de manipulacion robotica. Este repositorio concreto contiene un ajuste fino (fine-tune) de la base `lerobot/smolvla_base`, entrenado especificamente para una tarea de simulacion con un brazo robotico UR3: coger una taza y colocarla sobre un plato.

La relevancia de este modelo radica en su tamano compacto (450M de parametros), que contrasta con los VLA mas grandes como RT-2 o OpenVLA, y en su capacidad para ejecutar politicas de control en tiempo real con una sola GPU de consumo. El ajuste fino se ha realizado con el framework LeRobot, sobre un dataset de simulacion de 120 episodios, lo que lo convierte en un ejemplo practico de como adaptar un VLA preentrenado a una tarea concreta de manipulacion con una cantidad reducida de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM, con modulo de prediccion de acciones continuas |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se proporcionan pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, que combina un modelo de vision-lenguaje preentrenado (SmolVLM) con un cabezal de prediccion de acciones. No se proporcionan detalles internos sobre la atencion o la fusion de modalidades, pero se trata de un modelo denso de 450M de parametros. El ajuste fino se ha realizado con LeRobot sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios (91.365 frames) de una tarea de simulacion en UR3. La configuracion de entrenamiento incluye 1000 pasos, batch size 64, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de tecnicas adicionales como RLHF o DPO.

## Capacidades

- Control robotico: genera acciones continuas (vector de 10 dimensiones) a partir de observaciones visuales y del estado del robot.
- Percepcion multi-camara: utiliza tres imagenes de 256x256 (camaras `wrist`, `right` y otra no especificada) como entrada visual.
- Seguimiento de instrucciones en lenguaje natural: la tarea se define con una instruccion textual ("Pick the mug and place it on the plate.").
- Aprendizaje por imitacion: el modelo se ajusta mediante comportamiento demostrado, sin necesidad de refuerzo.
- Ejecucion en simulacion: esta preparado para desplegarse en entornos simulados con UR3, aunque no se descarta su adaptacion a otros robots.

## Casos de uso

- Manipulacion robotica en simulacion: el modelo puede controlar un brazo UR3 en entornos de simulacion para tareas de pick-and-place, como la tarea de la taza y el plato. Su tamano compacto permite iterar rapidamente en desarrollo.
- Prototipado de politicas VLA: sirve como punto de partida para experimentar con el ajuste de SmolVLA sobre tareas propias, gracias a su integracion con LeRobot y su licencia Apache 2.0.
- Evaluacion de algoritmos de aprendizaje por imitacion: al ser un modelo de tamano reducido, puede usarse como baseline para comparar metodos de entrenamiento de VLA en entornos simulados.
- Desarrollo de sistemas de control basados en vision y lenguaje: el modelo demuestra como un VLA puede mapear una instruccion textual y observaciones visuales a acciones concretas, util para investigacion en interaccion humano-robot.
- Generacion de datos sinteticos para entrenamiento de otros modelos: se puede usar para generar trayectorias de accion en simulacion que luego sirvan para entrenar politicas mas grandes.
- Despliegue en hardware de bajo coste: al tener solo 450M de parametros, puede ejecutarse en GPUs consumer, lo que permite probar politicas de robot en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion en robot real, y no se proporcionan metricas como tasa de exito, MMLU, HumanEval, etc.

## Requisitos de hardware

- Inferencia: al tener 450M de parametros, el modelo puede ejecutarse en una GPU consumer con al menos 8 GB de VRAM en precision fp16 (estimacion razonable, aunque no se especifica oficialmente).
- GPUs recomendadas: no se indica un modelo concreto, pero tarjetas como RTX 3060, RTX 4070 o superiores serian suficientes para inferencia en tiempo real.
- Despliegue: el modelo se integra con el framework LeRobot, que proporciona herramientas de rollout y entrenamiento. No se mencionan opciones como vLLM u Ollama, ya que se trata de un modelo de robotica, no de generacion de texto.
- Latencia y throughput: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos VLA de tamano similar. Se puede comparar con el modelo base `lerobot/smolvla_base`, del cual este es un ajuste fino, pero no hay datos de rendimiento adicionales. Modelos como OpenVLA (7B) o RT-2 (55B) son mucho mas grandes, pero no se tienen resultados comparativos en este contexto.

## Limitaciones y advertencias

- El modelo esta entrenado para una tarea especifica de simulacion (coger una taza y colocarla en un plato) y no se ha evaluado en otras tareas ni en robots reales.
- El dataset de entrenamiento es limitado (120 episodios) y puede no capturar la variabilidad de escenarios reales.
- No se reportan resultados de evaluacion, por lo que el rendimiento esperado es incierto.
- La generalizacion a nuevos objetos, posiciones o condiciones de iluminacion puede ser pobre.
- Al ser un ajuste fino de un VLA base, puede heredar sesgos de los datos de preentrenamiento del VLM, aunque no se han documentado.
- No se indica si el modelo es compatible con otros robots distintos del UR3 en simulacion; se requiere adaptar los nombres de las camaras y la dimension del estado.

## Enlaces

- Modelo en Hugging Face: [Sounderya/smolvla-ur3-sim-polished](https://huggingface.co/Sounderya/smolvla-ur3-sim-polished)
- Paper de SmolVLA: [arXiv:2506.01844](https://arxiv.org/abs/2506.01844)
- Sitio web oficial de SmolVLA: [https://smolvla.net/index_en](https://smolvla.net/index_en)
- Dataset de entrenamiento: [Sounderya/mug_smolvla_dataset_v2nc](https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentacion de LeRobot para SmolVLA: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
