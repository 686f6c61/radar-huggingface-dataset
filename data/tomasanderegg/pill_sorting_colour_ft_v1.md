# TomasAnderegg/pill_sorting_colour_ft_v1

## Resumen

`pill_sorting_colour_ft_v1` es una política visiomotor de tipo vision-language-action (VLA) entrenada con LeRobot para una tarea concreta de manipulación robótica: clasificar pastillas por color y depositarlas en compartimentos de distinta forma. Lo desarrolla TomasAnderegg y se publica bajo licencia Apache 2.0. No es un modelo de lenguaje generalista, sino un checkpoint de control robótico que consume una imagen de cámara frontal y el estado articular del robot, y emite comandos de acción de 6 dimensiones.

El modelo se basa en SmolVLA, la arquitectura compacta de VLA presentada en el paper arXiv:2506.01844, y ha sido afinado a partir de `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60`. Con 450 millones de parámetros, está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren reproducir experimentos de imitación robótica sin grandes clústeres de GPU.

Su interés práctico está en ser un ejemplo completo y reproducible de pipeline de aprendizaje por imitación: dataset público de 135 episodios y 68.217 fotogramas a 30 FPS, configuración de entrenamiento documentada y comandos de LeRobot para ejecutar y reentrenar la política. La tarea es acotada (12 instrucciones de lenguaje sobre cuatro colores y cuatro formas de compartimento), por lo que debe evaluarse como demostrador técnico más que como producto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en el paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que combina un codificador visual, un codificador de instrucciones en lenguaje natural y un decodificador de acciones, entrenado para predecir comandos motores a partir de observaciones. En esta ficha concreta, la política recibe `observation.state` de forma `(6,)` y una imagen `observation.images.front` de `(3, 480, 640)`, y produce una acción de forma `(6,)`. El robot objetivo es `so_follower` con una única cámara frontal.

El afinamiento se realizó sobre el dataset `TomasAnderegg/pill_sorting_colour_mix_v1`, con 135 episodios, 68.217 fotogramas a 30 FPS y 12 instrucciones de tarea que combinan cuatro colores de pastilla (amarillo, verde, azul, rojo) con cuatro compartimentos (cuadrado, círculo, cruz, triángulo). La configuración de entrenamiento documentada es de 4.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.2. El modelo base ya incorporaba una fase DAgger (según el nombre `dagger60`), lo que sugiere recogida de datos con correcciones humanas sobre la política.

## Capacidades

- Control robótico visiomotor: genera acciones de 6 dimensiones a partir de imagen frontal y estado articular.
- Seguimiento de instrucciones en lenguaje natural acotadas a la tarea de clasificación de pastillas por color y forma.
- Ejecución de 12 tareas distintas definidas explícitamente en el dataset (combinaciones color-compartimento).
- Aprendizaje por imitación: reproducible mediante `lerobot-train` a partir del modelo base.
- Despliegue en hardware de consumo, según la descripción de SmolVLA en el paper.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Demostración de clasificación robótica por color: la política ejecuta instrucciones como "Put the yellow pill in the square compartment" sobre un robot `so_follower` con cámara frontal, útil para validar pipelines de manipulación pick-and-place en laboratorio.
- Reproducción de experimentos de aprendizaje por imitación: sirve como punto de partida para reentrenar con `lerobot-train` sobre datasets propios y comparar curvas de éxito con la configuración documentada (4.000 pasos, batch 64, lr 1e-5).
- Benchmark interno de VLA compactos: con 450 M de parámetros y despliegue en hardware de consumo, permite medir latencia y tasa de éxito frente a políticas más grandes en tareas de sorting.
- Docencia y formación en robótica: el par dataset-política y los comandos de LeRobot facilitan prácticas guiadas de grabación de datos, entrenamiento y rollout.
- Prototipado de células de picking en entornos controlados: la tarea de clasificar objetos por atributos visuales (color) y depositarlos en receptáculos definidos es análoga a casos de logística y farmacia a pequeña escala.
- Investigación en generalización visual: al estar entrenada con mezcla de colores, permite estudiar cómo varía la tasa de éxito ante cambios de iluminación, posición de objetos o nuevos colores no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación de que no hay resultados ("No evaluation results"), por lo que no se dispone de tasas de éxito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, la huella de pesos es del orden de 1,8 GB en FP32 y ~0,9 GB en FP16, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: el paper de SmolVLA indica despliegue en hardware de consumo; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, según la descripción de SmolVLA como modelo compacto desplegable en hardware de consumo; no se detallan modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de captura del dataset es de 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_colour_ft_v1` (este) | 450 M | Imagen 480x640 + estado (6,) | Sorting de pastillas por color y forma | Apache 2.0 | Hugging Face, LeRobot |
| SmolVLA (modelo base genérico) | no disponible en la información | Vision-language-action | Manipulación general | no disponible | Hugging Face |
| `pill_sorting_full_ft_a100_v3_dagger60` (modelo base de este checkpoint) | no disponible en la información | Imagen + estado | Sorting de pastillas (con DAgger) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea muy acotada: solo cubre 12 instrucciones sobre cuatro colores y cuatro formas de compartimento; no generaliza a otras tareas de manipulación sin reentrenamiento.
- Dependencia de la configuración de hardware: requiere robot `so_follower`, cámara frontal con la resolución y FPS de entrenamiento (480x640, 30 FPS) y nombres de cámara que coincidan con las claves de observación.
- Sin resultados de evaluación publicados: no hay tasas de éxito por tarea, lo que impide estimar fiabilidad en producción.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo, posición de objetos o calibración pueden degradar el rendimiento; la model card menciona explícitamente que la dificultad varía con posiciones nuevas e iluminación.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece resultados de validación.
- Sin información sobre sesgos, alucinación o robustez fuera del dominio de entrenamiento; al ser una política de control, el fallo se manifiesta como acciones incorrectas, no como texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_ft_v1
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_mix_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_mix_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
