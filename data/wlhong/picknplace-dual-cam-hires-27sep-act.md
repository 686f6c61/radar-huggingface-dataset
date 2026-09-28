# wlhong/picknplace-dual-cam-hires-27sep-act

## Resumen

wlhong/picknplace-dual-cam-hires-27sep-act es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está asociado al paper arXiv 2304.13705 que describe el método ACT.

Se trata de un modelo especializado y de ámbito muy concreto: resuelve la tarea "Pick up the red object and put on chair" sobre un robot `so_follower` (brazo SO-100) equipado con dos cámaras (una cenital `ugreen-top` y una en la muñeca `wrist`). Consume el estado de las articulaciones y dos flujos de vídeo a resolución 720x1280, y produce un vector de 6 dimensiones de acciones. Con 51.668.614 parámetros (~51,7 M) y un repositorio de 0,2 GB, es un modelo ligero orientado a control en tiempo real más que a razonamiento general.

Su relevancia es la de un ejemplo reproducible de política de imitación con hardware de bajo coste: cualquiera con un SO-100 y el entorno LeRobot puede grabarlo, reentrenarlo con su propio dataset o desplegarlo como referencia. No es un modelo de lenguaje ni un modelo fundacional multimodal: es una política visuomotora de propósito único.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE y codificador visual convolucional |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ACT predice un horizonte de acciones (chunk) cuyo valor no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes cuantizadas documentadas) |
| Idiomas soportados | No aplica (modelo visuomotor, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, libreria lerobot) |

Datos adicionales de entrada/salida y entrenamiento:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `ugreen-top`, `wrist` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.ugreen-top` | VISUAL, forma `(3, 720, 1280)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 720, 1280)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | wlhong/picknplace-dual-cam-hires-27sep (49 episodios, 28.128 frames, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Tamano de batch | 4 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en un transformer con estructura de autoencoder variacional condicional (CVAE). La política procesa observaciones visuales y de estado, las codifica mediante un backbone convolucional (habitualmente ResNet) y un encoder transformer, y genera mediante un decoder un bloque de acciones futuras en lugar de una sola acción. Esta predicción por "chunks" reduce el error de acumulación típico de las políticas paso a paso y aporta coherencia temporal en tareas de manipulación. El componente CVAE modela la variabilidad de las demostraciones humanas y suele combinarse con ensamblado temporal (temporal ensembling) en inferencia para suavizar la señal de control.

El entrenamiento se realizó exclusivamente sobre teleoperación, con 30.000 pasos, batch de 4, optimizador AdamW y learning rate 1e-05, arrancando de la semilla 1000. El dataset contiene 49 episodios y 28.128 frames grabados a 30 FPS, con una única tarea anotada. La información proporcionada no detalla el backbone visual exacto, el tamano del chunk de acciones, la composición del dataset (variabilidad de posiciones, iluminación o distractores) ni si se aplicó algún esquema de regularización adicional, por lo que esos puntos quedan como no disponibles.

## Capacidades

- Generación de acciones de control visuomotor: produce vectores de acción de 6 dimensiones a partir del estado de las articulaciones y de dos vistas de cámara.
- Percepción visual multi-cámara: integra simultáneamente una vista cenital (`ugreen-top`) y una vista de muñeca (`wrist`) a resolución 720x1280.
- Ejecución de una tarea de manipulación concreta: "Pick up the red object and put on chair".
- Aprendizaje por imitación a partir de teleoperación: reproduce el comportamiento demostrado en el dataset sin necesidad de recompensas ni entorno simulado.
- Predicción de fragmentos de acción: genera secuencias cortas de acciones para mantener coherencia temporal en la ejecución.
- Compatibilidad con el ecosistema LeRobot: entrenable, evaluable y desplegable con las herramientas estándar (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.

## Casos de uso

- Automatización de una celda pick-and-place con SO-100: la política ejecuta la recogida de un objeto y su colocación sobre una silla reproduciendo las demostraciones, útil como banco de pruebas de manipulación de bajo coste.
- Base para reentrenamiento con datos propios: partiendo de este repositorio y del pipeline documentado, un laboratorio puede grabar sus propios episodios y ajustar la política sin partir de cero.
- Reproducibilidad de resultados en robótica de imitación: sirve como referencia pública de un entrenamiento ACT con hiperparámetros concretos (30.000 pasos, lr 1e-05, batch 4) para comparar configuraciones.
- Docencia y formación en LeRobot: ejemplo listo para ejecutar con `lerobot-rollout` que ilustra el flujo completo de grabación, entrenamiento y despliegue sobre hardware accesible.
- Investigación en políticas visuomotoras: punto de comparación frente a otros métodos del ecosistema LeRobot (Diffusion Policy, SmolVLA) sobre la misma tarea y el mismo robot.
- Validación de setups de cámaras duales: al exigir dos vistas sincronizadas a 30 FPS, permite comprobar la calidad y calibración de una configuración cenital + muñeca antes de escalar a tareas más complejas.
- Prototipado de control en tiempo real: con ~51,7 M de parámetros y 0,2 GB de pesos, puede ejecutarse a 30 FPS en una GPU de consumo, lo que facilita iterar sobre estrategias de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (_"No evaluation results have been provided for this policy yet"_), y no se incluye tasa de éxito por tarea, número de ensayos ni condiciones de dificultad.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los ~51,7 M de parámetros ocupan aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de gama baja; el consumo real depende de las activaciones del backbone visual a 720x1280 con dos cámaras.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA; el entrenamiento original usó `--policy.device=cuda`. No se especifican modelos concretos en la información disponible.
- GPU de consumo: por tamaño (0,2 GB de pesos) es probable que quepa en GPUs de consumo como las RTX 3060/4060 en adelante, aunque la información proporcionada no confirma requisitos exactos ni latencias medidas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento) sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no serían aplicables al tratarse de una política de acciones y no de un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control se plantea a 30 FPS, coincidiendo con el frame rate del dataset, pero no se aportan mediciones de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación es cualitativa. Se listan alternativas del mismo ecosistema (LeRobot) y de la misma categoría (políticas de imitación para manipulación):

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wlhong/picknplace-dual-cam-hires-27sep-act | ACT (transformer + CVAE) | 51.668.614 | No aplica | apache-2.0 | Hugging Face |
| Diffusion Policy | Política de difusión | No disponible | No aplica | No disponible | Implementada en LeRobot |
| SmolVLA | VLA (vision-language-action) | No disponible | No disponible | No disponible | Hugging Face / LeRobot |
| ACT (implementacion de referencia) | ACT (transformer + CVAE) | No disponible | No aplica | No disponible | GitHub (lerobot) |

Nota: las filas de Diffusion Policy, SmolVLA y ACT de referencia se incluyen como categorías comparables del ecosistema LeRobot; sus cifras concretas no están en la información disponible y no deben darse por confirmadas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("Pick up the red object and put on chair") y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin resultados de evaluación: no se ha publicado tasa de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en el mundo físico.
- Dependencia del setup: las cámaras deben llamarse exactamente `ugreen-top` y `wrist` y coincidir con las claves de observación usadas en entrenamiento; diferencias de posición, calibración o iluminación pueden degradar el comportamiento.
- Dataset reducido: 49 episodios y 28.128 frames son una base limitada, lo que puede traducirse en poca robustez ante variaciones de posición del objeto, distractores o cambios de iluminación.
- Riesgo de sobreajuste a las condiciones de grabación: el modelo reproduce las demostraciones y puede fallar fuera de la distribución vista durante el entrenamiento.
- Sin capacidades de lenguaje ni de razonamiento: no procesa instrucciones en lenguaje natural ni ejecuta tareas compuestas o multi-paso.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre daños derivados de su uso en robots reales.
- Sin variantes cuantizadas documentadas: la información disponible no describe formatos de cuantización ni conversiones para despliegue en hardware limitado.
- Advertencia de seguridad en producción: al controlar un brazo robótico físico, cualquier despliegue debe acompañarse de límites de par, paradas de emergencia y supervisión, dado que no se documenta ningún mecanismo de seguridad interno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wlhong/picknplace-dual-cam-hires-27sep-act
- Dataset de entrenamiento: https://huggingface.co/datasets/wlhong/picknplace-dual-cam-hires-27sep
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wlhong/picknplace-dual-cam-hires-27sep
- Paper de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
