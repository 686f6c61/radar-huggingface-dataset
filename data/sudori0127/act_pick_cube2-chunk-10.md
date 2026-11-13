# sudori0127/act_pick_cube2-chunk-10

## Resumen

`act_pick_cube2-chunk-10` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv:2304.13705. La desarrolla el usuario sudori0127 y se ha entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta de manipulación: agarrar un cubo negro, sobre un robot de tipo `so_follower` (SO-100/SO-101 de The Robot Studio) equipado con dos cámaras, una cenital y otra en la muñeca.

A diferencia de un LLM, no procesa lenguaje ni genera texto: es un transformer pequeño (51.576.454 parámetros, unos 0,2 GB en safetensors) que consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y emite vectores de acción de 6 dimensiones. Su relevancia es la de un ejemplo reproducible de extremo a extremo de imitación visual-motora con hardware de bajo coste, útil para quien quiera entender el flujo completo de LeRobot (grabación, entrenamiento, despliegue) antes de escalar a tareas propias.

El entrenamiento se hizo sobre 51 episodios y 22.099 fotogramas a 30 FPS del dataset `sudori0127/pick-cube2`, con 100.000 pasos, batch de 64 y AdamW a learning rate 1e-5. El autor no ha publicado resultados de evaluación en robot real, por lo que el rendimiento efectivo de la política no está verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.576.454 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de un paso con historial de acciones chunk (no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea está descrita en inglés: "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead`, `wrist` (480x640, 3 canales) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Dataset de entrenamiento | `sudori0127/pick-cube2` (51 episodios, 22.099 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 64 |
| Optimizador | AdamW, lr 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos (chunks) de acciones futuras en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas reactivas y suaviza la ejecución. La arquitectura combina un backbone transformer con atención sobre tokens visuales (las dos cámaras) y el estado propioceptivo, más un decodificador que genera el chunk de acciones. El nombre del repositorio (`chunk-10`) sugiere un tamaño de chunk de 10 pasos, aunque la model card no lo confirma explícitamente.

El entrenamiento es puramente supervisado sobre demostraciones de teleoperación: no hay RLHF, DPO ni recompensas. Se usaron 51 episodios de una única tarea ("Grab the black cube") a 30 FPS, lo que da 22.099 fotogramas en total, un volumen pequeño y de una sola distribución. La configuración (100.000 pasos, batch 64, AdamW, lr 1e-5, semilla 1000) es la típica del `lerobot-train` para ACT. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal; el interés técnico está en el chunking de acciones y en el uso de dos vistas (cenital y muñeca) para la estimación de pose del objeto.

## Capacidades

- Manipulación robótica de una sola tarea: agarre de un cubo negro sobre una superficie, con el robot `so_follower`.
- Política visomotora: combina estado articular de 6 dimensiones con dos imágenes RGB de 480x640 (vista cenital y de muñeca).
- Predicción de chunks de acción de 6 dimensiones, orientada a ejecución suave y estable en tiempo real a 30 FPS.
- Aprendizaje por imitación a partir de demostraciones de teleoperación, sin recompensas ni entorno simulado.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni generación de texto.
- Multilingüismo: no aplica; el único texto que consume es la etiqueta de tarea en inglés.

## Casos de uso

- Reproducción de un pipeline completo de imitación: sirve como referencia para grabar un dataset propio, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`, usando exactamente los mismos hiperparámetros documentados.
- Prototipado de agarre pick-and-place en laboratorio: el modelo agarra un cubo negro desde posiciones conocidas; útil para validar hardware, calibración de cámaras y latencia antes de abordar tareas más complejas.
- Docencia y formación en robótica de bajo coste: al ser un modelo pequeño (51,6 M de parámetros, 0,2 GB) y con licencia Apache 2.0, se puede ejecutar en un portátil con GPU de consumo y explicar el ciclo completo de una política visomotora.
- Base para fine-tuning: al estar entrenado sobre `pick-cube2`, puede servir de inicialización para tareas de agarre similares (otros objetos, otras posiciones) con pocos episodios adicionales.
- Benchmark interno de infraestructura: permite medir throughput de inferencia y latencia de bucle cerrado con dos cámaras a 30 FPS en un robot SO-100/SO-101, sin depender de modelos grandes.
- Generación de datos sintéticos y aumentación: al conocer la distribución de acciones (6 dimensiones) y observaciones, se puede usar para estudiar sensibilidad a cambios de iluminación, oclusiones o desplazamientos del cubo.
- Evaluación comparativa de métodos de imitación: sirve como línea base ACT frente a alternativas como Diffusion Policy o VQ-BeT en el mismo dataset y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía con la nota literal "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros (unos 206 MB de pesos) más activaciones de dos imágenes 480x640; en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia; A100/H100 no son necesarias. Para entrenamiento con batch 64 y 100.000 pasos, una RTX 3090/4090 o una A100 acortan notablemente el tiempo, aunque el modelo es pequeño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1660 en adelante) e incluso en CPU para inferencia a baja frecuencia, aunque el bucle de control a 30 FPS con dos cámaras exige una GPU modesta.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) es la vía documentada; también se puede cargar la política con la API de LeRobot en Python. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el sistema debe sostener 30 FPS con dos cámaras de 480x640, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_pick_cube2-chunk-10` (este) | 51,6 M | estado (6,) + 2 imágenes 480x640 | Agarre de cubo negro con `so_follower` | Apache 2.0 | Hugging Face, LeRobot |
| ACT original (paper arXiv:2304.13705) | no disponible en la información | no disponible | Manipulación bimanual (ALOHA) | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible en la información | no disponible | Políticas visomotoras por difusión | no disponible | Implementaciones en LeRobot |
| VQ-BeT | no disponible en la información | no disponible | Predicción de acciones discretizadas | no disponible | Implementaciones en LeRobot |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este checkpoint ni cifras de éxito en robot real que permitan situarlo frente a Diffusion Policy o VQ-BeT sobre el mismo dataset.

## Limitaciones y advertencias

- Una sola tarea y una sola distribución: entrenado exclusivamente para "Grab the black cube"; generaliza mal a otros objetos, posiciones fuera del dataset o entornos distintos.
- Dataset pequeño: 51 episodios y 22.099 fotogramas, sin variaciones documentadas de iluminación, distractores ni posiciones iniciales.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento real es desconocido; la model card lo indica explícitamente.
- Dependencia de hardware concreto: requiere robot `so_follower` y dos cámaras con los nombres `overhead` y `wrist`; cambiar la configuración invalida la política.
- Sin capacidades lingüísticas: no procesa lenguaje natural ni instrucciones arbitrarias; la etiqueta de tarea es fija.
- Riesgo de sobreajuste y de fallo silencioso: al ser imitación pura, puede ejecutar acciones plausibles pero incorrectas ante oclusiones o cambios de escena, sin señal de incertidumbre.
- Sin cuantizaciones documentadas: no se ofrecen variantes GGUF/INT8/INT4; el despliegue se limita al formato safetensors de LeRobot.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de ACT y LeRobot según la model card.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudori0127/act_pick_cube2-chunk-10
- Dataset de entrenamiento: https://huggingface.co/datasets/sudori0127/pick-cube2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sudori0127/pick-cube2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
