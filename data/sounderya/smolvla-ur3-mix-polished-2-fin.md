# Sounderya/smolvla-ur3-mix-polished-2-fin

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face con 450 millones de parametros, disenado especificamente para desplegarse en hardware de consumo. La variante aqui presentada, creada por Sounderya, esta especializada en una tarea de manipulacion robotica con un brazo UR3: recoger una taza y colocarla en un plato.

El modelo parte de `lerobot/smolvla_base` y se ha entrenado con el framework LeRobot sobre un dataset propio de 120 episodios y 91.365 fotogramas a 30 FPS, capturados con tres camaras. La arquitectura consume tres imagenes RGB de 256x256 junto con el estado del robot (6 dimensiones) y produce acciones de control de 10 dimensiones, operando en bucle cerrado a 30 Hz.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA sobre un dataset pequeno y especifico, alcanzando una politica funcional de pick-and-place con un coste computacional reducido. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamano lo hace accesible para laboratorios e investigadores sin infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un backbone de vision-lenguaje preentrenado con un decodificador de acciones motoras. A diferencia de otros VLA masivos (7B parametros o mas), SmolVLA esta disenado con 450M parametros para ejecutarse en GPU de consumo, lo que reduce drasticamente los requisitos de memoria y latencia. El modelo base fue preentrenado por Hugging Face sobre datos multimodales a gran escala y posteriormente adaptado a robotica, segun el paper arxiv:2506.01844.

Este fine-tuning se realizo con LeRobot 0.6.1 sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios de la tarea "recoger la taza y colocarla en el plato" con 91.365 fotogramas a 30 FPS. La configuracion de entrenamiento fue: 2.000 pasos, batch size de 64, optimizador AdamW con learning rate de 0,0005 y semilla 1000. El modelo consume tres flujos visuales (claves de observacion `camera1`, `camera2` y `camera3`, correspondientes a las camaras fisicas `wrist` y `right` mas una tercera) junto con el estado propioceptivo de 6 dimensiones, y genera acciones de 10 dimensiones.

## Capacidades

- Manipulacion robotica de pick-and-place: controla un brazo UR3 para recoger una taza y colocarla en un plato, basandose en entradas visuales en tiempo real.
- Control basado en instrucciones de tarea: la politica esta condicionada a la instruccion "recoge la taza y colocala en el plato", fijada durante el entrenamiento.
- Procesamiento multimodal simultaneo: integra tres flujos visuales de 256x256 píxeles con el estado propioceptivo del robot en cada paso de control.
- Generacion de acciones continuas: produce vectores de accion de 10 dimensiones a 30 FPS para control en bucle cerrado.
- Fine-tuning eficiente con pocos datos: demuestra que un VLA puede adaptarse a una tarea especifica con solo 120 episodios de demostraciones.
- Compatibilidad con el ecosistema LeRobot: se integra con las herramientas de rollout, entrenamiento y visualizacion de datasets de Hugging Face.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en lineas de montaje para manipular piezas estandarizadas, aprovechando su control visual continuo y su baja latencia a 30 FPS.
- Investigacion en aprendizaje por imitacion: sirve como base reproducible para estudiar tecnicas de fine-tuning de VLA sobre datasets pequenos, comparando estrategias de aumento de datos o regularizacion.
- Prototipado rapido de celdas roboticas: permite validar el flujo completo de LeRobot (grabacion, entrenamiento y despliegue) en un brazo UR3 antes de escalar a produccion, con un coste de hardware minimo.
- Educacion y formacion en robotica: al ejecutarse en GPU de consumo, es adecuado para laboratorios universitarios que necesitan un VLA funcional sin infraestructura de alto coste.
- Desarrollo de sistemas de manipulacion asistida: puede adaptarse mediante nuevo fine-tuning para tareas de asistencia en entornos domesticos o de cuidado, como recoger objetos y colocarlos en ubicaciones designadas.
- Benchmark de evaluacion de VLA compactos: el repositorio documenta el proceso completo de adaptacion, sirviendo como referencia para comparar metodologias de entrenamiento y configuraciones de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros, el modelo en precision FP32 ocupa aproximadamente 1,8 GB, y en BF16/FP16 unos 900 MB, mas la memoria para activaciones de las tres imagenes de entrada. Se estima que cabe en GPU con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento con batch size 64 y 450M parametros, se recomienda una GPU con 12-24 GB de VRAM (RTX 3090, RTX 4090).
- Compatibilidad con consumer GPU: si, es uno de los objetivos principales de SmolVLA segun el paper.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot con el comando `lerobot-rollout`, que gestiona la inferencia en tiempo real. No se han documentado despliegues con vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no de lenguaje generativo.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque el modelo opera a 30 FPS para control en tiempo real, lo que implica una latencia por paso inferior a 33 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sounderya/smolvla-ur3-mix-polished-2-fin | 450M | No disponible | Apache 2.0 | Fine-tuning especifico para UR3, tarea mug pick-and-place |
| lerobot/smolvla_base | 450M | No disponible | Apache 2.0 | Modelo base preentrenado por Hugging Face, sin especializar en tarea |
| OpenVLA (referencia general) | 7B | No disponible | MIT (pesos), restricciones de uso | VLA mucho mas grande, requiere GPU de datacenter para inferencia |

La comparativa directa mas relevante es con el modelo base `lerobot/smolvla_base`, del cual este es un fine-tuning. La ventaja de esta variante es que esta especializada en una tarea concreta, lo que reduce el espacio de acciones y mejora la precision en la tarea de la taza. Comparado con VLA mas grandes como OpenVLA (7B parametros), este modelo ofrece un coste computacional drasticamente menor (unas 15 veces menos parametros) a cambio de una especializacion en una unica tarea.

## Limitaciones y advertencias

- Especializacion limitada: el modelo ha sido entrenado exclusivamente para la tarea "recoger la taza y colocarla en el plato". No generaliza a otras tareas sin un nuevo fine-tuning.
- Dataset pequeno: con solo 120 episodios, el modelo puede no generalizar bien ante variaciones significativas de iluminacion, posicion de objetos, distracciones o cambios de fondo en el entorno.
- Sin resultados de evaluacion: no se han publicado metricas de exito en robot real, por lo que el rendimiento real no esta validado. Esto supone un riesgo para su uso en produccion.
- Sin capacidades de lenguaje natural: a diferencia de un LLM, este modelo no genera texto ni interpreta instrucciones variables; la tarea esta fijada en el entrenamiento.
- Riesgo de sobreajuste: el numero reducido de episodios y la tarea muy concreta aumentan el riesgo de sobreajuste al entorno de grabacion, especialmente en lo relativo a la posicion de la camara y la iluminacion.
- Requiere hardware robotico especifico: para desplegarlo se necesita un brazo UR3 con las camaras configuradas segun las claves de observacion entrenadas (`camera1`, `camera2`, `camera3`), lo que limita su portabilidad a otros robots sin recalibracion.
- Tamano del repositorio: el repo ocupa 14,5 GB, lo que incluye checkpoints y artefactos de entrenamiento; el peso del modelo en si es de aproximadamente 1,8 GB en FP32.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-mix-polished-2-fin
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Repositorio GitHub del autor: https://github.com/Sounderya22/ur3_smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sounderya/mug_smolvla_dataset_v2nc
