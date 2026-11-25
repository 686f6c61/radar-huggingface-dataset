# SteveNguyen/put_red_cube_green_box_pi05_step20000

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo vision-lenguaje-accion (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado a un robot concreto mediante la libreria LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, se ha especializado con 177 episodios de demostracion para una unica tarea de manipulacion: colocar un cubo rojo dentro de una caja verde. El autor es SteveNguyen y el resultado es una politica de imitacion lista para ejecutarse sobre un robot de tipo `grabette`.

La relevancia de esta ficha no reside en el modelo en si (que es un ajuste fino de proposito muy especifico), sino en que ilustra el flujo de trabajo actual de la robotica open source: partir de un VLA generalista preentrenado y adaptarlo a un hardware y una tarea concretos con pocos miles de frames. El checkpoint corresponde al paso 20.000 de entrenamiento y cuenta con 4.143.404.816 parametros en formato safetensors.

Se trata de un modelo de investigacion y prototipado, no de un modelo de lenguaje conversacional. Su entrada combina imagenes de una camara y el estado articular del robot, y su salida es un vector de 11 acciones motoras. La licencia Apache 2.0 permite uso comercial, aunque el autor no ha publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), adaptacion LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no se documentan capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, un VLA de Physical Intelligence disenado para generalizacion en entornos abiertos. La implementacion procede del repositorio OpenPI y se integra en LeRobot 0.6.1. La politica consume dos modalidades de observacion: una imagen de la camara `cam0` con forma `(3, 360, 480)` y el estado del robot con forma `(2,)`. Produce una accion de 11 dimensiones, presumiblemente las consignas articulares del robot `grabette`.

El entrenamiento se realizo por imitacion supervisada sobre el dataset `SteveNguyen/put_red_cube_green_box_graspproj`, compuesto por 177 episodios y 31.496 frames grabados a 30 FPS, todos ellos de la tarea "put the red cube in the green box". La configuracion reportada es de 20.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000. No se documenta el numero de tokens de preentrenamiento del modelo base, la composicion de su dataset original ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robotico por imitacion: genera secuencias de 11 acciones motoras a partir de una imagen y el estado articular actual.
- Manipulacion visomotora de una tarea concreta: recoger un cubo rojo y depositarlo en una caja verde.
- Percepcion visual de una unica camara (`cam0`) a resolucion 360x480.
- Condicionamiento por instruccion en lenguaje natural mediante el parametro `--task` de LeRobot.
- Ejecucion en bucle cerrado sobre el robot fisico mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, dialogo multilingue ni modos de pensamiento.

## Casos de uso

- Prototipado de politicas de manipulacion: sirve como punto de partida para validar el pipeline completo de LeRobot (grabacion, entrenamiento, despliegue) antes de invertir en datasets mayores.
- Automatizacion de una celda de pick-and-place: el modelo ejecuta la tarea de recoger el cubo y soltarlo en la caja, adecuado para entornos controlados con posiciones de objeto relativamente estables.
- Base para ajustes finos adicionales: al derivar de `lerobot/pi05_base`, puede reentrenarse con nuevos datasets para tareas relacionadas sin partir de cero.
- Docencia e investigacion en aprendizaje por imitacion: el repositorio incluye comandos reproducibles de entrenamiento y despliegue, util para cursos y laboratorios de robotica.
- Evaluacion comparativa de tecnicas de VLA: permite medir el efecto de hiperparametros (pasos, batch, learning rate) sobre una tarea acotada y medible.
- Demostraciones de robotica open source: util para generar videos y material divulgativo sobre VLA en hardware asequible tipo `grabette`.
- Integracion en pipelines de investigacion con LeRobot: el checkpoint es compatible con las herramientas `lerobot-train` y `lerobot-rollout`, lo que facilita su inclusion en experimentos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 4.143 millones de parametros, en precision completa (fp32) el peso de los tensores ronda los 16,5 GB, y en bf16/fp16 unos 8,3 GB, sin contar activaciones ni buffers de imagen.
- GPU recomendadas: no disponibles; por tamano, se requiere al menos una GPU con 16 GB o mas para bf16, y se recomienda una A100 o H100 para margen y latencia en bucle cerrado.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16, aunque no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), sobre el stack de OpenPI; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles; en control robotico a 30 FPS el requisito tipico es de unos 33 ms por paso de inferencia, pero el autor no reporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SteveNguyen/put_red_cube_green_box_pi05_step20000 | 4.143 M | no disponible | Manipulacion (cubo rojo en caja verde) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista preentrenado | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible en la informacion | OpenPI |

La comparativa se limita al modelo base y a la generacion anterior de la familia, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con 177 episodios de un unico entorno, el modelo hereda los sesgos de posicion, iluminacion y apariencia de esos datos.
- Riesgo de alucinacion: en un VLA se traduce en acciones incorrectas o inseguras; no hay evaluacion de tasa de exito publicada.
- Limitacion de contexto y tarea: solo se ha entrenado para "put the red cube in the green box"; no se espera generalizacion a otras tareas sin reentrenamiento.
- Dependencia de hardware: la politica espera un robot `grabette` con una camara `cam0` y estado de 2 dimensiones; cualquier cambio de configuracion invalida el modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de origen deben verificarse por separado.
- Caveat para produccion: es un checkpoint de investigacion sin evaluacion en robot real, con 0 descargas y 0 likes en el momento de la ficha; no debe desplegarse en entornos criticos sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/put_red_cube_green_box_pi05_step20000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/put_red_cube_green_box_graspproj
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/put_red_cube_green_box_graspproj
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
