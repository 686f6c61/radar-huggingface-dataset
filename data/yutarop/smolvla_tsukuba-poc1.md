# Yutarop/smolvla_tsukuba-poc1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado en el ecosistema de Hugging Face LeRobot y descrito en el artículo arXiv 2506.01844. Convierte observaciones visuales y el estado del robot en comandos de acción de bajo nivel, lo que permite controlar robots manipuladores mediante aprendizaje por imitación. Frente a los VLA de gran escala que requieren clústeres de GPU, SmolVLA apunta a un rendimiento competitivo con un coste computacional reducido y despliegue en hardware de consumo.

La ficha corresponde a un checkpoint concreto publicado por el usuario Yutarop, `smolvla_tsukuba-poc1`, entrenado para una tarea de pick-and-place sobre un robot `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara cenital. El modelo tiene 450.046.176 parámetros (unos 450 M) en formato safetensors, con un repositorio de 1,2 GB, y se distribuye a través de la librería `lerobot`.

Es relevante por dos motivos. Primero, demuestra el flujo completo de LeRobot: grabación de un dataset propio (50 episodios, 31.605 fotogramas a 30 FPS), entrenamiento de una política SmolVLA y publicación en el Hub con instrucciones de despliegue reproducibles. Segundo, sirve como referencia práctica de lo que se puede conseguir con datos modestos y una sola GPU, aunque el propio autor no ha publicado métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica; el prompt de tarea se usa como instrucción, idioma no especificado) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `top` (una sola) |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | `observation.images.top`, forma `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Frecuencia de datos | 30 FPS |
| Dataset de entrenamiento | Yutarop/tsukuba-poc1_20261107_211425 (50 episodios, 31.605 fotogramas) |
| Tarea entrenada | "Pick up an object and place it" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción: combina un codificador visual, un codificador de lenguaje para la instrucción de tarea y un decodificador de acciones que produce un vector de 6 dimensiones por paso de control. El artículo de referencia (arXiv 2506.01844) lo presenta como una alternativa compacta a los VLA de gran tamaño, con el objetivo de reducir el coste computacional manteniendo un rendimiento competitivo y permitiendo inferencia en hardware de consumo. La información disponible no detalla el número de capas, la dimensión oculta ni el backbone visual o lingüístico concreto.

Este checkpoint se ha entrenado por imitación supervisada sobre un dataset propio de 50 episodios y 31.605 fotogramas a 30 FPS, con una única cámara cenital y un estado de 6 dimensiones. La configuración es estándar de LeRobot: AdamW, learning rate 1e-4, batch de 64 y 20.000 pasos, ejecutado con LeRobot 0.7.1. No se indica en la información proporcionada si hubo RLHF, DPO u otras fases de ajuste posteriores, ni la composición exacta del dataset más allá de la tarea de pick-and-place.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de una imagen de 480x640 y un estado de 6 dimensiones, a 30 FPS.
- Ejecución de tareas de manipulación guiadas por instrucción en lenguaje natural ("Pick up an object and place it").
- Política visuomotora de cámara única: no requiere configuración multi-cámara, lo que simplifica el despliegue.
- Integración nativa con LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Despliegue en hardware de consumo según la descripción del método SmolVLA.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, visión general o audio; es un modelo especializado en acción robótica, no un LLM de propósito general.

## Casos de uso

- Pick-and-place en laboratorio o aula: el modelo ejecuta la tarea "Pick up an object and place it" sobre un SO-100/SO-101 con cámara cenital; es el escenario exacto para el que fue entrenado y el más fiable.
- Prototipado rápido de políticas VLA: sirve como plantilla para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets mayores.
- Docencia e investigación en aprendizaje por imitación: con 450 M de parámetros y un repo de 1,2 GB, se puede entrenar y evaluar en una sola GPU, lo que facilita experimentos reproducibles con estudiantes.
- Benchmark interno de referencia: útil como línea base de SmolVLA sobre una tarea sencilla para comparar con variantes entrenadas con más datos o más cámaras.
- Reentrenamiento con datos propios: el comando `lerobot-train` documentado permite adaptar la política a un nuevo dataset manteniendo la arquitectura y el flujo de trabajo.
- Demostraciones de robótica en el Hub: al estar publicado con instrucciones de rollout, se puede reproducir la inferencia en un robot físico o en simulación para validar la cadena de herramientas.
- Automatización de tareas repetitivas de baja precisión: en entornos controlados con iluminación y posiciones estables, puede sustituir a scripts de movimiento fijos, siempre que se valide la tasa de éxito real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no hay tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en fp32, los pesos ocupan aproximadamente 1,8 GB; el repo de 1,2 GB sugiere pesos en un formato más compacto. Sumando activaciones y el codificador visual, se estima un uso de VRAM en el rango de 2 a 4 GB en fp32/fp16, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia; para reentrenar con batch 64 y 20.000 pasos conviene una GPU de 16 GB o más (RTX 4090, A100, H100).
- GPU de consumo: sí, cabe en tarjetas consumer modernas (RTX 3060 12 GB, RTX 4070, RTX 4090) para inferencia; el entrenamiento completo es más exigente pero viable en una RTX 4090.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de acción robótica.
- Latencia y throughput: no disponibles. El modelo está pensado para control a 30 FPS, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yutarop/smolvla_tsukuba-poc1 | 450 M | no disponible | VLA (SmolVLA) | no disponible | Hugging Face, librería `lerobot` |
| SmolVLA (checkpoints oficiales de LeRobot) | ~450 M (según el método) | no disponible | VLA (SmolVLA) | no disponible en esta ficha | Hugging Face / LeRobot |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visuomotora | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | Imitación visuomotora generativa | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativos publicados para este checkpoint, por lo que la comparación se limita a categoría, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasa de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable fuera del entorno de grabación.
- Dataset muy pequeño y de una sola tarea: 50 episodios y 31.605 fotogramas para una única instrucción ("Pick up an object and place it"); la generalización a otros objetos, posiciones o instrucciones es muy limitada.
- Una sola cámara cenital: el modelo espera `observation.images.top` con forma (3, 480, 640); cambiar la cámara, su posición o la resolución invalida la política.
- Dependencia del robot `so_follower`: el estado y las acciones son de 6 dimensiones; usarlo en otro robot requiere reentrenamiento.
- Licencia no especificada: la model card indica "More Information Needed", por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al entorno: sin datos de evaluación, es probable que la política sea sensible a cambios de iluminación, fondo o posición inicial de los objetos.
- Idiomas no documentados: la instrucción de tarea se usa como prompt, pero no se especifica qué idiomas maneja el codificador de lenguaje.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de un único entorno, hereda los sesgos de ese entorno físico y de las demostraciones del operador.
- Advertencia de producción: no se recomienda su uso en aplicaciones críticas sin una validación exhaustiva en el robot y entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yutarop/smolvla_tsukuba-poc1
- Dataset de entrenamiento: https://huggingface.co/datasets/Yutarop/tsukuba-poc1_20261107_211425
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yutarop/tsukuba-poc1_20261107_211425
- Artículo SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
