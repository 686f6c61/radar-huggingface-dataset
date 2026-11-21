# Verithm/pick_and_place_dp_s

## Resumen

Verithm/pick_and_place_dp_s es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica —"Pick a ball and place"— sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste), consumiendo el estado articular de 6 dimensiones y dos cámaras (superior y de muñeca) a resolución 640x480, y produciendo comandos de acción de 6 dimensiones.

A diferencia de un LLM, no es un modelo de lenguaje: es una política de imitación que trata el control visuomotor como un proceso generativo de difusión, lo que le permite generar trayectorias de acción multimodales y suaves, especialmente útiles en tareas con contacto físico. El repositorio pesa 0,4 GB y contiene 89.243.842 parámetros en formato safetensors.

Su relevancia es práctica para la comunidad de robótica de bajo coste: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento de política, despliegue en robot real) con una licencia permisiva Apache 2.0 y un conjunto de datos abierto de 33 episodios y 24.685 fotogramas a 30 FPS. No obstante, se trata de un modelo muy específico de una sola tarea, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión, según arXiv:2303.04137) |
| Parametros totales | 89.243.842 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación limitada a la observación actual) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica mediante etiqueta de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Cámaras | top, wrist |
| Entrada observation.state | STATE, forma (6,) |
| Entrada observation.images.top | VISUAL, forma (3, 480, 640) |
| Entrada observation.images.wrist | VISUAL, forma (3, 480, 640) |
| Salida action | ACTION, forma (6,) |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

La política sigue el paradigma Diffusion Policy: en lugar de predecir una acción determinista, modela la distribución de secuencias de acción mediante un proceso de difusión condicionado por las observaciones (estado articular y dos imágenes RGB). Esto permite representar la multimodalidad del comportamiento humano —por ejemplo, distintas formas válidas de aproximarse a la pelota— y producir trayectorias suaves y coherentes temporalmente, lo que resulta ventajoso en manipulación con contacto.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset Verithm/pick_and_place_1104_20261104_142149, compuesto por 33 episodios y 24.685 fotogramas a 30 FPS de la tarea "Pick a ball and place". La configuración reportada es de 200.000 pasos, batch de 64, optimizador Adam, learning rate 1e-4 y semilla 1000. No se especifica en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables en este paradigma de imitación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de manipulación robótica: genera comandos de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Ejecución de la tarea específica "Pick a ball and place" sobre robot `so_follower`.
- Generación de trayectorias de acción multimodales y suaves gracias al proceso de difusión.
- Operación con observaciones multimodales (estado + dos imágenes RGB a 640x480).
- Integración nativa con el ecosistema LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger una pelota y colocarla sobre un robot SO-100/SO-101, sirviendo como referencia reproducible del flujo LeRobot.
- Prototipado rápido de políticas de imitación: con 33 episodios y 200.000 pasos de entrenamiento, es un punto de partida para validar pipelines de datos y despliegue antes de escalar a tareas más complejas.
- Docencia y formación en robótica de bajo coste: permite a estudiantes entrenar y desplegar una política de difusión real con hardware asequible y dataset abierto.
- Investigación en manipulación con contacto: la formulación generativa de Diffusion Policy es adecuada para estudiar el comportamiento en tareas donde la precisión y la suavidad de la trayectoria importan.
- Benchmark interno de infraestructura: al ser un modelo pequeño (89M parámetros, 0,4 GB), sirve para medir latencia y throughput de LeRobot en GPUs consumer antes de invertir en modelos mayores.
- Base para fine-tuning en tareas similares: el checkpoint puede reentrenarse con `lerobot-train` sobre nuevos datasets de pick-and-place para adaptarlo a otros objetos o posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito ni comparativas numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 89,2 millones de parámetros en safetensors (0,4 GB de repo), la inferencia en FP32 requiere aproximadamente 0,4 GB solo para pesos, más el coste de las dos cámaras a 640x480 y del proceso de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; se recomienda una RTX 3060/4060 o superior para margen.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs consumer modernas, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Verithm/pick_and_place_dp_s`), con soporte de `--policy.device=cuda` en entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verithm/pick_and_place_dp_s | Diffusion Policy (LeRobot) | 89,2 M | no aplica | Apache 2.0 | Hugging Face Hub |
| Otras políticas LeRobot Diffusion Policy | Diffusion Policy (LeRobot) | variable | no aplica | según autor | Hugging Face Hub |
| Políticas ACT (Action Chunking Transformer) en LeRobot | Transformer de imitación | variable | no aplica | según autor | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo verificable entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea "Pick a ball and place" sobre robot `so_follower`; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real reportadas, lo que impide estimar su fiabilidad en producción.
- Dataset pequeño: 33 episodios y 24.685 fotogramas limitan la diversidad de posiciones, iluminación y distractores; es probable un sobreajuste a las condiciones de grabación.
- Dependencia de hardware concreto: requiere robot `so_follower` y dos cámaras con nombres `top` y `wrist` en las posiciones e índices correctos; cambiar la configuración invalida la política.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea; no es apto para asistentes conversacionales ni tool calling.
- Riesgo de fallo en entornos no vistos: como toda política de imitación, puede comportarse de forma insegura ante objetos, iluminación o disposición distintos a los del entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el método (arXiv:2303.04137) y LeRobot según la model card.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero el dataset reducido puede reflejar sesgos de posición y apariencia de la pelota.

## Enlaces

- Hugging Face: https://huggingface.co/Verithm/pick_and_place_dp_s
- Dataset de entrenamiento: https://huggingface.co/datasets/Verithm/pick_and_place_1104_20261104_142149
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Verithm/pick_and_place_1104_20261104_142149
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
