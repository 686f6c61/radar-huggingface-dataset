# WetLabRoboData/diffusion-cap-finetuned

## Resumen

diffusion-cap-finetuned es una política de robot basada en difusión (Diffusion Policy) publicada por WetLabRoboData dentro del ecosistema LeRobot. No se trata de un modelo de lenguaje, sino de un controlador visomotor entrenado por imitación que genera secuencias de acciones para un robot bimanual UR3e equipado con tres cámaras. El objetivo concreto es la tarea "cap" (colocación de un tapón o capuchón), y el modelo se distribuye como un ajuste fino del checkpoint multitarea WetLabRoboData/diffusion-multitask_12task_mix-multitask.

El modelo resuelve el problema de aprender una política de manipulación a partir de demostraciones (imitation learning) sin necesidad de modelar explícitamente la dinámica del entorno. Para ello emplea el formalismo de Diffusion Policy, en el que la acción se genera iterativamente mediante un proceso de desdifusión condicionado por las observaciones visuales y el estado del robot. La variante aquí publicada parte de un preentrenamiento multitarea sobre doce tareas y se ajusta después sobre el conjunto de datos específico de la tarea "cap".

Su relevancia es acotada pero clara: sirve como pieza reproducible dentro de un flujo LeRobot de robótica de laboratorio húmedo (wet lab), con licencia Apache 2.0 y métricas de evaluación publicadas (6 éxitos de 20 episodios). La ficha no aporta datos sobre número de parámetros, tokens de entrenamiento ni contextos, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot); red de desdifusión de acciones condicionada por observaciones visuales y de estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en este tipo de política equivale a los horizontes de observación y predicción de acciones, no especificados en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (política visomotora de control, no modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la model card; la librería LeRobot exporta habitualmente safetensors |
| Libreria | lerobot |
| Tarea objetivo | cap |
| Robot | UR3e bimanual con 3 camaras |
| Modelo base | WetLabRoboData/diffusion-multitask_12task_mix-multitask |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-cap |
| Episodios de evaluacion | 20 |
| Exitos de evaluacion | 6 / 20 |
| Fecha de creacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La política pertenece a la familia Diffusion Policy implementada en LeRobot. Este enfoque formula la generación de acciones como un proceso de desdifusión: partiendo de ruido gaussiano, la red va eliminando ruido de forma iterativa para producir una secuencia de acciones (action chunk) condicionada por las observaciones. La condicionante incluye las imágenes de las tres cámaras del UR3e bimanual y el estado del robot, y la red interna suele ser una UNet temporal o un transformer con modulación de características. La model card no detalla la configuración exacta de capas, canales ni número de pasos de desdifusión, por lo que estos datos quedan como no disponibles.

El entrenamiento se realizó en dos fases según indica el propio autor: un preentrenamiento multitarea sobre una mezcla de doce tareas (checkpoint diffusion-multitask_12task_mix-multitask) y un ajuste fino posterior sobre el conjunto WetLabRoboData/lerobot-data-cap, que corresponde a la tarea "cap". Se trata, por tanto, de aprendizaje por imitación supervisado sobre demostraciones de teleoperación o similar; no se menciona uso de RLHF, DPO ni recompensas, que no aplican a este tipo de política. La model card también documenta la procedencia: el repositorio se reorganizó el 2026-10-04 a partir de WetLabRoboData/lerobot-data-rama-lbm_finetune_cap, conservando los artefactos de entrenamiento originales (checkpoints, train_config.json, wandb/) en la subcarpeta old/ del repositorio de origen.

## Capacidades

- Generacion de secuencias de acciones (action chunks) para control de un robot bimanual UR3e en la tarea "cap".
- Acondicionamiento multimodal a partir de tres camaras mas el estado del robot.
- Aprendizaje por imitacion: reproduce comportamientos derivados del dataset de demostraciones lerobot-data-cap.
- Transferencia desde un preentrenamiento multitarea de doce tareas, lo que puede aportar representaciones visuales y motoras mas generales.
- Ejecucion como politica de LeRobot mediante DiffusionPolicy.from_pretrained(...).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multimodales de lenguaje, vision general, audio ni thinking mode.
- Capacidad multilingue: no aplica.

## Casos de uso

- Automatizacion de la tarea "cap" en un laboratorio humedo: el modelo ejecuta la colocacion de tapones sobre viales o recipientes con un UR3e bimanual, sustituyendo la repeticion manual y reduciendo variabilidad entre operarios.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el efecto del ajuste fino desde un preentrenamiento multitarea frente a un entrenamiento desde cero.
- Evaluacion comparativa de variantes de Diffusion Policy: al publicar 20 episodios con resultados por episodio, permite contrastar hiperparametros, numero de pasos de desdifusion o arquitecturas de encoder.
- Recoleccion de datos activa: las politicas de este tipo se usan para generar trayectorias candidatas que despues se corrigen y se reincorporan al dataset, mejorando la cobertura de la tarea.
- Despliegue en pipelines de laboratorio existentes: al integrarse en LeRobot, la politica puede conectarse a la misma pila de control del UR3e que ya se use para otras tareas del conjunto multitarea.
- Base para ajustes a tareas relacionadas: el checkpoint puede reutilizarse como inicializacion para tareas vecinas (por ejemplo, "uncap" o ensamblaje de componentes) mediante un ajuste fino adicional.
- Docencia y prototipado en robotica: con licencia Apache 2.0 y una API sencilla de carga, resulta adecuado para practicas de manipulacion bimanual en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K y similares, que no aplican a una politica de control). La unica metrica reportada por el autor es la tasa de exito en rollouts reales:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 20 |
| Exitos | 6 |
| Tasa de exito | 30 % |
| Tarea | cap |
| Robot | UR3e bimanual (3 camaras) |

Los videos de rollout y los resultados por episodio se publican en WetLabRoboData/eval-diffusion-cap-finetuned. No se proporcionan comparaciones con otras politicas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Las politicas de difusion de LeRobot suelen ser ligeras en comparacion con modelos de lenguaje, pero no hay cifras confirmadas para este checkpoint.
- GPU recomendadas: no disponibles. En la practica, cualquier GPU con soporte CUDA capaz de ejecutar PyTorch es candidata, pero el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: probable en principio por el tipo de politica, pero no confirmado por el autor; no se debe asumir sin medirlo.
- Opciones de despliegue: carga mediante la libreria lerobot (DiffusionPolicy.from_pretrained). No se documentan integraciones con vLLM, TGI ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Para politicas de difusion, la latencia depende criticamente del numero de pasos de desdifusion y de la frecuencia de control requerida por el UR3e, datos no publicados.

## Comparativa con modelos similares

| Modelo | Familia | Tarea | Entrenamiento | Licencia | Datos publicados |
|---|---|---|---|---|---|
| diffusion-cap-finetuned | Diffusion Policy (LeRobot) | cap, UR3e bimanual | Multitarea (12 tareas) + ajuste fino | Apache 2.0 | Tasa de exito 6/20, videos |
| diffusion-multitask_12task_mix-multitask | Diffusion Policy (LeRobot) | 12 tareas mixtas | Multitarea | no disponible | no disponible |
| Otras politicas LeRobot (ACT, TDMPC, etc.) | Varias (imitation learning, RL) | Manipulacion general | Variable | variable | no disponible |
| Diffusion Policy original (referencia academica) | Diffusion Policy | Manipulacion en simulacion y real | Imitacion | codigo abierto | Resultados en papers |

La comparacion se limita a lo verificable: este checkpoint es un ajuste fino del modelo multitarea de doce tareas del mismo autor, y comparte familia con la Diffusion Policy original de la literatura. No hay datos publicados que permitan comparar tasas de exito con otras politicas bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Tasa de exito del 30 % (6 de 20 episodios): es una politica experimental, no apta para produccion sin validacion adicional y supervision.
- Entrenada exclusivamente para la tarea "cap" sobre el dataset lerobot-data-cap; su generalizacion a otras tareas, objetos o configuraciones de laboratorio no esta documentada.
- Dependiente del hardware concreto: UR3e bimanual con tres camaras. Cambios en la cinematica, la iluminacion o la colocacion de camaras pueden degradar gravemente el rendimiento.
- Sin datos sobre sesgos, dado que no es un modelo de lenguaje; el riesgo relevante es el sobreajuste al dataset de demostraciones y la escasa robustez ante distribuciones visuales distintas.
- Riesgo de fallo fisico: en entornos de laboratorio humedo, un fallo de la politica puede provocar derrames, rotura de material o colisiones, por lo que requiere paradas de seguridad y limites de fuerza.
- La model card no documenta parametros, cuantizacion ni requisitos de hardware, lo que dificulta dimensionar el despliegue sin pruebas propias.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar la atribucion y revisar la licencia del dataset y del modelo base por si imponen condiciones adicionales.
- Procedencia reorganizada: los artefactos de entrenamiento originales se conservan en la subcarpeta old/ del repositorio de origen, lo que puede complicar la trazabilidad si se reproducen experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-cap-finetuned
- Modelo base multitarea: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-cap
- Dataset de evaluacion: https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-cap-finetuned
- Libreria LeRobot: no disponible en la informacion proporcionada
- Paper de Diffusion Policy: no disponible en la informacion proporcionada
- Repositorio de origen (procedencia): WetLabRoboData/lerobot-data-rama-lbm_finetune_cap, no disponible como URL directa en la informacion proporcionada
