# WetLabRoboData/diffusion-uncap-finetuned

## Resumen

`diffusion-uncap-finetuned` es una política de robotica basada en difusion (diffusion policy) publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot de HuggingFace. No es un modelo de lenguaje: se trata de un modelo de imitacion (imitation learning) entrenado para ejecutar una tarea de manipulacion concreta, denominada `uncap`, sobre un robot UR3e bimanual equipado con tres camaras. El modelo se distribuye como un checkpoint de LeRobot listo para cargarse con la clase `DiffusionPolicy` y ejecutarse en el robot objetivo.

El modelo parte de un preentrenamiento multitarea (`WetLabRoboData/diffusion-multitask_12task_mix-multitask`) y despues se afina sobre el conjunto de datos especifico de la tarea `WetLabRoboData/lerobot-data-uncap`. La model card reporta 20 episodios de evaluacion con 20 exitos, es decir, una tasa de exito del 100 % autodeclarada por el autor, con los videos de rollout publicados en un dataset aparte.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un flujo completo de preentrenamiento multitarea mas ajuste fino por tarea en robotica abierta, con licencia Apache 2.0, y es util para equipos que quieran replicar la receta o comparar politicas de imitacion en tareas de laboratorio humedo. El numero de descargas y likes registrados es cero, por lo que se trata de un artefacto reciente y de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot); red de difusion condicionada que genera secuencias de acciones. Detalles internos de la red no especificados en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de ventana de tokens; el condicionamiento es por observaciones de camaras y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de robotica, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; checkpoint de LeRobot (PyTorch) cargable con `DiffusionPolicy.from_pretrained` |

Datos adicionales de la model card: tarea objetivo `uncap`, dataset de entrenamiento `WetLabRoboData/lerobot-data-uncap`, modelo base `WetLabRoboData/diffusion-multitask_12task_mix-multitask`, 20 episodios de evaluacion, 20 exitos, robot UR3e bimanual con 3 camaras, creado y actualizado el 2026-10-04, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La model card clasifica el modelo dentro de la familia de politicas de difusion de LeRobot (`Policy family: diffusion (LeRobot)`). Este tipo de politica aprende una distribucion sobre secuencias de acciones (action chunks) condicionada por las observaciones del robot, y genera las acciones mediante un proceso de eliminacion de ruido iterativo. La entrada incluye imagenes de las tres camaras del UR3e bimanual y el estado del robot, extremo que se deduce del campo "Robot" de la model card, aunque el documento no detalla la configuracion exacta de la red, el numero de pasos de difusion ni las dimensiones de los encoders visuales.

El entrenamiento sigue un esquema de dos fases declarado explicitamente por el autor: primero un preentrenamiento multitarea sobre una mezcla de 12 tareas (`diffusion-multitask_12task_mix-multitask`) y despues un ajuste fino sobre el conjunto de datos especifico de `uncap` (descrito como "finetune pool"). No se especifica en la informacion disponible el numero de episodios de demostracion usados, el numero de tokens o pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos. No se menciona RLHF ni DPO, algo esperable en un modelo de robotica por imitacion. La model card indica que los artefactos de entrenamiento archivados (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen `WetLabRoboData/lerobot-data-rama-lbm_finetune_uncap` con fines de trazabilidad.

## Capacidades

- Ejecucion de la tarea de manipulacion `uncap` (retirada de tapones o tapas) sobre un robot UR3e bimanual.
- Control bimanual: el robot objetivo emplea dos brazos, segun la model card.
- Percepcion multi-camara: condicionamiento a partir de tres camaras.
- Aprendizaje por imitacion: reproduce comportamientos derivados de demostraciones humanas o teleoperadas, no de reglas programadas.
- Ajuste fino transferible: al derivar de un modelo multitarea de 12 tareas, la receta permite adaptar la politica a nuevas tareas con datos especificos.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingues: son funciones propias de modelos de lenguaje, no de esta politica.
- No se documentan capacidades de vision semantica, audio, thinking mode ni generacion de texto.

## Casos de uso

- Automatizacion de laboratorio humedo: la politica esta entrenada especificamente para retirar tapones de contenedores, una operacion repetitiva y critica en flujos de preparacion de muestras. Encaja en estaciones robotizadas donde el operario dedica tiempo a abrir y cerrar viales.
- Encadenamiento con otras politicas del mismo preentrenamiento multitarea: al compartir base con un modelo de 12 tareas, puede integrarse como eslabon intermedio en una secuencia (por ejemplo, coger el vial y despues desenroscarlo) reutilizando el mismo pipeline de LeRobot.
- Ajuste fino a nuevos utillajes o formatos de tapon: partiendo de este checkpoint, un equipo puede recoger unas pocas demostraciones del nuevo formato y afinar la politica, aprovechando el preentrenamiento multitarea como inicializacion.
- Banco de pruebas para investigacion en imitation learning: sirve como referencia reproducible con dataset, videos de evaluacion y receta de entrenamiento publicados, util para comparar variantes de diffusion policy frente a otras familias como ACT.
- Validacion de despliegue end-to-end con LeRobot: el codigo de carga de la model card permite probar en pocas lineas el ciclo completo de carga de pesos, inferencia y ejecucion sobre el UR3e, lo que resulta util para equipos que evaluan adoptar LeRobot en produccion.
- Generacion de datos y evaluacion comparativa: los 20 rollouts publicados permiten auditar el comportamiento real del modelo, detectar modos de fallo y construir metricas propias de robustez ante variaciones de iluminacion o posicion.
- Formacion y prototipado en robotica bimanual: dado que el robot objetivo usa dos brazos y tres camaras, el modelo es un caso de estudio adecuado para reproducir configuraciones bimanuales en laboratorios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, y esos benchmarks no aplican a un modelo de robotica. La unica metrica publicada es la evaluacion propia del autor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Tasa de exito en la tarea `uncap` | 20 / 20 (100 %) | 20 episodios de evaluacion, UR3e bimanual con 3 camaras, resultado autodeclarado por el autor |

No se dispone de comparaciones con otras politicas en las mismas condiciones, ni de intervalos de confianza, ni de evaluacion en entornos distintos al del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. La model card no publica tamanos de checkpoint ni requisitos de memoria.
- GPU recomendadas: no disponibles. La inferencia de politicas de difusion en LeRobot suele requerir GPU para operar en tiempo real, pero no se aporta ninguna medicion oficial para este modelo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Robot objetivo: UR3e bimanual con tres camaras, segun la model card.
- Opciones de despliegue: carga mediante la libreria `lerobot` con la clase `DiffusionPolicy` (`DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-uncap-finetuned")`). No se documentan otros formatos de exportacion como ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos de otros modelos de la misma categoria (por ejemplo, politicas ACT de LeRobot u otras diffusion policies de terceros) en terminos de parametros, contexto, rendimiento o licencia. No se han facilitado cifras que permitan una comparacion rigurosa, por lo que se indica "no disponible".

| Modelo | Familia | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|
| diffusion-uncap-finetuned | Diffusion policy (LeRobot) | uncap | Apache 2.0 | Referencia: 20/20 exitos en 20 episodios (autodeclarado) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad de tarea extrema: la politica esta afinada para una unica tarea (`uncap`) sobre un unico robot (UR3e bimanual con tres camaras). No se puede asumir transferencia a otros brazos, otras camaras u otras tareas sin reentrenamiento.
- Resultado de evaluacion autodeclarado: el 20/20 proviene del propio autor, sin verificacion independiente, sin intervalos de confianza y sin evaluacion en condiciones fuera de distribucion.
- Sin datos de sesgo ni de robustez: no se documenta el comportamiento ante cambios de iluminacion, posicion de la pieza, variaciones de utillaje o presencia de objetos no vistos durante el entrenamiento.
- Riesgo de fallo fisico: como todo modelo de control robotico, un error de la politica puede provocar colisiones, danos en el material de laboratorio o vertido de muestras. Requiere barreras de seguridad externas y supervision.
- Sin informacion sobre requisitos de computo: no se publican requisitos de VRAM, GPU ni latencia, lo que dificulta planificar un despliegue en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de atribucion; no se han documentado restricciones adicionales.
- Trazabilidad parcial: los artefactos de entrenamiento se conservan en la subcarpeta `old/` del repositorio de origen, pero no se detallan hiperparametros en la model card.
- Sin soporte de lenguaje natural ni de interfaces conversacionales: no debe integrarse alli donde se espere un modelo de texto o multimodal.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-uncap-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-uncap
- Modelo base multitarea: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de evaluacion (videos y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-uncap-finetuned
- Repositorio de origen de los artefactos de entrenamiento: `WetLabRoboData/lerobot-data-rama-lbm_finetune_uncap` (subcarpeta `old/`)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot
- HuggingFace: https://huggingface.co/
