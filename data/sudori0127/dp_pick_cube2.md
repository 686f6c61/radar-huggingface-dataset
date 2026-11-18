# sudori0127/dp_pick_cube2

## Resumen

`dp_pick_cube2` es una política de control visuomotor entrenada con el método Diffusion Policy y empaquetada en el formato de LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. No es un modelo de lenguaje: es un sistema de robótica que, a partir del estado articular del robot y de dos cámaras (una cenital y otra en la muñeca), genera directamente trayectorias de acción de 6 dimensiones para un brazo tipo `so_follower` (SO-100/SO-101 de LeRobot). Lo desarrolla el usuario `sudori0127` y se publica con licencia Apache 2.0.

El modelo resuelve una tarea concreta y estrecha: "Grab the black cube" (agarrar el cubo negro). Se entrenó sobre el dataset `sudori0127/pick-cube2`, con 51 episodios y 22.099 fotogramas a 30 FPS, mediante 200.000 pasos de entrenamiento con Adam, batch de 32 y tasa de aprendizaje 1e-4. Con 277.840.246 parámetros y un tamaño de repositorio de 1,1 GB, es una política de tamaño medio que cabe holgadamente en una GPU de consumo.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: sirve como ejemplo funcional de Diffusion Policy en LeRobot, como base para reentrenar con datos propios y como referencia para evaluar el flujo completo de captura de datos, entrenamiento y despliegue en un robot de bajo coste. No hay resultados de evaluación publicados, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor generativo por difusión), implementada en LeRobot |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la única instrucción textual es la tarea "Grab the black cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 1,1 GB) |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy (Chi et al., 2023, arXiv:2303.04137): el control visuomotor se modela como un proceso generativo de difusión que produce secuencias de acciones multimplemento suaves, en lugar de predecir una única acción de forma regresiva. Esto favorece tareas de manipulación con contacto rico, donde las trayectorias deben ser continuas y estables. Las entradas son el estado del robot `observation.state` de forma `(6,)` y dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `overhead` y `wrist`; la salida es `action` de forma `(6,)`. El robot objetivo es `so_follower` y la implementación corresponde a la versión 0.6.0 de LeRobot.

El entrenamiento se realizó sobre 51 episodios (22.099 fotogramas a 30 FPS) del dataset `sudori0127/pick-cube2`, con 200.000 pasos, batch de 32, optimizador Adam, tasa de aprendizaje 1e-4 y semilla 1000. La model card no documenta la composición exacta del dataset más allá de la tarea, ni si hubo aumentos de datos, variaciones de iluminación, posiciones de objetos o distractores. Tampoco se especifica la configuración exacta del backbone visual ni el número de pasos de difusión empleados en inferencia.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para un brazo `so_follower` a partir de estado articular e imágenes.
- Control visuomotor con dos vistas simultáneas: cámara cenital (`overhead`) y cámara en la muñeca (`wrist`), ambas a 480x640.
- Ejecución de una única tarea de manipulación: agarrar un cubo negro.
- Producción de acciones multimplemento suaves propias de la formulación por difusión, adecuadas para contacto físico.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo multilingüe ni modalidades de audio o vídeo más allá de las dos cámaras de observación.

## Casos de uso

- Replicación de un pipeline de aprendizaje por imitación: sirve como referencia completa (dataset, configuración de entrenamiento y pesos) para que un equipo reproduzca el flujo de LeRobot de principio a fin con su propio robot SO-100/SO-101.
- Base para reentrenamiento con datos propios: partiendo de esta política y de `lerobot-train --policy.type=diffusion`, se puede adaptar la tarea (otro objeto, otra posición) sustituyendo el dataset, lo que reduce el coste frente a entrenar desde cero.
- Docencia y demostraciones de Diffusion Policy: el modelo permite mostrar en clase o en un laboratorio cómo una política generativa produce trayectorias suaves en una tarea de picking real, con hardware de bajo coste.
- Prueba de concepto de manipulación con contacto: la tarea de agarrar un cubo implica contacto físico; la formulación por difusión es adecuada para validar estrategias de agarre antes de escalar a tareas más complejas.
- Evaluación comparativa de métodos de imitación: al estar en formato LeRobot, se puede contrastar con políticas ACT o VQ-BeT entrenadas sobre el mismo dataset para medir diferencias de suavidad y tasa de éxito.
- Generación de datos sintéticos de trayectorias: las secuencias de acción generadas pueden usarse como referencia para analizar la distribución de movimientos del brazo en la tarea de agarre.
- Integración en un banco de pruebas de robótica: desplegable con `lerobot-rollout` en un robot `so_follower` con dos cámaras OpenCV a 640x480 y 30 FPS para validar la cadena completa de hardware y software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja la tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 277,8 millones de parámetros en safetensors (1,1 GB de repositorio), la inferencia en FP32 requiere aproximadamente 1,1 GB solo para pesos, más el coste de las activaciones de dos imágenes de 480x640; en la práctica es desplegable en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente; una RTX 3060/4060 o superior es un punto de partida razonable, aunque no hay cifras oficiales.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (277,8 M de parámetros), si bien el requisito real lo marca el pipeline de cámaras y el bucle de control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento; el ecosistema LeRobot en general. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa de captura del dataset, pero no se publican medidas de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sudori0127/dp_pick_cube2` | Diffusion Policy (LeRobot) | 277,8 M | Estado `(6,)` + 2 imagenes 480x640 | Apache 2.0 | Hugging Face |
| Otras politicas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | variable segun politica | variable | Hugging Face (hub de LeRobot) |
| Politicas ACT en LeRobot | Action Chunking Transformer | no disponible | variable segun politica | variable | Hugging Face (hub de LeRobot) |
| Politicas VQ-BeT en LeRobot | Behavior Transformer | no disponible | variable segun politica | variable | Hugging Face (hub de LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparación se limita a tipo de método, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea única y estrecha: la política solo se entrenó para "Grab the black cube"; no generaliza a otros objetos, posiciones o instrucciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad real en el robot.
- Dataset pequeño: 51 episodios y 22.099 fotogramas son una base limitada; la diversidad de posiciones, iluminación y distractores no está documentada, lo que aumenta el riesgo de sobreajuste al entorno de captura.
- Dependencia del hardware exacto: asume un robot `so_follower` con dos cámaras en posiciones concretas (`overhead` y `wrist`) a 480x640; cambios de montaje, calibración o resolución pueden degradar el comportamiento.
- Sin soporte lingüístico: no es un modelo de lenguaje ni un asistente; no procesa instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Riesgo de alucinación en el sentido de trayectorias no válidas: como política generativa, puede producir acciones que no correspondan a un agarre estable, especialmente fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia de los componentes de LeRobot y del método Diffusion Policy citado.
- Caveat para producción: al no haber métricas ni pruebas de robustez, no debería desplegarse en un entorno real sin una validación propia con ensayos repetidos y control de seguridad del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudori0127/dp_pick_cube2
- Dataset de entrenamiento: https://huggingface.co/datasets/sudori0127/pick-cube2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sudori0127/pick-cube2
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
