# vicshi97/pi05_policy_sock-garbage-merged_3.0_yolo_20k

## Resumen

`vicshi97/pi05_policy_sock-garbage-merged_3.0_yolo_20k` es un ajuste fino (fine-tune) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario vicshi97 en el Hub de HuggingFace. No es un modelo de lenguaje conversacional: es una política de control robótico entrenada con LeRobot que consume el estado articular y dos cámaras RGB de un robot `so_follower` (SO-100/SO-101 de LeRobot) y emite directamente un vector de acción de 6 dimensiones. El problema que resuelve es concreto: automatizar dos tareas de recogida de objetos —"pick up the garbage and put it in the basket" y "pick up the sock and put it in the container"— mediante aprendizaje por imitación.

El modelo parte de `lerobot/pi05_base` y se ha entrenado durante 20.000 pasos con batch de 16, optimizador AdamW y learning rate 2,5e-05 sobre el dataset `vicshi97/sock-garbage-merged_3.0_yolo` (260 episodios, 111.830 fotogramas a 30 FPS). Los pesos suman 4.143.404.816 parámetros (≈4,14 mil millones) en un repositorio de 8,6 GB en formato safetensors, con licencia Apache 2.0.

Su relevancia es la de un ejemplo práctico y reproducible de extremo a extremo: un fine-tune de una política VLA generalista para tareas de manipulación muy específicas, ejecutable con la CLI de LeRobot en hardware de consumo. Conviene subrayar que el autor no ha publicado ninguna evaluación en robot real, por lo que su rendimiento efectivo es desconocido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) π₀.₅ (Pi05); implementación de LeRobot adaptada de OpenPI. El backbone concreto y el mecanismo de decodificación de acciones no se detallan en la información disponible |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible (no se especifica ventana de contexto textual; la observación se limita a estado + 2 imágenes) |
| Tipos de cuantización | No disponible (el repositorio solo distribuye safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | No disponible. Las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo / pipeline | `robotics` (política de imitación) |
| Modelo base | `lerobot/pi05_base` |
| Librería | `lerobot` (versión 0.6.2 durante el entrenamiento) |
| Robot objetivo | `so_follower`, con cámaras `base` y `wrist` |
| Entradas | `observation.state` (6,); `observation.images.base_0_rgb` (3, 480, 640); `observation.images.wrist_0_rgb` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 8,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

π₀.₅ es un modelo visión-lenguaje-acción presentado por Physical Intelligence como evolución de π₀, orientado a la generalización en entornos y situaciones no vistos durante el entrenamiento. La implementación disponible en LeRobot está adaptada del repositorio OpenPI. La información proporcionada no detalla el backbone de visión-lenguaje, el número de capas, el mecanismo de generación de acciones ni la resolución interna de tokens de imagen; únicamente se documenta la interfaz de observación (estado de 6 dimensiones y dos imágenes RGB de 480×640) y la salida de acción de 6 dimensiones.

El entrenamiento es un ajuste fino supervisado por imitación sobre 260 episodios y 111.830 fotogramas grabados a 30 FPS, con 20.000 pasos, batch de 16, AdamW, learning rate 2,5e-05 y semilla 1000. El dataset combina dos tareas (recogida de basura y recogida de calcetines) y su nombre incluye el sufijo `yolo`, lo que sugiere algún procesamiento o anotación auxiliar basada en detección de objetos, aunque el procedimiento exacto no se describe. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación posterior; tampoco se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de los dos conjuntos de instrucciones.

## Capacidades

- Control robótico de manipulación extremo a extremo: mapea píxeles y estado articular a comandos de acción de 6 grados de libertad, sin planificación explícita intermedia.
- Ejecución de dos tareas de recogida y depósito: "pick up the garbage and put it in the basket" y "pick up the sock and put it in the container".
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto en la CLI (`--task=...`), lo que permite seleccionar el comportamiento entre las tareas aprendidas.
- Percepción multimodal con dos vistas: cámara base (contexto global de la escena) y cámara de muñeca (vista cenital del efector), ambas a 480×640.
- Generalización a posiciones de objeto no vistas dentro de la distribución del dataset, según la motivación declarada de π₀.₅ (no verificada para este fine-tune).
- Integración con el ecosistema LeRobot: inferencia con `lerobot-rollout`, reentrenamiento con `lerobot-train` y visualización del dataset asociado.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general (captioning, VQA) ni audio; es una política de acción, no un asistente.

## Casos de uso

- Recogida automatizada de residuos en entornos domésticos o de laboratorio: la política ejecuta la tarea "pick up the garbage and put it in the basket" de forma autónoma durante el tiempo indicado con `--duration`, usando la cámara base para localizar el objeto y la de muñeca para el agarre final.
- Clasificación y depósito de ropa en un contenedor: la segunda tarea entrenada ("pick up the sock and put it in the container") sirve como base para prototipos de manipulación de textiles, un caso clásico de deformable object manipulation.
- Banco de pruebas para investigación en aprendizaje por imitación: al ser un fine-tune reproducible con hiperparámetros documentados (20k pasos, batch 16, lr 2,5e-05, semilla 1000), permite estudiar el efecto del tamaño del dataset (260 episodios) en el rendimiento de políticas VLA.
- Punto de partida para fine-tunes propios: el flujo documentado con `--policy.path=lerobot/pi05_base` permite reentrenar sobre un dataset propio de un robot `so_follower` y comparar contra este checkpoint como referencia.
- Demostraciones educativas de VLA en hardware de bajo coste: con ≈8,3 GB en bf16, la política cabe en una GPU de consumo, lo que facilita talleres y cursos sobre LeRobot sin acceso a clústeres.
- Evaluación de robustez ante cambios de iluminación, posición de objetos y distractores: el modelo sirve como sujeto de pruebas para medir la degradación de una política entrenada con pocos episodios.
- Automatización de tareas repetitivas de picking en líneas de montaje simples o células de laboratorio, siempre que los objetos y la disposición se mantengan próximos a la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real, número de ensayos ni métricas de robustez. Tampoco se han publicado métricas estándar de VLA (por ejemplo, MMLU, HumanEval o GSM8K), que además no serían aplicables a una política de control.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ≈16,6 GB en fp32, ≈8,3 GB en bf16/fp16, ≈4,1 GB en int8 (estimación aritmética a partir de los 4,14 mil millones de parámetros; el repositorio ocupa 8,6 GB, coherente con pesos de 16 bits).
- Hay que añadir memoria para activaciones y para dos imágenes de 480×640 por paso de inferencia; se recomienda un margen de 2 a 4 GB adicionales sobre la cifra de pesos.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para entrenamiento; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con holgura; RTX 4080 (16 GB) o RTX 4070 Ti SUPER (16 GB) al límite en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 12-16 GB si se usa bf16 y se controla el tamaño de lote; en 8 GB solo con cuantización agresiva, no documentada por el autor.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (inferencia sin grabación) y `--policy.path=<repo>`; `lerobot-train` para reentrenamiento. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, y ninguno de ellos es adecuado para una política de acción.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que marca el orden de magnitud del bucle de control esperado, pero no se publica la latencia real por paso en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05_policy_sock-garbage-merged_3.0_yolo_20k`) | 4,14 mil millones | Estado (6,) + 2 imágenes 480×640; longitud de contexto no disponible | Sin evaluación publicada | Apache 2.0 | HuggingFace, 0 descargas |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | Misma familia π₀.₅; no detallado | No disponible | No disponible en la información proporcionada | HuggingFace (referenciado como base) |
| π₀ (modelo predecesor de Physical Intelligence) | No disponible | No disponible | No disponible | No disponible | Repositorio OpenPI (referenciado) |
| Otras políticas VLA de la categoría (OpenVLA, RDT, etc.) | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos en la información disponible |

La comparación cuantitativa con alternativas no es posible con los datos suministrados: no se han publicado métricas de éxito ni especificaciones del backbone para este checkpoint ni para el modelo base más allá de su identificador.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción parte de una base no verificada.
- Sesgo de dominio severo: entrenado con 260 episodios de dos tareas concretas sobre un robot `so_follower`; es esperable un fallo rápido ante objetos, posiciones, iluminación o fondos distintos de los del dataset.
- Idiomas: las instrucciones de tarea están en inglés y no se documenta soporte multilingüe; el condicionamiento lingüístico es mínimo (dos frases).
- Riesgo de sobreajuste: 20.000 pasos con batch 16 sobre 111.830 fotogramas puede provocar memorización de trayectorias; no se documenta ninguna técnica de regularización ni aumento de datos.
- Riesgo físico: es una política que mueve un brazo robótico real. Debe ejecutarse con límites de par, parada de emergencia y supervisión humana; los fallos de agarre o colisión no son "alucinaciones" benignas.
- Licencia: el repositorio declara Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base `lerobot/pi05_base` y de los datos de entrenamiento antes de un despliegue comercial.
- Reproducibilidad: se documentan hiperparámetros y semilla, pero no la versión exacta de las dependencias más allá de LeRobot 0.6.2, ni el hardware de entrenamiento.
- Mantenimiento: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin comunidad ni soporte.
- La búsqueda web asociada no devolvió resultados técnicos relevantes sobre este modelo (solo contenido no relacionado que se ha descartado), por lo que no hay documentación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vicshi97/pi05_policy_sock-garbage-merged_3.0_yolo_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/vicshi97/sock-garbage-merged_3.0_yolo
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vicshi97/sock-garbage-merged_3.0_yolo
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
