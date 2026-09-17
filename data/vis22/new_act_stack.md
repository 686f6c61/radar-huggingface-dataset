# vis22/new_act_stack

## Resumen

`vis22/new_act_stack` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. El modelo ha sido entrenado y publicado por el usuario vis22 mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está diseñado para ejecutarse sobre un robot `piper_follower` equipado con dos cámaras (`cam_global` y `cam_gripper`).

La política resuelve una tarea concreta de manipulación: apilar todos los platos sobre el plato azul y volver a la posición de reposo. Se entrenó a partir de 50 episodios teleoperados (26.060 fotogramas a 30 FPS) del dataset `vis22/new_plates_stack`, durante 200.000 pasos con optimizador AdamW y una tasa de aprendizaje de 1e-5. El resultado es un checkpoint de 51.670.663 parámetros (unos 0,2 GB de repositorio) en formato safetensors, con licencia Apache 2.0.

Su relevancia es la de un ejemplo canónico de extremo a extremo del flujo de trabajo de LeRobot: grabar demostraciones, entrenar una política ACT y desplegarla con `lerobot-rollout`. No es un modelo de lenguaje ni un sistema multimodal generalista: consume estado propioceptivo de 7 dimensiones e imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones. El autor no ha publicado resultados de evaluación en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa una observación por paso y predice un chunk de acciones) |
| Tipos de cuantizacion | No documentados; los pesos se distribuyen en safetensors (precisión declarada no disponible) |
| Idiomas soportados | No disponible (política robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de robot | `piper_follower` |
| Cámaras | `cam_global`, `cam_gripper` (3x480x640 cada una) |
| Entradas | `observation.state` (7,), `observation.images.cam_global` (3,480,640), `observation.images.cam_gripper` (3,480,640) |
| Salidas | `action` (7,) |
| Tarea | "Stack all the plates on top of the blue plate, then return to home position" |
| Dataset de entrenamiento | `vis22/new_plates_stack` (50 episodios, 26.060 fotogramas, 30 FPS) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La formulación descrita en la model card predice chunks cortos de acciones en lugar de pasos individuales, lo que reduce el error de composición y permite altas tasas de éxito con datos teleoperados. La implementación de LeRobot sigue el esquema de transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre el dataset `vis22/new_plates_stack`, compuesto por 50 episodios y 26.060 fotogramas grabados a 30 FPS. La configuración publicada es: 200.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.1. La model card no especifica composición adicional del dataset, aumentos de datos, ni si se aplicaron fases de ajuste con RLHF o DPO (procedimientos, por otra parte, poco habituales en este tipo de políticas). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 7 dimensiones a partir de estado propioceptivo e imágenes.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de un único paso, lo que mejora la estabilidad del control.
- Percepción visual con dos cámaras: procesa simultáneamente una vista global y una vista de pinza a 480x640 píxeles.
- Ejecución de tareas de manipulación de precisión: apilado de platos sobre una base de color designada.
- Retorno a posición de reposo: la tarea entrenada incluye explícitamente la vuelta a home.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Modo de razonamiento explícito (thinking), visión general, audio: no disponible.

## Casos de uso

- Apilado de platos sobre una base designada: es la tarea exacta para la que se entrenó la política; se ejecuta con `lerobot-rollout` sobre un `piper_follower` con dos cámaras configuradas con los mismos nombres de observación.
- Punto de partida para nuevos entrenamientos: el flujo `lerobot-train --policy.type=act` permite reutilizar la receta (200.000 pasos, lote 8, AdamW, lr 1e-5) sobre otros datasets de manipulación.
- Banco de pruebas de aprendizaje por imitación: sirve para validar la cadena completa de LeRobot (grabación de datos, entrenamiento, despliegue) antes de abordar tareas más complejas.
- Automatización de células de ensayo con tareas de pick-and-place: la política puede adaptarse a tareas de colocación apilada en entornos controlados con objetos y posiciones similares a los del dataset.
- Replicación de experimentos de ACT: permite reproducir la metodología del artículo 2304.13705 en hardware de bajo coste y comparar con otras políticas del mismo ecosistema.
- Docencia y formación en robótica: al ser un checkpoint pequeño (0,2 GB) con licencia Apache 2.0, es adecuado para prácticas de aprendizaje por imitación en laboratorios con GPU de gama media.
- Evaluación de robustez ante variaciones de iluminación, posición de objetos o distracciones: la model card sugiere reportar este tipo de factores, aunque no aporta resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que el autor no ha proporcionado resultados de evaluación para esta política, y propone una plantilla de tabla de éxito en robot real (tarea, ensayos, éxitos, tasa de éxito) que no ha sido cumplimentada.

## Requisitos de hardware

- Tamaño de pesos: 51.670.663 parámetros, aproximadamente 207 MB en fp32 y 103 MB en fp16 (cálculo derivado del recuento de parámetros; la precisión real de los safetensors no está documentada).
- VRAM estimada: no disponible de forma oficial. Como referencia derivada del tamaño del modelo, los pesos en fp16 caben holgadamente en cualquier GPU con 4 GB o más, a lo que hay que sumar el coste de procesar dos imágenes de 480x640 por paso de inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo, cualquier GPU NVIDIA moderna con soporte CUDA debería poder ejecutarlo; no se documenta compatibilidad con A100, H100 o RTX 4090 en concreto.
- GPU de consumo: es plausible que quepa en GPUs de consumo, dado el tamaño del checkpoint, pero no hay confirmación del autor.
- Opciones de despliegue: `lerobot-rollout` es el método documentado en la model card. Otros backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política y no están documentados.
- Latencia y throughput: no disponible. La política está pensada para operar a 30 FPS (frecuencia de grabación del dataset), pero no se publican mediciones de latencia ni de frecuencia efectiva de control.

## Comparativa con modelos similares

En la información proporcionada no se incluye ninguna comparativa con otras políticas. Se indican a continuación alternativas de la misma categoría (aprendizaje por imitación para robótica en el ecosistema LeRobot) sin cifras verificadas:

| Modelo | Categoría | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vis22/new_act_stack | ACT (imitation learning) | 51.670.663 | No aplica | No publicado | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | Imitation learning (difusión) | No disponible | No aplica | No disponible | No disponible en la información proporcionada | Ecosistema LeRobot |
| SmolVLA | VLA (vision-language-action) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Ecosistema LeRobot |
| pi0 / pi0.5 | VLA | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Ecosistema LeRobot |

Los tres modelos alternativos se citan únicamente como referencias de la misma categoría funcional (políticas de control robótico desplegables con LeRobot); no se dispone de especificaciones contrastadas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no ha publicado ninguna tasa de éxito en robot real, por lo que no hay evidencia pública de que la política funcione fuera del entorno de entrenamiento.
- Sesgo de dominio: entrenada con 50 episodios de una única tarea, un único tipo de robot (`piper_follower`), dos cámaras fijas y un conjunto concreto de objetos. No se espera generalización a otros objetos, posiciones, iluminaciones o robots.
- Dependencia del hardware: la política espera exactamente las claves de observación `observation.images.cam_global` y `observation.images.cam_gripper`; si los nombres o las resoluciones no coinciden, la ejecución falla.
- Ausencia de razonamiento o lenguaje: no procesa instrucciones en lenguaje natural, no tiene tool calling ni capacidades de agente; la tarea está fijada en el entrenamiento.
- Riesgo de sobreajuste: 200.000 pasos sobre 26.060 fotogramas con lote 8 implica muchas épocas sobre un dataset pequeño, lo que incrementa el riesgo de memorización de las trayectorias demostradas.
- Idiomas: no aplica; no hay soporte multilingüe ni de texto.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no exime de las obligaciones de atribución ni de la responsabilidad sobre el comportamiento del robot.
- Seguridad física: cualquier despliegue sobre hardware real debe realizarse con límites de par, paradas de emergencia y supervisión, dado que no se documentan evaluaciones de seguridad.
- Fecha de publicación: el repositorio figura creado el 2026-09-17 y actualizado el mismo día; la información disponible no permite verificar su mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/new_act_stack
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/new_plates_stack
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/new_plates_stack
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Artículo en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados correspondían a definiciones del término "atrición" en diccionarios, sin relación con la política.
