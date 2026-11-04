# Tron-Hayato/smolvla-pick-and-stack-final

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y de estado, y de una instruccion en lenguaje natural. Este repositorio concreto, `Tron-Hayato/smolvla-pick-and-stack-final`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de 80 episodios (167.957 frames a 30 FPS) para la tarea de apilar bloques. El modelo tiene 450.046.176 parametros y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo resuelve el problema de la imitacion visomotora de bajo coste: en lugar de requerir modelos de varios miles de millones de parametros, SmolVLA busca rendimiento competitivo en tareas de manipulacion con un coste computacional reducido, lo que permite desplegarlo en hardware de consumo. La entrada combina un vector de estado de 6 dimensiones con tres flujos de imagen RGB de 256x256 (camaras `side`, `wrist` y `top`), y la salida es un vector de accion de 6 dimensiones correspondiente a un robot `so_follower`.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabacion de datos, entrenamiento de una politica de imitacion y publicacion en el Hub, todo reproducible con la CLI de LeRobot 0.6.1. No obstante, se trata de un fine-tuning muy especifico, sin evaluacion publicada y con cero descargas, por lo que debe considerarse un experimento de referencia mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta de SmolVLA; detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (politica de imitacion por paso, no modelo conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de tarea se proporciona en ingles en el ejemplo de uso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una politica de imitacion que combina percepcion visual y comprension del lenguaje con la generacion de acciones motoras. El modelo consume tres imagenes de 256x256 píxeles procedentes de las camaras `side`, `wrist` y `top`, junto con un vector `observation.state` de dimension 6, y produce un vector `action` de dimension 6. La instruccion de tarea se pasa como texto (en el ejemplo, "Pick up blocks on the left one by one and stack them on top of the blocks on the right side"). El articulo asociado es arXiv:2506.01844, que describe SmolVLA como un modelo VLA compacto y eficiente; los detalles de capas, atencion y composicion exacta del backbone no se detallan en la informacion disponible.

El fine-tuning se realizo sobre el dataset `Tron-Hayato/record-pick-and-stack-final`, con 80 episodios y 167.957 frames a 30 FPS, durante 10.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni etapas de alineacion adicionales; se trata de aprendizaje por imitacion supervisado sobre demostraciones. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del metodo SmolVLA descrito en el paper.

## Capacidades

- Control visomotor de un robot manipulador `so_follower` a partir de tres camaras y del estado articular.
- Ejecucion de una tarea de apilado de bloques especificada mediante instruccion textual.
- Aprendizaje por imitacion: reproduce la politica demostrada en el dataset de entrenamiento.
- Integracion nativa con el ecosistema LeRobot para rollout, grabacion y reentrenamiento.
- Entrada multimodal: fusion de imagenes RGB (3x256x256) y estado numerico (6 dimensiones).
- Salida de acciones continuas de 6 dimensiones a la frecuencia de control del robot.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni dialogo general; no es un modelo de lenguaje de proposito general.

## Casos de uso

- Apilado de bloques en laboratorio: el caso exacto para el que fue entrenado; se lanza con `lerobot-rollout` sobre un `so_follower` con las tres camaras configuradas y la instruccion de tarea original.
- Banco de pruebas de LeRobot: sirve como ejemplo reproducible de fine-tuning de SmolVLA para validar el pipeline completo (grabacion, entrenamiento, publicacion y rollout) antes de escalar a tareas propias.
- Base para nuevos fine-tunings: al derivar de `lerobot/smolvla_base`, puede reentrenarse con `lerobot-train` sobre un dataset propio y servir de punto de partida para otras tareas de manipulacion.
- Docencia y divulgacion en robotica: permite mostrar de forma tangible como una politica VLA compacta transforma observaciones visuales en acciones sin infraestructura de gran escala.
- Evaluacion comparativa de politicas de imitacion: util para medir como influyen el numero de episodios, la configuracion de camaras o la tasa de frames en el exito de una tarea concreta.
- Prototipado de automatizacion de pick-and-place: aunque limitado a la tarea entrenada, ilustra el flujo para trasladar una politica de imitacion a una celda de manipulacion sencilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion sin rellenar y declara explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni de metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 450 millones de parametros en safetensors, el peso en precision completa ronda los 1,8 GB, pero no se documenta el consumo real de memoria en ejecucion.
- GPU recomendadas: no disponible; la model card afirma que SmolVLA puede desplegarse en hardware de consumo, sin especificar modelos.
- Compatibilidad con GPU de consumo: segun la descripcion generica de SmolVLA, si es desplegable en hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tron-Hayato/smolvla-pick-and-stack-final` | 450.046.176 | no disponible | Apilado de bloques con `so_follower` | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | Base VLA general para fine-tuning | no disponible en la informacion | Hugging Face (modelo base citado) |
| Otras politicas de LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulacion por imitacion | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Politica altamente especializada: entrenada unicamente para la tarea de apilar bloques descrita; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, por lo que se desconoce su robustez ante cambios de posicion, iluminacion o distracciones.
- Dependencia de la configuracion de hardware: requiere un robot `so_follower` y exactamente tres camaras con los nombres `side`, `wrist` y `top`; cualquier desviacion puede degradar o invalidar la politica.
- Dataset pequeno: 80 episodios y 167.957 frames son una base limitada, con riesgo de sobreajuste a las condiciones de grabacion.
- Riesgo de alucinacion en sentido amplio: al ser una politica de imitacion, puede generar acciones no seguras o fuera de distribucion ante observaciones no vistas; requiere supervision fisica y paradas de seguridad.
- Idiomas: no se documenta soporte multilingue; el ejemplo de uso emplea una instruccion en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y no se documentan restricciones adicionales.
- Cero descargas y cero likes: sin validacion por parte de la comunidad; tratar como experimento de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/smolvla-pick-and-stack-final
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack-final
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack-final
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
