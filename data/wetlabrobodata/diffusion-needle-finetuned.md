# WetLabRoboData/diffusion-needle-finetuned

## Resumen

diffusion-needle-finetuned es una política de control robótico basada en difusión (diffusion policy) publicada en HuggingFace por el usuario WetLabRoboData. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que traduce observaciones de cámara y estado del robot en acciones de control de bajo nivel para una tarea concreta, denominada "needle". Se distribuye a través de la librería LeRobot y se ejecuta sobre un robot UR3e bimanual equipado con tres cámaras.

El modelo parte de un preentrenamiento multitarea (WetLabRoboData/diffusion-multitask_12task_mix-multitask) y después se afina sobre un conjunto de datos específico de la tarea needle (WetLabRoboData/lerobot-data-needle). El autor reporta 15 éxitos sobre 20 episodios de evaluación (75 %) en esa tarea.

Su relevancia es acotada pero clara dentro del ecosistema de automatización de laboratorios: sirve como pieza reutilizable de imitación visual-motora para una tarea de manipulación fina, con licencia Apache 2.0, y como ejemplo de flujo "preentrenamiento multitarea + ajuste por tarea" en robótica de laboratorio húmedo. El repositorio no tiene descargas ni "likes" en el momento de la consulta, y la model card no publica arquitectura de red, número de parámetros ni requisitos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de LeRobot; no se especifica el backbone concreto (UNet, transformer u otro) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica / no disponible: no es un modelo de lenguaje y la model card no indica horizonte de observación ni horizonte de predicción de acciones |
| Tipos de cuantizacion | no disponible; no se documenta soporte de cuantización |
| Idiomas soportados | no aplica (modelo de control visomotor; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; la carga documentada es vía `DiffusionPolicy.from_pretrained` de LeRobot |
| Familia de politica | diffusion (LeRobot) |
| Variante | Finetuned (preentrenamiento multitarea y ajuste posterior sobre el pool de la tarea) |
| Modelo base | WetLabRoboData/diffusion-multitask_12task_mix-multitask |
| Tarea objetivo | needle |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-needle |
| Robot | UR3e bimanual |
| Camaras | 3 |
| Episodios de evaluacion | 20 |
| Exitos de evaluacion | 15 / 20 (75 %) |
| Pipeline (HuggingFace) | robotics |
| Libreria | lerobot |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-10-04 (ambas) |

## Arquitectura y entrenamiento

La model card identifica la familia de política como "diffusion (LeRobot)" y la variante como un ajuste fino de un modelo multitarea previo entrenado sobre una mezcla de 12 tareas. Esto implica un esquema en dos etapas: primero un preentrenamiento multitarea sobre datos heterogéneos y después un ajuste sobre el pool de datos específico de la tarea needle. No se detalla en la información disponible la arquitectura interna de la red (tipo de backbone, número de capas, dimensión de las representaciones), ni el número de parámetros, ni el volumen de datos de entrenamiento en episodios o transiciones.

Tampoco se especifica si hubo etapas de RLHF, DPO u optimización por refuerzo, ni el número de pasos de difusión usados en inferencia. El autor sí documenta la trazabilidad: el modelo se reorganizó el 2026-10-04 a partir de `WetLabRoboData/lerobot-data-rama-lbm_finetune_needle`, y los artefactos de entrenamiento originales (checkpoints, `train_config.json`, directorio `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen. Esa carpeta es la vía para recuperar detalles de configuración que no aparecen en la model card.

## Capacidades

- Control visomotor por imitación para una tarea de manipulación fina ("needle") sobre un UR3e bimanual.
- Fusión de tres flujos de cámara más el estado del robot como entrada para generar acciones de control.
- Ejecución bimanual coordinada, dado que el robot objetivo tiene dos brazos.
- Reutilización como punto de partida para ajuste fino en tareas nuevas dentro del mismo montaje (mismo robot y misma disposición de cámaras).
- Integración directa en el ecosistema LeRobot mediante `DiffusionPolicy.from_pretrained`.
- Generación de políticas multimodales por naturaleza: al ser una política de difusión, puede representar distribuciones de acción multimodales en lugar de una única media.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje y no procesa texto.

## Casos de uso

- Automatización de manipulación de precisión en laboratorio húmedo: el modelo se emplea para ejecutar la secuencia de la tarea needle sobre el UR3e bimanual, reduciendo la intervención manual en operaciones repetitivas de pipeteado, enhebrado o inserción de agujas.
- Base para ajuste fino en tareas adyacentes: partiendo de este checkpoint ya ajustado, un laboratorio puede reentrenar con su propio dataset manteniendo el mismo robot y las mismas tres cámaras, aprovechando que la variante ya incorpora la adaptación al montaje.
- Investigación en imitación visomotora: sirve como referencia comparativa frente a otras políticas (ACT, TDMPC, VQ-BeT) dentro de LeRobot, usando el mismo protocolo de 20 episodios de evaluación.
- Validación de canalizaciones de despliegue: útil para probar la integración entre LeRobot, el bucle de control del UR3e y la captura sincronizada de tres cámaras antes de escalar a producción.
- Generación de datos y teleoperación asistida: el modelo puede usarse como política inicial en esquemas de recolección de datos con corrección humana, acelerando la cobertura de estados difíciles.
- Demostraciones reproducibles en entornos de laboratorio automatizado: el autor publica vídeos de rollout y resultados por episodio, lo que permite auditar el comportamiento del modelo en un banco de pruebas concreto antes de adoptarlo.
- Docencia y prototipado en robótica bimanual: con licencia Apache 2.0 y carga en pocas líneas mediante LeRobot, es adecuado para cursos y proyectos que necesiten una política visomotora funcional sin partir de cero.

## Benchmarks y rendimiento

La única métrica publicada por el autor es la evaluación de rollout sobre la tarea needle. No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K y similares) porque el modelo no es un sistema de lenguaje, ni tampoco métricas estándar de robótica más allá de la tasa de éxito reportada.

| Metrica | Valor | Notas |
|---|---|---|
| Tasa de exito en la tarea needle | 75 % (15 de 20 episodios) | Evaluación propia del autor; sin intervalos de confianza ni desglose por semilla |
| Episodios de evaluacion | 20 | Rollouts disponibles en WetLabRoboData/eval-diffusion-needle-finetuned |
| Comparacion con el modelo base multitarea en needle | no disponible | El autor no publica la tasa de éxito del modelo base en esta tarea |
| Otras metricas (MMLU, HumanEval, GSM8K, etc.) | no aplica | El modelo no es un LLM |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica el tamaño del modelo ni el número de parámetros, por lo que no puede estimarse a partir de la información proporcionada.
- GPU recomendadas: no disponibles en la documentación del modelo. La model card solo identifica el robot objetivo (UR3e bimanual con tres cámaras).
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados al respecto.
- Opciones de despliegue: LeRobot es la vía documentada, mediante `from lerobot.policies.diffusion.modeling_diffusion import DiffusionPolicy` y `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-needle-finetuned")`. Los servidores de inferencia de LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de modelo.
- Latencia y rendimiento: no disponibles. En políticas de difusión el coste computacional depende del número de pasos de denoising, parámetro que no se especifica en la model card; este dato es crítico para verificar que la frecuencia de control es compatible con el bucle de control del UR3e.
- Requisito adicional de integración: el modelo asume el montaje concreto del autor (UR3e bimanual, tres cámaras). Cualquier cambio en la cinemática, la calibración o la posición de las cámaras invalida las observaciones esperadas.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar el modelo con su propio modelo base. No se han encontrado en la información proporcionada otras políticas comparables con cifras publicadas para esta tarea.

| Modelo | Tarea | Parametros | Exito en needle | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-needle-finetuned | needle (una tarea) | no disponible | 75 % (15/20) | apache-2.0 | HuggingFace, libreria lerobot |
| WetLabRoboData/diffusion-multitask_12task_mix-multitask | 12 tareas (multitarea) | no disponible | no disponible | no disponible | HuggingFace |
| Otras politicas de imitacion comparables (ACT, VQ-BeT, TDMPC) | manipulación general | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Evidencia empírica limitada: la evaluación se apoya en 20 episodios en un único montaje. Un 75 % de éxito no viene acompañado de intervalos de confianza, número de semillas ni análisis de varianza, por lo que la robustez real es incierta.
- Riesgo de sobreajuste al entorno del autor: el ajuste se hizo sobre los datos de una tarea y un laboratorio concretos, con un robot UR3e bimanual y tres cámaras. Cambios en iluminación, calibración, fondo, posición de cámaras o utillaje pueden degradar el rendimiento de forma no cuantificada.
- Ausencia de datos de generalización: no se publican resultados en objetos, posiciones o variantes de la tarea distintos de los de entrenamiento.
- Sin información sobre sesgos ni cobertura: al no haber desglose de episodios, no puede evaluarse si los fallos se concentran en configuraciones específicas (por ejemplo, un brazo, una oclusión o un rango de posiciones).
- Alucinación en el sentido de lenguaje natural: no aplica, ya que el modelo no genera texto. Sí existe el equivalente funcional: acciones incorrectas o inseguras ante observaciones fuera de distribución, sin mecanismo de abstención documentado.
- Limitaciones de contexto e idioma: no aplica el concepto de ventana de contexto ni de cobertura idiomática; el modelo no procesa lenguaje.
- Seguridad física: es un modelo de control para un robot real. Cualquier despliegue debe incorporar límites de par, parada de emergencia, monitorización de fuerza y supervisión humana, con independencia de la licencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el repositorio no incluye avisos sobre patentes, sobre datos de entrenamiento de terceros ni sobre cumplimiento normativo en entornos sanitarios o de laboratorio regulados.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin mantenimiento posterior documentado. La procedencia se reorganizó el 2026-10-04 desde otro repositorio, y la configuración de entrenamiento solo es recuperable en la subcarpeta `old/` del origen.
- Ambigüedad de nombre: las búsquedas del término "needle" devuelven de forma mayoritaria el proyecto Cactus-Compute/needle, un modelo de automatización para dispositivos pequeños sin relación alguna con este repositorio. Conviene no confundir ambos resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-needle-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-needle
- Modelo base multitarea: https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-needle-finetuned
- Librería LeRobot (vía de carga y despliegue documentada): https://github.com/huggingface/lerobot
- Repositorio de origen citado en la model card, con los artefactos de entrenamiento en la subcarpeta `old/`: `WetLabRoboData/lerobot-data-rama-lbm_finetune_needle` (el autor no proporciona URL directa).
- No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo; los resultados obtenidos corresponden al proyecto homónimo no relacionado Cactus-Compute/needle.
