# victorvanhalst/act_so101_cube_picking1

## Resumen

`victorvanhalst/act_so101_cube_picking1` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollada por el usuario victorvanhalst y publicada en Hugging Face dentro del ecosistema LeRobot. A diferencia de un modelo de lenguaje, no genera texto: consume el estado de las articulaciones y dos flujos de imagen de cámara (muñeca y externa) y produce directamente un vector de acción de 6 dimensiones para el robot `so_follower` (variante SO-101). El problema que resuelve es la ejecución autónoma de una tarea de manipulación concreta: "Pick the red cube and place it in the bowl".

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB, lo que lo sitúa en la gama ligera dentro del aprendizaje profundo aplicado a robótica. Está entrenado sobre un único conjunto de datos propio de 60 episodios y 18.981 fotogramas a 30 FPS, capturado mediante teleoperación. Esto lo convierte en un ejemplo típico de política especializada (single-task), no de propósito general.

Su relevancia actual reside en dos factores. Primero, ACT se ha consolidado como uno de los métodos de referencia para manipulación con hardware de bajo coste, y esta ficha permite reproducir el flujo completo (captura de datos, entrenamiento y despliegue) con las herramientas de LeRobot. Segundo, al estar liberado bajo licencia Apache 2.0, el artefacto puede reutilizarse y adaptarse sin restricciones comerciales, siempre que se cite la metodología y la librería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); incluye un módulo de estilo CVAE para modelar la variabilidad de las trayectorias |
| Parámetros totales | 51.668.614 |
| Longitud de contexto | no aplica (política de imitación; ventana de observación no especificada en la información disponible) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `wrist`, `external` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.external` (3, 480, 640) |
| Salidas | `action` (6,) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un bloque o "chunk" de acciones futuras de una sola vez. Esta formulación reduce el error de composición acumulado típico de las políticas paso a paso y favorece la coherencia temporal del movimiento. La arquitectura combina un codificador de variación condicional (CVAE) que captura la multimodalidad de las demostraciones humanas con un decodificador transformer que genera la secuencia de acciones a partir de las observaciones visuales y propioceptivas. La política consume dos vistas de cámara a 480x640 y el estado articular de 6 dimensiones, y emite un vector de acción de 6 dimensiones (según la model card; los detalles concretos del tamaño de chunk y del codificador visual no se especifican en la información proporcionada).

El entrenamiento se realizó con LeRobot sobre el conjunto `victorvanhalst/so101_cube_picking1`, compuesto por 60 episodios, 18.981 fotogramas a 30 FPS y una única tarea: coger el cubo rojo y depositarlo en el cuenco. La configuración documentada es de 100.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se indica en la información disponible si se aplicaron fases de RLHF, DPO u otro ajuste posterior; en el contexto de ACT lo habitual es un entrenamiento puramente supervisado sobre las demostraciones teleoperadas.

## Capacidades

- Generación de acciones de manipulación: produce comandos de 6 grados de libertad para el brazo `so_follower`.
- Control guiado por visión: integra dos cámaras simultáneas (muñeca y externa) como entrada perceptiva.
- Ejecución de la tarea específica "Pick the red cube and place it in the bowl" (coger el cubo rojo y ponerlo en el cuenco).
- Predicción por chunks de acción, lo que favorece trayectorias suaves y reduce la acumulación de error frente a políticas paso a paso.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`, con la política operando sobre observaciones en tiempo real.
- No dispone de tool calling, function calling ni soporte de agentes: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo de razonamiento explícito.
- No se documentan capacidades multimodales más allá de la visión (sin audio, sin texto).

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo puede controlar un SO-101 para trasladar un cubo a un cuenco, reproduciendo la tarea demostrada, con las dos cámaras proporcionando realimentación visual a 30 FPS.
- Banco de pruebas para investigación en imitation learning: sirve como referencia reproducible para comparar ACT frente a otros métodos (por ejemplo, Diffusion Policy) sobre el mismo conjunto de datos y hardware.
- Punto de partida para fine-tuning con nuevos objetos o posiciones: al ser una política pequeña (51,7 M de parámetros) y con licencia Apache 2.0, es viable reentrenarla con un conjunto propio de pocas decenas de episodios.
- Prototipado en robótica educativa: su bajo coste computacional permite desplegarla en equipos modestos y usarla para enseñar el flujo completo de teleoperación, captura de datos y entrenamiento con LeRobot.
- Generación de datos sintéticos de evaluación: ejecutando la política de forma repetida se pueden registrar trayectorias etiquetadas que alimenten otros entrenamientos o sirvan como línea base de éxito/fracaso.
- Despliegue en edge computing: el modelo cabe en GPU de consumo e incluso en CPU, por lo que puede ejecutarse en un ordenador de a bordo junto al brazo sin infraestructura de servidor.
- Integración en pipelines de evaluación automática: mediante `lerobot-rollout` con `--duration` fijo se pueden lanzar ensayos controlados y medir tasas de éxito sobre la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas verificables.

Los únicos datos de rendimiento documentados son de entrenamiento: 100.000 pasos, tamaño de lote 8, AdamW con tasa 1e-5 y semilla 1000, sobre 18.981 fotogramas y 60 episodios.

## Requisitos de hardware

- Parámetros totales: 51,7 M, por lo que el peso del modelo es muy reducido (el repositorio completo ocupa 0,2 GB).
- VRAM estimada en inferencia: aproximadamente 0,2 GB en FP32, 0,1 GB en FP16 y 0,05 GB en INT8, sin contar activaciones ni los búferes de imagen de las dos cámaras a 480x640 (estimación, no confirmada por el autor).
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GPU de consumo como RTX 3060, RTX 4060 o RTX 4090; también es viable en Apple Silicon mediante MPS.
- Cabe holgadamente en GPU de consumo e incluso en CPU: el cuello de botella real no es la memoria sino la latencia de inferencia necesaria para sostener el bucle de control.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=victorvanhalst/act_so101_cube_picking1`; entrenamiento con `lerobot-train`. No es aplicable el despliegue con vLLM, TGI u Ollama, ya que son servidores orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. Como referencia operativa, el sistema captura a 30 FPS, lo que implica un presupuesto de aproximadamente 33 ms por paso de control; no se documenta si el modelo cumple ese margen en el hardware del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `victorvanhalst/act_so101_cube_picking1` | ACT (transformer con chunks de acción) | 51,7 M | Estado (6) + 2 cámaras RGB | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | Política de difusión | no disponible | Estado + cámaras RGB | no disponible en la información proporcionada | Implementada en LeRobot |
| SmolVLA | VLA basada en VLM | no disponible en la información proporcionada | Estado + cámaras + instrucción en lenguaje | no disponible en la información proporcionada | LeRobot / Hugging Face |
| Otros checkpoints ACT de LeRobot | ACT | variable según el caso | Estado + cámaras | habitualmente Apache 2.0 | Hugging Face |

Nota: al tratarse de una política entrenada para un robot y una tarea concretos, la comparación justa debe hacerse sobre el mismo conjunto de datos y hardware; los datos de parámetros y licencia de las alternativas no se detallan en la información proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Es una política de tarea única: está entrenada exclusivamente para "Pick the red cube and place it in the bowl"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: está asociada al robot `so_follower` y a una configuración concreta de dos cámaras (`wrist` y `external`) con nombres de observación específicos; cambiar la disposición o el tipo de cámara puede invalidar la política.
- Sensibilidad al entorno: no se documentan pruebas con cambios de iluminación, posiciones de objeto, distractores u otros robots de la misma referencia, por lo que se desconoce su robustez fuera de las condiciones de captura.
- Ausencia de evaluación: no hay tasa de éxito publicada, de modo que su fiabilidad real en producción es desconocida.
- Riesgo de fallo en ejecución: como toda política de imitación, puede degradarse ante estados de observación no vistos durante el entrenamiento; no incorpora mecanismos de seguridad explícitos.
- Sesgos de datos: al derivarse de demostraciones teleoperadas de un único operador humano, puede heredar sus sesgos de estilo y trayectoria.
- Sin capacidades de lenguaje ni contexto conversacional: no puede recibir instrucciones en lenguaje natural ni mantener diálogo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y se cite la metodología (ACT) y LeRobot; conviene revisar la licencia del conjunto de datos asociado por si difiere.
- Caveat de producción: la ejecución indefinida (sin `--duration`) puede dejar la política actuando sin supervisión; se recomienda limitar la duración y establecer paradas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorvanhalst/act_so101_cube_picking1
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/victorvanhalst/so101_cube_picking1
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=victorvanhalst/so101_cube_picking1
- Artículo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
