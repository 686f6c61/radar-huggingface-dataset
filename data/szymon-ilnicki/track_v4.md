# Szymon-Ilnicki/track_v4

## Resumen

`Szymon-Ilnicki/track_v4` es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. El modelo está diseñado para control robótico por imitación: recibe dos flujos de vídeo de cámara y un vector de estado de dos dimensiones, y emite un vector de acción de dos dimensiones. Su propósito concreto es pilotar un vehículo de tipo `f1tenth` (plataforma de coche RC 1/10 empleada habitualmente en investigación de conducción autónoma a escala) para completar vueltas en un circuito, en sentido horario y antihorario y a distintas velocidades.

El modelo es relevante como ejemplo de despliegue de VLA compactos en hardware de consumo: SmolVLA se presenta como una alternativa eficiente a los VLA de gran escala, con un total de 450.046.176 parámetros (unos 450 M) según los pesos en safetensors del repositorio. El ajuste fino se ha realizado sobre un conjunto de datos propio y muy reducido (`local/track_v4`, 36 episodios y 7.380 fotogramas a 10 FPS), lo que lo convierte en un caso de estudio de imitación de bajo régimen de datos más que en un modelo de propósito general.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. No hay resultados de evaluación en robot real, ni benchmarks, ni métricas de éxito publicadas; el repositorio registra cero descargas y cero likes en el momento de la consulta, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), ajuste fino de `lerobot/smolvla_base`; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no es de texto generativo; las tareas se especifican en ingles: "complete laps anticlockwise", "complete laps clockwise", etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `f1tenth` |
| Camaras | `camera1`, `camera2` |
| Entrada visual | `observation.images.camera1` y `observation.images.camera2`, forma `(3, 240, 424)` cada una |
| Entrada de estado | `observation.state`, forma `(2,)` |
| Salida de accion | `action`, forma `(2,)` |
| Tamano del repositorio | 1.2 GB |
| Pipeline | robotics |
| Version de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SmolVLA, un VLA compacto que combina percepción visual y lenguaje con generación de acciones, según la descripción de la model card y el paper arXiv:2506.01844. La política consume dos imágenes de cámara de resolución 240x424 con tres canales y un vector de estado de dos dimensiones, y produce una acción de dos dimensiones. La model card no detalla la composición interna del transformer, el codificador visual ni el mecanismo de fusión visión-lenguaje; esos datos no están disponibles en la información proporcionada.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `local/track_v4`: 36 episodios, 7.380 fotogramas a 10 FPS, con seis consignas de tarea (vueltas en sentido horario y antihorario, y variantes lenta y rápida de cada una). La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se indica en la model card si hubo RLHF, DPO ni ninguna otra fase de alineación; se trata de aprendizaje por imitación supervisado a partir de demostraciones. Tampoco se especifican innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico por imitación: genera acciones de dos dimensiones para un robot `f1tenth` a partir de dos vistas de cámara y del estado del robot.
- Seguimiento de circuito: las tareas de entrenamiento cubren vueltas completas en sentido horario y antihorario.
- Modulación por instrucción de velocidad: el dataset incluye variantes "slowly" y "fast" además de la consigna base, por lo que el modelo recibe la tarea como texto condicionante.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB de 240x424 píxeles.
- Condicionamiento por lenguaje: la tarea se pasa como cadena de texto en la inferencia (`--task="complete laps anticlockwise "`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento explícito, matemáticas, generación de código, visión general, audio ni modo "thinking". Es un modelo de política, no un LLM conversacional.

## Casos de uso

- Conducción autónoma a escala en circuito: el modelo se usa con `lerobot-rollout` sobre un `f1tenth` para completar vueltas de forma autónoma, sustituyendo el control manual por una política aprendida de demostraciones.
- Investigación en imitación de bajo régimen de datos: con solo 36 episodios y 7.380 fotogramas, sirve como referencia para estudiar cuánta demostración necesita un VLA compacto para una tarea de control continuo.
- Evaluación de robustez direccional: al estar entrenado en ambos sentidos de giro, permite comparar el comportamiento del mismo modelo en trayectorias horarias y antihorarias sobre la misma pista.
- Control de velocidad condicionado por lenguaje: las variantes "slowly" y "fast" permiten probar si el condicionamiento textual modula realmente la velocidad de la política, un experimento útil en estudios de grounding lingüístico en robótica.
- Base para ajuste fino en otras pistas o robots: al derivar de `lerobot/smolvla_base` y ser Apache 2.0, puede reentrenarse con `lerobot-train` sobre nuevos datasets de conducción.
- Docencia y prototipado en robótica de consumo: al ser un VLA de unos 450 M de parámetros, es un candidato razonable para laboratorios con GPUs de gama consumer que quieran reproducir el flujo completo de LeRobot (grabación, entrenamiento y despliegue).
- Pruebas de integración de pipelines LeRobot: útil para validar configuraciones de cámaras, puertos y claves de observación en despliegues reales antes de escalar a políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota literal "No evaluation results have been provided for this policy yet.", por lo que no hay tasas de éxito, ni número de ensayos, ni comparaciones con otras políticas sobre el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parámetros, en FP16 el peso ronda los 0,9 GB y en FP32 unos 1,8 GB; a ello hay que sumar el codificador visual y los buffers de activación, por lo que se estima un consumo moderado, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles en la información proporcionada. La model card afirma que SmolVLA "can be deployed on consumer-grade hardware", sin especificar modelos.
- GPU consumer: previsiblemente viable en tarjetas con suficiente VRAM para el modelo y las dos cámaras a 30 FPS, pero no se confirma ningún modelo concreto.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento y ajuste fino), ambos de la librería LeRobot 0.7.0. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La captura de datos se hizo a 10 FPS y el ejemplo de rollout configura las cámaras a 30 FPS, pero no se publica la frecuencia de inferencia efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Szymon-Ilnicki/track_v4` | 450.046.176 | no disponible | Control de `f1tenth` en circuito (6 tareas) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada | no disponible | VLA base para ajuste fino | no disponible en la informacion proporcionada | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | no disponible |

La comparación se limita al modelo base, ya que la información proporcionada no incluye datos de benchmarks ni especificaciones de alternativas de la misma categoría. No se dispone de cifras de rendimiento para contrastar.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni ensayos en robot real, por lo que se desconoce si la política funciona fuera de las condiciones de demostración.
- Dataset muy pequeño y específico: 36 episodios y 7.380 fotogramas a 10 FPS, grabados en una única pista y con un único tipo de robot (`f1tenth`); la generalización a otras pistas, iluminaciones o vehículos es improbable sin reentrenamiento.
- Dependencia estricta de la configuración de entrada: las claves `observation.images.camera1`, `observation.images.camera2` y `observation.state` deben coincidir exactamente con las del entrenamiento; cualquier cambio de cámara, resolución o montaje invalida la política.
- Riesgo de sobreajuste y de comportamiento errático fuera de distribución: con 20.000 pasos sobre 36 episodios, es esperable que la política memorice trayectorias y falle ante perturbaciones no vistas.
- Sin datos sobre sesgos, alucinación o comportamiento en lenguaje: al no ser un modelo generativo de texto, las categorías habituales de sesgo lingüístico no aplican, pero no se documenta ningún análisis de sesgo visual ni de robustez.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y revisar la licencia del modelo base y del paper citado.
- Idiomas: las consignas están en inglés y no se declara soporte multilingüe; usar instrucciones en castellano no está validado.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin demo en vídeo ni resultados reproducibles publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v4
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/track_v4
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
