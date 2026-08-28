# Sounderya/smolvla-ur3-real-polished-acc2

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para desplegarse en hardware de consumo. Con solo 450 millones de parámetros, ofrece un rendimiento competitivo en tareas de manipulación robótica a una fracción del coste computacional de modelos más grandes. Este repositorio concreto, `Sounderya/smolvla-ur3-real-polished-acc2`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario Sounderya para controlar un brazo robótico UR3 en una tarea específica de recoger una taza y colocarla en un plato.

El modelo se ha entrenado con el framework LeRobot sobre un dataset propio de 120 episodios (91.365 frames a 30 FPS) y está especializado en una única instrucción: "Pick the mug and place it on the plate". Aunque no se han publicado resultados de evaluación en robot real, el modelo está preparado para ejecutarse con el pipeline de LeRobot y puede servir como punto de partida para tareas similares de pick-and-place. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de entrenamiento esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo vision-language-action que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. A diferencia de los VLA tradicionales que requieren GPUs de alta gama, SmolVLA esta optimizado para ejecutarse en hardware de consumo, con 450 millones de parametros. La arquitectura exacta (numero de capas, dimensiones ocultas, tipo de atencion) no se detalla en la informacion disponible, pero se sabe que sigue el diseno descrito en el paper arXiv:2506.01844.

El fine-tuning se realizo con LeRobot (version 0.6.1) sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios de un robot UR3 realizando la tarea de recoger una taza y colocarla en un plato. La configuracion de entrenamiento fue: 500 pasos, batch size de 64, optimizador AdamW, learning rate de 1e-5 y seed 1000. El modelo consume tres imagenes de camara (256x256 cada una) y el estado del robot (6 dimensiones), y produce un chunk de 10 acciones. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior al entrenamiento supervisado.

## Capacidades

- Manipulacion robotica de pick-and-place: el modelo esta entrenado para recoger una taza y colocarla en un plato, ejecutando la secuencia de acciones necesaria a partir de observaciones visuales y del estado del robot.
- Procesamiento de multiples camaras: acepta tres entradas visuales simultaneas (camera1, camera2, camera3), lo que permite fusionar informacion de distintos angulos para una mejor percepcion del entorno.
- Generacion de chunks de acciones: produce secuencias de 10 acciones por inferencia, lo que facilita un control suave y continuo del robot.
- Integracion con LeRobot: compatible con el ecosistema LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train` para ejecucion y reentrenamiento.
- Instruccion en lenguaje natural: aunque solo se ha entrenado con una tarea especifica, el modelo es capaz de interpretar la instruccion textual asociada a esa tarea.

## Casos de uso

- Automatizacion de lineas de montaje: el modelo puede integrarse en celdas roboticas con brazos UR3 para tareas repetitivas de recogida y colocacion de piezas, reduciendo el tiempo de ciclo y liberando a operarios de tareas monotonas.
- Investigacion en aprendizaje por imitacion: al ser un fine-tuning de SmolVLA con un dataset pequeno, sirve como caso de estudio para evaluar como modelos VLA compactos se adaptan a tareas especificas con pocos datos.
- Prototipado rapido en laboratorios de robotica: gracias a su tamano reducido, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 o 4090) y permite iterar rapidamente sobre nuevas tareas sin necesidad de infraestructura costosa.
- Educacion y formacion en robotica: el modelo, junto con LeRobot, ofrece un entorno accesible para que estudiantes aprendan a entrenar y desplegar politicas de manipulacion en robots reales.
- Benchmarking de VLA en hardware limitado: puede utilizarse como referencia para comparar el rendimiento de SmolVLA frente a otros VLA mas grandes en tareas de pick-and-place, midiendo latencia y precision.
- Base para fine-tuning en tareas similares: dado que el modelo ya ha aprendido a interactuar con un UR3, puede reentrenarse con datasets de otras tareas de manipulacion (apilar, insertar, etc.) partiendo de estos pesos iniciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval u otros indicadores de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado que el modelo tiene 450 millones de parametros y el repositorio pesa 5.3 GB (probablemente en precision fp32), se estima que la inferencia requiere al menos 8-10 GB de VRAM, pero este dato no esta confirmado.
- GPU recomendadas: SmolVLA esta disenado para hardware de consumo, por lo que GPUs como RTX 3090, RTX 4090 o similares con 24 GB de VRAM son adecuadas. Tambien podria ejecutarse en GPUs con menos memoria si se aplica cuantizacion, aunque no se proporcionan pesos cuantizados.
- Compatibilidad con consumer GPU: si, el modelo base SmolVLA esta especificamente optimizado para ello.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`), y potencialmente vLLM u otros frameworks de inferencia, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. SmolVLA se posiciona como una alternativa compacta a VLA mas grandes como OpenVLA (7B parametros) o RT-2 (55B parametros), pero no se han publicado resultados de benchmarks que permitan una comparacion cuantitativa. La unica referencia es el paper original de SmolVLA (arXiv:2506.01844), que reporta rendimiento competitivo en tareas de manipulacion, pero esos datos no se detallan en esta ficha.

## Limitaciones y advertencias

- Entrenamiento limitado a una unica tarea: el modelo solo ha sido entrenado para "recoger la taza y colocarla en el plato". No generaliza a otras tareas sin reentrenamiento.
- Dataset pequeno: 120 episodios pueden no cubrir la variabilidad del mundo real (cambios de iluminacion, posiciones de objetos, distracciones), lo que puede provocar fallos en entornos no vistos.
- Sin resultados de evaluacion: no hay datos de tasa de exito en robot real, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion en acciones: como cualquier modelo generativo, puede producir secuencias de acciones incoherentes si las observaciones se desvian del dominio de entrenamiento.
- Dependencia de la configuracion de camaras: el modelo espera tres camaras con nombres especificos (`camera1`, `camera2`, `camera3`). Cambiar la disposicion de las camaras requiere reentrenamiento.
- Idiomas: no se especifican idiomas soportados; la instruccion de entrenamiento esta en ingles, por lo que el modelo puede no responder correctamente a instrucciones en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset asociado deben revisarse para verificar que no haya restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-real-polished-acc2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Pagina oficial SmolVLA: https://smolvla.net/index_en
- Repositorio GitHub del autor: https://github.com/Sounderya22/ur3_smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
