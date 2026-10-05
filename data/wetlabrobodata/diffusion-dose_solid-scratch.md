# WetLabRoboData/diffusion-dose_solid-scratch

## Resumen

`WetLabRoboData/diffusion-dose_solid-scratch` es una política robótica de imitación basada en difusión, publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot de HuggingFace. No es un modelo de lenguaje: es un controlador de acción (policy) entrenado para ejecutar una tarea concreta de laboratorio húmedo denominada `dose_solid`, que consiste en la dosificación de una sustancia sólida. El modelo se distribuye con el pipeline `robotics` y la librería `lerobot`, y su propósito es traducir observaciones visuales y de estado del robot en secuencias de acciones motrices.

La arquitectura es una diffusion policy, es decir, un modelo generativo que aprende a producir "chunks" de acciones desruidando una muestra gaussiana condicionada por las observaciones, en lugar de predecir una única acción de forma determinista. El checkpoint contiene 262.813.031 parámetros (unos 263 millones) y ocupa 1,1 GB en el repositorio, un tamaño compatible con GPUs de consumo. La variante "scratch" indica que se ha entrenado exclusivamente con los datos de esta tarea, sin preentrenamiento previo sobre otros conjuntos.

Su relevancia es práctica más que arquitectónica: demuestra un flujo completo de robótica open source que abarca dataset, entrenamiento, evaluación con vídeos de rollout y publicación del checkpoint bajo licencia Apache 2.0. El modelo reporta 19 éxitos sobre 20 episodios de evaluación (95 %) en un robot UR3e bimanual con tres cámaras, un resultado que lo hace directamente reutilizable como referencia o punto de partida para tareas de manipulación similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), no es un transformer de lenguaje |
| Parámetros totales | 262.813.031 (aproximadamente 263 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; no se publica horizonte de observación ni de acción) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; entrada multimodal de visión y estado del robot) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | Robotics |
| Tarea objetivo | `dose_solid` |
| Robot objetivo | UR3e bimanual con 3 cámaras |
| Dataset de entrenamiento | `WetLabRoboData/lerobot-data-dose_solid` |
| Variante | Scratch (entrenada solo con los datos de esta tarea) |
| Resultado de evaluación | 19 / 20 episodios con éxito |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy, una familia de políticas de imitación en las que la red aprende a invertir un proceso de difusión para generar trayectorias de acción completas. En lugar de emitir una acción por paso, el modelo produce un bloque de acciones (action chunk) condicionado por las observaciones, lo que reduce el error de composición y permite movimientos más suaves y coherentes. Las observaciones incluyen tres cámaras y el estado del robot UR3e bimanual, de modo que la red debe fusionar información visual multivista con la propriocepción para coordinar los dos brazos.

El entrenamiento es de tipo *imitation learning* supervisado sobre el dataset `WetLabRoboData/lerobot-data-dose_solid`, sin indicios de refuerzo con retroalimentación humana ni de ajuste por preferencias. La variante "scratch" implica que no se ha partido de un checkpoint preentrenado en otras tareas, por lo que toda la capacidad de la política proviene de las demostraciones de `dose_solid`. La model card documenta que los resultados fueron reorganizados desde `WetLabRoboData/lerobot-data-rama-dose_solid` el 2026-10-04, y que los artefactos de entrenamiento originales (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad. No se especifican el número de tokens, el número de episodios de demostración, el número de pasos de entrenamiento, el optimizador ni el esquema de ruido utilizado.

## Capacidades

- Generación de trayectorias de acción mediante difusión condicionada por observaciones, en lugar de regresión directa de una única acción.
- Control bimanual coordinado, dado que el robot objetivo es un UR3e con dos brazos.
- Percepción visual multivista: consume tres cámaras simultáneamente, lo que permite razonar sobre la escena desde varios puntos de vista.
- Ejecución de la tarea específica `dose_solid` (dosificación de sólido) con una tasa de éxito reportada del 95 % en 20 episodios.
- Aprendizaje por imitación a partir de demostraciones, sin necesidad de especificar recompensas ni un simulador.
- Integración con el ecosistema LeRobot: carga directa mediante `DiffusionPolicy.from_pretrained(...)`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso simbólico ni planificación en lenguaje natural.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo "thinking", ni entrada o salida de audio.

## Casos de uso

- Automatización de dosificación en laboratorio húmedo: la política puede ejecutar el ciclo completo de dosificación de sólido sobre un UR3e bimanual, reduciendo la intervención manual en tareas repetitivas de pesada y transferencia.
- Base de referencia (*baseline*) para investigación en imitación robótica: al ser una diffusion policy "scratch" con licencia Apache 2.0 y evaluación documentada, sirve para comparar nuevas políticas sobre la misma tarea y el mismo dataset.
- Transferencia a tareas análogas de manipulación: el checkpoint puede servir de punto de partida para *fine-tuning* en tareas de dosificación de líquidos o mezcla, reutilizando la representación visual multivista ya aprendida.
- Validación de pipelines de LeRobot en producción: el código de carga de la model card permite integrar el modelo en un bucle de control real y comprobar latencias y estabilidad de forma reproducible.
- Generación de datos sintéticos de rollout para evaluación: los vídeos y resultados por episodio publicados en `eval-diffusion-dose_solid-scratch` permiten auditar el comportamiento y detectar modos de fallo.
- Docencia y divulgación en robótica: es un ejemplo completo y ligero (263 M de parámetros) de un flujo entrenamiento-evaluación-despliegue en robótica open source, adecuado para cursos prácticos.
- Estudio de robustez ante variaciones de iluminación y colocación: al depender de tres cámaras, permite analizar cómo afectan los cambios de punto de vista a una política de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K) en la información disponible, dado que no se trata de un modelo de lenguaje. El único dato de rendimiento documentado es la evaluación específica de la tarea:

| Métrica | Valor |
|---|---|
| Tarea evaluada | `dose_solid` |
| Episodios de evaluación | 20 |
| Episodios con éxito | 19 |
| Tasa de éxito | 95 % |
| Robot empleado | UR3e bimanual (3 cámaras) |
| Artefactos de evaluación | Vídeos de rollout y resultados por episodio en `WetLabRoboData/eval-diffusion-dose_solid-scratch` |

No se dispone de datos de *throughput*, latencia por *chunk* de acción, número de pasos de difusión empleados en inferencia ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- Tamaño del modelo: 262.813.031 parámetros, 1,1 GB en el repositorio (coherente con pesos en fp32, unos 1,05 GB).
- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 y en torno a 0,55 GB en fp16, más el *overhead* del *runtime* de PyTorch y de los codificadores visuales, que no se documenta.
- Cabe holgadamente en GPUs de consumo: cualquier tarjeta con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para la política en sí; la viabilidad real dependerá del procesamiento de las tres cámaras y del bucle de control.
- GPUs profesionales: A100, H100 o L40S son válidas pero sobredimensionadas para el tamaño del modelo; su interés estaría en servir múltiples instancias o en reentrenamiento.
- La inferencia en CPU es plausible por el reducido número de parámetros, aunque no hay datos publicados de latencia.
- Opciones de despliegue: LeRobot con PyTorch (`DiffusionPolicy.from_pretrained`). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no son runtimes para políticas robóticas ni para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. En una diffusion policy, la latencia depende críticamente del número de pasos de desruido, que no se especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. A continuación se indican alternativas de la misma categoría (políticas de imitación en robótica), marcando como "no disponible" todo aquello que no está documentado en esta búsqueda:

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| `WetLabRoboData/diffusion-dose_solid-scratch` | Diffusion policy (LeRobot) | 262.813.031 | No disponible | Apache 2.0 | 19/20 episodios (95 %) en `dose_solid` |
| Diffusion Policy original (familia) | Diffusion policy | No disponible | No disponible | No disponible | No disponible |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de imitación | No disponible | No disponible | No disponible | No disponible |
| Políticas VLA tipo pi0 | Vision-Language-Action | No disponible | No disponible | No disponible | No disponible |

No se ha encontrado en la información disponible ningún *benchmark* común que permita comparar estas alternativas de forma cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: la variante "scratch" se ha entrenado únicamente con el dataset de `dose_solid`, por lo que no se espera generalización a otras tareas sin *fine-tuning*.
- Dependencia del hardware concreto: está entrenada para un UR3e bimanual con una configuración específica de tres cámaras; cambios en la cinemática, en la disposición de las cámaras o en el *end-effector* pueden invalidar la política.
- Sensibilidad al entorno visual: al basarse en imitación, es probable que sufra ante cambios de iluminación, fondo, texturas o colocación de objetos no representados en las demostraciones.
- Riesgo de fallo silencioso: una política de difusión puede generar trayectorias plausibles pero incorrectas; no incorpora mecanismos explícitos de detección de error ni de recuperación.
- Sin capacidad de razonamiento simbólico ni de lenguaje: no puede interpretar instrucciones en texto ni explicar sus decisiones.
- Sesgos: no se documenta ningún análisis de sesgos. El principal riesgo es el sesgo de las demostraciones (posiciones, velocidades y estrategias concretas del operador que las generó).
- Alucinación: el concepto no aplica en el sentido de los modelos de lenguaje; el equivalente es la generación de acciones fuera de distribución, que puede producir colisiones o daños si no se aplican límites de seguridad.
- Idiomas y contexto: no disponible, no aplica.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y la atribución correspondiente. No se identifican restricciones adicionales en la información disponible.
- Advertencias para producción: se recomienda validar la política en el *setup* físico real antes de desplegarla, implementar paradas de emergencia y límites de par/velocidad, y monitorizar la tasa de éxito de forma continua. El modelo tiene 0 descargas y 0 *likes*, por lo que no existe validación independiente por parte de la comunidad.
- Trazabilidad: los artefactos de entrenamiento originales se conservan en la subcarpeta `old/` del repositorio `WetLabRoboData/lerobot-data-rama-dose_solid`; conviene consultarla para verificar hiperparámetros y configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-dose_solid-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-dose_solid
- Dataset de evaluación (vídeos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-dose_solid-scratch
- Repositorio de origen citado en la model card: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-rama-dose_solid
- LeRobot (librería y framework de políticas robóticas): https://github.com/huggingface/lerobot
- Curso de modelos de difusión de HuggingFace (material general, no específico de este modelo): https://huggingface.co/learn/diffusion-course/en/unit1/3
- Curso de *flow matching* y modelos de difusión del MIT CSAIL (material general, no específico de este modelo): https://diffusion.csail.mit.edu/2026/index.html
- Difusión desde cero (tutorial general, no específico de este modelo): https://github.com/Animadversio/DiffusionFromScratch
