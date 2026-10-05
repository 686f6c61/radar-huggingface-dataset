# WetLabRoboData/diffusion-multitask_12task_mix-multitask

## Resumen

diffusion-multitask_12task_mix-multitask es una política de imitación basada en difusión (diffusion policy) publicada por WetLabRoboData dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que traduce observaciones de cámara (tres cámaras) y el estado del robot en secuencias de acciones, entrenado sobre demostraciones teleoperadas. El problema que resuelve es el control de un robot UR3e bimanual en un conjunto de doce tareas de laboratorio húmedo agrupadas bajo el identificador multitask_12task_mix.

El checkpoint corresponde a un preentrenamiento multitarea sobre 1206 episodios procedentes del dataset WetLabRoboData/lerobot-data-multitask_12task_mix. La model card no especifica el número de parámetros, el horizonte de observación, el horizonte de predicción de acciones ni el número de pasos de denoising, por lo que las cifras de arquitectura no están disponibles públicamente.

Su relevancia actual es acotada pero concreta: se trata de un artefacto reproducible de robótica de laboratorio, con licencia Apache 2.0, integrado en el pipeline estándar de LeRobot y acompañado de un dataset de evaluación separado. Sin embargo, el propio autor declara 0 episodios de evaluación y 0 éxitos sobre 0 intentos, de modo que no existe evidencia publicada de tasa de éxito. Se reorganizó el 2026-10-04 a partir del repositorio WetLabRoboData/lerobot-data-rama-lbm_pretrain_all_ds5, cuyos checkpoints y configuraciones de entrenamiento se conservan en la subcarpeta old/ de ese repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de la familia LeRobot; backbone y configuración de red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo de lenguaje; el horizonte de observación y el de acciones no se especifican en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de PyTorch cargados mediante LeRobot (`DiffusionPolicy.from_pretrained`); no se detalla el formato exacto de los ficheros |

Datos adicionales declarados por el autor:

| Parametro | Valor |
|---|---|
| Variante | Preentrenamiento multitarea sobre la mezcla de 12 tareas |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-multitask_12task_mix (1206 episodios) |
| Tarea objetivo | multitask_12task_mix |
| Robot | UR3e bimanual con 3 cámaras |
| Episodios de evaluacion | 0 |
| Exitos de evaluacion | 0 / 0 |
| Libreria | lerobot |
| Pipeline | robotics |
| Fecha de creacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica la política como "diffusion (LeRobot)", es decir, una política de difusión para aprendizaje por imitación: la red aprende a generar secuencias de acciones (action chunks) mediante un proceso iterativo de denoising condicionado por las observaciones visuales y propioceptivas del robot. Este enfoque, popularizado por el trabajo Diffusion Policy (Chi et al., 2023), modela la distribución multimodal de las demostraciones humanas, lo que ayuda a evitar el promedio destructivo típico de las políticas de regresión cuando existen múltiples modos de actuación válidos. La model card no especifica el tipo de backbone (U-Net convolucional o transformer), el número de pasos de denoising, ni los horizontes de observación y acción.

El entrenamiento se realizó sobre la mezcla de 12 tareas con 1206 episodios del dataset lerobot-data-multitask_12task_mix, recogido con un UR3e bimanual y tres cámaras. No se documenta el número total de tokens ni de transiciones, la composición exacta por tarea, ni si hubo etapas posteriores de ajuste fino, RLHF o DPO (estos mecanismos no son habituales en políticas de imitación). Tampoco se publican hiperparámetros, esquema de aumento de datos ni receta de normalización. La procedencia indica que el checkpoint se reorganizó el 2026-10-04 desde WetLabRoboData/lerobot-data-rama-lbm_pretrain_all_ds5, conservándose los artefactos de entrenamiento originales (checkpoints, train_config.json, wandb/) en la subcarpeta old/ del repositorio de origen para trazabilidad.

## Capacidades

- Control visuomotor bimanual: genera comandos de acción para un robot UR3e de dos brazos a partir de observaciones de tres cámaras.
- Ejecución multitarea: entrenado de forma conjunta sobre la mezcla de 12 tareas del dataset multitask_12task_mix, en lugar de una única tarea especializada.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones teleoperadas, sin necesidad de recompensa explícita ni entorno simulado para el ajuste.
- Modelado multimodal de acciones: la formulación de difusión permite representar distribuciones de acción multimodales en tareas con varias soluciones válidas.
- Integración directa con LeRobot: carga mediante `DiffusionPolicy.from_pretrained(...)` y uso del stack estándar de entrenamiento y evaluación de LeRobot.
- Reproducibilidad de datos: el dataset de evaluación asociado incluye vídeos de rollout y resultados por episodio.
- Capacidades no disponibles o no documentadas: tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión generalista, audio y multilingüismo. No aplican a este artefacto.

## Casos de uso

- Automatización de protocolos de laboratorio húmedo: el modelo actúa como política bimanual para manipular material y ejecutar las 12 tareas del mix, reduciendo la intervención manual en rutinas repetitivas de wet lab.
- Base para ajuste fino por tarea específica: al ser un preentrenamiento multitarea, sirve como punto de partida para especializar la política en una única tarea con pocos episodios adicionales, aprovechando la representación compartida aprendida.
- Benchmark interno de políticas de imitación: permite comparar arquitecturas alternativas de LeRobot (ACT, VQ-BeT, entre otras) sobre el mismo dataset y el mismo robot, con los vídeos de rollout como referencia cualitativa.
- Investigación en aprendizaje multitarea con difusión: útil para estudiar cómo se comporta una política de difusión cuando comparte parámetros entre doce tareas heterogéneas con tres cámaras de entrada.
- Generación de datos y evaluación de robustez: los rollouts del dataset de evaluación permiten analizar modos de fallo, deriva de la política y sensibilidad a cambios de iluminación o colocación de objetos.
- Prototipado en laboratorios con un UR3e disponible: al ser un checkpoint Apache 2.0 y cargarse con LeRobot, se puede replicar el montaje (UR3e bimanual, tres cámaras) sin coste de licencia y validar el pipeline antes de invertir en recolección de datos propia.
- Docencia y formación en robótica de manipulación: sirve como ejemplo completo de extremo a extremo (dataset, política, evaluación) para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente 0 episodios de evaluación y 0 éxitos sobre 0 intentos, por lo que no existe tasa de éxito medida ni comparación cuantitativa con otras políticas. El repositorio WetLabRoboData/eval-diffusion-multitask_12task_mix-multitask se ofrece como lugar previsto para los vídeos de rollout y los resultados por episodio, pero los datos de rendimiento no se incluyen en la información disponible.

## Requisitos de hardware

- El autor no publica requisitos de hardware ni huella de memoria del checkpoint.
- VRAM estimada: no disponible de forma confirmada. Como referencia genérica del ecosistema LeRobot, las políticas de difusión con backbone convolucional y entrada de varias cámaras suelen ejecutarse en GPUs con 8-12 GB de VRAM o menos; esta cifra es una orientación de familia, no un dato verificado para este checkpoint.
- GPU recomendadas: no especificadas. Por la escala típica de estas políticas, una NVIDIA RTX 4090, RTX 3090, A100 o H100 son suficientes para inferencia; también es viable ejecutar en GPUs de gama media si el backbone es convolucional.
- GPU de consumo: probablemente sí, dado el tamaño habitual de las políticas de difusión de LeRobot, pero no está confirmado por el autor.
- Opciones de despliegue: LeRobot sobre PyTorch (`DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-multitask_12task_mix-multitask")`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo. Ejecución en CPU posible en principio, con latencia mucho mayor.
- Latencia y throughput: no disponibles. En políticas de difusión el coste por paso de control depende del número de pasos de denoising, del horizonte de acciones y del backbone, parámetros que la model card no detalla, por lo que no se puede estimar una frecuencia de control fiable.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, de modo que la comparación solo puede ser estructural y cualitativa frente a otras familias de políticas disponibles en LeRobot entrenadas sobre datos propios.

| Modelo / familia | Tipo de politica | Parametros | Contexto | Licencia | Disponibilidad en este caso |
|---|---|---|---|---|---|
| diffusion-multitask_12task_mix-multitask | Difusión (LeRobot) | no disponible | no aplica | Apache 2.0 | Checkpoint público en Hugging Face |
| ACT (Action Chunking Transformer) | Transformer con chunking de acciones | no disponible | no aplica | según implementación de LeRobot | Disponible como familia en LeRobot; sin checkpoint equivalente para este robot |
| VQ-BeT | Discretización vectorial sobre comportamiento | no disponible | no aplica | según implementación de LeRobot | Disponible como familia en LeRobot; sin checkpoint equivalente para este robot |
| Politicas de difusion genericas (p. ej. Diffusion Policy original) | Difusión | no disponible | no aplica | MIT (implementación de referencia) | Repositorio de investigación; requiere entrenamiento propio |

No se dispone de comparativas cuantitativas de tasa de éxito, tiempo de inferencia ni robustez entre estas alternativas sobre el mismo dataset multitask_12task_mix, por lo que no es posible establecer una jerarquía de rendimiento con la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: 0 episodios evaluados y 0/0 éxitos declarados. No hay evidencia empírica de que la política funcione en el robot real.
- Especificidad de hardware: entrenado para un UR3e bimanual con exactamente tres cámaras. Cambiar el robot, el número de cámaras, su calibración o su montaje invalida las observaciones esperadas por la política.
- Dependencia del entorno de recogida: al ser aprendizaje por imitación, el rendimiento se degrada ante cambios de iluminación, fondo, disposición de objetos o dinámica del laboratorio no representados en los 1206 episodios.
- Sesgos de los datos: el comportamiento refleja las trayectorias y los sesgos de los operadores que teleoperaron las demostraciones, incluidas sus preferencias de agarre, velocidad y orden de acciones.
- Riesgo de fallo silencioso: en políticas de difusión, un error de predicción puede producir movimientos plausibles pero incorrectos; con robots físicos esto implica riesgo de colisión, derrame de material o daño al equipamiento. Se requiere supervisión y paradas de seguridad.
- Multitarea sin métricas por tarea: aunque se declaran 12 tareas, no hay desglose de rendimiento por tarea ni información sobre interferencia negativa entre ellas.
- Idiomas: no aplica; el modelo no procesa lenguaje natural ni instrucciones textuales.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y el uso en un laboratorio real queda bajo responsabilidad del integrador.
- Trazabilidad: los checkpoints originales de entrenamiento viven en un repositorio de origen distinto (subcarpeta old/), lo que complica auditar la receta exacta de entrenamiento desde este repositorio.
- Metadatos incompletos: sin número de parámetros, sin configuración de red, sin requisitos de hardware y sin hiperparámetros, la reproducibilidad del entrenamiento no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-multitask_12task_mix
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-multitask_12task_mix-multitask
- Repositorio de origen del que se reorganizó el checkpoint: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-rama-lbm_pretrain_all_ds5
- LeRobot (librería y repositorio de políticas): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper del método de difusión para políticas visuomotoras (Diffusion Policy, Chi et al., 2023): https://arxiv.org/abs/2303.04137
- Perfil del autor en Hugging Face: https://huggingface.co/WetLabRoboData

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo ni con robótica (contenido de foros sin vinculación temática), por lo que no se incluyen como fuentes. No se han encontrado enlaces adicionales relevantes (blog técnico, paper propio, demo o repositorio de código del autor) más allá de los listados arriba.
