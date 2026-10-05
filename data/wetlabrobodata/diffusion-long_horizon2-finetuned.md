# WetLabRoboData/diffusion-long_horizon2-finetuned

## Resumen

diffusion-long_horizon2-finetuned es una politica robotica de tipo diffusion policy desarrollada por WetLabRoboData y distribuida a traves de la libreria LeRobot. No es un modelo de lenguaje: se trata de un controlador de imitacion entrenado para ejecutar una tarea especifica denominada long_horizon2 sobre un robot UR3e bimanual equipado con tres camaras. El modelo se ha obtenido afinando una politica multitarea preentrenada, `WetLabRoboData/diffusion-multitask_12task_mix-multitask`, sobre el conjunto de datos de la tarea objetivo.

Su relevancia radica en el paradigma de imitacion con politicas de difusion, que modelan la distribucion de acciones mediante un proceso de difusion generativo en lugar de una regresion directa. Esto permite capturar multimodalidad en las trayectorias (varias formas validas de completar una tarea). El modelo se publica bajo licencia Apache 2.0, lo que facilita su reutilizacion y su integracion en pipelines de robotica.

Los datos disponibles son limitados: no se especifican el numero de parametros, la arquitectura interna detallada, los hiperparametros de entrenamiento ni los idiomas (no aplicables en este dominio). La unica metrica de rendimiento publicada es la evaluacion en 20 episodios de rollout, con 7 exitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (familia LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control robotico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Biblioteca | lerobot |
| Familia de politica | diffusion |
| Variante | Finetuned (preentrenamiento multitarea y posterior finetuning sobre la tarea) |
| Tarea objetivo | long_horizon2 |
| Robot | UR3e bimanual (3 camaras) |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-long_horizon2 |
| Modelo base | WetLabRoboData/diffusion-multitask_12task_mix-multitask |
| Numero de episodios de evaluacion | 20 |
| Exitos en evaluacion | 7 / 20 |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de una diffusion policy de LeRobot aplicada a la tarea long_horizon2. La variante es "finetuned": el modelo parte de un preentrenamiento multitarea (`diffusion-multitask_12task_mix-multitask`, que cubre 12 tareas) y despues se afina sobre el pool de datos especifico de esta tarea. El conjunto de entrenamiento es `WetLabRoboData/lerobot-data-long_horizon2`.

No se detallan en la informacion proporcionada el numero de tokens o transiciones, la composicion del dataset, el numero de pasos de difusion, la arquitectura concreta de la red de denoising, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se especifican hiperparametros de entrenamiento ni innovaciones tecnicas adicionales. La procedencia indica que el modelo se reorganizo a partir de `WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon2_cam_reorient` el 2026-10-04, conservandose las salidas de entrenamiento archivadas (checkpoints, train_config.json, wandb/) en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Control robotic o por imitacion: genera secuencias de acciones para el robot UR3e bimanual.
- Entrada multimodal de percepcion: utiliza tres camaras como fuentes de observacion.
- Ejecucion de la tarea long_horizon2, caracterizada por un horizonte temporal largo.
- Modelado multimodal de acciones gracias al proceso de difusion, lo que permite representar multiples trayectorias validas.
- Transferencia desde un preentrenamiento multitarea de 12 tareas al dominio especifico de la tarea objetivo.
- Integracion con el ecosistema LeRobot mediante `DiffusionPolicy.from_pretrained`.
- Soporte de tool calling / function calling: no aplica (modelo de robotica).
- Soporte de agentes y multi-step reasoning en lenguaje: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): vision mediante las tres camaras del robot; el resto, no disponible.

## Casos de uso

- Automatizacion de laboratorio humedo: la politica puede controlar un UR3e bimanual para ejecutar la tarea long_horizon2 de forma autonoma, reduciendo la intervencion manual en protocolos repetitivos con multiples etapas.
- Manipulacion bimanual de precision: el uso de tres camaras permite al modelo coordinar ambos brazos en tareas que requieren agarre y reposicionamiento, aprovechando la representacion multimodal de acciones.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del preentrenamiento multitarea seguido de finetuning especifico en tareas de horizonte largo.
- Benchmarking de diffusion policies: dado que publica resultados de evaluacion (7/20 exitos en 20 episodios), puede usarse como referencia base para comparar variantes de politica en el mismo robot y tarea.
- Fine-tuning sobre nuevas tareas: al estar bajo licencia Apache 2.0 y derivarse de un modelo multitarea, puede reutilizarse como inicializacion para tareas relacionadas dentro del mismo entorno de laboratorio.
- Reproduccion de experimentos: los videos de rollout y los resultados por episodio publicados en `WetLabRoboData/eval-diffusion-long_horizon2-finetuned` permiten auditar y reproducir la evaluacion.
- Prototipado en entornos controlados: integracion en pipelines de investigacion robotica que usan LeRobot para desplegar y evaluar politicas de difusion.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible es la tasa de exito de rollout de la tarea long_horizon2.

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 20 |
| Exitos | 7 |
| Tasa de exito | 35 % (7/20) |
| Robot de evaluacion | UR3e bimanual (3 camaras) |

No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo. No se dispone de comparaciones numericas con otras politicas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (los requisitos no se especifican en la model card).
- Opciones de despliegue: la via indicada por el autor es la libreria LeRobot, cargando la politica con `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-long_horizon2-finetuned")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Requisitos de percepcion: el modelo opera con tres camaras y un robot UR3e bimanual, por lo que el despliegue exige ese hardware fisico o un entorno simulado equivalente.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que deriva.

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| diffusion-long_horizon2-finetuned | Diffusion policy (finetuned) | long_horizon2 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| diffusion-multitask_12task_mix-multitask | Diffusion policy (preentrenada multitarea) | 12 tareas | no disponible en esta ficha | Modelo base referenciado |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de tarea: el modelo esta afinado para long_horizon2 y no se garantiza su comportamiento en otras tareas fuera del dominio de finetuning.
- Tasa de exito moderada: 7 exitos sobre 20 episodios (35 %), lo que implica una probabilidad relevante de fallo en produccion sin supervision.
- Dependencia de hardware: requiere un UR3e bimanual y tres camaras; no es portable a otras configuraciones sin reentrenamiento.
- Falta de informacion tecnica: no se publican parametros, arquitectura interna, hiperparametros ni detalles del dataset, lo que dificulta la reproducibilidad completa.
- Riesgo de sobreajuste al entorno de laboratorio: al ser una politica de imitacion, puede degradarse ante cambios de iluminacion, posicion de objetos o distribucion de escena no vistos en entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; en robotica el riesgo equivalente es la generacion de acciones invalidas o fuera de distribucion, no cuantificado en la informacion disponible.
- Limitaciones de contexto o idioma: no aplica (modelo de robotica).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets y del modelo base utilizados.
- Advertencia de produccion: dado el bajo numero de descargas y likes (0 y 0) y la ausencia de datos de robustez, se recomienda validacion exhaustiva antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-long_horizon2-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon2
- Modelo base: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon2-finetuned
- Repositorio de origen (procedencia): https://huggingface.co/WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon2_cam_reorient
