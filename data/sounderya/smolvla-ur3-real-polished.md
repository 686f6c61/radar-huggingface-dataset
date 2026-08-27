# Sounderya/smolvla-ur3-real-polished

## Resumen

Sounderya/smolvla-ur3-real-polished es un fine-tuning del modelo base SmolVLA, un vision-language-action model (VLA) compacto y eficiente desarrollado por Hugging Face y colaboradores, descrito en el paper arxiv 2506.01844. Este checkpoint concreto ha sido entrenado con LeRobot sobre el dataset `Sounderya/sim_mug_skillgen_v3`, que contiene 229 episodios de teleoperación con un robot UR3 realizando la tarea "coger la taza y colocarla en el plato". El modelo combina percepción visual de tres cámaras (muñeca, derecha y una tercera) con el estado del robot para generar acciones de control de 10 dimensiones.

Con 450 millones de parámetros, es un modelo relativamente ligero diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que buscan desplegar políticas robóticas de imitación sin requerir infraestructura de alto coste. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones. No se han publicado resultados de evaluación real en esta versión, aunque el modelo base SmolVLA demuestra en el paper un rendimiento competitivo en manipulación robótica con costes computacionales reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (SmolVLM + MLP de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de vision-lenguaje-accion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot (v0.6.1) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (10,) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un modelo de lenguaje multimodal compacto (SmolVLM) con una capa de proyeccion que genera acciones de control directamente desde las observaciones visuales y el estado del robot. Su diseno prioriza la eficiencia computacional: el paper original (2506.01844) demuestra que puede funcionar en GPUs de consumo, reduciendo costes frente a VLA mas grandes. El modelo base `lerobot/smolvla_base` se preentreno sobre datasets multimodales y de robotica comunitaria, y luego se hace fine-tuning con aprendizaje por imitacion.

Este fine-tuning concreto se entreno con el framework LeRobot, con una configuracion de 1000 pasos, batch size de 64, optimizador AdamW y learning rate de 1e-5. Los datos provienen del dataset `Sounderya/sim_mug_skillgen_v3`, con 229 episodios y 163.913 frames a 30 FPS, capturados con tres camaras (wrist, right y una tercera no especificada). No se indica el uso de tecnicas como RLHF o DPO; se trata de una politica de imitacion pura.

## Capacidades

- Control robotico por imitacion: genera acciones de 10 dimensiones (por ejemplo, posiciones de articulaciones o de efector final) a partir de observaciones visuales y de estado.
- Percepcion multimodal: integra tres flujos de imagen de 256x256 junto con el estado del robot (6 dimensiones).
- Ejecucion en tiempo real: disenado para inferencia en hardware de consumo, con latencia baja para control robotico.
- Fine-tuning rapido: entrenable con LeRobot en pocas horas (1000 pasos) sobre datasets propios.
- Tarea especifica: entrenado para la manipulacion de objetos (pick-and-place de una taza), pero el metodo permite adaptacion a otras tareas con nuevos datasets.

## Casos de uso

- **Manipulacion de objetos en laboratorio**: el modelo puede controlar un brazo robotico UR3 para tareas de pick-and-place en entornos controlados, como recoger objetos y colocarlos en posiciones determinadas.
- **Investigacion en aprendizaje por imitacion**: sirve como base para estudiar tecnicas de VLA en hardware real, dado su bajo coste computacional y su integracion con LeRobot.
- **Despliegue en robotica educativa**: al caber en GPUs de consumo, es viable para universidades y centros de formacion que disponen de robots UR3 o similares.
- **Automatizacion de tareas de ensamblaje**: con un dataset adecuado, el mismo enfoque puede adaptarse para ensamblar piezas, clasificar objetos o empaquetar.
- **Evaluacion de politicas en simulacion**: se puede transferir a entornos simulados para probar estrategias de control antes del despliegue real.
- **Baseline para comparacion de VLA**: sirve como punto de referencia para comparar con modelos mas grandes (por ejemplo, OpenVLA) en tareas de manipulacion, dado su menor coste y similar arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tuning especifico. El paper original de SmolVLA (arxiv 2506.01844) reporta resultados comparativos en tareas de manipulacion, pero no se incluyen datos concretos en la model card ni en la busqueda web realizada.

## Requisitos de hardware

- **VRAM estimada**: con 450 millones de parametros en precision FP32, el modelo ocupa aproximadamente 1,8 GB de memoria. Con cuantizacion a 8 bits, se reduce a unos 0,45 GB, y a 4 bits a 0,23 GB. Sin embargo, al ser un modelo de vision-lenguaje-accion, la inferencia requiere procesamiento de imagenes, por lo que se recomienda al menos 4-6 GB de VRAM para un funcionamiento fluido.
- **GPU recomendadas**: se puede ejecutar en GPUs consumer como RTX 3090 (24 GB), RTX 4090 (24 GB), o incluso RTX 3060 (12 GB) con cuantizacion. En el paper original se menciona la ejecucion en hardware de consumo, tipicamente una RTX 4090.
- **Cabe en consumer GPU**: si, es viable en GPUs de gama media y alta de NVIDIA.
- **Opciones de despliegue**: se integra con LeRobot, que soporta inferencia en tiempo real con `lerobot-rollout`. Tambien se puede exportar a formatos de cuantizacion (GGUF, ONNX) para usar con llama.cpp u otros runtimes, aunque la documentacion oficial se centra en LeRobot.
- **Latencia y throughput**: no se publican datos concretos, pero al ser un modelo de 450M de parametros, se estima una latencia de inferencia de 10-50 ms por paso en GPU consumer, adecuada para control robotico en tiempo real (30 Hz).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Sounderya/smolvla-ur3-real-polished | 450M | no disponible | no evaluado | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | VLA general, resultados en paper | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | 4096 tokens | MMLU, HumanEval (vision-lenguaje) | MIT | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. El modelo base SmolVLA se posiciona como una alternativa ligera a VLA grandes como OpenVLA, con menor coste computacional, pero su rendimiento en tareas reales depende del dataset de fine-tuning.

## Limitaciones y advertencias

- **Entrenamiento de tarea especifica**: el modelo esta entrenado para una sola tarea (coger la taza y colocarla en el plato) con un robot UR3. No generaliza a otras tareas o robots sin un nuevo fine-tuning.
- **Dependencia de las camaras**: requiere las tres camaras configuradas tal como se especifican en el entrenamiento (256x256, 30 fps). Cambios en la disposicion de camaras o iluminacion pueden degradar el rendimiento.
- **Sin evaluacion publicada**: no hay resultados de exito en robot real en este repo; el autor no ha proporcionado metricas de evaluacion.
- **Alucinacion en acciones**: como todo modelo de aprendizaje por imitacion, puede generar acciones incorrectas ante estados no vistos, especialmente en entornos con obstaculos o variaciones de la tarea.
- **Riesgo de sobreajuste**: con solo 229 episodios, el modelo puede sobreajustarse a las condiciones de los datos de entrenamiento (posiciones de objetos, iluminacion, fondo).
- **Licencia**: Apache 2.0 permite uso comercial, pero no hay garantias de seguridad para despliegues en produccion robotica; requiere validacion adicional en entornos reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Sounderya/smolvla-ur3-real-polished)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Sounderya/sim_mug_skillgen_v3)
- [Modelo base SmolVLA](https://huggingface.co/lerobot/smolvla_base)
- [Paper de SmolVLA (arxiv 2506.01844)](https://arxiv.org/abs/2506.01844)
- [Documentacion de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [GitHub del autor](https://github.com/Sounderya22/ur3_smolvla)
