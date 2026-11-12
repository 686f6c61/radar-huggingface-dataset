# xx1541zz/act_pick_cube_chunk50

## Resumen

ACT (`act_pick_cube_chunk50`) es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. Ha sido entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots reales. El modelo resuelve una tarea concreta de manipulación: agarrar un cubo negro ("Grab the black cube") con un robot tipo `so_follower` (SO-100/SO-101 de bajo coste) equipado con dos cámaras, una cenital (`overhead`) y otra en la muñeca (`wrist`).

La arquitectura es un transformer que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el comportamiento del robot. El checkpoint tiene 51.617.414 parámetros y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors. La entrada combina el estado proprioceptivo del robot (vector de 6 dimensiones) con dos imágenes RGB de 480x640 y produce un vector de acción de 6 dimensiones.

Es relevante como ejemplo reproducible de un pipeline completo de aprendizaje por imitación de extremo a extremo: dataset de 50 episodios y 15.000 fotogramas a 30 FPS, entrenamiento de 100.000 pasos con AdamW y publicación del checkpoint listo para ejecutar con `lerobot-rollout`. No obstante, se trata de un modelo de nicho, sin resultados de evaluación publicados y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana de observación definida por la configuración de LeRobot) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés: "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visual-motora. Codifica las observaciones (estado del robot de 6 dimensiones e imágenes de las cámaras `overhead` y `wrist` a 480x640) y decodifica un chunk de acciones futuras de 6 dimensiones por paso, en lugar de una única acción. Esta predicción por chunks, junto con el uso de una arquitectura tipo CVAE durante el entrenamiento, mitiga el problema de la acumulación de errores típico de las políticas paso a paso y produce trayectorias más suaves y estables.

El entrenamiento se realizó sobre el dataset `xx1541zz/pick-cube_20261008_103849`, compuesto por 50 episodios de teleoperación, 15.000 fotogramas a 30 FPS, todos asociados a la tarea "Grab the black cube". La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.0. No se documentan detalles sobre aumentos de datos, composición exacta del dataset ni procesos de RLHF/DPO (no aplicables en este paradigma).

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones (típicamente posición articular o cartesiana del efector) para el robot `so_follower`.
- Percepción visual multimodal: consume dos flujos de imagen RGB de 480x640 (`overhead` y `wrist`) junto con el estado proprioceptivo.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Predicción de chunks de acciones que mejora la suavidad y reduce el error acumulado.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con la tarea especificada en texto.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: es una política motora especializada, no un modelo generativo de propósito general.

## Casos de uso

- Automatización de picking de objetos concretos: la política recoge un cubo negro en un entorno controlado; es directamente desplegable con `lerobot-rollout` sobre un SO-100/SO-101.
- Base para fine-tuning en nuevas tareas de manipulación: sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets propios de agarre.
- Benchmark interno de pipelines de imitación: útil para validar la infraestructura de captura de datos, entrenamiento y despliegue con LeRobot antes de escalar a tareas más complejas.
- Docencia y prototipado en robótica de bajo coste: ejemplo completo y reproducible de un flujo ACT con dos cámaras y robot asequible.
- Investigación en aprendizaje por imitación: referencia para comparar variantes de ACT, tamaños de chunk o configuraciones de datos.
- Pruebas de integración hardware-software: validación de calibración de cámaras, puertos y tasas de fotogramas en un montaje físico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento de referencia usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido tamaño del modelo.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del hardware, de las cámaras y de la frecuencia de control (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick_cube_chunk50 | 51,6 M | Estado 6D + 2 imagenes 480x640 | Agarrar cubo negro (SO follower) | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | Manipulacion general (referencia metodologica) | no disponible | Paper y codigo de referencia |
| Otras politicas LeRobot (p. ej. Diffusion Policy, pi0) | no disponible en la informacion | no disponible | Manipulacion robotica | no disponible | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasas de éxito publicadas en robot real, por lo que el rendimiento real es desconocido.
- Especialización extrema: entrenada únicamente para "Grab the black cube"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 50 episodios y 15.000 fotogramas limitan la robustez frente a variaciones de iluminación, posiciones de objeto o distractores.
- Dependencia del montaje: requiere un robot `so_follower` y cámaras con los nombres y resoluciones exactos (`overhead`, `wrist`, 480x640, 30 FPS); cambios en la configuración degradan el comportamiento.
- Riesgo de sobreajuste al entorno de captura y de fallos ante objetos distintos al cubo negro.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de texto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace recomendable validar en el entorno de destino antes de producción.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xx1541zz/act_pick_cube_chunk50
- Dataset de entrenamiento: https://huggingface.co/datasets/xx1541zz/pick-cube_20261008_103849
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=xx1541zz/pick-cube_20261008_103849
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
